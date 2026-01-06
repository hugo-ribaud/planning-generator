/**
 * ActionItems - Priority action list with checkboxes
 * Displays numbered priority list for manual tracking
 */

export function ActionItems({
  tasks = [],
  milestones = [],
  users = [],
  maxItems = 10,
}) {
  // Helper to get user info
  const getUserInfo = (assignedTo) => {
    if (assignedTo === 'common') {
      return { name: 'Commun', color: '#9333EA', initials: 'C' }
    }
    const user = users.find(u => u.id === assignedTo)
    if (user) {
      return {
        name: user.name,
        color: user.color,
        initials: user.name?.charAt(0).toUpperCase(),
      }
    }
    return { name: '-', color: '#9CA3AF', initials: '?' }
  }

  // Create action items from high priority tasks and milestones
  const actionItems = []

  // Add high priority tasks
  const highPriorityTasks = tasks.filter(t => t.priority === 'high')
  highPriorityTasks.forEach(task => {
    actionItems.push({
      id: task.id,
      type: 'task',
      title: task.name,
      assignedTo: task.assignedTo,
      priority: 'high',
      duration: task.duration,
      frequency: task.frequency,
      dueInfo: task.frequency === 'daily' ? 'Quotidien' : task.preferredDays?.join(', '),
    })
  })

  // Add in-progress milestones with deadlines
  const urgentMilestones = milestones
    .filter(m => m.status === 'in_progress' || m.status === 'todo')
    .filter(m => {
      const today = new Date()
      const targetDate = m.target_date ? new Date(m.target_date) : null
      const daysUntil = targetDate ? Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24)) : null
      return daysUntil !== null && daysUntil <= 7
    })
    .sort((a, b) => new Date(a.target_date) - new Date(b.target_date))

  urgentMilestones.forEach(milestone => {
    const today = new Date()
    const targetDate = new Date(milestone.target_date)
    const daysUntil = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24))

    actionItems.push({
      id: milestone.id,
      type: 'milestone',
      title: milestone.title,
      assignedTo: milestone.assigned_to,
      priority: daysUntil <= 0 ? 'urgent' : daysUntil <= 3 ? 'high' : 'medium',
      progress: milestone.progress,
      dueInfo: daysUntil <= 0
        ? 'En retard!'
        : daysUntil === 1
          ? 'Demain'
          : `Dans ${daysUntil} jours`,
    })
  })

  // Add medium priority tasks (if space remains)
  const mediumPriorityTasks = tasks.filter(t => t.priority === 'medium')
  mediumPriorityTasks.slice(0, 3).forEach(task => {
    actionItems.push({
      id: task.id,
      type: 'task',
      title: task.name,
      assignedTo: task.assignedTo,
      priority: 'medium',
      duration: task.duration,
      frequency: task.frequency,
    })
  })

  // Sort by priority and limit
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
  const sortedItems = actionItems
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, maxItems)

  const getPriorityStyle = (priority) => {
    const styles = {
      urgent: { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B', label: 'URGENT' },
      high: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E', label: 'HAUTE' },
      medium: { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF', label: 'MOYENNE' },
      low: { bg: '#F3F4F6', border: '#9CA3AF', text: '#4B5563', label: 'BASSE' },
    }
    return styles[priority] || styles.medium
  }

  return (
    <div className="action-items">
      <h3 className="section-title">Actions prioritaires</h3>

      <div className="items-list">
        {sortedItems.map((item, index) => {
          const userInfo = getUserInfo(item.assignedTo)
          const priorityStyle = getPriorityStyle(item.priority)

          return (
            <div
              key={item.id || index}
              className="action-item"
              style={{ '--priority-color': priorityStyle.border }}
            >
              {/* Priority number */}
              <div
                className="item-number"
                style={{
                  backgroundColor: priorityStyle.bg,
                  color: priorityStyle.text,
                  borderColor: priorityStyle.border,
                }}
              >
                {index + 1}
              </div>

              {/* Checkbox for manual tracking */}
              <div className="item-checkbox">
                <div className="checkbox-box" />
              </div>

              {/* Content */}
              <div className="item-content">
                <div className="item-header">
                  <span className="item-title">{item.title}</span>
                  <span
                    className="item-priority-badge"
                    style={{
                      backgroundColor: priorityStyle.bg,
                      color: priorityStyle.text,
                    }}
                  >
                    {priorityStyle.label}
                  </span>
                </div>

                <div className="item-meta">
                  {/* User */}
                  <span className="item-user">
                    <span
                      className="user-dot"
                      style={{ backgroundColor: userInfo.color }}
                    />
                    {userInfo.name}
                  </span>

                  {/* Type indicator */}
                  <span className="item-type">
                    {item.type === 'milestone' ? 'Objectif' : 'Tache'}
                  </span>

                  {/* Due info */}
                  {item.dueInfo && (
                    <span className={`item-due ${item.priority === 'urgent' ? 'item-due-urgent' : ''}`}>
                      {item.dueInfo}
                    </span>
                  )}

                  {/* Duration (for tasks) */}
                  {item.duration && (
                    <span className="item-duration">{item.duration}min</span>
                  )}

                  {/* Progress (for milestones) */}
                  {item.progress !== undefined && (
                    <span className="item-progress">{item.progress}%</span>
                  )}
                </div>
              </div>

              {/* Priority indicator line */}
              <div
                className="item-priority-line"
                style={{ backgroundColor: priorityStyle.border }}
              />
            </div>
          )
        })}
      </div>

      {/* Notes section for manual additions */}
      <div className="notes-section">
        <span className="notes-label">Notes supplementaires:</span>
        <div className="notes-lines">
          <div className="notes-line" />
          <div className="notes-line" />
          <div className="notes-line" />
        </div>
      </div>

      <style>{`
        .action-items {
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

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .action-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px;
          background: #F9FAFB;
          border-radius: 6px;
          position: relative;
          overflow: hidden;
        }

        .item-number {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          border: 2px solid;
          flex-shrink: 0;
        }

        .item-checkbox {
          flex-shrink: 0;
        }

        .checkbox-box {
          width: 18px;
          height: 18px;
          border: 2px solid #D1D5DB;
          border-radius: 4px;
          background: white;
        }

        .item-content {
          flex: 1;
          min-width: 0;
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 4px;
        }

        .item-title {
          font-size: 13px;
          font-weight: 600;
          color: #1F2937;
          line-height: 1.3;
        }

        .item-priority-badge {
          font-size: 9px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 3px;
          flex-shrink: 0;
        }

        .item-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 11px;
          color: #6B7280;
        }

        .item-user {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .user-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .item-type {
          color: #9CA3AF;
        }

        .item-due {
          font-weight: 500;
        }

        .item-due-urgent {
          color: #EF4444;
          font-weight: 700;
        }

        .item-duration,
        .item-progress {
          color: #9CA3AF;
        }

        .item-priority-line {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
        }

        .notes-section {
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid #E5E7EB;
        }

        .notes-label {
          font-size: 11px;
          font-weight: 600;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: block;
          margin-bottom: 8px;
        }

        .notes-lines {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .notes-line {
          height: 1px;
          background: #E5E7EB;
          width: 100%;
        }

        /* Print styles */
        @media print {
          .action-items {
            box-shadow: none;
            border: 1px solid #E5E7EB;
          }

          .action-item,
          .item-number,
          .item-priority-badge,
          .user-dot,
          .item-priority-line {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .checkbox-box {
            border-color: #000;
          }
        }
      `}</style>
    </div>
  )
}
