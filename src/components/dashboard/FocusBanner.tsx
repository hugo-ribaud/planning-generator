import { motion } from 'motion/react'
import type { Milestone, User } from '../../types'

export interface FocusBannerProps {
  milestone: Milestone | null
  users: User[]
}

/**
 * Banner affichant le milestone focus de la période
 */
export function FocusBanner({ milestone, users }: FocusBannerProps): JSX.Element {
  if (!milestone) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl p-6 border border-gray-200"
      >
        <div className="text-center">
          <span className="text-2xl mb-2 block">🎯</span>
          <h3 className="text-lg font-medium text-gray-600">Aucun objectif en focus</h3>
          <p className="text-sm text-gray-500 mt-1">
            Sélectionnez un objectif prioritaire pour le mettre en avant
          </p>
        </div>
      </motion.div>
    )
  }

  const assignedUser = users.find(u => u.id === milestone.assignedTo)
  const progress = milestone.progress || 0
  const targetDate = milestone.targetDate ? new Date(milestone.targetDate) : null
  const daysRemaining = targetDate
    ? Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-6 border border-primary/20"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🎯</span>
            <span className="text-xs font-medium px-2 py-0.5 bg-primary/20 text-primary rounded-full uppercase tracking-wide">
              Focus actuel
            </span>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {milestone.title}
          </h3>

          {milestone.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {milestone.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm">
            {assignedUser && (
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: assignedUser.color }}
                />
                <span className="text-gray-600">{assignedUser.name}</span>
              </div>
            )}

            {targetDate && daysRemaining !== null && (
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400">📅</span>
                <span className={`${daysRemaining < 0 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                  {daysRemaining < 0
                    ? `En retard de ${Math.abs(daysRemaining)} jour${Math.abs(daysRemaining) > 1 ? 's' : ''}`
                    : daysRemaining === 0
                    ? "Aujourd'hui"
                    : daysRemaining === 1
                    ? 'Demain'
                    : `${daysRemaining} jours restants`
                  }
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress circle */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-gray-200"
            />
            <motion.circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              className="text-primary"
              initial={{ strokeDasharray: '0 226' }}
              animate={{ strokeDasharray: `${(progress / 100) * 226} 226` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-900">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  )
}
