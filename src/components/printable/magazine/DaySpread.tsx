import type { User, PlanningDay, Task } from '../../../types'

/**
 * DaySpread - Magazine-style day layout with asymmetric zones
 * Features main task area, sidebar details, and varied typography
 */

interface ExtendedTask extends Task {
  user?: User
  startTime?: string
  endTime?: string
  isUserTask?: boolean
  isCommonTask?: boolean
}

export interface DaySpreadProps {
  day: PlanningDay | null
  users: User[]
  isHighlighted?: boolean
}

export function DaySpread({ day, users, isHighlighted = false }: DaySpreadProps): JSX.Element | null {
  if (!day) return null

  const dayDate = new Date(day.date)
  const dayName = day.dayName || dayDate.toLocaleDateString('fr-FR', { weekday: 'long' })
  const dayNumber = dayDate.getDate()
  const monthName = dayDate.toLocaleDateString('fr-FR', { month: 'short' })

  // Extract tasks from all columns
  const getAllTasks = (): ExtendedTask[] => {
    const taskMap = new Map<string, ExtendedTask>()

    // Process user columns
    users.forEach(user => {
      const column = day.columns?.[user.id]
      if (column?.slots) {
        column.slots.forEach(slot => {
          if (slot.task) {
            const key = `${slot.task.name}-${user.id}`
            if (!taskMap.has(key)) {
              taskMap.set(key, {
                ...slot.task,
                user,
                startTime: slot.startTime,
                endTime: slot.endTime,
                isUserTask: true,
              })
            }
          }
        })
      }
    })

    // Process common column
    const commonColumn = day.columns?.common
    if (commonColumn?.slots) {
      commonColumn.slots.forEach(slot => {
        if (slot.task) {
          const key = `common-${slot.task.name}`
          if (!taskMap.has(key)) {
            taskMap.set(key, {
              ...slot.task,
              startTime: slot.startTime,
              endTime: slot.endTime,
              isCommonTask: true,
            })
          }
        }
      })
    }

    return Array.from(taskMap.values())
  }

  const tasks = getAllTasks()
  const priorityTasks = tasks.filter(t => t.priority === 1 || t.priority === 'high' as unknown)
  const regularTasks = tasks.filter(t => t.priority !== 1 && t.priority !== 'high' as unknown)

  // Group tasks by user for sidebar
  const tasksByUser: Record<string, ExtendedTask[]> = users.reduce((acc, user) => {
    acc[user.id] = tasks.filter(t => t.user?.id === user.id)
    return acc
  }, {} as Record<string, ExtendedTask[]>)
  const commonTasks = tasks.filter(t => t.isCommonTask)

  const isDayOff = day.columns?.[users[0]?.id]?.isDayOff

  return (
    <article
      className={`
        day-spread relative bg-white rounded-lg overflow-hidden
        ${isHighlighted ? 'ring-2 ring-gray-300' : 'border border-gray-200'}
        ${isDayOff ? 'opacity-60' : ''}
      `}
    >
      {/* Day header - editorial style */}
      <div className="flex items-stretch border-b border-gray-200">
        {/* Large day number */}
        <div className="w-24 bg-gray-900 text-white p-4 flex flex-col justify-center items-center">
          <span className="font-serif text-4xl font-bold leading-none">
            {dayNumber}
          </span>
          <span className="text-xs uppercase tracking-wider mt-1 opacity-80">
            {monthName}
          </span>
        </div>

        {/* Day name and task count */}
        <div className="flex-1 p-4 flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="font-serif text-2xl font-bold text-gray-900 capitalize">
              {dayName}
            </h2>
            {isDayOff && (
              <span className="text-sm text-gray-500 italic">Jour de repos</span>
            )}
          </div>

          {!isDayOff && tasks.length > 0 && (
            <div className="text-right">
              <span className="text-3xl font-light text-gray-400">{tasks.length}</span>
              <span className="block text-xs text-gray-500 uppercase tracking-wide">
                {tasks.length > 1 ? 'taches' : 'tache'}
              </span>
            </div>
          )}
        </div>
      </div>

      {isDayOff ? (
        <div className="p-8 text-center text-gray-400">
          <span className="font-serif text-xl italic">Profitez de ce moment de pause</span>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-0">
          {/* Main content area - priority tasks */}
          <div className="col-span-8 p-5 border-r border-gray-100">
            {priorityTasks.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  Prioritaires
                </h3>
                <div className="space-y-3">
                  {priorityTasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div
                        className="w-1 h-full min-h-[40px] rounded-full flex-shrink-0"
                        style={{ backgroundColor: task.user?.color || '#10B981' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">
                          {task.name}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          <span>{task.startTime} - {task.endTime}</span>
                          {task.user && (
                            <span
                              className="px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: task.user.color + '20',
                                color: task.user.color
                              }}
                            >
                              {task.user.name}
                            </span>
                          )}
                          {task.isCommonTask && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                              Ensemble
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regular tasks */}
            {regularTasks.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Programme du jour
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {regularTasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 text-sm"
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: task.user?.color || '#10B981' }}
                      />
                      <span className="text-gray-700 truncate">{task.name}</span>
                      <span className="text-gray-400 text-xs ml-auto flex-shrink-0">
                        {task.startTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tasks.length === 0 && (
              <div className="text-center py-8 text-gray-400 italic">
                Aucune tache programmee
              </div>
            )}
          </div>

          {/* Sidebar - by person */}
          <div className="col-span-4 p-4 bg-gray-50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
              Par personne
            </h4>

            {users.map(user => {
              const userTasks = tasksByUser[user.id] || []
              if (userTasks.length === 0) return null

              return (
                <div key={user.id} className="mb-4 last:mb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: user.color }}
                    />
                    <span className="font-medium text-sm text-gray-700">
                      {user.name}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {userTasks.length}
                    </span>
                  </div>
                  <div className="pl-5 space-y-1">
                    {userTasks.slice(0, 4).map((task, idx) => (
                      <div key={idx} className="text-xs text-gray-600 truncate">
                        {task.startTime} &middot; {task.name}
                      </div>
                    ))}
                    {userTasks.length > 4 && (
                      <div className="text-xs text-gray-400 italic">
                        +{userTasks.length - 4} autres
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {commonTasks.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="font-medium text-sm text-gray-700">
                    Ensemble
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {commonTasks.length}
                  </span>
                </div>
                <div className="pl-5 space-y-1">
                  {commonTasks.slice(0, 3).map((task, idx) => (
                    <div key={idx} className="text-xs text-gray-600 truncate">
                      {task.startTime} &middot; {task.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  )
}
