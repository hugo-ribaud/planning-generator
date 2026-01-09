import { motion, AnimatePresence } from 'motion/react'
import { useEffect } from 'react'
import type { ToastType, Toast as ToastData, ToastAction } from '../../hooks/useToasts'

interface ToastTypeConfig {
  icon: string
  className: string
}

const typeConfig: Record<ToastType, ToastTypeConfig> = {
  info: {
    icon: 'ℹ️',
    className: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  success: {
    icon: '✅',
    className: 'bg-green-50 text-green-800 border-green-200',
  },
  warning: {
    icon: '⚠️',
    className: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  },
  error: {
    icon: '❌',
    className: 'bg-red-50 text-red-800 border-red-200',
  },
  sync: {
    icon: '🔄',
    className: 'bg-primary/10 text-primary border-primary/20',
  },
}

export interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  /** Action optionnelle (ex: bouton "Annuler") */
  action?: ToastAction
  onClose: () => void
}

/**
 * Toast notification component
 * Supporte un bouton d'action optionnel (ex: "Annuler")
 */
export function Toast({ message, type = 'info', duration = 3000, action, onClose }: ToastProps): JSX.Element {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const config = typeConfig[type] || typeConfig.info

  return (
    <motion.div
      role="alert"
      aria-live="polite"
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg ${config.className}`}
    >
      <span aria-hidden="true">{config.icon}</span>
      <span className="flex-1 text-sm font-medium">{message}</span>

      {/* Bouton d'action optionnel (ex: "Annuler") */}
      {action && (
        <button
          onClick={action.onClick}
          className="ml-2 px-2 py-1 text-xs font-semibold rounded bg-white/50 hover:bg-white/80 transition-colors focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-1"
        >
          {action.label}
        </button>
      )}

      <button
        onClick={onClose}
        aria-label="Fermer la notification"
        className="ml-2 opacity-60 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-1 rounded"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </motion.div>
  )
}

export interface ToastContainerProps {
  toasts: ToastData[]
  onRemove: (id: string) => void
}

/**
 * Toast container for managing multiple toasts
 */
export function ToastContainer({ toasts, onRemove }: ToastContainerProps): JSX.Element {
  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm"
      aria-label="Notifications"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            action={toast.action}
            onClose={() => onRemove(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
