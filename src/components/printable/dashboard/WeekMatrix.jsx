/**
 * WeekMatrix - Compact week grid with colored cells
 * Color intensity represents hourly workload
 */

export function WeekMatrix({
  users = [],
  tasks = [],
  planning = null,
}) {
  const days = [
    { key: 'lundi', label: 'Lun', full: 'Lundi' },
    { key: 'mardi', label: 'Mar', full: 'Mardi' },
    { key: 'mercredi', label: 'Mer', full: 'Mercredi' },
    { key: 'jeudi', label: 'Jeu', full: 'Jeudi' },
    { key: 'vendredi', label: 'Ven', full: 'Vendredi' },
    { key: 'samedi', label: 'Sam', full: 'Samedi' },
    { key: 'dimanche', label: 'Dim', full: 'Dimanche' },
  ]

  const timeSlots = [
    { start: '08:00', end: '10:00', label: '8-10h' },
    { start: '10:00', end: '12:00', label: '10-12h' },
    { start: '12:00', end: '14:00', label: '12-14h' },
    { start: '14:00', end: '16:00', label: '14-16h' },
    { start: '16:00', end: '18:00', label: '16-18h' },
    { start: '18:00', end: '20:00', label: '18-20h' },
  ]

  // Generate matrix data (simulated - in real app, this comes from planning)
  const matrixData = days.map(day => {
    return {
      day: day.key,
      slots: timeSlots.map(slot => {
        // Simulate workload intensity (0-100)
        const intensity = Math.floor(Math.random() * 100)
        // Assign to a user or common
        const assignedUsers = []
        if (intensity > 30) {
          const randomUser = users[Math.floor(Math.random() * users.length)]
          if (randomUser) assignedUsers.push(randomUser)
          if (intensity > 70 && users.length > 1) {
            const otherUser = users.find(u => u.id !== randomUser?.id)
            if (otherUser) assignedUsers.push(otherUser)
          }
        }
        return {
          ...slot,
          intensity,
          users: assignedUsers,
          taskCount: Math.floor(intensity / 25),
        }
      })
    }
  })

  // Get intensity color
  const getIntensityColor = (intensity, users) => {
    if (intensity === 0) return '#F9FAFB'
    if (users.length === 1) {
      const opacity = 0.2 + (intensity / 100) * 0.6
      return `${users[0].color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`
    }
    if (users.length > 1) {
      // Gradient or blend for shared tasks
      const opacity = 0.3 + (intensity / 100) * 0.5
      return `rgba(147, 51, 234, ${opacity})` // purple for shared
    }
    const opacity = 0.1 + (intensity / 100) * 0.4
    return `rgba(107, 114, 128, ${opacity})`
  }

  const getTextColor = (intensity) => {
    return intensity > 60 ? '#FFFFFF' : '#374151'
  }

  return (
    <div className="week-matrix">
      <div className="matrix-header">
        <h3 className="matrix-title">Vue matricielle de la semaine</h3>
        <div className="matrix-legend">
          <span className="legend-label">Charge:</span>
          <div className="legend-gradient">
            <span className="legend-low">Faible</span>
            <div className="gradient-bar" />
            <span className="legend-high">Elevee</span>
          </div>
        </div>
      </div>

      <div className="matrix-container">
        {/* Time labels column */}
        <div className="matrix-time-column">
          <div className="matrix-corner" />
          {timeSlots.map((slot, index) => (
            <div key={index} className="matrix-time-label">
              {slot.label}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {matrixData.map((dayData, dayIndex) => (
          <div key={dayData.day} className="matrix-day-column">
            <div className="matrix-day-header">
              {days[dayIndex].label}
            </div>
            {dayData.slots.map((slot, slotIndex) => (
              <div
                key={slotIndex}
                className="matrix-cell"
                style={{
                  backgroundColor: getIntensityColor(slot.intensity, slot.users),
                  color: getTextColor(slot.intensity),
                }}
                title={`${days[dayIndex].full} ${slot.label}: ${slot.taskCount} tache(s)`}
              >
                {slot.taskCount > 0 && (
                  <span className="cell-count">{slot.taskCount}</span>
                )}
                {slot.users.length > 0 && (
                  <div className="cell-users">
                    {slot.users.map((user, i) => (
                      <span
                        key={user.id}
                        className="cell-user-dot"
                        style={{ backgroundColor: user.color }}
                        title={user.name}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* User legend */}
      <div className="matrix-user-legend">
        {users.map(user => (
          <div key={user.id} className="user-legend-item">
            <span
              className="user-legend-dot"
              style={{ backgroundColor: user.color }}
            />
            <span className="user-legend-name">{user.name}</span>
          </div>
        ))}
        <div className="user-legend-item">
          <span
            className="user-legend-dot"
            style={{ backgroundColor: '#9333EA' }}
          />
          <span className="user-legend-name">Commun</span>
        </div>
      </div>

      <style>{`
        .week-matrix {
          background: white;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }

        .matrix-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .matrix-title {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin: 0;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .matrix-legend {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .legend-label {
          font-size: 11px;
          color: #6B7280;
        }

        .legend-gradient {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .legend-low,
        .legend-high {
          font-size: 10px;
          color: #9CA3AF;
        }

        .gradient-bar {
          width: 60px;
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(90deg, #E5E7EB 0%, #3B82F6 100%);
        }

        .matrix-container {
          display: flex;
          gap: 2px;
        }

        .matrix-time-column {
          flex-shrink: 0;
          width: 50px;
        }

        .matrix-corner {
          height: 32px;
        }

        .matrix-time-label {
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 8px;
          font-size: 10px;
          color: #6B7280;
          font-weight: 500;
        }

        .matrix-day-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .matrix-day-header {
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          background: #F3F4F6;
          border-radius: 4px;
        }

        .matrix-cell {
          height: 40px;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: all 0.2s ease;
          cursor: default;
        }

        .cell-count {
          font-size: 14px;
          font-weight: 600;
          line-height: 1;
        }

        .cell-users {
          display: flex;
          gap: 2px;
          margin-top: 2px;
        }

        .cell-user-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.5);
        }

        .matrix-user-legend {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #E5E7EB;
        }

        .user-legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .user-legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .user-legend-name {
          font-size: 11px;
          color: #6B7280;
        }

        /* Hover effects (screen only) */
        @media screen {
          .matrix-cell:hover {
            transform: scale(1.05);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            z-index: 1;
          }
        }

        /* Print styles */
        @media print {
          .week-matrix {
            box-shadow: none;
            border: 1px solid #E5E7EB;
          }

          .matrix-cell,
          .gradient-bar,
          .cell-user-dot,
          .user-legend-dot {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}
