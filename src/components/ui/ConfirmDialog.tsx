/**
 * ConfirmDialog - Modal de confirmation accessible
 * Utilise pour confirmer les actions destructrices (suppression, etc.)
 */

import { useEffect, useRef, useCallback, type KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from './Button'

export type ConfirmDialogVariant = 'danger' | 'warning' | 'info'

export interface ConfirmDialogProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmDialogVariant
}

const variantStyles: Record<ConfirmDialogVariant, {
  icon: string
  iconBg: string
  iconColor: string
  confirmButtonClass: string
}> = {
  danger: {
    icon: '&#9888;',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    confirmButtonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  },
  warning: {
    icon: '&#9888;',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    confirmButtonClass: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
  },
  info: {
    icon: '&#8505;',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    confirmButtonClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  },
}

export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
}: ConfirmDialogProps): JSX.Element {
  const dialogRef = useRef<HTMLDivElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  const styles = variantStyles[variant]

  // Store previously focused element and focus first button on open
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
      // Focus cancel button by default (safer option)
      setTimeout(() => {
        cancelButtonRef.current?.focus()
      }, 0)
    } else {
      // Restore focus on close
      previousActiveElement.current?.focus()
    }
  }, [isOpen])

  // Handle escape key
  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onCancel()
    }

    // Focus trap - Tab cycling between buttons
    if (event.key === 'Tab') {
      const focusableElements = [cancelButtonRef.current, confirmButtonRef.current].filter(Boolean) as HTMLElement[]
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement?.focus()
        }
      }
    }
  }, [onCancel])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          ref={dialogRef}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-message"
          onKeyDown={handleKeyDown}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50"
            onClick={onCancel}
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative bg-white dark:bg-surface-dark rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
          >
            <div className="p-6">
              {/* Icon and Title */}
              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full ${styles.iconBg} ${styles.iconColor} flex items-center justify-center text-xl`}
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: styles.icon }}
                />
                <div className="flex-1 min-w-0">
                  <h2
                    id="confirm-dialog-title"
                    className="text-lg font-semibold text-gray-900 dark:text-text-dark"
                  >
                    {title}
                  </h2>
                  <p
                    id="confirm-dialog-message"
                    className="mt-2 text-sm text-gray-600 dark:text-text-muted-dark"
                  >
                    {message}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  ref={cancelButtonRef}
                  variant="secondary"
                  onClick={onCancel}
                >
                  {cancelLabel}
                </Button>
                <button
                  ref={confirmButtonRef}
                  type="button"
                  onClick={onConfirm}
                  className={`
                    px-4 py-2 rounded-lg font-medium text-white
                    transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
                    dark:focus:ring-offset-background-dark
                    ${styles.confirmButtonClass}
                  `}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
