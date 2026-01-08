/**
 * Utilitaires pour la gestion de la grille de planning
 */

import { generateDaySlots } from './timeUtils'
import { getWeekDates, getMonthDates, getDayName, isDayOff, getWeekNumber } from './dateUtils'
import { WORK_HOURS, DEFAULT_DURATIONS } from './constants'

/**
 * Crée une grille vide pour le planning
 * @param {Object} config - Configuration générale
 * @param {Array} users - Liste des utilisateurs
 * @returns {Object} Grille avec dates et créneaux disponibles
 */
export function createEmptyGrid(config, users) {
  const { period, startDate, workStart, workEnd, lunchStart, lunchEnd, slotDuration } = config

  // Obtenir les dates selon la période
  const dates = period === 'week'
    ? getWeekDates(startDate)
    : getMonthDates(startDate)

  // Générer les créneaux types pour une journée
  const daySlotTemplate = generateDaySlots(workStart, workEnd, lunchStart, lunchEnd, slotDuration)

  // Créer la grille
  const grid = {
    period,
    startDate: new Date(startDate),
    days: [],
    users,
  }

  // Pour chaque jour
  for (const date of dates) {
    const dayName = getDayName(date)

    // Créer les colonnes (une par utilisateur + common)
    const columns = {
      common: {
        slots: daySlotTemplate.map(slot => ({
          ...slot,
          available: true,
          task: null,
        })),
      },
    }

    // Ajouter une colonne par utilisateur
    for (const user of users) {
      const userDayOff = isDayOff(date, user.days_off)

      columns[user.id] = {
        userId: user.id,
        userName: user.name,
        isDayOff: userDayOff,
        slots: daySlotTemplate.map(slot => ({
          ...slot,
          available: !userDayOff,
          task: null,
        })),
      }
    }

    grid.days.push({
      date,
      dayName,
      weekNumber: getWeekNumber(date),
      columns,
    })
  }

  return grid
}

/**
 * Trouve le premier créneau disponible pour une tâche
 * @param {Object} grid - La grille de planning
 * @param {Object} task - La tâche à placer
 * @param {Object} options - Options de recherche
 * @returns {Object|null} Le créneau trouvé ou null
 */
export function findAvailableSlot(grid, task, options = {}) {
  const {
    preferredTime = 'any',
    preferredDays = [],
    startDayIndex = 0,
  } = options

  const slotsNeeded = Math.ceil(task.duration / grid.days[0]?.columns.common.slots[0]?.duration || DEFAULT_DURATIONS.SHORT)

  // Déterminer la colonne cible
  const targetColumn = task.assignedTo === 'common' ? 'common' : task.assignedTo

  // Parcourir les jours
  for (let dayIdx = startDayIndex; dayIdx < grid.days.length; dayIdx++) {
    const day = grid.days[dayIdx]

    // Vérifier les jours préférés si spécifiés
    if (preferredDays.length > 0 && !preferredDays.includes(day.dayName)) {
      continue
    }

    const column = day.columns[targetColumn]
    if (!column) continue

    // Vérifier si jour off pour l'utilisateur
    if (column.isDayOff) continue

    // Parcourir les créneaux
    for (let slotIdx = 0; slotIdx < column.slots.length; slotIdx++) {
      const slot = column.slots[slotIdx]

      // Vérifier la préférence horaire
      if (!matchesTimePreference(slot.startTime, preferredTime)) {
        continue
      }

      // Vérifier la disponibilité du créneau
      if (!slot.available || slot.task) {
        continue
      }

      // Pour les tâches common, vérifier aussi les colonnes utilisateurs
      if (task.assignedTo === 'common' || task.type === 'common') {
        const allAvailable = checkAllColumnsAvailable(day, slotIdx, grid.users)
        if (!allAvailable) continue
      }

      // Vérifier s'il y a assez de créneaux consécutifs
      if (slotsNeeded > 1) {
        const consecutiveAvailable = checkConsecutiveSlots(column.slots, slotIdx, slotsNeeded)
        if (!consecutiveAvailable) continue
      }

      return {
        dayIndex: dayIdx,
        slotIndex: slotIdx,
        day,
        slot,
        slotsNeeded,
      }
    }
  }

  return null
}

/**
 * Vérifie si un horaire correspond à la préférence
 */
function matchesTimePreference(startTime, preference) {
  if (preference === 'any') return true

  const hour = parseInt(startTime.split(':')[0], 10)

  switch (preference) {
    case 'morning':
      return hour >= WORK_HOURS.MORNING_START && hour < WORK_HOURS.LUNCH_START
    case 'afternoon':
      return hour >= WORK_HOURS.AFTERNOON_START && hour < WORK_HOURS.EVENING_END
    case 'evening':
      return hour >= WORK_HOURS.EVENING_END
    default:
      return true
  }
}

/**
 * Vérifie si tous les utilisateurs ont le créneau disponible
 */
function checkAllColumnsAvailable(day, slotIndex, users) {
  for (const user of users) {
    const userColumn = day.columns[user.id]
    if (!userColumn) return false
    if (userColumn.isDayOff) return false
    if (!userColumn.slots[slotIndex]?.available) return false
    if (userColumn.slots[slotIndex]?.task) return false
  }
  return true
}

/**
 * Vérifie s'il y a assez de créneaux consécutifs disponibles
 */
function checkConsecutiveSlots(slots, startIndex, needed) {
  for (let i = 0; i < needed; i++) {
    const slot = slots[startIndex + i]
    if (!slot || !slot.available || slot.task) {
      return false
    }
  }
  return true
}

/**
 * Place une tâche dans la grille
 * @param {Object} grid - La grille (sera modifiée)
 * @param {Object} task - La tâche à placer
 * @param {Object} placement - Position du placement
 */
export function placeTaskInGrid(grid, task, placement) {
  const { dayIndex, slotIndex, slotsNeeded } = placement
  const day = grid.days[dayIndex]
  const targetColumn = task.assignedTo === 'common' ? 'common' : task.assignedTo

  // Placer dans la colonne cible
  for (let i = 0; i < slotsNeeded; i++) {
    const column = day.columns[targetColumn]
    if (column && column.slots[slotIndex + i]) {
      column.slots[slotIndex + i].task = task
      column.slots[slotIndex + i].available = false
    }
  }

  // Si tâche common, marquer aussi les colonnes utilisateurs
  if (task.assignedTo === 'common' || task.type === 'common') {
    for (const user of grid.users) {
      const userColumn = day.columns[user.id]
      for (let i = 0; i < slotsNeeded; i++) {
        if (userColumn && userColumn.slots[slotIndex + i]) {
          userColumn.slots[slotIndex + i].available = false
          userColumn.slots[slotIndex + i].blockedBy = 'common'
        }
      }
    }
  }
}

/**
 * Compte les créneaux disponibles restants
 */
export function countAvailableSlots(grid, userId = null) {
  let count = 0

  for (const day of grid.days) {
    const columns = userId ? [day.columns[userId]] : Object.values(day.columns)

    for (const column of columns) {
      if (!column) continue
      for (const slot of column.slots) {
        if (slot.available && !slot.task) {
          count++
        }
      }
    }
  }

  return count
}
