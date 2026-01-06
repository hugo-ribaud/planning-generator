/**
 * DashboardHeader - Header with KPIs for printable dashboard
 * Displays title, period, and 4 KPI cards in a row
 */

export function DashboardHeader({
  title = 'Planning Familial',
  period,
  stats = {}
}) {
  const {
    totalTasks = 0,
    completedTasks = 0,
    inProgressTasks = 0,
    totalMilestones = 0,
  } = stats

  const completionRate = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0

  const kpis = [
    {
      label: 'Taches totales',
      value: totalTasks,
      icon: '📋',
      color: '#3B82F6', // blue
    },
    {
      label: 'Terminees',
      value: completedTasks,
      subValue: `${completionRate}%`,
      icon: '✅',
      color: '#10B981', // green
    },
    {
      label: 'En cours',
      value: inProgressTasks,
      icon: '🔄',
      color: '#F59E0B', // amber
    },
    {
      label: 'Objectifs',
      value: totalMilestones,
      icon: '🎯',
      color: '#8B5CF6', // purple
    },
  ]

  return (
    <div className="dashboard-header">
      {/* Title Section */}
      <div className="dashboard-title-section">
        <h1 className="dashboard-title">{title}</h1>
        {period && (
          <p className="dashboard-period">{period}</p>
        )}
      </div>

      {/* KPI Cards Row */}
      <div className="dashboard-kpi-row">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className="dashboard-kpi-card"
            style={{ '--kpi-accent': kpi.color }}
          >
            <div className="kpi-icon">{kpi.icon}</div>
            <div className="kpi-content">
              <div className="kpi-value">
                {kpi.value}
                {kpi.subValue && (
                  <span className="kpi-sub-value">{kpi.subValue}</span>
                )}
              </div>
              <div className="kpi-label">{kpi.label}</div>
            </div>
            <div
              className="kpi-accent-bar"
              style={{ backgroundColor: kpi.color }}
            />
          </div>
        ))}
      </div>

      <style>{`
        .dashboard-header {
          margin-bottom: 24px;
        }

        .dashboard-title-section {
          text-align: center;
          margin-bottom: 20px;
        }

        .dashboard-title {
          font-size: 28px;
          font-weight: 700;
          color: #1F2937;
          margin: 0 0 4px 0;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .dashboard-period {
          font-size: 14px;
          color: #6B7280;
          margin: 0;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .dashboard-kpi-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .dashboard-kpi-card {
          background: white;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .kpi-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .kpi-content {
          flex: 1;
          min-width: 0;
        }

        .kpi-value {
          font-size: 24px;
          font-weight: 700;
          color: #1F2937;
          line-height: 1.2;
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .kpi-sub-value {
          font-size: 14px;
          font-weight: 500;
          color: #6B7280;
        }

        .kpi-label {
          font-size: 12px;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 2px;
        }

        .kpi-accent-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
        }

        /* Print styles */
        @media print {
          .dashboard-kpi-card {
            box-shadow: none;
            border: 1px solid #E5E7EB;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .kpi-accent-bar {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}
