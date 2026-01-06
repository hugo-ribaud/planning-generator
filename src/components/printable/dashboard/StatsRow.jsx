/**
 * StatsRow - Statistics row with mini-charts
 * Displays workload distribution by user and day
 */

export function StatsRow({
  users = [],
  tasks = [],
  planning = null,
}) {
  // Calculate hours per user
  const userStats = users.map(user => {
    const userTasks = tasks.filter(t =>
      t.assignedTo === user.id || t.assignedTo === 'common'
    )
    const totalMinutes = userTasks.reduce((acc, t) => acc + (t.duration || 0), 0)
    return {
      ...user,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      taskCount: userTasks.length,
    }
  })

  // Calculate hours per day
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  const maxHoursPerDay = 12

  // Simulated daily workload (in real app, this would come from planning)
  const dailyWorkload = days.map((day, index) => {
    // Simulate varying workload
    const baseHours = 3 + Math.random() * 4
    return {
      day,
      hours: Math.round(baseHours * 10) / 10,
      percentage: Math.round((baseHours / maxHoursPerDay) * 100),
    }
  })

  // Calculate max for scaling
  const maxUserHours = Math.max(...userStats.map(u => u.totalHours), 1)
  const maxDayHours = Math.max(...dailyWorkload.map(d => d.hours), 1)

  return (
    <div className="stats-row">
      {/* User Distribution */}
      <div className="stats-section">
        <h3 className="stats-section-title">Repartition par personne</h3>
        <div className="user-stats">
          {userStats.map((user, index) => (
            <div key={user.id || index} className="user-stat-item">
              <div className="user-stat-header">
                <span
                  className="user-color-dot"
                  style={{ backgroundColor: user.color }}
                />
                <span className="user-name">{user.name}</span>
                <span className="user-hours">{user.totalHours}h</span>
              </div>
              <div className="user-bar-container">
                <div
                  className="user-bar"
                  style={{
                    width: `${(user.totalHours / maxUserHours) * 100}%`,
                    backgroundColor: user.color,
                  }}
                />
              </div>
              <div className="user-tasks-count">
                {user.taskCount} tache{user.taskCount > 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Workload Chart */}
      <div className="stats-section">
        <h3 className="stats-section-title">Charge par jour</h3>
        <div className="daily-chart">
          {dailyWorkload.map((item, index) => (
            <div key={index} className="daily-bar-wrapper">
              <div className="daily-bar-container">
                <div
                  className="daily-bar"
                  style={{
                    height: `${(item.hours / maxDayHours) * 100}%`,
                  }}
                />
              </div>
              <div className="daily-label">{item.day}</div>
              <div className="daily-hours">{item.hours}h</div>
            </div>
          ))}
        </div>
      </div>

      {/* Donut Chart - Task Distribution */}
      <div className="stats-section stats-section-donut">
        <h3 className="stats-section-title">Types de taches</h3>
        <div className="donut-container">
          <div className="donut-chart">
            <div className="donut-ring">
              {/* CSS-only donut segments */}
              <div className="donut-segment donut-daily" style={{ '--percentage': 45 }} />
              <div className="donut-segment donut-weekly" style={{ '--percentage': 35 }} />
              <div className="donut-segment donut-flexible" style={{ '--percentage': 20 }} />
            </div>
            <div className="donut-center">
              <span className="donut-total">{tasks.length}</span>
              <span className="donut-label">total</span>
            </div>
          </div>
          <div className="donut-legend">
            <div className="legend-item">
              <span className="legend-color legend-daily" />
              <span>Quotidien</span>
            </div>
            <div className="legend-item">
              <span className="legend-color legend-weekly" />
              <span>Hebdo</span>
            </div>
            <div className="legend-item">
              <span className="legend-color legend-flexible" />
              <span>Flexible</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr 200px;
          gap: 16px;
          margin-bottom: 20px;
        }

        .stats-section {
          background: white;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .stats-section-donut {
          display: flex;
          flex-direction: column;
        }

        .stats-section-title {
          font-size: 12px;
          font-weight: 600;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 12px 0;
          font-family: system-ui, -apple-system, sans-serif;
        }

        /* User Stats */
        .user-stats {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .user-stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .user-stat-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .user-color-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .user-name {
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          flex: 1;
        }

        .user-hours {
          font-size: 13px;
          font-weight: 600;
          color: #1F2937;
        }

        .user-bar-container {
          height: 6px;
          background: #E5E7EB;
          border-radius: 3px;
          overflow: hidden;
        }

        .user-bar {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .user-tasks-count {
          font-size: 11px;
          color: #9CA3AF;
        }

        /* Daily Chart */
        .daily-chart {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          height: 100px;
          gap: 8px;
        }

        .daily-bar-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .daily-bar-container {
          width: 100%;
          height: 60px;
          background: #E5E7EB;
          border-radius: 4px 4px 0 0;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
        }

        .daily-bar {
          width: 100%;
          background: linear-gradient(180deg, #3B82F6 0%, #2563EB 100%);
          border-radius: 4px 4px 0 0;
          transition: height 0.3s ease;
          min-height: 4px;
        }

        .daily-label {
          font-size: 10px;
          font-weight: 500;
          color: #6B7280;
        }

        .daily-hours {
          font-size: 9px;
          color: #9CA3AF;
        }

        /* Donut Chart */
        .donut-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .donut-chart {
          width: 80px;
          height: 80px;
          position: relative;
        }

        .donut-ring {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: conic-gradient(
            #3B82F6 0% 45%,
            #10B981 45% 80%,
            #F59E0B 80% 100%
          );
          position: relative;
        }

        .donut-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 50px;
          height: 50px;
          background: white;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .donut-total {
          font-size: 16px;
          font-weight: 700;
          color: #1F2937;
          line-height: 1;
        }

        .donut-label {
          font-size: 9px;
          color: #9CA3AF;
          text-transform: uppercase;
        }

        .donut-legend {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 100%;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #6B7280;
        }

        .legend-color {
          width: 8px;
          height: 8px;
          border-radius: 2px;
        }

        .legend-daily { background: #3B82F6; }
        .legend-weekly { background: #10B981; }
        .legend-flexible { background: #F59E0B; }

        /* Print styles */
        @media print {
          .stats-section {
            box-shadow: none;
            border: 1px solid #E5E7EB;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .user-bar,
          .daily-bar,
          .donut-ring,
          .legend-color {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}
