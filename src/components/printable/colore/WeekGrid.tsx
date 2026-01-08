import { useMemo } from 'react'
import { TaskBadge, TaskBadgeGroup } from './TaskBadge'
import type { Task, User, PlanningWeek } from '../../../types'

/**
 * WeekGrid - Colorful 7-column weekly grid for printable planning
 * Features colored day headers, task badges, and visual priority indicators
 */

interface DayInfo {
  key: string
  label: string
  short: string
}

// Days of the week
const DAYS: DayInfo[] = [
  { key: 'lundi', label: 'Lundi', short: 'Lun' },
  { key: 'mardi', label: 'Mardi', short: 'Mar' },
  { key: 'mercredi', label: 'Mercredi', short: 'Mer' },
  { key: 'jeudi', label: 'Jeudi', short: 'Jeu' },
  { key: 'vendredi', label: 'Vendredi', short: 'Ven' },
  { key: 'samedi', label: 'Samedi', short: 'Sam' },
  { key: 'dimanche', label: 'Dimanche', short: 'Dim' },
]

interface DayColors {
  bg: string
  border: string
  text: string
  accent: string
}

// Day header colors (gradient from blue to pink through the week)
const DAY_COLORS: Record<string, DayColors> = {
  lundi: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', accent: '#3B82F6' },
  mardi: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', accent: '#6366F1' },
  mercredi: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', accent: '#8B5CF6' },
  jeudi: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', accent: '#A855F7' },
  vendredi: { bg: 'bg-fuchsia-50', border: 'border-fuchsia-200', text: 'text-fuchsia-700', accent: '#D946EF' },
  samedi: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', accent: '#EC4899' },
  dimanche: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', accent: '#F43F5E' },
}

// Default user colors
const USER_COLORS: Record<string, string> = {
  'user-hugo': '#3B82F6',
  'user-delphine': '#EC4899',
  common: '#10B981',
}

/**
 * Get date for a day in the week
 */
function getDateForDay(startDate: Date | null, dayIndex: number): Date | null {
  if (!startDate) return null
  const date = new Date(startDate)
  date.setDate(date.getDate() + dayIndex)
  return date
}

/**
 * Format date for display
 */
