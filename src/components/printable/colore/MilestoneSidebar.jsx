/**
 * MilestoneSidebar - Sidebar with progress bars for milestones
 * Features colored progress indicators, user pastilles, and focus section
 */

import { useMemo } from 'react'

// Default user colors
const USER_COLORS = {
  'user-hugo': '#3B82F6',    // Blue
  'user-delphine': '#EC4899', // Pink
  common: '#10B981',          // Green
}

// Status configuration
const STATUS_CONFIG = {
  todo: { label: 'A faire', color: '#9CA3AF', bgColor: '#F3F4F6' },
  in_progress: { label: 'En cours', color: '#3B82F6', bgColor: '#EFF6FF' },
  done: { label: 'Termine', color: '#10B981', bgColor: '#ECFDF5' },
  blocked: { label: 'Bloque', color: '#EF4444', bgColor: '#FEF2F2' },
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

/**
 * Check if date is overdue
 */
function isOverdue(dateString) {
  if (!dateString) return false
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

/**
 * Get days remaining
 */
function getDaysRemaining(dateString) {
  if (!dateString) return null
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffTime = date - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * ProgressBar - Colored progress bar with percentage
 */
function ProgressBar({ progress, color, size = 'md' }) {
  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }

  return (
    <div className={`w-full ${heights[size]} bg-gray-100 rounded-full overflow-hidden print:bg-gray-200`}>
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{
          width: `${Math.min(100, Math.max(0, progress))}%`,
          backgroundColor: color,
        }}
      />
    </div>
  )
}

/**
 * UserPastille - Small colored indicator for user
 */
function UserPastille({ userId, users }) {
  const user = users?.find(u => u.id === userId)
  const color = user?.color || USER_COLORS[userId] || USER_COLORS.common

  const label = userId === 'common'
    ? 'Commun'
    : user?.name || 'Inconnu'

  return (
    <span
      className="inline-flex items-center gap-1 text-[10px]"
      title={label}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-gray-500 print:text-gray-600">{label}</span>
    </span>
  )
}

/**
 * MilestoneCard - Individual milestone display
 */
function MilestoneCard({ milestone, users, isFocus = false }) {
  const color = milestone.assigned_to
    ? (users?.find(u => u.id === milestone.assigned_to)?.color || USER_COLORS[milestone.assigned_to] || USER_COLORS.common)
    : USER_COLORS.common

  const statusConfig = STATUS_CONFIG[milestone.status] || STATUS_CONFIG.todo
  const overdue = isOverdue(milestone.target_date) && milestone.status !== 'done'
  const daysRemaining = getDaysRemaining(milestone.target_date)

  return (
    <div
      className={`
        p-2.5 rounded-lg border print:rounded print:p-2
        ${isFocus ? 'border-2' : 'border'}
        ${overdue ? 'border-red-300 bg-red-50/50' : ''}
      `}
      style={{
        borderColor: isFocus ? color : undefined,
        backgroundColor: isFocus ? `${color}08` : undefined,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex-1 min-w-0">
          <h4 className={`text-xs font-semibold text-gray-800 truncate ${isFocus ? 'text-sm' : ''}`}>
            {isFocus && <span className="mr-1">🎯</span>}
            {milestone.title}
          </h4>
        </div>
        <UserPastille userId={milestone.assigned_to} users={users} />
      </div>

      {/* Progress */}
      <div className="mb-1.5">
        <ProgressBar
          progress={milestone.progress || 0}
          color={color}
          size={isFocus ? 'md' : 'sm'}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px]">
        <span
          className="px-1.5 py-0.5 rounded text-[9px] font-medium"
          style={{
            backgroundColor: statusConfig.bgColor,
            color: statusConfig.color,
          }}
        >
          {statusConfig.label}
        </span>

        <span className={`flex items-center gap-1 ${overdue ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
          {overdue ? (
            <>
              <span>⚠️</span>
              <span>En retard</span>
            </>
          ) : daysRemaining !== null ? (
            <>
              <span>📅</span>
              <span>
                {daysRemaining === 0 ? 'Aujourd\'hui' : `${daysRemaining}j`}
              </span>
            </>
          ) : null}
        </span>

        <span className="font-bold" style={{ color }}>
          {milestone.progress || 0}%
        </span>
      </div>
    </div>
  )
}

/**
 * MilestoneSidebar Component
 */
export function MilestoneSidebar({
  milestones = [],
  users = [],
  showCompleted = false,
  maxVisible = 6,
}) {
  // Separate focus milestone and others
  const { focusMilestone, otherMilestones } = useMemo(() => {
    const focus = milestones.find(m => m.is_focus && m.status !== 'done')

    let others = milestones.filter(m => !m.is_focus)

    // Filter completed if not showing them
    if (!showCompleted) {
      others = others.filter(m => m.status !== 'done')
    }

    // Sort by priority: overdue first, then by progress (desc), then by date
    others.sort((a, b) => {
      const aOverdue = isOverdue(a.target_date) && a.status !== 'done'
      const bOverdue = isOverdue(b.target_date) && b.status !== 'done'

      if (aOverdue && !bOverdue) return -1
      if (!aOverdue && bOverdue) return 1

      // In progress before todo
      if (a.status === 'in_progress' && b.status !== 'in_progress') return -1
      if (a.status !== 'in_progress' && b.status === 'in_progress') return 1

      // Higher progress first
      return (b.progress || 0) - (a.progress || 0)
    })

    return { focusMilestone: focus, otherMilestones: others }
  }, [milestones, showCompleted])

  // Calculate stats
  const stats = useMemo(() => {
    const total = milestones.length
    const completed = milestones.filter(m => m.status === 'done').length
    const inProgress = milestones.filter(m => m.status === 'in_progress').length
    const overdue = milestones.filter(m => isOverdue(m.target_date) && m.status !== 'done').length

    return { total, completed, inProgress, overdue }
  }, [milestones])

  if (milestones.length === 0) {
    return (
      <div className="milestone-sidebar p-4 bg-gray-50 rounded-lg border border-gray-200 print:bg-white print:border-gray-300">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Objectifs</h3>
        <p className="text-xs text-gray-400 italic">Aucun objectif defini</p>
      </div>
    )
  }

  const visibleMilestones = otherMilestones.slice(0, focusMilestone ? maxVisible - 1 : maxVisible)
  const remaining = otherMilestones.length - visibleMilestones.length

  return (
    <div className="milestone-sidebar space-y-3 print:space-y-2">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800">Objectifs</h3>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
            {stats.inProgress} en cours
          </span>
          {stats.overdue > 0 && (
            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
              {stats.overdue} en retard
            </span>
          )}
          <span className="text-gray-400">
            {stats.completed}/{stats.total}
          </span>
        </div>
      </div>

      {/* Focus Section */}
      {focusMilestone && (
        <div className="focus-section">
          <div className="flex items-center gap-1 mb-1.5">
            <span className="text-xs font-semibold text-gray-600">Focus de la semaine</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded">
              Priorite
            </span>
          </div>
          <MilestoneCard
            milestone={focusMilestone}
            users={users}
            isFocus={true}
          />
        </div>
      )}

      {/* Other Milestones */}
      {visibleMilestones.length > 0 && (
        <div className="other-milestones space-y-2 print:space-y-1.5">
          {focusMilestone && (
            <div className="text-xs font-semibold text-gray-600 pt-1">
              Autres objectifs
            </div>
          )}
          {visibleMilestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              users={users}
              isFocus={false}
            />
          ))}
          {remaining > 0 && (
            <div className="text-[10px] text-gray-400 italic text-center pt-1">
              +{remaining} autre{remaining > 1 ? 's' : ''} objectif{remaining > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {/* Progress Summary */}
      <div className="pt-2 border-t border-gray-200 print:border-gray-300">
        <div className="text-xs text-gray-600 mb-1.5">Progression globale</div>
        <div className="space-y-1">
          {users.map(user => {
            const userMilestones = milestones.filter(m => m.assigned_to === user.id)
            const avgProgress = userMilestones.length > 0
              ? Math.round(userMilestones.reduce((acc, m) => acc + (m.progress || 0), 0) / userMilestones.length)
              : 0

            return (
              <div key={user.id} className="flex items-center gap-2">
                <span className="w-16 text-[10px] text-gray-500 truncate">{user.name}</span>
                <div className="flex-1">
                  <ProgressBar progress={avgProgress} color={user.color || USER_COLORS[user.id]} size="sm" />
                </div>
                <span className="w-8 text-[10px] text-gray-500 text-right">{avgProgress}%</span>
              </div>
            )
          })}
          {/* Common milestones */}
          {milestones.some(m => m.assigned_to === 'common') && (
            <div className="flex items-center gap-2">
              <span className="w-16 text-[10px] text-gray-500 truncate">Commun</span>
              <div className="flex-1">
                <ProgressBar
                  progress={
                    Math.round(
                      milestones
                        .filter(m => m.assigned_to === 'common')
                        .reduce((acc, m) => acc + (m.progress || 0), 0) /
                      milestones.filter(m => m.assigned_to === 'common').length || 0
                    )
                  }
                  color={USER_COLORS.common}
                  size="sm"
                />
              </div>
              <span className="w-8 text-[10px] text-gray-500 text-right">
                {Math.round(
                  milestones
                    .filter(m => m.assigned_to === 'common')
                    .reduce((acc, m) => acc + (m.progress || 0), 0) /
                  milestones.filter(m => m.assigned_to === 'common').length || 0
                )}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MilestoneSidebar
