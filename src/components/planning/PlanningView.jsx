import { motion } from 'motion/react'
import { Legend } from './Legend'
import { WeekView } from './WeekView'

export function PlanningView({ planning, users, stats, onReset }) {
  if (!planning || planning.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Aucun planning a afficher</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header with actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Planning genere
          </h2>
          {stats && (
            <p className="text-sm text-gray-500 mt-1">
              {stats.placed.length} taches placees sur {stats.total} ({stats.successRate}% de succes)
            </p>
          )}
        </div>

        {onReset && (
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Modifier la configuration
          </button>
        )}
      </div>

      {/* Legend */}
      <Legend users={users} />

      {/* Stats summary */}
      {stats && stats.failed.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-orange-50 border border-orange-200 rounded-lg"
        >
          <h4 className="font-medium text-orange-800 mb-2">
            Taches non placees ({stats.failed.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {stats.failed.map((item, idx) => (
              <span
                key={idx}
                className="text-sm px-2 py-1 bg-orange-100 text-orange-700 rounded"
              >
                {item.task.name}
                <span className="text-orange-500 ml-1">({item.reason})</span>
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Week views */}
      {planning.map((week, idx) => (
        <WeekView
          key={week.weekNumber}
          week={week}
          users={users}
          focusLabel={week.focusLabel}
        />
      ))}

      {/* Print styles info */}
      <div className="text-center text-sm text-gray-400 py-4">
        <p>Utilisez Ctrl+P pour imprimer ou exporter en PDF</p>
      </div>
    </motion.div>
  )
}
