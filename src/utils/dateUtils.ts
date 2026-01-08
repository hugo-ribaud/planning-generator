/**
 * Utilitaires pour la manipulation des dates
 */

import { DAYS_OF_WEEK } from './constants'

/**
 * Retourne le lundi de la semaine d'une date
 */
export function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Ajuste si dimanche
  return new Date(d.setDate(diff))
}

/**
 * Ajoute des jours a une date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Formate une date en YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Formate une date en francais (ex: "Lundi 6 janvier")
 */
export function formatDateFr(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

/**
 * Retourne le nom du jour en francais pour une date
 */
export function getDayName(date: Date): string {
  const dayIndex = date.getDay()
  // getDay() retourne 0=dimanche, 1=lundi, etc.
  // Notre array est lundi=0, mardi=1, etc.
  const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1
  return DAYS_OF_WEEK[adjustedIndex].key
}

/**
 * Retourne l'index du jour (0=lundi, 6=dimanche)
 */
export function getDayIndex(dayName: string): number {
  return DAYS_OF_WEEK.findIndex(d => d.key === dayName)
}

/**
 * Genere les dates d'une semaine a partir d'une date de debut
 */
export function getWeekDates(startDate: Date): Date[] {
  const monday = getMonday(startDate)
  const dates: Date[] = []

  for (let i = 0; i < 7; i++) {
    dates.push(addDays(monday, i))
  }

  return dates
}

/**
 * Genere les dates d'un mois a partir d'une date de debut
 */
export function getMonthDates(startDate: Date): Date[] {
  const dates: Date[] = []
  const start = new Date(startDate)
  const year = start.getFullYear()
  const month = start.getMonth()

  // Nombre de jours dans le mois
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  for (let day = 1; day <= daysInMonth; day++) {
    dates.push(new Date(year, month, day))
  }

  return dates
}

/**
 * Retourne le numero de semaine ISO d'une date
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

/**
 * Verifie si une date est un jour off pour un utilisateur
 */
export function isDayOff(date: Date, daysOff: string[] = []): boolean {
  const dayName = getDayName(date)
  return daysOff.includes(dayName)
}
