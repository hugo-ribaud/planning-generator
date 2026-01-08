/**
 * Utilitaires pour la gestion de la grille de planning
 */

import { generateDaySlots } from './timeUtils'
import { getWeekDates, getMonthDates, getDayName, isDayOff, getWeekNumber } from './dateUtils'
import { WORK_HOURS, DEFAULT_DURATIONS } from './constants'
import type { User, Task, PlanningConfig, TimePreference } from '../types'

// Types pour la grille
export interface GridSlot {
  startTime: string
  endTime: string
  available: boolean
  task: Task | null
  blockedBy?: string
  duration?: number
}

export interface GridColumn {
  slots: GridSlot[]
  userId?: string
  userName?: string
  isDayOff?: boolean
}

export interface GridDay {
  date: Date
  dayName: string
  weekNumber: number
  columns: Record<string, GridColumn>
}

export interface Grid {
  period: string
  startDate: Date
  days: GridDay[]
  users: User[]
}

export interface FoundSlot {
  dayIndex: number
  slotIndex: number
  day: GridDay
  slot: GridSlot
  slotsNeeded: number
}

export interface FindSlotOptions {
  preferredTime?: TimePreference
  preferredDays?: string[]
  startDayIndex?: number
}

interface ExtendedConfig extends PlanningConfig {
  period?: string
  startDate?: string | Date
  workStart?: string
  workEnd?: string
  lunchStart?: string
  lunchEnd?: string
}

/**
 * Cree une grille vide pour le planning
 */
export function createEmptyGrid(config: ExtendedConfig, users: User[]): Grid {
  const {
    period = 'week',
    startDate = new Date(),
    workStart = '09:00',
    workEnd = '17:00',
    lunchStart = '12:00',
    lunchEnd = '13:00',
    slotDuration
  } = config

  // Obtenir les dates selon la periode
  const startDateObj = typeof startDate === 'string' ? new Date(startDate) : startDate
  const dates = period === 'week'
    ? getWeekDates(startDateObj)
    : getMonthDates(startDateObj)

  // Generer les creneaux types pour une journee
  const daySlotTemplate = generateDaySlots(workStart, workEnd, lunchStart, lunchEnd, slotDuration)

  // Creer la grille
  const grid: Grid = {
    period,
    startDate: startDateObj,
    days: [],
    users,
  }

  // Pour chaque jour
  for (const date of dates) {
    const dayName = getDayName(date)

    // Creer les colonnes (une par utilisateur + common)
    const columns: Record<string, GridColumn> = {
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
      const userDayOff = isDayOff(date, user.daysOff || [])

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
 * Trouve le premier creneau disponible pour une tache
 */
export function findAvailableSlot(
  grid: Grid,
  task: Task,
  options: FindSlotOptions = {}
): FoundSlot | null {
  const {
    preferredTime = 'any',
    preferredDays = [],
    startDayIndex = 0,
  } = options

  const firstSlot = grid.days[0]?.columns.common.slots[0]
  const slotDuration = firstSlot?.duration || DEFAULT_DURATIONS.SHORT
  const slotsNeeded = Math.ceil(task.duration / slotDuration)

  // Determiner la colonne cible
  const targetColumn = task.assignedTo === 'common' ? 'common' : task.assignedTo

  // Parcourir les jours
  for (let dayIdx = startDayIndex; dayIdx < grid.days.length; dayIdx++) {
    const day = grid.days[dayIdx]

    // Verifier les jours preferes si specifies
    if (preferredDays.length > 0 && !preferredDays.includes(day.dayName)) {
      continue
    }

    const column = targetColumn ? day.columns[targetColumn] : null
    if (!column) continue

    // Verifier si jour off pour l'utilisateur
    if (column.isDayOff) continue

    // Parcourir les creneaux
    for (let slotIdx = 0; slotIdx < column.slots.length; slotIdx++) {
      const slot = column.slots[slotIdx]

      // Verifier la preference horaire
      if (!matchesTimePreference(slot.startTime, preferredTime)) {
        continue
      }

      // Verifier la disponibilite du creneau
      if (!slot.available || slot.task) {
        continue
      }

      // Pour les taches common, verifier aussi les colonnes utilisateurs
      if (task.assignedTo === 'common' || task.type === 'common') {
        const allAvailable = checkAllColumnsAvailable(day, slotIdx, grid.users)
        if (!allAvailable) continue
      }

      // Verifier s'il y a assez de creneaux consecutifs
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
 * Verifie si un horaire correspond a la preference
 */
function matchesTimePreference(startTime: string, preference: TimePreference): boolean {
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
 * Verifie si tous les utilisateurs ont le creneau disponible
 */
function checkAllColumnsAvailable(day: GridDay, slotIndex: number, users: User[]): boolean {
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
 * Verifie s'il y a assez de creneaux consecutifs disponibles
 */
function checkConsecutiveSlots(slots: GridSlot[], startIndex: number, needed: number): boolean {
  for (let i = 0; i < needed; i++) {
    const slot = slots[startIndex + i]
    if (!slot || !slot.available || slot.task) {
      return false
    }
  }
  return true
}

/**
 * Place une tache dans la grille
 */
export function placeTaskInGrid(grid: Grid, task: Task, placement: FoundSlot): void {
  const { dayIndex, slotIndex, slotsNeeded } = placement
  const day = grid.days[dayIndex]
  const targetColumn = task.assignedTo === 'common' ? 'common' : task.assignedTo

  // Placer dans la colonne cible
  for (let i = 0; i < slotsNeeded; i++) {
    const column = targetColumn ? day.columns[targetColumn] : null
    if (column && column.slots[slotIndex + i]) {
      column.slots[slotIndex + i].task = task
      column.slots[slotIndex + i].available = false
    }
  }

  // Si tache common, marquer aussi les colonnes utilisateurs
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
 * Compte les creneaux disponibles restants
 */
export function countAvailableSlots(grid: Grid, userId: string | null = null): number {
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
