/**
 * MagazineHeader - Editorial style header for printable planning
 * Features asymmetric layout with stylized title and week dates
 */

const WEEK_MOTTOS: string[] = [
  "Chaque jour est une nouvelle opportunite",
  "Ensemble, tout devient possible",
  "La constance mene a l'excellence",
  "Simplifier pour mieux avancer",
  "Le bonheur est dans les petites choses",
  "Progresser, pas perfectionner",
  "Un pas apres l'autre",
]

export interface MagazineHeaderProps {
  weekNumber?: number
  startDate?: Date | string
  endDate?: Date | string
  year?: number
}

export function MagazineHeader({ weekNumber, startDate, endDate, year }: MagazineHeaderProps): JSX.Element {
  // Format dates
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
    })
  }

  // Get a consistent motto based on week number
  const motto = WEEK_MOTTOS[(weekNumber || 1) % WEEK_MOTTOS.length]

  return (
    <header className="magazine-header mb-8 pb-6 border-b-2 border-gray-200">
      {/* Top accent line */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-1 w-16 bg-gray-900" />
        <span className="text-xs font-medium tracking-[0.3em] uppercase text-gray-500">
          Planorai
        </span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Main title area - asymmetric layout */}
      <div className="grid grid-cols-12 gap-6 items-end">
        {/* Left: Main title */}
        <div className="col-span-7">
          <h1 className="font-serif text-6xl font-bold text-gray-900 leading-none tracking-tight">
            Notre
            <span className="block text-7xl italic font-light text-gray-700 -mt-2">
              Semaine
            </span>
          </h1>
        </div>

        {/* Right: Dates and week number */}
        <div className="col-span-5 text-right">
          <div className="inline-block text-left">
            <div className="text-sm font-medium tracking-wide text-gray-500 uppercase mb-1">
              Semaine {weekNumber} &mdash; {year}
            </div>
            <div className="font-serif text-2xl text-gray-800">
              {formatDate(startDate)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-400">au</span>
              <span className="font-serif text-2xl text-gray-800">
                {formatDate(endDate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Motto / Quote section */}
      <div className="mt-8 pl-8 border-l-4 border-gray-300">
        <blockquote className="font-serif text-xl italic text-gray-600 leading-relaxed">
          "{motto}"
        </blockquote>
      </div>

      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="currentColor" />
        </svg>
      </div>
    </header>
  )
}
