import { motion, AnimatePresence } from 'motion/react'
import type { Milestone, User } from '../../types'

export interface MilestoneTimelineProps {
  upcomingMilestones: Milestone[]
  overdueMilestones: Milestone[]
  users: User[]
}

/**
 * Timeline chronologique des milestones
 */
export function MilestoneTimeline({ upcomingMilestones, overdueMilestones, users }: MilestoneTimelineProps): JSX.Element {
  /**
   * Récupère la date cible d'un milestone (supporte les deux formats)
   */
  const getTargetDate = (milestone: Milestone): string | undefined => {
    return milestone.targetDate || milestone.target_date
  }

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }

  const getDaysText = (dateString: string | undefined): string => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    const days = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return "Aujourd'hui"
    if (days === 1) return 'Demain'
    if (days < 0) return `Il y a ${Math.abs(days)} jour${Math.abs(days) > 1 ? 's' : ''}`
    return `Dans ${days} jour${days > 1 ? 's' : ''}`
  }

  const getUserInfo = (userId?: string): User | undefined => {
    return users.find(u => u.id === userId)
  }

  const hasNoItems = upcomingMilestones.length === 0 && overdueMilestones.length === 0

  if (hasNoItems) {
    return (
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Timeline</h3>
        <div className="text-center py-6 sm:py-8 text-gray-500">
          <span className="text-2xl sm:text-3xl mb-2 block">📅</span>
          <p className="text-sm sm:text-base">Aucun objectif avec date cible</p>
          <p className="text-xs sm:text-sm mt-1">Ajoutez des dates a vos objectifs pour les voir ici</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Timeline</h3>

      <div className="space-y-4 sm:space-y-6">
        {/* Overdue section */}
        <AnimatePresence>
          {overdueMilestones.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-red-500">⚠️</span>
                <h4 className="text-sm font-semibold text-red-600">En retard</h4>
              </div>

              <div className="space-y-2 pl-6 border-l-2 border-red-200">
                {overdueMilestones.map((milestone, index) => {
                  const user = getUserInfo(milestone.assignedTo)
                  return (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative"
                    >
                      <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-red-400 border-2 border-white" />
                      <div className="bg-red-50 rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{milestone.title}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs">
                              <span className="text-red-600">{getDaysText(getTargetDate(milestone))}</span>
                              {user && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: user.color }}
                                  />
                                  <span className="text-gray-500">{user.name}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">{formatDate(getTargetDate(milestone))}</span>
                        </div>

                        {/* Progress mini */}
                        <div className="mt-2 h-1 bg-red-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-400 rounded-full"
                            style={{ width: `${milestone.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upcoming section */}
        <AnimatePresence>
          {upcomingMilestones.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-primary">📅</span>
                <h4 className="text-sm font-semibold text-gray-700">Cette semaine</h4>
              </div>

              <div className="space-y-2 pl-6 border-l-2 border-primary/30">
                {upcomingMilestones.map((milestone, index) => {
                  const user = getUserInfo(milestone.assignedTo)
                  const isToday = getDaysText(getTargetDate(milestone)) === "Aujourd'hui"
                  const isTomorrow = getDaysText(getTargetDate(milestone)) === 'Demain'

                  return (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative"
                    >
                      <div
                        className={`absolute -left-[25px] w-3 h-3 rounded-full border-2 border-white ${
                          isToday ? 'bg-primary' : isTomorrow ? 'bg-primary/70' : 'bg-primary/40'
                        }`}
                      />
                      <div className={`rounded-lg p-3 ${isToday ? 'bg-primary/5' : 'bg-gray-50'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{milestone.title}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs">
                              <span className={isToday ? 'text-primary font-medium' : 'text-gray-500'}>
                                {getDaysText(getTargetDate(milestone))}
                              </span>
                              {user && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: user.color }}
                                  />
                                  <span className="text-gray-500">{user.name}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">{formatDate(getTargetDate(milestone))}</span>
                        </div>

                        {/* Progress mini */}
                        <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${milestone.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
