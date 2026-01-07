/**
 * QuickNotes - Small todo/notes section for quick reminders
 * Elegant checklist for things like "rappeler l'artisan", "Prendre RDV pour..."
 */

export function QuickNotes({ notes = [], maxItems = 6 }) {
  // Default empty notes if none provided
  const displayNotes = notes.length > 0
    ? notes.slice(0, maxItems)
    : Array(maxItems).fill({ text: '', checked: false })

  return (
    <div className="quick-notes bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Section header */}
      <div className="px-4 py-2 border-b border-gray-200 bg-amber-50">
        <h3 className="font-serif text-sm font-bold text-gray-900 flex items-center gap-2">
          <span className="text-amber-600">&#9998;</span>
          Pense-bete
        </h3>
      </div>

      {/* Notes list */}
      <div className="p-3">
        <ul className="space-y-2">
          {displayNotes.map((note, idx) => (
            <li key={idx} className="flex items-start gap-2">
              {/* Checkbox */}
              <div className="flex-shrink-0 mt-0.5">
                <div className={`
                  w-4 h-4 rounded border-2 flex items-center justify-center
                  ${note.checked
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-300 bg-white'
                  }
                `}>
                  {note.checked && (
                    <span className="text-emerald-600 text-xs">&#10003;</span>
                  )}
                </div>
              </div>

              {/* Note text or empty line */}
              {note.text ? (
                <span className={`
                  text-sm flex-1
                  ${note.checked ? 'text-gray-400 line-through' : 'text-gray-700'}
                `}>
                  {note.text}
                </span>
              ) : (
                <div className="flex-1 border-b border-dotted border-gray-300 min-h-[18px]" />
              )}
            </li>
          ))}
        </ul>

        {/* Writing prompt for empty state */}
        {notes.length === 0 && (
          <p className="text-[10px] text-gray-400 mt-3 italic text-center">
            A completer a la main
          </p>
        )}
      </div>
    </div>
  )
}
