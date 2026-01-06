/**
 * WeekOverview - Compact weekly calendar with visual load summary
 * Mini-calendar with color coding and key highlights
 */

export function WeekOverview({ days, users }) {
  if (!days || days.length === 0) return null

  // Calculate task load per day
  const getDayLoad = (day) => {
    let count = 0
    const seenTasks = new Set()

    users.forEach(user => {
      const column = day.columns?.[user.id]
      if (column?.slots) {
        column.slots.forEach(slot => {
          if (slot.task && !seenTasks.has(slot.task.name)) {
            seenTasks.add(slot.task.name)
            count++
          }
        })
      }
    })

    const commonColumn = day.columns?.common
    if (commonColumn?.slots) {
      commonColumn.slots.forEach(slot => {
        if (slot.task && !seenTasks.has(`common-${slot.task.name}`)) {
          seenTasks.add(`common-${slot.task.name}`)
          count++
        }
      })
    }

    return count
  }

  // Get max load for relative sizing
  const loads = days.map(getDayLoad)
  const maxLoad = Math.max(...loads, 1)

  // Get load intensity class
  const getLoadIntensity = (load) => {
    const ratio = load / maxLoad
    if (ratio === 0) return 'bg-gray-100'
    if (ratio < 0.33) return 'bg-emerald-100'
    if (ratio < 0.66) return 'bg-amber-100'
    return 'bg-rose-100'
  }

  // Get priority tasks for the week
  const getWeekHighlights = () => {
    const highlights = []

    days.forEach(day => {
      const dayDate = new Date(day.date)
      const dayName = dayDate.toLocaleDateString('fr-FR', { weekday: 'short' })

      users.forEach(user => {
        const column = day.columns?.[user.id]
        if (column?.slots) {
          column.slots.forEach(slot => {
            if (slot.task?.priority === 'high') {
              const key = `${day.date}-${slot.task.name}`
              if (!highlights.find(h => h.key === key)) {
                highlights.push({
                  key,
                  day: dayName,
                  task: slot.task.name,
                  time: slot.startTime,
                  user,
                })
              }
            }
          })
        }
      })
    })

    return highlights.slice(0, 5)
  }

  const highlights = getWeekHighlights()

  // Calculate total tasks per user
  const getUserStats = () => {
    const stats = {}
    users.forEach(user => {
      stats[user.id] = { count: 0, minutes: 0 }
    })
    stats.common = { count: 0, minutes: 0 }

    days.forEach(day => {
      users.forEach(user => {
        const column = day.columns?.[user.id]
        if (column?.slots) {
          const seen = new Set()
          column.slots.forEach(slot => {
            if (slot.task && !seen.has(slot.task.name)) {
              seen.add(slot.task.name)
              stats[user.id].count++
              stats[user.id].minutes += slot.task.duration || 30
            }
          })
        }
      })

      const commonColumn = day.columns?.common
      if (commonColumn?.slots) {
        const seen = new Set()
        commonColumn.slots.forEach(slot => {
          if (slot.task && !seen.has(slot.task.name)) {
            seen.add(slot.task.name)
            stats.common.count++
            stats.common.minutes += slot.task.duration || 30
          }
        })
      }
    })

    return stats
  }

  const userStats = getUserStats()

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}min`
    if (mins === 0) return `${hours}h`
    return `${hours}h${mins}`
  }

  return (
    <div className="week-overview bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Section header */}
      <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="font-serif text-lg font-bold text-gray-900">
          Vue d'ensemble
        </h3>
      </div>

      <div className="p-5">
        {/* Mini calendar grid */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {days.map((day, idx) => {
            const dayDate = new Date(day.date)
            const dayName = dayDate.toLocaleDateString('fr-FR', { weekday: 'short' })
            const dayNumber = dayDate.getDate()
            const load = loads[idx]
            const isDayOff = day.columns?.[users[0]?.id]?.isDayOff

            return (
              <div
                key={idx}
                className={`
                  relative rounded-lg p-3 text-center transition-colors
                  ${isDayOff ? 'bg-gray-200' : getLoadIntensity(load)}
                `}
              >
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                  {dayName}
                </div>
                <div className="font-serif text-2xl font-bold text-gray-900">
                  {dayNumber}
                </div>
                {!isDayOff && load > 0 && (
                  <div className="mt-2 flex justify-center gap-0.5">
                    {Array.from({ length: Math.min(load, 5) }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-gray-400"
                      />
                    ))}
                    {load > 5 && (
                      <span className="text-[10px] text-gray-500 ml-0.5">+</span>
                    )}
                  </div>
                )}
                {isDayOff && (
                  <div className="text-[10px] text-gray-500 mt-1 uppercase">
                    Repos
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Load legend */}
        <div className="flex items-center justify-center gap-4 mb-6 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-100" />
            <span>Leger</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-100" />
            <span>Modere</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-rose-100" />
            <span>Charge</span>
          </div>
        </div>

        {/* User stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {users.map(user => (
            <div
              key={user.id}
              className="text-center p-3 rounded-lg"
              style={{ backgroundColor: user.color + '10' }}
            >
              <div
                className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: user.color }}
              >
                {user.name.charAt(0)}
              </div>
              <div className="font-medium text-gray-900">{user.name}</div>
              <div className="text-sm text-gray-500">
                {userStats[user.id].count} taches
              </div>
              <div className="text-xs text-gray-400">
                {formatDuration(userStats[user.id].minutes)}
              </div>
            </div>
          ))}
          <div className="text-center p-3 rounded-lg bg-emerald-50">
            <div className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center bg-emerald-500 text-white font-bold text-sm">
              &amp;
            </div>
            <div className="font-medium text-gray-900">Ensemble</div>
            <div className="text-sm text-gray-500">
              {userStats.common.count} taches
            </div>
            <div className="text-xs text-gray-400">
              {formatDuration(userStats.common.minutes)}
            </div>
          </div>
        </div>

        {/* Week highlights */}
        {highlights.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Points cles de la semaine
            </h4>
            <div className="space-y-2">
              {highlights.map((h, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-sm"
                >
                  <span className="text-gray-400 w-10 flex-shrink-0 capitalize">
                    {h.day}
                  </span>
                  <span className="text-gray-500">{h.time}</span>
                  <span className="text-gray-900 flex-1 truncate">
                    {h.task}
                  </span>
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: h.user.color }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
