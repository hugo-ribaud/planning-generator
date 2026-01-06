/**
 * PrintablePlanning - Dashboard-style printable planning
 * Business KPI dashboard with metrics and visual data
 * A4 landscape layout (297mm x 210mm)
 */

import { DashboardHeader } from './DashboardHeader'
import { StatsRow } from './StatsRow'
import { WeekMatrix } from './WeekMatrix'
import { UserDashboard } from './UserDashboard'
import { MilestoneTracker } from './MilestoneTracker'

/**
 * Calculate week start date (Monday)
 */
function getWeekStart(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Format date range for display
 */
function formatPeriod(startDate) {
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6)

  const options = { day: 'numeric', month: 'short' }
  const start = startDate.toLocaleDateString('fr-FR', options)
  const end = endDate.toLocaleDateString('fr-FR', { ...options, year: 'numeric' })

  return `${start} - ${end}`
}

/**
 * Calculate stats from tasks and milestones
 */
function calculateStats(tasks, milestones) {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'done' || t.completed).length
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length
  const totalMilestones = milestones.length

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    totalMilestones,
  }
}

/**
 * Dashboard-style printable planning component
 */
export function PrintablePlanning({
  users = [],
  tasks = [],
  milestones = [],
  config = {},
  weekStart,
  showPrintButton = true,
  onClose
}) {
  const startDate = weekStart || getWeekStart()
  const period = formatPeriod(startDate)
  const stats = calculateStats(tasks, milestones)

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="dashboard-planning-wrapper">
      {/* Action bar (hidden when printing) */}
      {(showPrintButton || onClose) && (
        <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
          {showPrintButton && (
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
            >
              📊 Imprimer Dashboard
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-lg"
            >
              Fermer
            </button>
          )}
        </div>
      )}

      {/* A4 landscape container */}
      <div className="dashboard-page bg-white mx-auto my-4 shadow-lg print:shadow-none print:m-0">
        {/* Header with KPIs */}
        <DashboardHeader
          title={config.name || 'Planning Familial'}
          period={period}
          stats={stats}
        />

        {/* Stats row with mini charts */}
        <StatsRow
          users={users}
          tasks={tasks}
          weekStart={startDate}
        />

        {/* Main content grid */}
        <div className="dashboard-grid">
          {/* Week matrix */}
          <div className="matrix-section">
            <h3 className="section-title">📅 Matrice Hebdomadaire</h3>
            <WeekMatrix
              users={users}
              tasks={tasks}
              weekStart={startDate}
            />
          </div>

          {/* User dashboards */}
          <div className="users-section">
            <h3 className="section-title">👥 Par Utilisateur</h3>
            <div className="user-cards">
              {users.map(user => (
                <UserDashboard
                  key={user.id}
                  user={user}
                  tasks={tasks.filter(t =>
                    t.assignedTo === user.id ||
                    t.assigned_to === user.id
                  )}
                  milestones={milestones.filter(m =>
                    m.assignedTo === user.id ||
                    m.assigned_to === user.id
                  )}
                />
              ))}
            </div>
          </div>

          {/* Milestone tracker */}
          <div className="milestones-section">
            <h3 className="section-title">🎯 Suivi des Objectifs</h3>
            <MilestoneTracker
              milestones={milestones}
              users={users}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="dashboard-footer">
          <span>Planning Familial Dashboard</span>
          <span>•</span>
          <span>{period}</span>
          <span>•</span>
          <span>Généré le {new Date().toLocaleDateString('fr-FR')}</span>
        </footer>
      </div>

      {/* Print styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .dashboard-planning-wrapper {
          font-family: 'Inter', system-ui, sans-serif;
        }

        .dashboard-page {
          width: 297mm;
          min-height: 210mm;
          padding: 12mm;
          box-sizing: border-box;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .section-title {
          font-size: 11px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: auto auto;
          gap: 12px;
          margin-top: 12px;
        }

        .matrix-section {
          grid-column: 1 / 2;
          grid-row: 1 / 3;
          background: white;
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .users-section {
          grid-column: 2 / 3;
          grid-row: 1 / 2;
          background: white;
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .user-cards {
          display: flex;
          gap: 8px;
        }

        .milestones-section {
          grid-column: 2 / 3;
          grid-row: 2 / 3;
          background: white;
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .dashboard-footer {
          margin-top: 12px;
          padding-top: 8px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: center;
          gap: 8px;
          font-size: 9px;
          color: #6b7280;
        }

        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .no-print {
            display: none !important;
          }

          .dashboard-page {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 8mm;
            box-shadow: none;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
          }

          .matrix-section,
          .users-section,
          .milestones-section {
            box-shadow: none;
            border: 1px solid #e5e7eb;
          }
        }

        @media screen and (max-width: 1200px) {
          .dashboard-page {
            width: 100%;
            min-height: auto;
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
          }

          .matrix-section,
          .users-section,
          .milestones-section {
            grid-column: 1 / 2;
            grid-row: auto;
          }
        }
      `}</style>
    </div>
  )
}
