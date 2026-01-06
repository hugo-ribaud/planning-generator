/**
 * PrintablePlanning - Main container for magazine-style printable planning
 * A4 landscape layout with asymmetric CSS grid and rich typography
 */

import { MagazineHeader } from './MagazineHeader'
import { DaySpread } from './DaySpread'
import { WeekOverview } from './WeekOverview'
import { FocusArticle } from './FocusArticle'
import { MilestoneCards } from './MilestoneCards'

export function PrintablePlanning({ weeks, users, milestones, config }) {
  if (!weeks || weeks.length === 0) {
    return (
      <div className="printable-planning-empty p-8 text-center text-gray-500">
        <p className="font-serif text-xl">Aucun planning a afficher</p>
        <p className="text-sm mt-2">Generez un planning pour voir l'apercu magazine</p>
      </div>
    )
  }

  // Get focus milestone
  const focusMilestone = milestones?.find(m => m.is_focus)

  // Get current week data
  const currentWeek = weeks[0]
  const startDate = currentWeek.days[0]?.date
  const endDate = currentWeek.days[currentWeek.days.length - 1]?.date
  const year = startDate ? new Date(startDate).getFullYear() : new Date().getFullYear()

  return (
    <div className="printable-planning magazine-style">
      {/* Print-specific styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');

        .magazine-style {
          font-family: system-ui, -apple-system, sans-serif;
          background: white;
          color: #1f2937;
        }

        .magazine-style .font-serif {
          font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
        }

        @media print {
          .magazine-style {
            width: 297mm;
            min-height: 210mm;
            margin: 0;
            padding: 12mm;
            box-sizing: border-box;
          }

          .magazine-page {
            page-break-after: always;
            page-break-inside: avoid;
          }

          .magazine-page:last-child {
            page-break-after: auto;
          }

          .no-break {
            page-break-inside: avoid;
          }

          @page {
            size: A4 landscape;
            margin: 0;
          }
        }

        @media screen {
          .magazine-style {
            max-width: 1200px;
            margin: 0 auto;
            padding: 24px;
          }
        }

        /* Line clamp utility */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* First letter styling for article */
        .prose p:first-of-type::first-letter {
          float: left;
          font-family: 'Playfair Display', serif;
          font-size: 3.5em;
          font-weight: 700;
          line-height: 0.8;
          margin-right: 0.15em;
          margin-top: 0.1em;
        }
      `}</style>

      {/* Page 1: Header + Focus + Overview */}
      <div className="magazine-page">
        {/* Magazine Header */}
        <MagazineHeader
          weekNumber={currentWeek.weekNumber}
          startDate={startDate}
          endDate={endDate}
          year={year}
        />

        {/* Two-column layout for focus and overview */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          {/* Focus Article - Main column */}
          <div className="col-span-8">
            <FocusArticle
              milestone={focusMilestone}
              users={users}
            />
          </div>

          {/* Week Overview - Side column */}
          <div className="col-span-4">
            <WeekOverview
              days={currentWeek.days}
              users={users}
            />
          </div>
        </div>
      </div>

      {/* Page 2+: Day Spreads */}
      <div className="magazine-page">
        {/* Section title */}
        <div className="flex items-center gap-4 mb-6 pt-4">
          <h2 className="font-serif text-3xl font-bold text-gray-900">
            Jour par jour
          </h2>
          <div className="h-px flex-1 bg-gray-300" />
        </div>

        {/* Days grid - 2 columns for larger days, 3 for smaller */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {currentWeek.days.slice(0, 4).map((day, idx) => (
            <div key={idx} className="no-break">
              <DaySpread
                day={day}
                users={users}
                isHighlighted={idx === 0}
              />
            </div>
          ))}
        </div>

        {/* Remaining days in a different layout */}
        {currentWeek.days.length > 4 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {currentWeek.days.slice(4).map((day, idx) => (
              <div key={idx} className="no-break">
                <DaySpread
                  day={day}
                  users={users}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Page 3: Milestones */}
      {milestones && milestones.length > 0 && (
        <div className="magazine-page">
          {/* Section title */}
          <div className="flex items-center gap-4 mb-6 pt-4">
            <h2 className="font-serif text-3xl font-bold text-gray-900">
              Nos objectifs
            </h2>
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          <MilestoneCards
            milestones={milestones}
            users={users}
            focusMilestoneId={focusMilestone?.id}
          />

          {/* Footer */}
          <footer className="mt-auto pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Planning Familial &mdash; Semaine {currentWeek.weekNumber}</span>
              <span>
                Genere le {new Date().toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </footer>
        </div>
      )}

      {/* Additional weeks if multiple */}
      {weeks.slice(1).map((week, weekIdx) => (
        <div key={weekIdx} className="magazine-page mt-8 pt-8 border-t-2 border-gray-300">
          {/* Week header */}
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-serif text-3xl font-bold text-gray-900">
              Semaine {week.weekNumber}
            </h2>
            <div className="h-px flex-1 bg-gray-300" />
            <span className="text-gray-500">
              {week.days[0]?.date && new Date(week.days[0].date).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
              })}
              {' - '}
              {week.days[week.days.length - 1]?.date && new Date(week.days[week.days.length - 1].date).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
              })}
            </span>
          </div>

          {/* Overview for this week */}
          <div className="mb-6">
            <WeekOverview
              days={week.days}
              users={users}
            />
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-2 gap-4">
            {week.days.map((day, idx) => (
              <div key={idx} className="no-break">
                <DaySpread
                  day={day}
                  users={users}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
