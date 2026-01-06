/**
 * MilestoneTracker - Progress tracker for milestones/objectives
 * Displays horizontal progress bars with percentages and status
 */

export function MilestoneTracker({
  milestones = [],
  users = [],
}) {
  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    })
  }

  // Helper to get user info
  const getUserInfo = (assignedTo) => {
    if (assignedTo === 'common') {
      return { name: 'Commun', color: '#9333EA' }
    }
    const user = users.find(u => u.id === assignedTo)
    return user || { name: 'Non assigne', color: '#9CA3AF' }
  }

  // Helper to determine status
  const getStatusInfo = (milestone) => {
    const today = new Date()
    const targetDate = milestone.target_date ? new Date(milestone.target_date) : null
    const isLate = targetDate && today > targetDate && milestone.progress < 100

    if (milestone.status === 'done' || milestone.progress === 100) {
      return { status: 'done', label: 'Termine', color: '#10B981', icon: 'check' }
    }
    if (isLate) {
      return { status: 'late', label: 'En retard', color: '#EF4444', icon: 'alert' }
    }
    if (milestone.progress >= 50) {
      return { status: 'on_track', label: 'En cours', color: '#F59E0B', icon: 'progress' }
    }
    return { status: 'starting', label: 'Debut', color: '#3B82F6', icon: 'start' }
  }

  // Sort milestones: late first, then by progress, then by date
  const sortedMilestones = [...milestones].sort((a, b) => {
    const statusA = getStatusInfo(a)
    const statusB = getStatusInfo(b)

    // Late items first
    if (statusA.status === 'late' && statusB.status !== 'late') return -1
    if (statusB.status === 'late' && statusA.status !== 'late') return 1

    // Done items last
    if (statusA.status === 'done' && statusB.status !== 'done') return 1
    if (statusB.status === 'done' && statusA.status !== 'done') return -1

    // Sort by target date
    if (a.target_date && b.target_date) {
      return new Date(a.target_date) - new Date(b.target_date)
    }

    return 0
  })

  return (
    <div className="milestone-tracker">
      <h3 className="section-title">Suivi des objectifs</h3>

      <div className="milestones-list">
        {sortedMilestones.map((milestone, index) => {
          const userInfo = getUserInfo(milestone.assigned_to)
          const statusInfo = getStatusInfo(milestone)

          return (
            <div
              key={milestone.id || index}
              className={`milestone-row milestone-${statusInfo.status}`}
            >
              {/* Status indicator */}
              <div
                className="milestone-status-indicator"
                style={{ backgroundColor: statusInfo.color }}
              >
                {statusInfo.status === 'done' && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {statusInfo.status === 'late' && (
                  <span className="status-icon">!</span>
                )}
                {statusInfo.status === 'on_track' && (
                  <span className="status-icon-dot" />
                )}
                {statusInfo.status === 'starting' && (
                  <span className="status-icon-arrow" />
                )}
              </div>

              {/* Content */}
              <div className="milestone-content">
                <div className="milestone-header">
                  <span className="milestone-title">{milestone.title}</span>
                  <div className="milestone-meta">
                    <span
                      className="milestone-user"
                      style={{ color: userInfo.color }}
                    >
                      {userInfo.name}
                    </span>
                    {milestone.target_date && (
                      <span className="milestone-date">
                        {formatDate(milestone.target_date)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="milestone-progress-container">
                  <div className="milestone-progress-bar">
                    <div
                      className="milestone-progress-fill"
                      style={{
                        width: `${milestone.progress}%`,
                        backgroundColor: statusInfo.color,
                      }}
                    />
                  </div>
                  <span
                    className="milestone-percentage"
                    style={{ color: statusInfo.color }}
                  >
                    {milestone.progress}%
                  </span>
                </div>

                {/* Description (if exists) */}
                {milestone.description && (
                  <p className="milestone-description">{milestone.description}</p>
                )}
              </div>

              {/* Status badge */}
              <div
                className="milestone-status-badge"
                style={{
                  backgroundColor: `${statusInfo.color}20`,
                  color: statusInfo.color,
                }}
              >
                {statusInfo.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="milestone-summary">
        <div className="summary-item">
          <span className="summary-dot" style={{ backgroundColor: '#10B981' }} />
          <span>{milestones.filter(m => m.status === 'done').length} termine(s)</span>
        </div>
        <div className="summary-item">
          <span className="summary-dot" style={{ backgroundColor: '#F59E0B' }} />
          <span>{milestones.filter(m => m.status === 'in_progress').length} en cours</span>
        </div>
        <div className="summary-item">
          <span className="summary-dot" style={{ backgroundColor: '#EF4444' }} />
          <span>{milestones.filter(m => {
            const today = new Date()
            const targetDate = m.target_date ? new Date(m.target_date) : null
            return targetDate && today > targetDate && m.progress < 100
          }).length} en retard</span>
        </div>
      </div>

      <style>{`
        .milestone-tracker {
          background: white;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 12px 0;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .milestones-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .milestone-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          background: #F9FAFB;
          border-radius: 6px;
          border-left: 3px solid transparent;
        }

        .milestone-late {
          border-left-color: #EF4444;
          background: #FEF2F2;
        }

        .milestone-done {
          border-left-color: #10B981;
          background: #ECFDF5;
        }

        .milestone-status-indicator {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .status-icon {
          color: white;
          font-size: 14px;
          font-weight: 700;
        }

        .status-icon-dot {
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
        }

        .status-icon-arrow {
          width: 0;
          height: 0;
          border-left: 5px solid white;
          border-top: 4px solid transparent;
          border-bottom: 4px solid transparent;
          margin-left: 2px;
        }

        .milestone-content {
          flex: 1;
          min-width: 0;
        }

        .milestone-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 8px;
        }

        .milestone-title {
          font-size: 13px;
          font-weight: 600;
          color: #1F2937;
          line-height: 1.3;
        }

        .milestone-meta {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .milestone-user {
          font-size: 11px;
          font-weight: 500;
        }

        .milestone-date {
          font-size: 11px;
          color: #6B7280;
        }

        .milestone-progress-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .milestone-progress-bar {
          flex: 1;
          height: 6px;
          background: #E5E7EB;
          border-radius: 3px;
          overflow: hidden;
        }

        .milestone-progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .milestone-percentage {
          font-size: 12px;
          font-weight: 600;
          min-width: 40px;
          text-align: right;
        }

        .milestone-description {
          font-size: 11px;
          color: #6B7280;
          margin: 6px 0 0 0;
          line-height: 1.4;
        }

        .milestone-status-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .milestone-summary {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid #E5E7EB;
        }

        .summary-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #6B7280;
        }

        .summary-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        /* Print styles */
        @media print {
          .milestone-tracker {
            box-shadow: none;
            border: 1px solid #E5E7EB;
          }

          .milestone-row,
          .milestone-status-indicator,
          .milestone-progress-fill,
          .milestone-status-badge,
          .summary-dot {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}
