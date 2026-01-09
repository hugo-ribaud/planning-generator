import { motion } from 'motion/react'
import { useState, useRef, useCallback, TouchEvent } from 'react'
import { DayColumn } from './DayColumn'
import type { User, PlanningWeek } from '../../types'

export interface WeekViewProps {
  week: PlanningWeek
  users: User[]
  focusLabel?: string
}

/**
 * Vue d'une semaine de planning
 * - Mobile: swipe navigation, one day at a time
 * - Tablet: 3-4 days visible
 * - Desktop: full week view
 */
export function WeekView({ week, users, focusLabel }: WeekViewProps): JSX.Element {
  const slots = week.days[0]?.columns.common?.slots || []
  const [currentDayIndex, setCurrentDayIndex] = useState(0)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Swipe threshold in pixels
  const SWIPE_THRESHOLD = 50

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback(() => {
    const swipeDistance = touchStartX.current - touchEndX.current

    if (Math.abs(swipeDistance) > SWIPE_THRESHOLD) {
      if (swipeDistance > 0 && currentDayIndex < week.days.length - 1) {
        // Swipe left - next day
        setCurrentDayIndex(prev => prev + 1)
      } else if (swipeDistance < 0 && currentDayIndex > 0) {
        // Swipe right - previous day
        setCurrentDayIndex(prev => prev - 1)
      }
    }
  }, [currentDayIndex, week.days.length])

  const goToDay = useCallback((index: number) => {
    setCurrentDayIndex(index)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 sm:mb-8 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
    >
      {/* Week header */}
      <div className="p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h3 className="text-base sm:text-lg font-bold text-gray-800">
            Semaine {week.weekNumber}
          </h3>
          {focusLabel && (
            <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs sm:text-sm font-medium">
              <span>Focus :</span> {focusLabel}
            </span>
          )}
        </div>
      </div>

      {/* Desktop/Tablet view - horizontal scroll (md+) */}
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

      {/* Mobile view - swipe navigation, one day at a time */}
      <div className="md:hidden">
        {/* Day selector pills */}
        <div className="flex overflow-x-auto gap-1 p-2 bg-gray-50 border-b border-gray-200 scrollbar-hide">
          {week.days.map((day, idx) => (
            <button
              key={day.date.toString()}
              onClick={() => goToDay(idx)}
              className={`
                flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                min-h-[44px] touch-manipulation
                ${idx === currentDayIndex
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
                }
              `}
              aria-pressed={idx === currentDayIndex}
              aria-label={`Aller au ${day.dayName}`}
            >
              <span className="block capitalize">{day.dayName.slice(0, 3)}</span>
              <span className="block text-xs opacity-75">
                {new Date(day.date).getDate()}
              </span>
            </button>
          ))}
        </div>

        {/* Swipe area with current day */}
        <div
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative touch-pan-y"
        >
          {/* Navigation arrows */}
          <div className="absolute inset-y-0 left-0 z-10 flex items-center">
            <button
              onClick={() => currentDayIndex > 0 && goToDay(currentDayIndex - 1)}
              disabled={currentDayIndex === 0}
              className={`
                p-2 ml-1 rounded-full bg-white/80 shadow-sm backdrop-blur-sm
                min-h-[44px] min-w-[44px] flex items-center justify-center
                transition-opacity touch-manipulation
                ${currentDayIndex === 0 ? 'opacity-30' : 'opacity-70 hover:opacity-100'}
              `}
              aria-label="Jour precedent"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 z-10 flex items-center">
            <button
              onClick={() => currentDayIndex < week.days.length - 1 && goToDay(currentDayIndex + 1)}
              disabled={currentDayIndex === week.days.length - 1}
              className={`
                p-2 mr-1 rounded-full bg-white/80 shadow-sm backdrop-blur-sm
                min-h-[44px] min-w-[44px] flex items-center justify-center
                transition-opacity touch-manipulation
                ${currentDayIndex === week.days.length - 1 ? 'opacity-30' : 'opacity-70 hover:opacity-100'}
              `}
              aria-label="Jour suivant"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day content with animation */}
          <motion.div
            key={currentDayIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="px-8"
          >
            {(() => {
              const day = week.days[currentDayIndex]
              if (!day) return null
              const daySlots = day.columns.common?.slots || []

              return (
                <div>
                  {/* Day header */}
                  <div className="py-3 text-center border-b border-gray-100">
                    <div className="font-semibold text-gray-800 capitalize text-lg">
                      {day.dayName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(day.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </div>
                  </div>

                  {/* Time slots */}
                  <div className="divide-y divide-gray-100">
                    {daySlots.map((slot, slotIdx) => {
                      // Check if there's any task in this slot
                      const hasTasks = users.some(u => day.columns[u.id]?.slots[slotIdx]?.task) ||
                        day.columns.common?.slots[slotIdx]?.task

                      if (!hasTasks) return null

                      return (
                        <div key={slotIdx} className="flex py-3">
                          <div className="w-14 shrink-0 text-xs text-gray-500 font-medium pt-0.5">
                            {slot.startTime}
                          </div>
                          <div className="flex-1 flex flex-col gap-1.5">
                            {users.map((user) => {
                              const column = day.columns[user.id]
                              const cellSlot = column?.slots[slotIdx]
                              const task = cellSlot?.task
                              const isDayOff = column?.isDayOff

                              if (isDayOff) {
                                return (
                                  <div
                                    key={user.id}
                                    className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-200 text-gray-500"
                                  >
                                    {user.name}: OFF
                                  </div>
                                )
                              }

                              if (!task) return null

                              return (
                                <div
                                  key={user.id}
                                  className="text-sm px-2.5 py-1.5 rounded-lg font-medium"
                                  style={{
                                    backgroundColor: task.color + '20',
                                    color: task.color,
                                  }}
                                >
                                  <span className="text-xs opacity-75">{user.name}:</span>{' '}
                                  {task.name}
                                </div>
                              )
                            })}
                            {day.columns.common?.slots[slotIdx]?.task && (
                              <div className="text-sm px-2.5 py-1.5 rounded-lg bg-common/20 text-common font-medium">
                                <span className="text-xs opacity-75">Commun:</span>{' '}
                                {day.columns.common.slots[slotIdx].task?.name}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Empty state if no tasks */}
                  {!daySlots.some((_, slotIdx) =>
                    users.some(u => day.columns[u.id]?.slots[slotIdx]?.task) ||
                    day.columns.common?.slots[slotIdx]?.task
                  ) && (
                    <div className="py-8 text-center text-gray-500 text-sm">
                      Aucune tache planifiee pour ce jour
                    </div>
                  )}
                </div>
              )
            })()}
          </motion.div>

          {/* Swipe indicator */}
          <div className="flex justify-center gap-1.5 py-3">
            {week.days.map((_, idx) => (
              <div
                key={idx}
                className={`
                  w-2 h-2 rounded-full transition-colors
                  ${idx === currentDayIndex ? 'bg-primary' : 'bg-gray-300'}
                `}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
