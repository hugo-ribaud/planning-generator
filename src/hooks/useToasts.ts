import { useState, useCallback } from 'react'

export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'sync'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration: number
}

export interface ToastMethods {
  info: (message: string, duration?: number) => string
  success: (message: string, duration?: number) => string
  warning: (message: string, duration?: number) => string
  error: (message: string, duration?: number) => string
  sync: (message: string, duration?: number) => string
}

export interface UseToastsReturn {
  toasts: Toast[]
  addToast: (message: string, type?: ToastType, duration?: number) => string
  removeToast: (id: string) => void
  clearToasts: () => void
  toast: ToastMethods
}

/**
 * Hook pour gerer les toast notifications
 */
export function useToasts(): UseToastsReturn {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000): string => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, type, duration }])
    return id
  }, [])

  const removeToast = useCallback((id: string): void => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const clearToasts = useCallback((): void => {
    setToasts([])
  }, [])

  // Convenience methods
  const toast: ToastMethods = {
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
