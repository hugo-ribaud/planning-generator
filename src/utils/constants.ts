/**
 * Constantes pour le Planning Generator
 * Centralise les valeurs magiques pour eviter la duplication
 */

import type { Priority, TimePreference, TaskType, RecurrenceType, PlanningConfig } from '../types'

// Niveaux de priorite des taches
export const PRIORITIES: Record<string, Priority> = {
  URGENT: 1,
  HIGH: 2,
  NORMAL: 3,
  LOW: 4
} as const

// Labels des priorites en francais
export const PRIORITY_LABELS: Record<Priority, string> = {
  1: 'Urgente',
  2: 'Haute',
  3: 'Normale',
  4: 'Basse'
}

// Couleurs des priorites (Tailwind classes)
export const PRIORITY_COLORS: Record<Priority, string> = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-blue-500',
  4: 'bg-gray-400'
}

// Durees par defaut des taches (en minutes)
export const DEFAULT_DURATIONS = {
  SHORT: 30,
  MEDIUM: 60,
  LONG: 90,
  HALF_DAY: 240
} as const

// Heures de travail par defaut
export const WORK_HOURS = {
  MORNING_START: 9,
  LUNCH_START: 12,
  AFTERNOON_START: 14,
  EVENING_END: 17,
  DAY_END: 19
} as const

// Preferences horaires
export const TIME_PREFERENCES: Record<string, TimePreference> = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening',
  ANY: 'any'
} as const

// Types de taches
export const TASK_TYPES: Record<string, TaskType> = {
  SOLO: 'solo',
  COMMON: 'common',
  FLEXIBLE: 'flexible'
} as const

// Types de recurrence
export const RECURRENCE_TYPES: Record<string, RecurrenceType> = {
  NONE: 'none',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  CUSTOM: 'custom'
} as const

// Jours de la semaine
export interface DayOfWeek {
  key: string
  label: string
  fullLabel: string
  value?: string
}

export const DAYS_OF_WEEK: DayOfWeek[] = [
  { key: 'lundi', label: 'Lun', fullLabel: 'Lundi', value: 'lundi' },
  { key: 'mardi', label: 'Mar', fullLabel: 'Mardi', value: 'mardi' },
  { key: 'mercredi', label: 'Mer', fullLabel: 'Mercredi', value: 'mercredi' },
  { key: 'jeudi', label: 'Jeu', fullLabel: 'Jeudi', value: 'jeudi' },
  { key: 'vendredi', label: 'Ven', fullLabel: 'Vendredi', value: 'vendredi' },
  { key: 'samedi', label: 'Sam', fullLabel: 'Samedi', value: 'samedi' },
  { key: 'dimanche', label: 'Dim', fullLabel: 'Dimanche', value: 'dimanche' }
]

// Configuration par defaut du planning
export const DEFAULT_CONFIG: Partial<PlanningConfig> = {
  weekStartDay: 'lundi',
  workDays: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
  slotDuration: DEFAULT_DURATIONS.MEDIUM
}

// Delais d'auto-save (en ms)
export const AUTO_SAVE_DELAY = 30000 // 30 secondes

// Taille maximale des listes
export const MAX_USERS = 10
export const MAX_TASKS = 100
export const MAX_MILESTONES = 20
