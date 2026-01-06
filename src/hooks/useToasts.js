import { useState, useCallback } from 'react'

/**
 * Hook pour gérer les toast notifications
 */
export function useToasts() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, type, duration }])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  // Convenience methods
  const toast = {
    info: (message, duration) => addToast(message, 'info', duration),
    success: (message, duration) => addToast(message, 'success', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    sync: (message, duration) => addToast(message, 'sync', duration),
  }

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    toast,
  }
}
