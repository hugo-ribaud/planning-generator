import type { Task, User } from '../../../types'

/**
 * TaskBadge - Colorful task badge for printable planning
 * Features colored background, category icons, and duration display
 */

// Default user colors
const USER_COLORS: Record<string, string> = {
  'user-hugo': '#3B82F6',    // Blue
  'user-delphine': '#EC4899', // Pink
  common: '#10B981',          // Green
}

// Task category icons
const CATEGORY_ICONS: Record<string, string> = {
  // Household
  cuisine: '🍳',
  menage: '🧹',
  lessive: '🧺',
  courses: '🛒',
  jardinage: '🌱',
  bricolage: '🔧',
  garage: '🚗',

  // Personal care
  sport: '💪',
  yoga: '🧘',
  meditation: '🧘',
  sante: '❤️',

  // Pets
  chien: '🐕',
  chat: '🐱',
  animaux: '🐾',

  // Work & Projects
  travail: '💼',
  projet: '💻',
  code: '👨‍💻',
  reunion: '📅',
  certification: '🎓',

  // Social & Family
  famille: '👨‍👩‍👧',
  parents: '📞',
  amis: '👥',
  sortie: '🎉',

  // Hobbies
  lecture: '📚',
  poterie: '🏺',
  musique: '🎵',
  art: '🎨',

  // Admin
  impots: '📋',
  admin: '📄',
  banque: '🏦',

  // Default
  default: '📌',
}

type TaskPriority = 'high' | 'medium' | 'low'

/**
 * Detect category from task name
 */
function detectCategory(taskName: string): string {
  const name = taskName.toLowerCase()

  // Kitchen & Food
  if (name.includes('petit-dejeuner') || name.includes('repas') || name.includes('diner') || name.includes('dejeuner') || name.includes('cuisine')) {
    return 'cuisine'
  }
  // Cleaning
  if (name.includes('menage') || name.includes('nettoyer') || name.includes('ranger')) {
    return 'menage'
  }
  // Laundry
  if (name.includes('lessive') || name.includes('linge') || name.includes('repassage')) {
    return 'lessive'
  }
  // Shopping
  if (name.includes('courses') || name.includes('acheter') || name.includes('shopping')) {
    return 'courses'
  }
  // Garden
  if (name.includes('jardin') || name.includes('plante') || name.includes('arros')) {
    return 'jardinage'
  }
  // DIY
  if (name.includes('bricolage') || name.includes('reparer') || name.includes('cloture')) {
    return 'bricolage'
  }
  // Garage
  if (name.includes('garage') || name.includes('voiture')) {
    return 'garage'
  }
  // Sport
  if (name.includes('sport') || name.includes('salle') || name.includes('fitness') || name.includes('course')) {
    return 'sport'
  }
  // Yoga
  if (name.includes('yoga') || name.includes('stretching')) {
    return 'yoga'
  }
  // Meditation
  if (name.includes('meditation') || name.includes('mediter')) {
    return 'meditation'
  }
  // Dog
  if (name.includes('chien') || name.includes('promener') || name.includes('sortir le')) {
    return 'chien'
  }
  // Work & Projects
  if (name.includes('projet') || name.includes('code') || name.includes('dev')) {
    return 'code'
  }
  if (name.includes('certification') || name.includes('formation') || name.includes('cours')) {
    return 'certification'
  }
  // Family & Social
  if (name.includes('parent') || name.includes('appeler') || name.includes('telephone')) {
    return 'parents'
  }
  if (name.includes('famille')) {
    return 'famille'
  }
  // Hobbies
  if (name.includes('lecture') || name.includes('lire') || name.includes('livre')) {
    return 'lecture'
  }
  if (name.includes('poterie')) {
    return 'poterie'
  }
  // Admin
  if (name.includes('impot') || name.includes('declarer')) {
    return 'impots'
  }
  if (name.includes('vacances')) {
    return 'sortie'
  }

  return 'default'
}

/**
 * Format duration for display
 */