function formatDate(date: Date | null): string {
  if (!date) return ''
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

/**
 * Check if date is today
 */
function isToday(date: Date | null): boolean {
  if (!date) return false
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

interface DayHeaderProps {
  day: DayInfo
  date: Date | null
  isToday: boolean
}

/**
 * DayHeader - Colored header for each day column
 */
function DayHeader({ day, date, isToday: today }: DayHeaderProps): JSX.Element {
  const colors = DAY_COLORS[day.key]

  return (
    <div
      className={`
        ${colors.bg} ${colors.border} ${colors.text}
        border-b-2 px-2 py-2 text-center font-semibold
        ${today ? 'ring-2 ring-offset-1' : ''}
        print:border-b print:border-gray-300
      `}
      style={today ? { '--tw-ring-color': colors.accent } as React.CSSProperties : undefined}
    >
      <div className="text-sm print:text-xs">{day.label}</div>
      {date && (
        <div className={`text-xs font-normal ${today ? 'font-bold' : 'opacity-70'}`}>
          {formatDate(date)}
          {today && <span className="ml-1">●</span>}
        </div>
      )}
    </div>
  )
}

interface DayColumnProps {
  day: DayInfo
  date: Date | null
  tasks: Task[]
  users?: User[]
  isWeekend: boolean
}

/**
 * DayColumn - Column containing tasks for a single day
 */
function DayColumn({ day, date, tasks, users, isWeekend }: DayColumnProps): JSX.Element {
  const colors = DAY_COLORS[day.key]
  const today = isToday(date)

  // Sort tasks by priority
  const sortedTasks = useMemo(() => {
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
    return [...tasks].sort((a, b) => {
      const aPriority = typeof a.priority === 'number'
        ? (a.priority <= 1 ? 'high' : a.priority <= 2 ? 'medium' : 'low')
        : (a.priority || 'medium')
      const bPriority = typeof b.priority === 'number'
        ? (b.priority <= 1 ? 'high' : b.priority <= 2 ? 'medium' : 'low')
        : (b.priority || 'medium')
      const priorityDiff = (priorityOrder[aPriority] ?? 1) - (priorityOrder[bPriority] ?? 1)
      if (priorityDiff !== 0) return priorityDiff
      return (a.preferredTime === 'morning' ? -1 : 1) - (b.preferredTime === 'morning' ? -1 : 1)
    })
  }, [tasks])

  const getUser = (assignedTo?: string): User | null => {
    return users?.find(u => u.id === assignedTo) || null
  }

  return (
    <div
      className={`
        flex flex-col min-h-[200px] print:min-h-[150px]
        ${isWeekend ? 'bg-gray-50/50' : 'bg-white'}
        ${today ? `${colors.bg} bg-opacity-30` : ''}
        border-r border-gray-200 last:border-r-0
        print:border-gray-300
      `}
    >
      {/* Day Header */}
      <DayHeader day={day} date={date} isToday={today} />

      {/* Tasks */}
      <div className="flex-1 p-2 space-y-1.5 overflow-hidden print:p-1.5 print:space-y-1">
        {sortedTasks.length > 0 ? (
          sortedTasks.length <= 4 ? (
            // Show all tasks if 4 or fewer
            sortedTasks.map((task) => (
              <TaskBadge
                key={task.id}
                task={task}
                user={getUser(task.assignedTo)}
                compact={sortedTasks.length > 2}
              />
            ))
          ) : (
            // Use badge group if more than 4
            <TaskBadgeGroup
              tasks={sortedTasks}
              users={users}
              maxVisible={4}
            />
          )
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-gray-400 italic">
            Aucune tache
          </div>
        )}
      </div>

      {/* Task count indicator */}
      {sortedTasks.length > 0 && (
        <div className="px-2 py-1 border-t border-gray-100 print:border-gray-200">
          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span>{sortedTasks.length} tache{sortedTasks.length > 1 ? 's' : ''}</span>
            <span>
              {sortedTasks.reduce((acc, t) => acc + (t.duration || 0), 0)} min
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export interface WeekGridProps {
  tasks?: Task[]
  users?: User[]
  startDate?: Date
  planning?: PlanningWeek | null
}

/**
 * WeekGrid Component
 */
export function WeekGrid({
  tasks = [],
  users = [],
  startDate,
  planning,
}: WeekGridProps): JSX.Element {
  // Group tasks by day
  const tasksByDay = useMemo(() => {
    const grouped: Record<string, Task[]> = {}

    DAYS.forEach(day => {
      grouped[day.key] = []
    })

    // If we have a generated planning, use it
    if (planning?.days) {
      planning.days.forEach((dayPlan, index) => {
        const dayKey = DAYS[index]?.key
        if (dayKey) {
          // Extract tasks from all columns
          Object.values(dayPlan.columns || {}).forEach(column => {
            if (column?.slots) {
              column.slots.forEach(slot => {
                if (slot.task) {
                  grouped[dayKey].push(slot.task)
                }
              })
            }
          })
        }
      })
    } else {
      // Otherwise, distribute tasks based on preferredDays
      tasks.forEach(task => {
        if (task.recurrence === 'daily') {
          // Daily tasks go to all days
          DAYS.forEach(day => {
            grouped[day.key].push(task)
          })
        } else if (task.preferredDays && task.preferredDays.length > 0) {
          // Tasks with preferred days
          task.preferredDays.forEach(preferredDay => {
            const dayKey = preferredDay.toLowerCase()
            if (grouped[dayKey]) {
              grouped[dayKey].push(task)
            }
          })
        } else if (task.recurrence === 'weekly') {
          // Weekly tasks without preference - assign to a day based on task id
          const dayIndex = Math.abs(task.id.length) % 7
          const dayKey = DAYS[dayIndex].key
          grouped[dayKey].push(task)
        }
      })
    }

    return grouped
  }, [tasks, planning])

  // Calculate start date for the week
  const weekStartDate = useMemo(() => {
    if (startDate) return new Date(startDate)
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    return new Date(now.setDate(diff))
  }, [startDate])

  return (
    <div className="week-grid border border-gray-200 rounded-lg overflow-hidden print:border-gray-400 print:rounded-none">
      {/* Grid */}
      <div className="grid grid-cols-7">
        {DAYS.map((day, index) => (
          <DayColumn
            key={day.key}
            day={day}
            date={getDateForDay(weekStartDate, index)}
            tasks={tasksByDay[day.key] || []}
            users={users}
            isWeekend={index >= 5}
          />
        ))}
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-7 border-t border-gray-200 bg-gray-50 print:border-gray-300">
        {DAYS.map((day) => {
          const dayTasks = tasksByDay[day.key] || []
          const totalDuration = dayTasks.reduce((acc, t) => acc + (t.duration || 0), 0)
          const highPriority = dayTasks.filter(t => {
            const priority = typeof t.priority === 'number'
              ? (t.priority <= 1 ? 'high' : 'other')
              : t.priority
            return priority === 'high'
          }).length

          return (
            <div
              key={day.key}
              className="px-1 py-1.5 text-center border-r border-gray-200 last:border-r-0 print:border-gray-300"
            >
              <div className="flex items-center justify-center gap-1 text-[10px]">
                {highPriority > 0 && (
                  <span className="text-red-500 font-bold">{highPriority}!</span>
                )}
                <span className="text-gray-500">
                  {Math.round(totalDuration / 60 * 10) / 10}h
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default WeekGrid
