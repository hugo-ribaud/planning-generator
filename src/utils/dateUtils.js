/**
 * Utilitaires pour la manipulation des dates
 */

import { DAYS_OF_WEEK } from '../data/defaults'

/**
 * Retourne le lundi de la semaine d'une date
 */
export function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Ajuste si dimanche
  return new Date(d.setDate(diff))
}

/**
 * Ajoute des jours à une date
 */
export function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Formate une date en YYYY-MM-DD
 */
export function formatDate(date) {
  return date.toISOString().split('T')[0]
}

/**
 * Formate une date en français (ex: "Lundi 6 janvier")
 */
export function formatDateFr(date) {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

/**
 * Retourne le nom du jour en français pour une date
 */
export function getDayName(date) {
  const dayIndex = date.getDay()
  // getDay() retourne 0=dimanche, 1=lundi, etc.
  // Notre array est lundi=0, mardi=1, etc.
  const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1
  return DAYS_OF_WEEK[adjustedIndex].value
}

/**
 * Retourne l'index du jour (0=lundi, 6=dimanche)
 */
export function getDayIndex(dayName) {
  return DAYS_OF_WEEK.findIndex(d => d.value === dayName)
}

/**
 * Génère les dates d'une semaine à partir d'une date de début
 */
export function getWeekDates(startDate) {
  const monday = getMonday(startDate)
  const dates = []

  for (let i = 0; i < 7; i++) {
    dates.push(addDays(monday, i))
  }

  return dates
}

/**
 * Génère les dates d'un mois à partir d'une date de début
 */
export function getMonthDates(startDate) {
  const dates = []
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
 * Retourne le numéro de semaine ISO d'une date
 */
export function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

/**
 * Vérifie si une date est un jour off pour un utilisateur
 */
export function isDayOff(date, daysOff = []) {
  const dayName = getDayName(date)
  return daysOff.includes(dayName)
}
