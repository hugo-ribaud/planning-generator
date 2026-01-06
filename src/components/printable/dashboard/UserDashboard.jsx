/**
 * UserDashboard - Individual user section with tasks and stats
 * Displays dedicated card for each user with their tasks and progress
 */

export function UserDashboard({
  users = [],
  tasks = [],
  milestones = [],
}) {
  // Calculate user-specific data
  const userCards = users.map(user => {
    // User's tasks
    const userTasks = tasks.filter(t =>
      t.assignedTo === user.id || t.assignedTo === 'common'
    )

    // Separate by frequency
    const dailyTasks = userTasks.filter(t => t.frequency === 'daily')
    const weeklyTasks = userTasks.filter(t => t.frequency === 'weekly')
    const flexibleTasks = userTasks.filter(t => t.frequency === 'flexible')

    // Total hours
    const totalMinutes = userTasks.reduce((acc, t) => acc + (t.duration || 0), 0)
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10

    // User's milestones
    const userMilestones = milestones.filter(m =>
      m.assigned_to === user.id || m.assigned_to === 'common'
    )
    const completedMilestones = userMilestones.filter(m => m.status === 'done')
    const inProgressMilestones = userMilestones.filter(m => m.status === 'in_progress')

    // Priority breakdown
    const highPriority = userTasks.filter(t => t.priority === 'high')
    const mediumPriority = userTasks.filter(t => t.priority === 'medium')
    const lowPriority = userTasks.filter(t => t.priority === 'low')

    return {
      ...user,
      tasks: userTasks,
      dailyTasks,
      weeklyTasks,
      flexibleTasks,
      totalHours,
      userMilestones,
      completedMilestones,
      inProgressMilestones,
      highPriority,
      mediumPriority,
      lowPriority,
    }
  })

  const getPriorityBadge = (priority) => {
    const styles = {
      high: { bg: '#FEE2E2', color: '#991B1B', label: 'Haute' },
      medium: { bg: '#FEF3C7', color: '#92400E', label: 'Moyenne' },
      low: { bg: '#DBEAFE', color: '#1E40AF', label: 'Basse' },
    }
    return styles[priority] || styles.medium
  }

  return (
    <div className="user-dashboard">
      <h3 className="section-title">Tableau de bord par personne</h3>

      <div className="user-cards-grid">
        {userCards.map((user, index) => (
          <div
            key={user.id || index}
            className="user-card"
            style={{ '--user-color': user.color }}
          >
            {/* User Header */}
            <div className="user-card-header">
              <div className="user-avatar" style={{ backgroundColor: user.color }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <h4 className="user-card-name">{user.name}</h4>
                <span className="user-card-hours">{user.totalHours}h cette semaine</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="user-quick-stats">
              <div className="quick-stat">
                <span className="stat-number">{user.tasks.length}</span>
                <span className="stat-label">Taches</span>
              </div>
              <div className="quick-stat">
                <span className="stat-number">{user.userMilestones.length}</span>
                <span className="stat-label">Objectifs</span>
              </div>
              <div className="quick-stat">
                <span className="stat-number">{user.highPriority.length}</span>
                <span className="stat-label">Prioritaires</span>
              </div>
            </div>

            {/* Tasks by Frequency */}
            <div className="user-tasks-section">
              {user.dailyTasks.length > 0 && (
                <div className="tasks-group">
                  <span className="tasks-group-label">Quotidiennes</span>
                  <div className="tasks-list">
                    {user.dailyTasks.slice(0, 3).map((task, i) => (
                      <div key={task.id || i} className="task-item">
                        <span className="task-bullet" style={{ backgroundColor: user.color }} />
                        <span className="task-name">{task.name}</span>
                        <span className="task-duration">{task.duration}min</span>
                      </div>
                    ))}
                    {user.dailyTasks.length > 3 && (
                      <span className="tasks-more">+{user.dailyTasks.length - 3} autres</span>
                    )}
                  </div>
                </div>
              )}

              {user.weeklyTasks.length > 0 && (
                <div className="tasks-group">
                  <span className="tasks-group-label">Hebdomadaires</span>
                  <div className="tasks-list">
                    {user.weeklyTasks.slice(0, 3).map((task, i) => (
                      <div key={task.id || i} className="task-item">
                        <span className="task-bullet" style={{ backgroundColor: user.color }} />
                        <span className="task-name">{task.name}</span>
                        <span className="task-duration">{task.duration}min</span>
                      </div>
                    ))}
                    {user.weeklyTasks.length > 3 && (
                      <span className="tasks-more">+{user.weeklyTasks.length - 3} autres</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Milestones Progress */}
            {user.inProgressMilestones.length > 0 && (
              <div className="user-milestones-section">
                <span className="milestones-label">Objectifs en cours</span>
                {user.inProgressMilestones.slice(0, 2).map((milestone, i) => (
                  <div key={milestone.id || i} className="milestone-mini">
                    <div className="milestone-mini-header">
                      <span className="milestone-mini-title">{milestone.title}</span>
                      <span className="milestone-mini-progress">{milestone.progress}%</span>
                    </div>
                    <div className="milestone-mini-bar">
                      <div
                        className="milestone-mini-fill"
                        style={{
                          width: `${milestone.progress}%`,
                          backgroundColor: user.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* User color accent */}
            <div
              className="user-card-accent"
              style={{ backgroundColor: user.color }}
            />
          </div>
        ))}
      </div>

      <style>{`
        .user-dashboard {
          margin-bottom: 20px;
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 12px 0;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .user-cards-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .user-card {
          background: white;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .user-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 600;
          color: white;
        }

        .user-info {
          flex: 1;
        }

        .user-card-name {
          font-size: 16px;
          font-weight: 600;
          color: #1F2937;
          margin: 0;
        }

        .user-card-hours {
          font-size: 12px;
          color: #6B7280;
        }

        .user-quick-stats {
          display: flex;
          gap: 12px;
          padding: 10px 0;
          border-top: 1px solid #E5E7EB;
          border-bottom: 1px solid #E5E7EB;
          margin-bottom: 12px;
        }

        .quick-stat {
          flex: 1;
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 18px;
          font-weight: 700;
          color: #1F2937;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 10px;
          color: #9CA3AF;
          text-transform: uppercase;
        }

        .user-tasks-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .tasks-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .tasks-group-label {
          font-size: 10px;
          font-weight: 600;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .task-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
        }

        .task-bullet {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .task-name {
          flex: 1;
          color: #374151;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .task-duration {
          font-size: 11px;
          color: #9CA3AF;
          flex-shrink: 0;
        }

        .tasks-more {
          font-size: 11px;
          color: #6B7280;
          font-style: italic;
          margin-left: 12px;
        }

        .user-milestones-section {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #E5E7EB;
        }

        .milestones-label {
          display: block;
          font-size: 10px;
          font-weight: 600;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        .milestone-mini {
          margin-bottom: 8px;
        }

        .milestone-mini:last-child {
          margin-bottom: 0;
        }

        .milestone-mini-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .milestone-mini-title {
          font-size: 11px;
          color: #374151;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
          margin-right: 8px;
        }

        .milestone-mini-progress {
          font-size: 11px;
          font-weight: 600;
          color: #6B7280;
        }

        .milestone-mini-bar {
          height: 4px;
          background: #E5E7EB;
          border-radius: 2px;
          overflow: hidden;
        }

        .milestone-mini-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .user-card-accent {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
        }

        /* Print styles */
        @media print {
          .user-card {
            box-shadow: none;
            border: 1px solid #E5E7EB;
            page-break-inside: avoid;
          }

          .user-avatar,
          .task-bullet,
          .milestone-mini-fill,
          .user-card-accent {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}
