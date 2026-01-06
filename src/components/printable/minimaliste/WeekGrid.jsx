/**
 * WeekGrid - Grille hebdomadaire minimaliste pour le planning imprimable
 * 7 colonnes (Lun-Dim), lignes horaires (8h-20h, slots 30min)
 * 3 sous-colonnes par jour: User1 | User2 | Commun
 */

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const DAYS_FULL_FR = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

/**
 * Genere les creneaux horaires entre startHour et endHour
 * @param {number} startHour - Heure de debut (ex: 8)
 * @param {number} endHour - Heure de fin (ex: 20)
 * @param {number} slotMinutes - Duree du creneau en minutes (ex: 30)
 * @returns {Array<{hour: number, minute: number, label: string}>}
 */
function generateTimeSlots(startHour = 8, endHour = 20, slotMinutes = 30) {
  const slots = []
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotMinutes) {
      const label = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push({ hour, minute, label })
    }
  }
  return slots
}

/**
 * Calcule les dates de la semaine a partir d'une date de debut
 * @param {Date} startDate - Date du lundi
 * @returns {Array<Date>}
 */
function getWeekDaysFromStart(startDate) {
  const days = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate)
    day.setDate(day.getDate() + i)
    days.push(day)
  }
  return days
}

/**
 * Trouve les taches pour un creneau specifique
 * @param {Array} tasks - Liste des taches
 * @param {number} dayIndex - Index du jour (0-6)
 * @param {Object} slot - Creneau horaire {hour, minute}
 * @param {string} columnType - 'user1', 'user2', ou 'common'
 * @param {Array} users - Liste des utilisateurs
 * @returns {Array} - Taches correspondantes
 */
function getTasksForSlot(tasks, dayIndex, slot, columnType, users) {
  if (!tasks || tasks.length === 0) return []

  const dayNames = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
  const currentDayName = dayNames[dayIndex]

  return tasks.filter(task => {
    // Verifier l'assignation
    if (columnType === 'common') {
      if (task.assignedTo !== 'common') return false
    } else if (columnType === 'user1' && users[0]) {
      if (task.assignedTo !== users[0].id) return false
    } else if (columnType === 'user2' && users[1]) {
      if (task.assignedTo !== users[1].id) return false
    } else {
      return false
    }

    // Verifier le jour prefere pour les taches hebdomadaires
    if (task.frequency === 'weekly' && task.preferredDays) {
      return task.preferredDays.includes(currentDayName)
    }

    // Les taches quotidiennes apparaissent tous les jours
    if (task.frequency === 'daily') {
      // Verifier l'heure preferee
      if (task.preferredTime) {
        if (task.preferredTime === 'morning' && slot.hour >= 12) return false
        if (task.preferredTime === 'evening' && slot.hour < 17) return false
      }
      return true
    }

    return false
  })
}

/**
 * Composant de cellule individuelle
 */
function GridCell({ tasks, isHeader = false }) {
  if (isHeader) {
    return (
      <div className="text-xs font-serif font-medium text-gray-600 text-center py-1 border-b border-gray-200">
        {tasks}
      </div>
    )
  }

  return (
    <div className="min-h-[24px] text-xs font-serif text-gray-800 border-b border-r border-gray-200 px-1 py-0.5 overflow-hidden">
      {tasks.map((task, idx) => (
        <div key={task.id || idx} className="truncate leading-tight">
          {task.name}
        </div>
      ))}
    </div>
  )
}

/**
 * Composant principal de la grille hebdomadaire
 * @param {Object} props
 * @param {Array} props.users - Liste des utilisateurs
 * @param {Array} props.tasks - Liste des taches
 * @param {Object} props.config - Configuration (workStart, workEnd, slotDuration)
 * @param {Date} [props.weekStart] - Date de debut de semaine
 */
