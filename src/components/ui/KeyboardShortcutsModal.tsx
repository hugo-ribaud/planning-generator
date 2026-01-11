/**
 * KeyboardShortcutsModal - Modal d'aide pour les raccourcis clavier
 * Accessible via la touche '?'
 */

import { motion, AnimatePresence } from 'motion/react'
import { useEffect, useRef, useCallback, type KeyboardEvent } from 'react'
import { SHORTCUTS_LIST, formatShortcut } from '../../hooks/useKeyboardShortcuts'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ShortcutItemProps {
  shortcut: string
  description: string
}

function ShortcutItem({ shortcut, description }: ShortcutItemProps): JSX.Element {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-gray-600 dark:text-text-muted-dark">{description}</span>
      <kbd className="ml-4 px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-surface-elevated-dark text-gray-800 dark:text-text-dark rounded border border-gray-200 dark:border-border-dark shadow-sm">
        {formatShortcut(shortcut)}
      </kbd>
    </div>
  )
}

interface ShortcutSectionProps {
  title: string
  icon: string
  shortcuts: ReadonlyArray<{ key: string; description: string }>
}

function ShortcutSection({ title, icon, shortcuts }: ShortcutSectionProps): JSX.Element {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-text-dark mb-2">
        <span>{icon}</span>
        {title}
      </h3>
      <div className="space-y-1">
        {shortcuts.map(({ key, description }) => (
          <ShortcutItem key={key} shortcut={key} description={description} />
        ))}
      </div>
    </div>
  )
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps): JSX.Element {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Focus trap and escape handling
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
    }
  }, [onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-title"
          onKeyDown={handleKeyDown}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative bg-white dark:bg-surface-dark rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-border-dark">
              <h2
                id="shortcuts-title"
                className="text-lg font-semibold text-gray-900 dark:text-text-dark flex items-center gap-2"
              >
                <span className="text-xl">⌨️</span>
                Raccourcis clavier
              </h2>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-elevated-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Fermer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 overflow-y-auto max-h-[calc(85vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Navigation */}
                <ShortcutSection
                  title="Navigation"
                  icon="🧭"
                  shortcuts={SHORTCUTS_LIST.navigation}
                />

                {/* Édition */}
                <ShortcutSection
                  title="Édition"
                  icon="✏️"
                  shortcuts={SHORTCUTS_LIST.editing}
                />

                {/* Sections */}
                <ShortcutSection
                  title="Sections"
                  icon="📑"
                  shortcuts={SHORTCUTS_LIST.sections}
                />

                {/* Aide */}
                <ShortcutSection
                  title="Aide"
                  icon="❓"
                  shortcuts={SHORTCUTS_LIST.help}
                />
              </div>

              {/* Footer tip */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-border-dark">
                <p className="text-xs text-gray-500 dark:text-text-muted-dark text-center">
                  💡 Les raccourcis avec chiffres (1-5) ne fonctionnent que lorsqu'aucun champ n'est en cours d'édition
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default KeyboardShortcutsModal
