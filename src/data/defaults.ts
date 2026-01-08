import type { TaskType, RecurrenceType, TimePreference, MilestoneStatus } from '../types'

export interface DefaultConfig {
  period: string
  work_start: string
  work_end: string
  lunch_start: string
  lunch_end: string
  slot_duration: number
}

export interface DefaultUser {
  name: string
  color: string
  days_off: string[]
}

export interface SelectOption<T = string> {
  value: T
  label: string
  color?: string
}

export const DEFAULT_CONFIG: DefaultConfig = {
  period: 'week',
  work_start: '09:00',
  work_end: '17:00',
  lunch_start: '12:30',
  lunch_end: '14:00',
  slot_duration: 30,
}

export const DEFAULT_USERS: DefaultUser[] = [
  { name: 'Hugo', color: '#3B82F6', days_off: [] },
  { name: 'Delphine', color: '#EC4899', days_off: [] },
]

export const TASK_TYPES: SelectOption<TaskType>[] = [
  { value: 'solo', label: 'Solo' },
  { value: 'common', label: 'Commun' },
  { value: 'flexible', label: 'Flexible' },
]

export const RECURRENCE_TYPES: SelectOption<RecurrenceType>[] = [
  { value: 'daily', label: 'Quotidien' },
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'once', label: 'Une fois' },
  { value: 'custom', label: 'Personnalise' },
]

export const TIME_PREFERENCES: SelectOption<TimePreference>[] = [
  { value: 'morning', label: 'Matin' },
  { value: 'afternoon', label: 'Apres-midi' },
  { value: 'evening', label: 'Soir' },
  { value: 'any', label: 'Peu importe' },
]

export const MILESTONE_STATUSES: SelectOption<MilestoneStatus>[] = [
  { value: 'todo', label: 'A faire', color: '#6B7280' },
  { value: 'in_progress', label: 'En cours', color: '#F59E0B' },
  { value: 'done', label: 'Termine', color: '#10B981' },
]

export const DAYS_OF_WEEK: SelectOption[] = [
  { value: 'lundi', label: 'Lundi' },
  { value: 'mardi', label: 'Mardi' },
  { value: 'mercredi', label: 'Mercredi' },
  { value: 'jeudi', label: 'Jeudi' },
  { value: 'vendredi', label: 'Vendredi' },
  { value: 'samedi', label: 'Samedi' },
  { value: 'dimanche', label: 'Dimanche' },
]
