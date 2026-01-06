/**
 * PrintableHeader - En-tete minimaliste pour le planning imprimable
 * Style: Police serif, couleurs noir/gris uniquement
 */

/**
 * Formate une date en francais
 * @param {Date} date - La date a formater
 * @returns {string} - Date formatee (ex: "6 janvier 2026")
 */
function formatDateFr(date) {
  const months = [
    'janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'
  ]
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

/**
 * Calcule les dates de debut et fin de semaine
 * @param {Date} referenceDate - Date de reference (par defaut: aujourd'hui)
 * @returns {{ startDate: Date, endDate: Date }} - Dates de debut (lundi) et fin (dimanche)
 */
function getWeekDates(referenceDate = new Date()) {
  const start = new Date(referenceDate)
  const day = start.getDay()
  // Ajuster pour commencer le lundi (0 = dimanche, donc on recule de 6 jours si dimanche)
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { startDate: start, endDate: end }
}

/**
 * Composant d'en-tete pour le planning imprimable
 * @param {Object} props
 * @param {Array} props.users - Liste des utilisateurs [{id, name, color}]
 * @param {Date} [props.weekStart] - Date de debut de semaine (optionnel)
 */
export function PrintableHeader({ users = [], weekStart }) {
  const { startDate, endDate } = weekStart
    ? { startDate: weekStart, endDate: new Date(new Date(weekStart).setDate(weekStart.getDate() + 6)) }
    : getWeekDates()

  const userNames = users
    .filter(u => u.name)
    .map(u => u.name)
    .join(' & ')

  return (
    <header className="print-header mb-6 pb-4 border-b border-gray-300">
      {/* Titre principal */}
      <h1 className="text-2xl font-serif font-bold text-black text-center mb-2">
        Semaine du {formatDateFr(startDate)} au {formatDateFr(endDate)}
      </h1>

      {/* Sous-titre avec les noms des utilisateurs */}
      {userNames && (
        <p className="text-base font-serif text-gray-700 text-center">
          Planning de {userNames}
        </p>
      )}
    </header>
  )
}

export default PrintableHeader
