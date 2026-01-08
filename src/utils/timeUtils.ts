/**
 * Utilitaires pour la manipulation des horaires
 */

import type { TimePreference } from '../types'

export interface TimeSlot {
  startTime: string
  endTime: string
}

/**
 * Convertit une heure "HH:mm" en minutes depuis minuit
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Convertit des minutes depuis minuit en "HH:mm"
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

/**
 * Ajoute des minutes a une heure "HH:mm"
 */
export function addMinutesToTime(time: string, minutesToAdd: number): string {
  const totalMinutes = timeToMinutes(time) + minutesToAdd
  return minutesToTime(totalMinutes)
}

/**
 * Verifie si time1 est avant time2
 */
export function isBefore(time1: string, time2: string): boolean {
  return timeToMinutes(time1) < timeToMinutes(time2)
}

/**
 * Verifie si time1 est apres ou egal a time2
 */
export function isAfterOrEqual(time1: string, time2: string): boolean {
  return timeToMinutes(time1) >= timeToMinutes(time2)
}

/**
 * Verifie si deux creneaux se chevauchent
 */
export function slotsOverlap(
  slot1Start: string,
  slot1End: string,
  slot2Start: string,
  slot2End: string
): boolean {
  const s1Start = timeToMinutes(slot1Start)
  const s1End = timeToMinutes(slot1End)
  const s2Start = timeToMinutes(slot2Start)
  const s2End = timeToMinutes(slot2End)

  return s1Start < s2End && s2Start < s1End
}

/**
 * Verifie si un creneau est dans la periode de dejeuner
 */
export function isInLunchBreak(
  startTime: string,
  endTime: string,
  lunchStart: string,
  lunchEnd: string
): boolean {
  return slotsOverlap(startTime, endTime, lunchStart, lunchEnd)
}

/**
 * Retourne la duree en minutes entre deux heures
 */
export function getDurationMinutes(startTime: string, endTime: string): number {
  return timeToMinutes(endTime) - timeToMinutes(startTime)
}

/**
 * Genere tous les creneaux horaires pour une journee
 */
export function generateDaySlots(
  workStart: string,
  workEnd: string,
  lunchStart: string,
  lunchEnd: string,
  slotDuration: number
): TimeSlot[] {
  const slots: TimeSlot[] = []
  let currentTime = timeToMinutes(workStart)
  const endTime = timeToMinutes(workEnd)
  const lunchStartMin = timeToMinutes(lunchStart)
  const lunchEndMin = timeToMinutes(lunchEnd)

  while (currentTime + slotDuration <= endTime) {
    const slotStart = currentTime
    const slotEnd = currentTime + slotDuration

    // Skip si le creneau chevauche la pause dejeuner
    if (!(slotStart < lunchEndMin && slotEnd > lunchStartMin)) {
      slots.push({
        startTime: minutesToTime(slotStart),
        endTime: minutesToTime(slotEnd),
      })
    }

    currentTime += slotDuration
  }

  return slots
}

/**
 * Determine la periode de la journee pour un creneau
 */
export function getTimePreference(time: string): TimePreference {
  const minutes = timeToMinutes(time)

  if (minutes < timeToMinutes('12:00')) {
    return 'morning'
  } else if (minutes < timeToMinutes('17:00')) {
    return 'afternoon'
  } else {
    return 'evening'
  }
}
