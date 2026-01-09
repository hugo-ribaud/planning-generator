import { useState, useCallback } from 'react'

export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'sync'

/**
 * Action optionnelle pour un toast (ex: bouton "Annuler")
 */
export interface ToastAction {
  /** Texte du bouton */
  label: string
  /** Callback quand le bouton est clique */
  onClick: () => void
}

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration: number
  /** Action optionnelle (ex: bouton "Annuler") */
  action?: ToastAction
}

export interface ToastOptions {
  duration?: number
  action?: ToastAction
}

export interface ToastMethods {
  info: (message: string, options?: ToastOptions | number) => string
  success: (message: string, options?: ToastOptions | number) => string
  warning: (message: string, options?: ToastOptions | number) => string
  error: (message: string, options?: ToastOptions | number) => string
  sync: (message: string, options?: ToastOptions | number) => string
  /** Toast avec bouton d'annulation */
  withUndo: (message: string, onUndo: () => void, duration?: number) => string
}

export interface UseToastsReturn {
  toasts: Toast[]
  addToast: (message: string, type?: ToastType, duration?: number, action?: ToastAction) => string
  removeToast: (id: string) => void
  clearToasts: () => void
  toast: ToastMethods
}

/**
 * Helper pour parser les options de toast
 */
function parseOptions(options?: ToastOptions | number): { duration: number; action?: ToastAction } {
  if (typeof options === 'number') {
    return { duration: options }
  }
  return {
    duration: options?.duration ?? 3000,
    action: options?.action,
  }
}

/**
 * Hook pour gerer les toast notifications
 */
export function useToasts(): UseToastsReturn {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((
    message: string,
    type: ToastType = 'info',
    duration: number = 3000,
    action?: ToastAction
  ): string => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, type, duration, action }])
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
    info: (message, options) => {
      const { duration, action } = parseOptions(options)
      return addToast(message, 'info', duration, action)
    },
    success: (message, options) => {
      const { duration, action } = parseOptions(options)
      return addToast(message, 'success', duration, action)
    },
    warning: (message, options) => {
      const { duration, action } = parseOptions(options)
      return addToast(message, 'warning', duration, action)
    },
    error: (message, options) => {
      const { duration, action } = parseOptions(options)
      return addToast(message, 'error', duration, action)
    },
    sync: (message, options) => {
      const { duration, action } = parseOptions(options)
      return addToast(message, 'sync', duration, action)
    },
    /** Toast avec bouton d'annulation integre */
    withUndo: (message, onUndo, duration = 5000) => {
      const id = crypto.randomUUID()
      const action: ToastAction = {
        label: 'Annuler',
        onClick: () => {
          onUndo()
          // Fermer le toast apres l'action
          setToasts(prev => prev.filter(t => t.id !== id))
        },
      }
      setToasts(prev => [...prev, { id, message, type: 'info', duration, action }])
      return id
    },
  }

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    toast,
  }
}
