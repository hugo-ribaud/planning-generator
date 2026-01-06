/**
 * PrintablePlanning - Main container for colorful printable planning
 * Features A4 landscape layout with print-optimized CSS and color variables
 */

import { useMemo, useRef, useCallback } from 'react'
import { PrintableHeader } from './PrintableHeader'
import { WeekGrid } from './WeekGrid'
import { MilestoneSidebar } from './MilestoneSidebar'

// Default colors
const COLORS = {
  hugo: '#3B82F6',
  delphine: '#EC4899',
  common: '#10B981',
  accent: '#8B5CF6',
}

/**
 * Calculate week start date (Monday)
 */
function getWeekStartDate(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Calculate week end date (Sunday)
 */
function getWeekEndDate(startDate) {
  const d = new Date(startDate)
  d.setDate(d.getDate() + 6)
  return d
}

/**
 * PrintButton - Styled print button
 */
function PrintButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        inline-flex items-center gap-2 px-4 py-2
        bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
        text-white font-medium rounded-lg
        hover:from-blue-600 hover:via-purple-600 hover:to-pink-600
        transition-all shadow-md hover:shadow-lg
        print:hidden
      "
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
      Imprimer
    </button>
  )
}

/**
 * ColorLegend - Print-friendly color legend
 */
function ColorLegend({ users }) {
  return (
    <div className="hidden print:flex items-center justify-center gap-4 mt-4 pt-2 border-t border-gray-300 text-[10px] text-gray-600">
      {users.map(user => (
        <span key={user.id} className="flex items-center gap-1">
          <span
            className="w-2.5 h-2.5 rounded"
            style={{ backgroundColor: user.color || COLORS.hugo }}
          />
          {user.name}
        </span>
      ))}
      <span className="flex items-center gap-1">
        <span
          className="w-2.5 h-2.5 rounded"
          style={{ backgroundColor: COLORS.common }}
        />
        Commun
      </span>
      <span className="mx-2 text-gray-400">|</span>
      <span className="flex items-center gap-1">
        <span className="text-red-500">●</span> Haute
      </span>
      <span className="flex items-center gap-1">
        <span className="text-yellow-500">●</span> Moyenne
      </span>
      <span className="flex items-center gap-1">
        <span className="text-green-500">●</span> Basse
      </span>
    </div>
  )
}

/**
 * PrintablePlanning Component
 */
export function PrintablePlanning({
  tasks = [],
  users = [],
  milestones = [],
  planning = null,
  config = {},
  title = 'Planning Familial',
}) {
  const printRef = useRef(null)

  // Calculate date range
  const { startDate, endDate } = useMemo(() => {
    const start = getWeekStartDate()
    const end = getWeekEndDate(start)
    return { startDate: start, endDate: end }
  }, [])

  // Print handler
  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  return (
    <>
      {/* Print Styles */}
      <style>{`
        /* CSS Variables for colors */
        :root {
          --color-hugo: ${COLORS.hugo};
          --color-delphine: ${COLORS.delphine};
          --color-common: ${COLORS.common};
          --color-accent: ${COLORS.accent};
        }

        /* Screen styles */
        @media screen {
          .printable-planning {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          .printable-planning-container {
            max-width: 1200px;
            margin: 0 auto;
          }
        }

        /* Print styles - A4 Landscape */
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          body {
            margin: 0;
            padding: 0;
          }

          .printable-planning {
            width: 100%;
            max-width: none;
            margin: 0;
            padding: 0;
            box-shadow: none;
            border-radius: 0;
            background: white;
          }

          .printable-planning-container {
            max-width: none;
          }

          /* Hide non-printable elements */
          .print\\:hidden {
            display: none !important;
          }

          /* Show print-only elements */
          .hidden.print\\:flex {
            display: flex !important;
          }

          .hidden.print\\:block {
            display: block !important;
          }

          /* Ensure colors print */
          .bg-blue-50, .bg-indigo-50, .bg-violet-50,
          .bg-purple-50, .bg-fuchsia-50, .bg-pink-50, .bg-rose-50 {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Optimize font sizes for print */
          .text-xs {
            font-size: 9px;
          }

          .text-sm {
            font-size: 10px;
          }

          .text-base {
            font-size: 11px;
          }

          /* Compact spacing for print */
          .p-4 {
            padding: 8px;
          }

          .p-6 {
            padding: 12px;
          }

          .gap-6 {
            gap: 12px;
          }

          .mb-6 {
            margin-bottom: 12px;
          }

          /* Page break handling */
          .printable-planning {
            page-break-inside: avoid;
          }

          .week-grid {
            page-break-inside: avoid;
          }

          .milestone-sidebar {
            page-break-inside: avoid;
          }
        }

        /* High contrast for printing */
        @media print and (prefers-contrast: high) {
          .printable-planning {
            border: 2px solid black;
          }

          .text-gray-400, .text-gray-500 {
            color: #374151 !important;
          }
        }
      `}</style>

      {/* Main Container */}
      <div className="printable-planning-container p-4 print:p-0">
        {/* Print Button */}
        <div className="flex justify-end mb-4 print:hidden">
          <PrintButton onClick={handlePrint} />
        </div>

        {/* Printable Content */}
        <div
          ref={printRef}
          className="printable-planning bg-white p-6 print:p-4"
        >
          {/* Header */}
          <PrintableHeader
            users={users}
            config={config}
            startDate={startDate}
            endDate={endDate}
            title={title}
          />

          {/* Main Content - Grid + Sidebar */}
          <div className="flex gap-6 print:gap-4">
            {/* Week Grid - Main content area */}
            <div className="flex-1 min-w-0">
              <WeekGrid
                tasks={tasks}
                users={users}
                startDate={startDate}
                planning={planning}
              />
            </div>

            {/* Milestone Sidebar - Fixed width on side */}
            {milestones.length > 0 && (
              <div className="w-64 flex-shrink-0 print:w-56">
                <MilestoneSidebar
                  milestones={milestones}
                  users={users}
                  showCompleted={false}
                  maxVisible={5}
                />
              </div>
            )}
          </div>

          {/* Footer with legend (print only) */}
          <ColorLegend users={users} />

          {/* Generation timestamp (print only) */}
          <div className="hidden print:block mt-4 pt-2 border-t border-gray-200 text-center text-[8px] text-gray-400">
            Planning genere le {new Date().toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
    </>
  )
}

/**
 * PrintablePlanningPreview - Preview wrapper with controls
 */
export function PrintablePlanningPreview({
  tasks = [],
  users = [],
  milestones = [],
  planning = null,
  config = {},
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-50 bg-gray-900/50 overflow-auto print:static print:bg-transparent print:overflow-visible">
      <div className="min-h-screen py-8 px-4 print:p-0 print:min-h-0">
        {/* Close button */}
        {onClose && (
          <div className="max-w-[1200px] mx-auto mb-4 flex justify-between items-center print:hidden">
            <h2 className="text-lg font-semibold text-white">Apercu du planning</h2>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Fermer
            </button>
          </div>
        )}

        {/* Planning */}
        <PrintablePlanning
          tasks={tasks}
          users={users}
          milestones={milestones}
          planning={planning}
          config={config}
        />
      </div>
    </div>
  )
}

export default PrintablePlanning
