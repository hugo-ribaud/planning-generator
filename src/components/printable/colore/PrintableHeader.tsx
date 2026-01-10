import { useMemo } from 'react'
import type { User, PlanningConfig } from '../../../types'

/**
 * PrintableHeader - Vibrant header for colorful printable planning
 * Features gradient title, colored user avatars, and period badges
 */

// Default user colors
const USER_COLORS: Record<string, string> = {
  'user-hugo': '#3B82F6',    // Blue
  'user-delphine': '#EC4899', // Pink
  common: '#10B981',          // Green
}

/**
 * Get initials from a name
 */
function getInitials(name: string | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Format date range for display
 */
function formatDateRange(startDate: Date, endDate: Date): string {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }
  const start = startDate.toLocaleDateString('fr-FR', options)
  const end = endDate.toLocaleDateString('fr-FR', options)
  const year = startDate.getFullYear()
  return `${start} - ${end} ${year}`
}

interface UserAvatarProps {
  user: User
  size?: 'sm' | 'md' | 'lg'
}

/**
 * UserAvatar - Colored circular avatar with initials
 */
function UserAvatar({ user, size = 'md' }: UserAvatarProps): JSX.Element {
  const color = user.color || USER_COLORS[user.id] || '#6B7280'

  const sizeClasses: Record<string, string> = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white shadow-sm print:shadow-none`}
      style={{ backgroundColor: color }}
    >
      {getInitials(user.name)}
    </div>
  )
}

type PeriodType = 'week' | 'biweek' | 'month'

interface PeriodBadgeProps {
  type: PeriodType
  count: number
}

/**
 * PeriodBadge - Badge showing the planning period
 */
function PeriodBadge({ type, count }: PeriodBadgeProps): JSX.Element {
  const labels: Record<PeriodType, { singular: string; plural: string }> = {
    week: { singular: 'semaine', plural: 'semaines' },
    biweek: { singular: 'quinzaine', plural: 'quinzaines' },
    month: { singular: 'mois', plural: 'mois' },
  }

  const label = labels[type] || labels.week
  const text = count > 1 ? label.plural : label.singular

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-50 to-pink-50 text-gray-700 border border-gray-200 print:border-gray-300">
      <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-pink-500"></span>
      {count} {text}
    </span>
  )
}

interface PrintableHeaderConfig extends Partial<PlanningConfig> {
  periodType?: PeriodType
  periodCount?: number
}

export interface PrintableHeaderProps {
  users?: User[]
  config?: PrintableHeaderConfig
  startDate?: Date
  endDate?: Date
  title?: string
}

/**
 * PrintableHeader Component
 */
export function PrintableHeader({
  users = [],
  config = {},
  startDate,
  endDate,
  title = 'Planorai'
}: PrintableHeaderProps): JSX.Element {
  const dateRange = useMemo(() => {
    if (startDate && endDate) {
      return formatDateRange(startDate, endDate)
    }
    // Default to current week
    const now = new Date()
    const start = new Date(now)
    start.setDate(now.getDate() - now.getDay() + 1) // Monday
    const end = new Date(start)
    end.setDate(start.getDate() + 6) // Sunday
    return formatDateRange(start, end)
  }, [startDate, endDate])

  return (
    <header className="printable-header mb-6 print:mb-4">
      {/* Main Header Row */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b-2 border-gradient print:border-gray-300">
        {/* Title Section */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent print:text-gray-900 print:bg-none">
            {title}
          </h1>
          <p className="text-sm text-gray-500 mt-1 print:text-gray-600">
            {dateRange}
          </p>
        </div>

        {/* Users Section */}
        <div className="flex items-center gap-3">
          {/* User Avatars */}
          <div className="flex items-center -space-x-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="relative"
                title={user.name}
              >
                <UserAvatar user={user} size="md" />
              </div>
            ))}
          </div>

          {/* User Names */}
          <div className="flex items-center gap-2 text-sm">
            {users.map((user, index) => (
              <span key={user.id} className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: user.color || USER_COLORS[user.id] || '#6B7280' }}
                ></span>
                <span className="font-medium text-gray-700">{user.name}</span>
                {index < users.length - 1 && <span className="text-gray-300 mx-1">&</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Period Badge */}
        <div className="flex-shrink-0">
          <PeriodBadge
            type={config.periodType || 'week'}
            count={config.periodCount || 1}
          />
        </div>
      </div>

      {/* Legend Row */}
      <div className="flex items-center justify-between gap-4 pt-3 text-xs text-gray-500">
        {/* Color Legend */}
        <div className="flex items-center gap-4">
          {users.map((user) => (
            <span key={user.id} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded"
                style={{
                  backgroundColor: user.color || USER_COLORS[user.id] || '#6B7280',
                  opacity: 0.2,
                  border: `2px solid ${user.color || USER_COLORS[user.id] || '#6B7280'}`
                }}
              ></span>
              <span>{user.name}</span>
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded"
              style={{
                backgroundColor: USER_COLORS.common,
                opacity: 0.2,
                border: `2px solid ${USER_COLORS.common}`
              }}
            ></span>
            <span>Commun</span>
          </span>
        </div>

        {/* Priority Legend */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="text-red-500">●</span>
            <span>Haute</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-yellow-500">●</span>
            <span>Moyenne</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-green-500">●</span>
            <span>Basse</span>
          </span>
        </div>
      </div>

      {/* Gradient border effect for screen */}
      <style>{`
        @media screen {
          .printable-header .border-gradient {
            border-image: linear-gradient(to right, #3B82F6, #8B5CF6, #EC4899) 1;
          }
        }
      `}</style>
    </header>
  )
}

export default PrintableHeader
