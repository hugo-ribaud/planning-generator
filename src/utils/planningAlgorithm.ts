/**
 * Algorithme de placement automatique des taches
 */

import { createEmptyGrid, findAvailableSlot, placeTaskInGrid, Grid, GridSlot, FoundSlot, GridDay } from './gridUtils'
import { PRIORITIES, DEFAULT_DURATIONS } from './constants'
import type { Task, User, PlanningConfig, TimePreference } from '../types'

// Types pour les statistiques
export interface PlacedTask {
  task: Task
  day: Date
  slot: GridSlot
}

export interface FailedTask {
  task: Task
  reason: string
}

export interface PlanningStats {
  placed: PlacedTask[]
  failed: FailedTask[]
  total: number
  successRate?: number
}

export interface WeekSlot {
  day: Date
  dayName: string
  startTime: string
  endTime: string
  task: Task
  column: string
}

export interface PlanningWeek {
  weekNumber: number
  startDate: Date
  slots: WeekSlot[]
  days: GridDay[]
}

export interface GeneratedPlanning {
  planning: PlanningWeek[]
  grid: Grid
  stats: PlanningStats
}

export interface ExportedPlanning {
  generatedAt: string
  weeks: {
    weekNumber: number
    startDate: string
    slots: {
      day: string
      dayName: string
      startTime: string
      endTime: string
      taskId: string
      taskName: string
      taskColor?: string
      column: string
    }[]
  }[]
}

/**
 * Genere un planning automatique
 */
export function generatePlanning(
  config: PlanningConfig,
  users: User[],
  tasks: Task[]
): GeneratedPlanning {
  // Creer la grille vide
  const grid = createEmptyGrid(config, users)

  // Statistiques de placement
  const stats: PlanningStats = {
    placed: [],
    failed: [],
    total: tasks.length,
  }

  // Trier les taches par priorite de placement
  const sortedTasks = sortTasksByPriority(tasks)

  // Etape 1: Placer les taches quotidiennes recurrentes
  const dailyTasks = sortedTasks.filter(t => t.recurrence === 'daily')
  placeDailyTasks(grid, dailyTasks, stats)

  // Etape 2: Placer les taches hebdomadaires recurrentes
  const weeklyTasks = sortedTasks.filter(t => t.recurrence === 'weekly')
  placeWeeklyTasks(grid, weeklyTasks, stats)

  // Etape 3: Placer les taches ponctuelles (once)
  const onceTasks = sortedTasks.filter(t => t.recurrence === 'once')
  placeOnceTasks(grid, onceTasks, stats)

  // Etape 4: Placer les taches personnalisees (custom)
  const customTasks = sortedTasks.filter(t => t.recurrence === 'custom')
  placeCustomTasks(grid, customTasks, stats)

  // Etape 5: Remplir avec les taches flexibles
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
 * Trie les taches par priorite de placement
 */
function sortTasksByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // Priorite: URGENT(1), HIGH(2), NORMAL(3), LOW(4)
    const priorityDiff = (a.priority || PRIORITIES.NORMAL) - (b.priority || PRIORITIES.NORMAL)
    if (priorityDiff !== 0) return priorityDiff

    // A priorite egale, taches common en premier
    if (a.type === 'common' && b.type !== 'common') return -1
    if (b.type === 'common' && a.type !== 'common') return 1

    // Ensuite par duree decroissante (les plus longues d'abord)
    return (b.duration || DEFAULT_DURATIONS.SHORT) - (a.duration || DEFAULT_DURATIONS.SHORT)
  })
}

/**
 * Place les taches quotidiennes recurrentes
 */
function placeDailyTasks(grid: Grid, tasks: Task[], stats: PlanningStats): void {
  for (const task of tasks) {
    // Pour chaque jour de la grille
    for (let dayIndex = 0; dayIndex < grid.days.length; dayIndex++) {
      const placement = findAvailableSlot(grid, task, {
        preferredTime: (task.preferredTime || 'any') as TimePreference,
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
 * Place les taches hebdomadaires recurrentes
 */
function placeWeeklyTasks(grid: Grid, tasks: Task[], stats: PlanningStats): void {
  for (const task of tasks) {
    // Si des jours preferes sont specifies, utiliser ceux-ci
    const preferredDays = task.preferredDays && task.preferredDays.length > 0
      ? task.preferredDays
      : []

    const placement = findAvailableSlot(grid, task, {
      preferredTime: (task.preferredTime || 'any') as TimePreference,
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
      stats.failed.push({ task, reason: 'Aucun creneau disponible' })
    }
  }
}

/**
 * Place les taches ponctuelles
 */
function placeOnceTasks(grid: Grid, tasks: Task[], stats: PlanningStats): void {
  for (const task of tasks) {
    const placement = findAvailableSlot(grid, task, {
      preferredTime: (task.preferredTime || 'any') as TimePreference,
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
      stats.failed.push({ task, reason: 'Aucun creneau disponible' })
    }
  }
}

/**
 * Place les taches personnalisees
 */
function placeCustomTasks(grid: Grid, tasks: Task[], stats: PlanningStats): void {
  for (const task of tasks) {
    // Pour les taches custom avec jours preferes, placer sur ces jours
    if (task.preferredDays && task.preferredDays.length > 0) {
      for (const preferredDay of task.preferredDays) {
        const placement = findAvailableSlot(grid, task, {
          preferredTime: (task.preferredTime || 'any') as TimePreference,
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
      // Sinon, placer comme une tache once
      const placement = findAvailableSlot(grid, task, {
        preferredTime: (task.preferredTime || 'any') as TimePreference,
      })

      if (placement) {
        placeTaskInGrid(grid, task, placement)
        stats.placed.push({
          task,
          day: grid.days[placement.dayIndex].date,
          slot: placement.slot,
        })
      } else {
        stats.failed.push({ task, reason: 'Aucun creneau disponible' })
      }
    }
  }
}

/**
 * Remplit les creneaux vides avec les taches flexibles
 */
function fillWithFlexible(grid: Grid, tasks: Task[], stats: PlanningStats): void {
  if (tasks.length === 0) return

  // Trouver la tache flexible par utilisateur
  const flexibleByUser: Record<string, Task> = {}
  for (const task of tasks) {
    const userId = task.assignedTo || 'common'
    if (!flexibleByUser[userId]) {
      flexibleByUser[userId] = task
    }
  }

  // Parcourir tous les creneaux vides et les remplir
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
function convertGridToPlanning(grid: Grid): PlanningWeek[] {
  // Grouper par semaine
  const weekMap = new Map<number, PlanningWeek>()

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

    const week = weekMap.get(weekNum)!

    // Convertir les creneaux du jour
    const daySlots: WeekSlot[] = []

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
      weekNumber: day.weekNumber,
      columns: day.columns,
    })
  }

  // Convertir la Map en tableau
  return Array.from(weekMap.values()).sort((a, b) => a.weekNumber - b.weekNumber)
}

/**
 * Exporte le planning genere
 */
export function exportPlanning(planning: PlanningWeek[]): ExportedPlanning {
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
