/**
 * Constantes pour le Planning Generator
 * Centralise les valeurs magiques pour éviter la duplication
 */

// Niveaux de priorité des tâches
export const PRIORITIES = {
  URGENT: 1,
  HIGH: 2,
  NORMAL: 3,
  LOW: 4
}

// Labels des priorités en français
export const PRIORITY_LABELS = {
  [PRIORITIES.URGENT]: 'Urgente',
  [PRIORITIES.HIGH]: 'Haute',
  [PRIORITIES.NORMAL]: 'Normale',
  [PRIORITIES.LOW]: 'Basse'
}

// Couleurs des priorités (Tailwind classes)
export const PRIORITY_COLORS = {
  [PRIORITIES.URGENT]: 'bg-red-500',
  [PRIORITIES.HIGH]: 'bg-orange-500',
  [PRIORITIES.NORMAL]: 'bg-blue-500',
  [PRIORITIES.LOW]: 'bg-gray-400'
}

// Durées par défaut des tâches (en minutes)
export const DEFAULT_DURATIONS = {
  SHORT: 30,
  MEDIUM: 60,
  LONG: 90,
  HALF_DAY: 240
}

// Heures de travail par défaut
export const WORK_HOURS = {
  MORNING_START: 9,
  LUNCH_START: 12,
  AFTERNOON_START: 14,
  EVENING_END: 17,
  DAY_END: 19
}

// Préférences horaires
export const TIME_PREFERENCES = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening',
  ANY: 'any'
}

// Types de tâches
export const TASK_TYPES = {
  SOLO: 'solo',
  COMMON: 'common',
  FLEXIBLE: 'flexible'
}

// Types de récurrence
export const RECURRENCE_TYPES = {
  NONE: 'none',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  CUSTOM: 'custom'
}

// Jours de la semaine
export const DAYS_OF_WEEK = [
  { key: 'lundi', label: 'Lun', fullLabel: 'Lundi' },
  { key: 'mardi', label: 'Mar', fullLabel: 'Mardi' },
  { key: 'mercredi', label: 'Mer', fullLabel: 'Mercredi' },
  { key: 'jeudi', label: 'Jeu', fullLabel: 'Jeudi' },
  { key: 'vendredi', label: 'Ven', fullLabel: 'Vendredi' },
  { key: 'samedi', label: 'Sam', fullLabel: 'Samedi' },
  { key: 'dimanche', label: 'Dim', fullLabel: 'Dimanche' }
]

// Configuration par défaut du planning
export const DEFAULT_CONFIG = {
  weekStartDay: 'lundi',
  workDays: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
  slotDuration: DEFAULT_DURATIONS.MEDIUM
}

// Délais d'auto-save (en ms)
export const AUTO_SAVE_DELAY = 30000 // 30 secondes

// Taille maximale des listes
export const MAX_USERS = 10
export const MAX_TASKS = 100
export const MAX_MILESTONES = 20
