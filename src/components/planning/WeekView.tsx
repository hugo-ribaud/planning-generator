import { motion } from 'motion/react'
import { DayColumn } from './DayColumn'
import type { User, PlanningWeek } from '../../types'

export interface WeekViewProps {
  week: PlanningWeek
  users: User[]
  focusLabel?: string
}

/**
 * Vue d'une semaine de planning
 */
export function WeekView({ week, users, focusLabel }: WeekViewProps): JSX.Element {
  const slots = week.days[0]?.columns.common?.slots || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
    >
      {/* Week header */}
      <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-bold text-gray-800">
            Semaine {week.weekNumber}
          </h3>
          {focusLabel && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              <span>Focus :</span> {focusLabel}
            </span>
          )}
        </div>
      </div>

      {/* Desktop view - horizontal scroll */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-max">
          {/* Header row */}
          <div className="flex border-b border-gray-200">
            {/* Time column header */}
            <div className="w-20 shrink-0 p-3 bg-gray-100 border-r border-gray-200 font-semibold text-gray-600 text-sm">
              Horaire
            </div>

            {/* Day headers */}
            {week.days.map((day) => (
              <div
                key={day.date.toString()}
                className="flex-1 min-w-[160px]"
              >
                <div className="p-3 bg-gray-100 text-center border-r border-gray-200 last:border-r-0">
                  <div className="font-semibold text-gray-800 capitalize">
                    {day.dayName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(day.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                </div>

                {/* Column sub-headers for users */}
                <div className="flex border-b border-gray-200">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex-1 p-1.5 text-center text-xs font-medium border-r border-gray-100 last:border-r-0"
                      style={{ color: user.color }}
                    >
                      {user.name}
                    </div>
                  ))}
                  <div className="flex-1 p-1.5 text-center text-xs font-medium text-common">
                    Commun
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Time slots rows */}
          {slots.map((slot, slotIdx) => (
            <div key={slotIdx} className="flex border-b border-gray-100 last:border-b-0">
              {/* Time column */}
              <div className="w-20 shrink-0 p-2 bg-gray-50 border-r border-gray-200 text-xs text-gray-500 font-medium">
                <div>{slot.startTime}</div>
                <div className="text-gray-400">{slot.endTime}</div>
              </div>

              {/* Days columns */}
              {week.days.map((day) => (
                <div key={day.date.toString()} className="flex-1 min-w-[160px] flex border-r border-gray-100 last:border-r-0">
                  {/* User columns */}
                  {users.map((user) => {
                    const column = day.columns[user.id]
                    const cellSlot = column?.slots[slotIdx]
                    const task = cellSlot?.task
                    const isDayOff = column?.isDayOff
                    const isBlocked = cellSlot?.blockedBy === 'common'

                    return (
                      <div
                        key={user.id}
                        className={`
                          flex-1 p-1.5 min-h-[48px] border-r border-gray-50 last:border-r-0 transition-colors
                          ${isDayOff ? 'bg-gray-200/70' : ''}
                          ${isBlocked && !task ? 'bg-common/5' : ''}
                        `}
                        style={
                          task && !isDayOff
                            ? { backgroundColor: task.color + '15' }
                            : {}
                        }
                      >
                        {isDayOff ? (
                          <span className="text-[10px] text-gray-400 font-medium">OFF</span>
                        ) : task ? (
                          <div
                            className="text-[11px] font-medium px-1.5 py-0.5 rounded truncate"
                            style={{ color: task.color }}
                            title={`${task.name} (${slot.startTime}-${slot.endTime})`}
                          >
                            {task.name}
                          </div>
                        ) : null}
                      </div>
                    )
                  })}

                  {/* Common column */}
                  <div className="flex-1 p-1.5 min-h-[48px] bg-gray-50/50">
                    {(() => {
                      const commonSlot = day.columns.common?.slots[slotIdx]
                      const task = commonSlot?.task

                      return task ? (
                        <div
                          className="text-[11px] font-medium px-1.5 py-0.5 rounded truncate bg-common/10 text-common"
                          title={`${task.name} (${slot.startTime}-${slot.endTime})`}
                        >
                          {task.name}
                        </div>
                      ) : null
                    })()}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile view - stacked days */}
      <div className="md:hidden">
        {week.days.map((day) => {
          const daySlots = day.columns.common?.slots || []

          return (
            <div key={day.date.toString()} className="border-b border-gray-200 last:border-b-0">
              <div className="p-3 bg-gray-50 font-semibold text-gray-700 capitalize flex items-center justify-between">
                <span>{day.dayName}</span>
                <span className="text-sm text-gray-500">
                  {new Date(day.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>

              {daySlots.map((slot, slotIdx) => {
                // Check if there's any task in this slot
                const hasTasks = users.some(u => day.columns[u.id]?.slots[slotIdx]?.task) ||
                  day.columns.common?.slots[slotIdx]?.task

                if (!hasTasks) return null

                return (
                  <div key={slotIdx} className="flex border-t border-gray-100">
                    <div className="w-16 shrink-0 p-2 bg-gray-50 text-xs text-gray-500">
                      {slot.startTime}
                    </div>
                    <div className="flex-1 p-2 flex flex-wrap gap-1">
                      {users.map((user) => {
                        const task = day.columns[user.id]?.slots[slotIdx]?.task
                        if (!task) return null

                        return (
                          <span
                            key={user.id}
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: task.color + '20',
                              color: task.color,
                            }}
                          >
                            {user.name}: {task.name}
                          </span>
                        )
                      })}
                      {day.columns.common?.slots[slotIdx]?.task && (
                        <span className="text-xs px-2 py-0.5 rounded bg-common/20 text-common">
                          Commun: {day.columns.common.slots[slotIdx].task?.name}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
