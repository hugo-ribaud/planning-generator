/**
 * Algorithme de placement automatique des tâches
 */

import { createEmptyGrid, findAvailableSlot, placeTaskInGrid } from './gridUtils'
import { getWeekNumber } from './dateUtils'
import { PRIORITIES, DEFAULT_DURATIONS } from './constants'

/**
 * Génère un planning automatique
 * @param {Object} config - Configuration générale
 * @param {Array} users - Liste des utilisateurs
 * @param {Array} tasks - Liste des tâches à placer
 * @returns {Object} Planning généré avec statistiques
 */
export function generatePlanning(config, users, tasks) {
  // Créer la grille vide
  const grid = createEmptyGrid(config, users)

  // Statistiques de placement
  const stats = {
    placed: [],
    failed: [],
    total: tasks.length,
  }

  // Trier les tâches par priorité de placement
  const sortedTasks = sortTasksByPriority(tasks)

  // Étape 1: Placer les tâches quotidiennes récurrentes
  const dailyTasks = sortedTasks.filter(t => t.recurrence === 'daily')
  placeDailyTasks(grid, dailyTasks, stats)

  // Étape 2: Placer les tâches hebdomadaires récurrentes
  const weeklyTasks = sortedTasks.filter(t => t.recurrence === 'weekly')
  placeWeeklyTasks(grid, weeklyTasks, stats)

  // Étape 3: Placer les tâches ponctuelles (once)
  const onceTasks = sortedTasks.filter(t => t.recurrence === 'once')
  placeOnceTasks(grid, onceTasks, stats)

  // Étape 4: Placer les tâches personnalisées (custom)
  const customTasks = sortedTasks.filter(t => t.recurrence === 'custom')
  placeCustomTasks(grid, customTasks, stats)

  // Étape 5: Remplir avec les tâches flexibles
  const flexibleTasks = sortedTasks.filter(t => t.type === 'flexible')
  fillWithFlexible(grid, flexibleTasks, stats)

  // Convertir la grille en format de sortie
  const planning = convertGridToPlanning(grid)

  return {
    planning,
    grid,
    stats: {
      ...stats,
      successRate: Math.round((stats.placed.length / stats.total) * 100) || 0,
    },
  }
}

/**
 * Trie les tâches par priorité de placement
 */
function sortTasksByPriority(tasks) {
  return [...tasks].sort((a, b) => {
    // Priorité: URGENT(1), HIGH(2), NORMAL(3), LOW(4)
    const priorityDiff = (a.priority || PRIORITIES.NORMAL) - (b.priority || PRIORITIES.NORMAL)
    if (priorityDiff !== 0) return priorityDiff

    // À priorité égale, tâches common en premier
    if (a.type === 'common' && b.type !== 'common') return -1
    if (b.type === 'common' && a.type !== 'common') return 1

    // Ensuite par durée décroissante (les plus longues d'abord)
    return (b.duration || DEFAULT_DURATIONS.SHORT) - (a.duration || DEFAULT_DURATIONS.SHORT)
  })
}

/**
 * Place les tâches quotidiennes récurrentes
 */
function placeDailyTasks(grid, tasks, stats) {
  for (const task of tasks) {
    // Pour chaque jour de la grille
    for (let dayIndex = 0; dayIndex < grid.days.length; dayIndex++) {
      const placement = findAvailableSlot(grid, task, {
        preferredTime: task.preferredTime || 'any',
        preferredDays: task.preferredDays || [],
        startDayIndex: dayIndex,
      })

      if (placement && placement.dayIndex === dayIndex) {
        placeTaskInGrid(grid, task, placement)
        stats.placed.push({
          task,
          day: grid.days[dayIndex].date,
          slot: placement.slot,
        })
      }
    }
  }
}

/**
 * Place les tâches hebdomadaires récurrentes
 */
function placeWeeklyTasks(grid, tasks, stats) {
  for (const task of tasks) {
    // Si des jours préférés sont spécifiés, utiliser ceux-ci
    const preferredDays = task.preferredDays && task.preferredDays.length > 0
      ? task.preferredDays
      : []

    const placement = findAvailableSlot(grid, task, {
      preferredTime: task.preferredTime || 'any',
      preferredDays,
    })

    if (placement) {
      placeTaskInGrid(grid, task, placement)
      stats.placed.push({
        task,
        day: grid.days[placement.dayIndex].date,
        slot: placement.slot,
      })
    } else {
      stats.failed.push({ task, reason: 'Aucun créneau disponible' })
    }
  }
}

/**
 * Place les tâches ponctuelles
 */
