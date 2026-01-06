export const DEFAULT_CONFIG = {
  period: 'week',
  work_start: '09:00',
  work_end: '17:00',
  lunch_start: '12:30',
  lunch_end: '14:00',
  slot_duration: 30,
}

export const DEFAULT_USERS = [
  { name: 'Hugo', color: '#3B82F6', days_off: [] },
  { name: 'Delphine', color: '#EC4899', days_off: [] },
]

export const TASK_TYPES = [
  { value: 'solo', label: 'Solo' },
  { value: 'common', label: 'Commun' },
  { value: 'flexible', label: 'Flexible' },
]

export const RECURRENCE_TYPES = [
  { value: 'daily', label: 'Quotidien' },
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'once', label: 'Une fois' },
  { value: 'custom', label: 'Personnalisé' },
]

export const TIME_PREFERENCES = [
  { value: 'morning', label: 'Matin' },
  { value: 'afternoon', label: 'Après-midi' },
  { value: 'evening', label: 'Soir' },
  { value: 'any', label: 'Peu importe' },
]

export const MILESTONE_STATUSES = [
  { value: 'todo', label: 'À faire', color: '#6B7280' },
  { value: 'in_progress', label: 'En cours', color: '#F59E0B' },
  { value: 'done', label: 'Terminé', color: '#10B981' },
]

export const DAYS_OF_WEEK = [
  { value: 'lundi', label: 'Lundi' },
  { value: 'mardi', label: 'Mardi' },
  { value: 'mercredi', label: 'Mercredi' },
  { value: 'jeudi', label: 'Jeudi' },
  { value: 'vendredi', label: 'Vendredi' },
  { value: 'samedi', label: 'Samedi' },
  { value: 'dimanche', label: 'Dimanche' },
]
