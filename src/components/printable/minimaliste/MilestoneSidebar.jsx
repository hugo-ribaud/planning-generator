/**
 * MilestoneSidebar - Sidebar droite avec objectifs en cours
 * Style: Epure, liste a puces, checklist simple avec cases a cocher
 */

/**
 * Formate une date relative en francais
 * @param {string} dateStr - Date ISO string
 * @returns {string} - Date formatee ou indication relative
 */
function formatTargetDate(dateStr) {
  if (!dateStr) return ''

  const target = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)

  const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return `En retard (${Math.abs(diffDays)}j)`
  } else if (diffDays === 0) {
    return "Aujourd'hui"
  } else if (diffDays === 1) {
    return 'Demain'
  } else if (diffDays <= 7) {
    return `Dans ${diffDays} jours`
  } else {
    const day = target.getDate()
    const month = target.getMonth() + 1
    return `${day}/${month.toString().padStart(2, '0')}`
  }
}

/**
 * Retourne le statut en francais
 * @param {string} status - Statut technique
 * @returns {string} - Statut lisible
 */
function getStatusLabel(status) {
  const labels = {
    todo: 'A faire',
    in_progress: 'En cours',
    done: 'Termine',
  }
  return labels[status] || status
}

/**
 * Trouve le nom de l'utilisateur assigne
 * @param {string} assignedTo - ID de l'utilisateur ou 'common'
 * @param {Array} users - Liste des utilisateurs
 * @returns {string}
 */
function getAssigneeName(assignedTo, users) {
  if (assignedTo === 'common') return 'Commun'
  const user = users.find(u => u.id === assignedTo)
  return user?.name || ''
}

/**
 * Composant pour un objectif individuel
 */
function MilestoneItem({ milestone, users }) {
  const isCompleted = milestone.status === 'done'
  const isOverdue = milestone.target_date && new Date(milestone.target_date) < new Date() && !isCompleted
  const isFocus = milestone.is_focus

  return (
    <div className={`mb-4 pb-3 border-b border-gray-200 last:border-b-0 ${isFocus ? 'bg-gray-50 -mx-2 px-2 py-2 rounded' : ''}`}>
      {/* Case a cocher et titre */}
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5">
          <div
            className={`w-4 h-4 border rounded-sm flex items-center justify-center
              ${isCompleted ? 'border-gray-400 bg-gray-100' : 'border-gray-400 bg-white'}`}
          >
            {isCompleted && (
              <span className="text-gray-600 text-xs font-bold">x</span>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Titre avec indicateur focus */}
          <h4 className={`font-serif text-sm font-medium leading-tight
            ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}
            ${isFocus ? 'font-bold' : ''}`}
          >
            {isFocus && <span className="text-gray-600 mr-1">*</span>}
            {milestone.title}
          </h4>

          {/* Meta informations */}
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
            {/* Assignation */}
            <span>{getAssigneeName(milestone.assigned_to, users)}</span>

            {/* Echeance */}
            {milestone.target_date && (
              <span className={isOverdue ? 'font-bold text-gray-700' : ''}>
                {formatTargetDate(milestone.target_date)}
              </span>
            )}

            {/* Progression */}
            {typeof milestone.progress === 'number' && milestone.progress > 0 && !isCompleted && (
              <span>{milestone.progress}%</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Composant principal de la sidebar des objectifs
 * @param {Object} props
 * @param {Array} props.milestones - Liste des objectifs
 * @param {Array} props.users - Liste des utilisateurs
 * @param {boolean} [props.showCompleted=false] - Afficher les objectifs termines
 */
export function MilestoneSidebar({
  milestones = [],
  users = [],
  showCompleted = false
}) {
  // Filtrer et trier les objectifs
  const filteredMilestones = milestones
    .filter(m => showCompleted || m.status !== 'done')
    .sort((a, b) => {
      // Focus en premier
      if (a.is_focus && !b.is_focus) return -1
      if (!a.is_focus && b.is_focus) return 1

      // Puis par statut (in_progress > todo > done)
      const statusOrder = { in_progress: 0, todo: 1, done: 2 }
      const statusDiff = (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99)
      if (statusDiff !== 0) return statusDiff

      // Enfin par date cible
      if (a.target_date && b.target_date) {
        return new Date(a.target_date) - new Date(b.target_date)
      }
      return 0
    })

  // Separer les objectifs par statut
  const inProgress = filteredMilestones.filter(m => m.status === 'in_progress')
  const todo = filteredMilestones.filter(m => m.status === 'todo')
  const done = filteredMilestones.filter(m => m.status === 'done')

  if (filteredMilestones.length === 0) {
    return (
      <aside className="milestone-sidebar w-64 flex-shrink-0 border-l border-gray-300 pl-4">
        <h3 className="font-serif font-bold text-base text-gray-900 mb-4">
          Objectifs
        </h3>
        <p className="text-sm text-gray-500 italic">Aucun objectif en cours</p>
      </aside>
    )
  }

  return (
    <aside className="milestone-sidebar w-64 flex-shrink-0 border-l border-gray-300 pl-4">
      <h3 className="font-serif font-bold text-base text-gray-900 mb-4">
        Objectifs
      </h3>

      {/* En cours */}
      {inProgress.length > 0 && (
        <div className="mb-4">
          <h4 className="font-serif text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            En cours ({inProgress.length})
          </h4>
          {inProgress.map(milestone => (
            <MilestoneItem
              key={milestone.id}
              milestone={milestone}
              users={users}
            />
          ))}
        </div>
      )}

      {/* A faire */}
      {todo.length > 0 && (
        <div className="mb-4">
          <h4 className="font-serif text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            A faire ({todo.length})
          </h4>
          {todo.map(milestone => (
            <MilestoneItem
              key={milestone.id}
              milestone={milestone}
              users={users}
            />
          ))}
        </div>
      )}

      {/* Termines (si affiche) */}
      {showCompleted && done.length > 0 && (
        <div className="mb-4">
          <h4 className="font-serif text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            Termines ({done.length})
          </h4>
          {done.map(milestone => (
            <MilestoneItem
              key={milestone.id}
              milestone={milestone}
              users={users}
            />
          ))}
        </div>
      )}

      {/* Legende */}
      <div className="mt-6 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-400 italic">
          * Objectif prioritaire
        </p>
      </div>
    </aside>
  )
}

export default MilestoneSidebar