function formatDuration(minutes: number | undefined): string {
  if (!minutes) return ''
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours}h`
  return `${hours}h${mins}`
}

interface PriorityIndicatorProps {
  priority?: TaskPriority | number
}

/**
 * Get priority indicator
 */
function PriorityIndicator({ priority }: PriorityIndicatorProps): JSX.Element {
  const indicators: Record<string, { color: string; symbol: string }> = {
    high: { color: 'text-red-500', symbol: '●' },
    medium: { color: 'text-yellow-500', symbol: '●' },
    low: { color: 'text-green-500', symbol: '●' },
  }

  const priorityKey = typeof priority === 'number'
    ? (priority <= 1 ? 'high' : priority <= 2 ? 'medium' : 'low')
    : (priority || 'medium')
  const indicator = indicators[priorityKey] || indicators.medium

  return (
    <span className={`${indicator.color} text-[8px] leading-none`}>
      {indicator.symbol}
    </span>
  )
}

export interface TaskBadgeProps {
  task: Task
  user?: User | null
  compact?: boolean
  showDuration?: boolean
  showIcon?: boolean
  showPriority?: boolean
}

/**
 * Adjust color for better text readability
 */
function adjustColorForReadability(hex: string): string {
  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  // Darken the color for text
  const darken = (c: number): number => Math.max(0, Math.floor(c * 0.6))

  return `rgb(${darken(r)}, ${darken(g)}, ${darken(b)})`
}

/**
 * TaskBadge Component
 */
export function TaskBadge({
  task,
  user,
  compact = false,
  showDuration = true,
  showIcon = true,
  showPriority = true,
}: TaskBadgeProps): JSX.Element {
  const color = user?.color || USER_COLORS[task.assignedTo || ''] || USER_COLORS.common
  const category = detectCategory(task.name)
  const icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.default

  // Generate background with opacity
  const backgroundColor = `${color}1A` // 10% opacity in hex
  const borderColor = `${color}4D` // 30% opacity in hex

  if (compact) {
    return (
      <div
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium truncate max-w-full"
        style={{
          backgroundColor,
          borderLeft: `3px solid ${color}`,
        }}
        title={task.name}
      >
        {showIcon && <span className="flex-shrink-0">{icon}</span>}
        <span className="truncate text-gray-800">{task.name}</span>
        {showPriority && (
          <PriorityIndicator priority={task.priority} />
        )}
      </div>
    )
  }

  return (
    <div
      className="flex items-start gap-2 px-2.5 py-1.5 rounded-lg text-xs print:text-[10px]"
      style={{
        backgroundColor,
        border: `1px solid ${borderColor}`,
      }}
    >
      {/* Icon */}
      {showIcon && (
        <span className="flex-shrink-0 text-sm print:text-xs">{icon}</span>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          {/* Task Name */}
          <span
            className="font-medium text-gray-800 truncate"
            style={{ color: adjustColorForReadability(color) }}
          >
            {task.name}
          </span>
          {/* Priority */}
          {showPriority && (
            <PriorityIndicator priority={task.priority} />
          )}
        </div>

        {/* Duration */}
        {showDuration && task.duration && (
          <span className="text-[10px] text-gray-500">
            {formatDuration(task.duration)}
          </span>
        )}
      </div>
    </div>
  )
}

export interface TaskBadgeGroupProps {
  tasks: Task[]
  users?: User[]
  maxVisible?: number
}

/**
 * TaskBadgeGroup - Group multiple tasks together
 */
export function TaskBadgeGroup({ tasks, users, maxVisible = 3 }: TaskBadgeGroupProps): JSX.Element {
  const visibleTasks = tasks.slice(0, maxVisible)
  const remaining = tasks.length - maxVisible

  const getUser = (assignedTo?: string): User | null => {
    return users?.find(u => u.id === assignedTo) || null
  }

  return (
    <div className="flex flex-col gap-1">
      {visibleTasks.map((task) => (
        <TaskBadge
          key={task.id}
          task={task}
          user={getUser(task.assignedTo)}
          compact={tasks.length > 2}
        />
      ))}
      {remaining > 0 && (
        <span className="text-[10px] text-gray-400 italic pl-2">
          +{remaining} autre{remaining > 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}

export default TaskBadge
