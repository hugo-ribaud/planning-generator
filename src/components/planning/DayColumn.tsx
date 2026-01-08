import { motion } from 'motion/react'
import { formatDateFr } from '../../utils/dateUtils'
import type { User, PlanningDay } from '../../types'

export interface DayColumnProps {
  day: PlanningDay
  users: User[]
  showHeader?: boolean
}

/**
 * Colonne représentant un jour dans le planning
 */
export function DayColumn({ day, users, showHeader = true }: DayColumnProps): JSX.Element {
  const slots = day.columns.common?.slots || []

  // Get unique time slots
  const timeSlots = slots.map((slot) => ({
    startTime: slot.startTime,
    endTime: slot.endTime,
  }))

  return (
    <div className="min-w-[200px] flex-1">
      {showHeader && (
        <div className="p-3 bg-gray-100 border-b border-gray-200 text-center">
          <div className="font-semibold text-gray-800 capitalize">
            {day.dayName}
          </div>
          <div className="text-xs text-gray-500">
            {formatDateFr(new Date(day.date)).split(' ').slice(1).join(' ')}
          </div>
        </div>
      )}

      {/* Time slots for this day */}
      {timeSlots.map((timeSlot, slotIdx) => (
        <div
          key={slotIdx}
          className="flex border-b border-gray-100"
        >
          {/* User columns */}
          {users.map((user) => {
            const column = day.columns[user.id]
            const slot = column?.slots[slotIdx]
            const task = slot?.task
            const isDayOff = column?.isDayOff
            const isBlocked = slot?.blockedBy === 'common'

            return (
              <div
                key={user.id}
                className={`
                  flex-1 p-2 min-h-[48px] border-r border-gray-100 last:border-r-0
                  ${isDayOff ? 'bg-gray-200' : ''}
                  ${isBlocked ? 'bg-common/10' : ''}
                `}
                style={
                  task && !isDayOff
                    ? { backgroundColor: task.color + '20' }
                    : {}
                }
              >
                {isDayOff ? (
                  <span className="text-xs text-gray-400 font-medium">OFF</span>
                ) : task ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs font-medium px-1.5 py-0.5 rounded truncate"
                    style={{ color: task.color }}
                    title={task.name}
                  >
                    {task.name}
                  </motion.div>
                ) : isBlocked ? (
                  <span className="text-xs text-common/50"></span>
                ) : null}
              </div>
            )
          })}

          {/* Common column */}
          <div className="flex-1 p-2 min-h-[48px] bg-gray-50">
            {(() => {
              const commonSlot = day.columns.common?.slots[slotIdx]
              const task = commonSlot?.task

              return task ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs font-medium px-1.5 py-0.5 rounded truncate bg-common/20 text-common"
                  title={task.name}
                >
                  {task.name}
                </motion.div>
              ) : null
            })()}
          </div>
        </div>
      ))}
    </div>
  )
}