export function WeekGrid({
  users = [],
  tasks = [],
  config = {},
  weekStart
}) {
  // Configuration par defaut
  const startHour = config.workStart ? parseInt(config.workStart.split(':')[0]) : 8
  const endHour = config.workEnd ? parseInt(config.workEnd.split(':')[0]) : 20
  const slotMinutes = config.slotDuration || 30

  // Generer les creneaux horaires
  const timeSlots = generateTimeSlots(startHour, endHour, slotMinutes)

  // Calculer les dates de la semaine
  const weekDays = weekStart ? getWeekDaysFromStart(weekStart) : getWeekDaysFromStart(new Date())

  // Noms des sous-colonnes
  const user1Name = users[0]?.name || 'User 1'
  const user2Name = users[1]?.name || 'User 2'

  return (
    <div className="week-grid w-full overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300 text-xs font-serif">
        {/* En-tete des jours */}
        <thead>
          {/* Ligne des jours */}
          <tr className="bg-gray-50">
            <th className="border border-gray-300 px-2 py-2 text-left font-medium text-gray-700 w-16">
              Heure
            </th>
            {DAYS_FR.map((day, dayIndex) => (
              <th
                key={day}
                colSpan={3}
                className="border border-gray-300 px-2 py-2 text-center font-medium text-gray-900"
              >
                <div className="font-bold">{day}</div>
                <div className="text-xs font-normal text-gray-500">
                  {weekDays[dayIndex]?.getDate()}/{(weekDays[dayIndex]?.getMonth() + 1).toString().padStart(2, '0')}
                </div>
              </th>
            ))}
          </tr>

          {/* Ligne des sous-colonnes (User1 | User2 | Commun) */}
          <tr className="bg-gray-100">
            <th className="border border-gray-300"></th>
            {DAYS_FR.map((day) => (
              <React.Fragment key={`sub-${day}`}>
                <th className="border border-gray-200 px-1 py-1 text-center text-xs font-normal text-gray-600 w-[60px]">
                  {user1Name.substring(0, 3)}
                </th>
                <th className="border border-gray-200 px-1 py-1 text-center text-xs font-normal text-gray-600 w-[60px]">
                  {user2Name.substring(0, 3)}
                </th>
                <th className="border border-gray-200 px-1 py-1 text-center text-xs font-normal text-gray-600 w-[60px]">
                  Com
                </th>
              </React.Fragment>
            ))}
          </tr>
        </thead>

        {/* Corps de la grille */}
        <tbody>
          {timeSlots.map((slot, slotIndex) => (
            <tr key={slot.label} className={slotIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {/* Colonne horaire */}
              <td className="border border-gray-300 px-2 py-1 text-center font-medium text-gray-600 whitespace-nowrap">
                {slot.label}
              </td>

              {/* Cellules pour chaque jour et sous-colonne */}
              {DAYS_FR.map((day, dayIndex) => (
                <React.Fragment key={`${day}-${slot.label}`}>
                  {/* User 1 */}
                  <td className="border border-gray-200 px-1 py-0.5 align-top min-w-[60px] max-w-[80px]">
                    {getTasksForSlot(tasks, dayIndex, slot, 'user1', users).map((task, idx) => (
                      <div key={task.id || idx} className="text-xs truncate leading-tight text-gray-800">
                        {task.name}
                      </div>
                    ))}
                  </td>
                  {/* User 2 */}
                  <td className="border border-gray-200 px-1 py-0.5 align-top min-w-[60px] max-w-[80px]">
                    {getTasksForSlot(tasks, dayIndex, slot, 'user2', users).map((task, idx) => (
                      <div key={task.id || idx} className="text-xs truncate leading-tight text-gray-800">
                        {task.name}
                      </div>
                    ))}
                  </td>
                  {/* Common */}
                  <td className="border border-gray-200 px-1 py-0.5 align-top min-w-[60px] max-w-[80px]">
                    {getTasksForSlot(tasks, dayIndex, slot, 'common', users).map((task, idx) => (
                      <div key={task.id || idx} className="text-xs truncate leading-tight text-gray-800">
                        {task.name}
                      </div>
                    ))}
                  </td>
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Import React pour les fragments
import React from 'react'

export default WeekGrid
