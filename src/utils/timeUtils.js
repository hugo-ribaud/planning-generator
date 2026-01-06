/**
 * Utilitaires pour la manipulation des horaires
 */

/**
 * Convertit une heure "HH:mm" en minutes depuis minuit
 */
export function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Convertit des minutes depuis minuit en "HH:mm"
 */
export function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

/**
 * Ajoute des minutes à une heure "HH:mm"
 */
export function addMinutesToTime(time, minutesToAdd) {
  const totalMinutes = timeToMinutes(time) + minutesToAdd
  return minutesToTime(totalMinutes)
}

/**
 * Vérifie si time1 est avant time2
 */
export function isBefore(time1, time2) {
  return timeToMinutes(time1) < timeToMinutes(time2)
}

/**
 * Vérifie si time1 est après ou égal à time2
 */
export function isAfterOrEqual(time1, time2) {
  return timeToMinutes(time1) >= timeToMinutes(time2)
}

/**
 * Vérifie si deux créneaux se chevauchent
 */
export function slotsOverlap(slot1Start, slot1End, slot2Start, slot2End) {
  const s1Start = timeToMinutes(slot1Start)
  const s1End = timeToMinutes(slot1End)
  const s2Start = timeToMinutes(slot2Start)
  const s2End = timeToMinutes(slot2End)

  return s1Start < s2End && s2Start < s1End
}

/**
 * Vérifie si un créneau est dans la période de déjeuner
 */
export function isInLunchBreak(startTime, endTime, lunchStart, lunchEnd) {
  return slotsOverlap(startTime, endTime, lunchStart, lunchEnd)
}

/**
 * Retourne la durée en minutes entre deux heures
 */
export function getDurationMinutes(startTime, endTime) {
  return timeToMinutes(endTime) - timeToMinutes(startTime)
}

/**
 * Génère tous les créneaux horaires pour une journée
 */
export function generateDaySlots(workStart, workEnd, lunchStart, lunchEnd, slotDuration) {
  const slots = []
  let currentTime = timeToMinutes(workStart)
  const endTime = timeToMinutes(workEnd)
  const lunchStartMin = timeToMinutes(lunchStart)
  const lunchEndMin = timeToMinutes(lunchEnd)

  while (currentTime + slotDuration <= endTime) {
    const slotStart = currentTime
    const slotEnd = currentTime + slotDuration

    // Skip si le créneau chevauche la pause déjeuner
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
 * Détermine la période de la journée pour un créneau
 */
export function getTimePreference(time) {
  const minutes = timeToMinutes(time)

  if (minutes < timeToMinutes('12:00')) {
    return 'morning'
  } else if (minutes < timeToMinutes('17:00')) {
    return 'afternoon'
  } else {
    return 'evening'
  }
}
