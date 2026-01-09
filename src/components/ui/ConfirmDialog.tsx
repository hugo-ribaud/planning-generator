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
  iconBg: string
  iconColor: string
  icon: string
}> = {
  danger: {
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    icon: '!',
  },
  warning: {
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    icon: '!',
  },
  info: {
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    icon: '?',
  },
}

/**
 * Dialogue de confirmation accessible pour les actions destructives
 * Implémente: focus trap, navigation clavier, attributs ARIA
 */
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
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  const styles = variantStyles[variant]

  // Focus the cancel button when dialog opens (safer default)
  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      cancelButtonRef.current.focus()
    }
  }, [isOpen])

  // Handle escape key
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }

    // Focus trap
    if (e.key === 'Tab') {
      const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled])'
      )
      if (!focusableElements || focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }
  }, [onCancel])

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="presentation"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onCancel}
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
            onKeyDown={handleKeyDown}
            className="relative bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
          >
            <div className="p-6">
              {/* Icon */}
              <div className="flex items-center justify-center mb-4">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${styles.iconBg}
                `}>
                  <span className={`text-2xl font-bold ${styles.iconColor}`}>
                    {styles.icon}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h2
                id="confirm-dialog-title"
                className="text-xl font-semibold text-gray-900 text-center mb-2"
              >
                {title}
              </h2>

              {/* Message */}
              <p
                id="confirm-dialog-description"
                className="text-gray-600 text-center mb-6"
              >
                {message}
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  ref={cancelButtonRef}
                  variant="secondary"
                  onClick={onCancel}
                  className="flex-1"
                >
                  {cancelLabel}
                </Button>
                <Button
                  ref={confirmButtonRef}
                  variant={variant === 'danger' ? 'danger' : 'primary'}
                  onClick={onConfirm}
                  className="flex-1"
                >
                  {confirmLabel}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