function placeOnceTasks(grid, tasks, stats) {
  for (const task of tasks) {
    const placement = findAvailableSlot(grid, task, {
      preferredTime: task.preferredTime || 'any',
      preferredDays: task.preferredDays || [],
    })

    if (placement) {
      placeTaskInGrid(grid, task, placement)
      stats.placed.push({
        task,
        day: grid.days[placement.dayIndex].date,
        slot: placement.slot,
      })
    } else {
      stats.failed.push({ task, reason: 'Aucun créneau disponible' })
    }
  }
}

/**
 * Place les tâches personnalisées
 */
function placeCustomTasks(grid, tasks, stats) {
  for (const task of tasks) {
    // Pour les tâches custom avec jours préférés, placer sur ces jours
    if (task.preferredDays && task.preferredDays.length > 0) {
      for (const preferredDay of task.preferredDays) {
        const placement = findAvailableSlot(grid, task, {
          preferredTime: task.preferredTime || 'any',
          preferredDays: [preferredDay],
        })

        if (placement) {
          placeTaskInGrid(grid, task, placement)
          stats.placed.push({
            task,
            day: grid.days[placement.dayIndex].date,
            slot: placement.slot,
          })
        }
      }
    } else {
      // Sinon, placer comme une tâche once
      const placement = findAvailableSlot(grid, task, {
        preferredTime: task.preferredTime || 'any',
      })

      if (placement) {
        placeTaskInGrid(grid, task, placement)
        stats.placed.push({
          task,
          day: grid.days[placement.dayIndex].date,
          slot: placement.slot,
        })
      } else {
        stats.failed.push({ task, reason: 'Aucun créneau disponible' })
      }
    }
  }
}

/**
 * Remplit les créneaux vides avec les tâches flexibles
 */
function fillWithFlexible(grid, tasks, stats) {
  if (tasks.length === 0) return

  // Trouver la tâche flexible par utilisateur
  const flexibleByUser = {}
  for (const task of tasks) {
    const userId = task.assignedTo || 'common'
    if (!flexibleByUser[userId]) {
      flexibleByUser[userId] = task
    }
  }

  // Parcourir tous les créneaux vides et les remplir
  for (const day of grid.days) {
    for (const [columnId, column] of Object.entries(day.columns)) {
      if (columnId === 'common') continue // Skip common column for flexible
      if (column.isDayOff) continue

      for (let slotIdx = 0; slotIdx < column.slots.length; slotIdx++) {
        const slot = column.slots[slotIdx]

        if (slot.available && !slot.task && !slot.blockedBy) {
          const flexTask = flexibleByUser[columnId] || flexibleByUser['common']
          if (flexTask) {
            slot.task = flexTask
            slot.available = false
            stats.placed.push({
              task: flexTask,
              day: day.date,
              slot,
            })
          }
        }
      }
    }
  }
}

/**
 * Convertit la grille interne en format de sortie
 */
function convertGridToPlanning(grid) {
  // Grouper par semaine
  const weekMap = new Map()

  for (const day of grid.days) {
    const weekNum = day.weekNumber

    if (!weekMap.has(weekNum)) {
      weekMap.set(weekNum, {
        weekNumber: weekNum,
        startDate: day.date,
        slots: [],
        days: [],
      })
    }

    const week = weekMap.get(weekNum)

    // Convertir les créneaux du jour
    const daySlots = []

    for (const [columnId, column] of Object.entries(day.columns)) {
      for (const slot of column.slots) {
        if (slot.task) {
          daySlots.push({
            day: day.date,
            dayName: day.dayName,
            startTime: slot.startTime,
            endTime: slot.endTime,
            task: slot.task,
            column: columnId,
          })
        }
      }
    }

    week.slots.push(...daySlots)
    week.days.push({
      date: day.date,
      dayName: day.dayName,
      columns: day.columns,
    })
  }

  // Convertir la Map en tableau
  return Array.from(weekMap.values()).sort((a, b) => a.weekNumber - b.weekNumber)
}

/**
 * Exporte le planning généré
 */
export function exportPlanning(planning) {
  return {
    generatedAt: new Date().toISOString(),
    weeks: planning.map(week => ({
      weekNumber: week.weekNumber,
      startDate: week.startDate.toISOString(),
      slots: week.slots.map(slot => ({
        day: slot.day.toISOString(),
        dayName: slot.dayName,
        startTime: slot.startTime,
        endTime: slot.endTime,
        taskId: slot.task.id,
        taskName: slot.task.name,
        taskColor: slot.task.color,
        column: slot.column,
      })),
    })),
  }
}
