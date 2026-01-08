import { motion, AnimatePresence } from 'motion/react'
import { useEffect } from 'react'

/**
 * Toast notification component
 */
export function Toast({ message, type = 'info', duration = 3000, onClose }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const typeConfig = {
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

/**
 * Toast container for managing multiple toasts
 */
export function ToastContainer({ toasts, onRemove }) {
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
            onClose={() => onRemove(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
