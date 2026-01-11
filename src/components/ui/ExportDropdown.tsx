/**
 * ExportDropdown - Menu deroulant pour exporter les donnees du planning
 * Supporte JSON (complet) et CSV (taches, courses)
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { exportToJSON, exportTasksToCSV, exportShoppingListToCSV, type ExportOptions } from '../../utils/exportUtils'

export interface ExportDropdownProps {
  options: ExportOptions
  onExportComplete?: (format: string) => void
  className?: string
}

export function ExportDropdown({ options, onExportComplete, className = '' }: ExportDropdownProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Fermer avec Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleExportJSON = () => {
    exportToJSON(options)
    setIsOpen(false)
    onExportComplete?.('JSON')
  }

  const handleExportTasksCSV = () => {
    exportTasksToCSV(options.tasks, options.users, options.name)
    setIsOpen(false)
    onExportComplete?.('CSV (Taches)')
  }

  const handleExportShoppingCSV = () => {
    exportShoppingListToCSV(options.shoppingList, options.users, options.name)
    setIsOpen(false)
    onExportComplete?.('CSV (Courses)')
  }

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-text-dark bg-white dark:bg-surface-dark border border-gray-300 dark:border-border-dark rounded-lg hover:bg-gray-50 dark:hover:bg-surface-elevated-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Exporter
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-surface-dark rounded-lg shadow-lg border border-gray-200 dark:border-border-dark overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-surface-elevated-dark border-b border-gray-200 dark:border-border-dark">
              <p className="text-xs font-medium text-gray-500 dark:text-text-muted-dark uppercase tracking-wider">
                Format d'export
              </p>
            </div>

            {/* Options */}
            <div className="py-1">
              {/* JSON Export */}
              <button
                onClick={handleExportJSON}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-surface-elevated-dark transition-colors"
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-mono">
                  { }
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-text-dark">
                    JSON complet
                  </p>
                  <p className="text-xs text-gray-500 dark:text-text-muted-dark">
                    Export complet pour backup/import
                  </p>
                </div>
              </button>

              {/* Divider */}
              <div className="my-1 border-t border-gray-100 dark:border-border-dark" />

              {/* CSV Tasks */}
              <button
                onClick={handleExportTasksCSV}
                disabled={options.tasks.length === 0}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-surface-elevated-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 text-xs font-mono">
                  CSV
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-text-dark">
                    Taches (CSV)
                  </p>
                  <p className="text-xs text-gray-500 dark:text-text-muted-dark">
                    {options.tasks.length} tache{options.tasks.length > 1 ? 's' : ''} - Compatible Excel
                  </p>
                </div>
              </button>

              {/* CSV Shopping */}
              <button
                onClick={handleExportShoppingCSV}
                disabled={options.shoppingList.categories.every(c => c.items.length === 0)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-surface-elevated-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-xs font-mono">
                  CSV
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-text-dark">
                    Liste de courses (CSV)
                  </p>
                  <p className="text-xs text-gray-500 dark:text-text-muted-dark">
                    {options.shoppingList.categories.reduce((acc, c) => acc + c.items.length, 0)} article{options.shoppingList.categories.reduce((acc, c) => acc + c.items.length, 0) > 1 ? 's' : ''}
                  </p>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ExportDropdown
