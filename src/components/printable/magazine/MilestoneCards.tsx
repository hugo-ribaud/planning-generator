import type { Milestone, User } from '../../../types'

/**
 * MilestoneCards - Editorial-style cards for milestone objectives
 * Visual cards with decorative elements and graphical progress
 */

interface PrintableMilestone extends Milestone {
  status?: 'todo' | 'in_progress' | 'done' | 'blocked'
  progress?: number
  assigned_to?: string
  target_date?: string
  title?: string
}

export interface MilestoneCardsProps {
  milestones: PrintableMilestone[]
  users: User[]
  focusMilestoneId?: string
}

interface StatusStyle {
  badge: string
  border: string
  accent: string
}

export function MilestoneCards({ milestones, users, focusMilestoneId }: MilestoneCardsProps): JSX.Element | null {
  // Filter out the focus milestone (shown separately)
  const otherMilestones = milestones.filter(m => m.id !== focusMilestoneId)

  if (otherMilestones.length === 0) {
    return null
  }

  // Get icon based on milestone status/type
  const getIcon = (milestone: PrintableMilestone): string => {
    if (milestone.status === 'done') return '&#10003;' // checkmark
    if ((milestone.progress || 0) >= 75) return '&#9733;' // star
    if ((milestone.progress || 0) >= 50) return '&#9650;' // triangle up
    if ((milestone.progress || 0) >= 25) return '&#9679;' // circle
    return '&#9675;' // empty circle
  }

  // Get status styling
  const getStatusStyle = (status: string | undefined, progress: number): StatusStyle => {
    if (status === 'done') {
      return {
        badge: 'bg-emerald-100 text-emerald-700',
        border: 'border-emerald-200',
        accent: 'bg-emerald-500',
      }
    }
    if (progress >= 75) {
      return {
        badge: 'bg-blue-100 text-blue-700',
        border: 'border-blue-200',
        accent: 'bg-blue-500',
      }
    }
    if (progress >= 50) {
      return {
        badge: 'bg-amber-100 text-amber-700',
        border: 'border-amber-200',
        accent: 'bg-amber-500',
      }
    }
    return {
      badge: 'bg-gray-100 text-gray-600',
      border: 'border-gray-200',
      accent: 'bg-gray-400',
    }
  }

  // Check if deadline is urgent
  const isUrgent = (milestone: PrintableMilestone): boolean => {
    if (!milestone.target_date) return false
    const days = Math.ceil((new Date(milestone.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days < 0 || (days <= 3 && milestone.status !== 'done')
  }

  return (
    <section className="milestone-cards">
      {/* Section header */}
      <div className="flex items-center gap-4 mb-6">
        <h3 className="font-serif text-2xl font-bold text-gray-900">
          Autres objectifs
        </h3>
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-sm text-gray-500">
          {otherMilestones.length} objectif{otherMilestones.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 gap-4">
        {otherMilestones.map((milestone) => {
          const assignedUser = users.find(u => u.id === milestone.assigned_to)
          const styles = getStatusStyle(milestone.status, milestone.progress || 0)
          const urgent = isUrgent(milestone)
          const targetDate = milestone.target_date ? new Date(milestone.target_date) : null
          const displayTitle = milestone.title || milestone.name

          return (
            <article
              key={milestone.id}
              className={`
                relative bg-white rounded-lg border overflow-hidden
                ${urgent ? 'border-red-300 ring-1 ring-red-100' : styles.border}
              `}
            >
              {/* Top accent bar */}
              <div
                className={`h-1 ${styles.accent}`}
                style={{
                  width: `${Math.max(milestone.progress || 0, 5)}%`,
                }}
              />

              <div className="p-4">
                {/* Header with icon and status */}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{
                      backgroundColor: (assignedUser?.color || '#10B981') + '15',
                      color: assignedUser?.color || '#10B981',
                    }}
                    dangerouslySetInnerHTML={{ __html: getIcon(milestone) }}
                  />

                  <div className="flex items-center gap-2">
                    {urgent && (
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">
                        Urgent
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles.badge}`}>
                      {milestone.status === 'done' ? 'Termine' :
                       milestone.status === 'in_progress' ? 'En cours' : 'A faire'}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h4 className="font-serif text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {displayTitle}
                </h4>

                {/* Description */}
                {milestone.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {milestone.description}
                  </p>
                )}

                {/* Meta row */}
                <div className="flex items-center justify-between text-sm">
                  {/* Assignee */}
                  <div className="flex items-center gap-1.5">
                    {assignedUser ? (
                      <>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: assignedUser.color }}
                        />
                        <span className="text-gray-600">{assignedUser.name}</span>
                      </>
                    ) : milestone.assigned_to === 'common' ? (
                      <>
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-gray-600">Commun</span>
                      </>
                    ) : null}
                  </div>

                  {/* Date */}
                  {targetDate && (
                    <span className={`text-xs ${urgent ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                      {targetDate.toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500">Progression</span>
                    <span className="text-sm font-bold text-gray-700">
                      {milestone.progress || 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${milestone.progress || 0}%`,
                        backgroundColor: assignedUser?.color || '#10B981',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Corner decoration for completed */}
              {milestone.status === 'done' && (
                <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden">
                  <div className="absolute transform rotate-45 bg-emerald-500 text-white text-xs w-12 text-center -right-3 top-2">
                    &#10003;
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </div>

      {/* Summary footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span>
            &#10003; {milestones.filter(m => m.status === 'done').length} termines
          </span>
          <span>
            &#9679; {milestones.filter(m => m.status === 'in_progress').length} en cours
          </span>
          <span>
            &#9675; {milestones.filter(m => m.status === 'todo').length} a faire
          </span>
        </div>
        <div className="font-medium text-gray-700">
          {Math.round(milestones.reduce((sum, m) => sum + (m.progress || 0), 0) / milestones.length)}% global
        </div>
      </div>
    </section>
  )
}
