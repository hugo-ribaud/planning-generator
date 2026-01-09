import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * Type d'action pour l'historique undo/redo
 */
export interface UndoRedoAction<T> {
  /** Etat avant l'action */
  previousState: T
  /** Etat apres l'action */
  nextState: T
  /** Description de l'action (pour debug/UI) */
  description?: string
  /** Timestamp de l'action */
  timestamp: number
}

/**
 * Options de configuration pour useUndoRedo
 */
export interface UseUndoRedoOptions<T> {
  /** Taille maximale de l'historique (defaut: 20) */
  maxHistory?: number
  /** Callback apres un undo */
  onUndo?: (state: T, action: UndoRedoAction<T>) => void
  /** Callback apres un redo */
  onRedo?: (state: T, action: UndoRedoAction<T>) => void
  /** Callback quand l'etat change */
  onChange?: (state: T) => void
  /** Delai pour grouper les actions rapides (ms) */
  debounceMs?: number
}

/**
 * Retour du hook useUndoRedo
 */
export interface UseUndoRedoReturn<T> {
  /** Etat actuel */
  state: T
  /** Mettre a jour l'etat (ajoute a l'historique) */
  setState: (newState: T | ((prev: T) => T), description?: string) => void
  /** Annuler la derniere action */
  undo: () => void
  /** Refaire la derniere action annulee */
  redo: () => void
  /** Est-ce qu'on peut annuler? */
  canUndo: boolean
  /** Est-ce qu'on peut refaire? */
  canRedo: boolean
  /** Vider l'historique */
  clear: () => void
  /** Reinitialiser avec un nouvel etat (sans ajouter a l'historique) */
  reset: (newState: T) => void
  /** Nombre d'actions dans l'historique undo */
  undoCount: number
  /** Nombre d'actions dans l'historique redo */
  redoCount: number
  /** Derniere action (pour afficher "Annuler: description") */
  lastAction: UndoRedoAction<T> | null
}

/**
 * Hook generique pour gerer l'historique undo/redo
 *
 * @param initialState - Etat initial
 * @param options - Options de configuration
 * @returns Interface undo/redo complete
 *
 * @example
 * ```tsx
 * const { state, setState, undo, redo, canUndo, canRedo } = useUndoRedo<Task[]>([])
 *
 * // Ajouter une tache
 * setState([...state, newTask], 'Ajout de tache')
 *
 * // Annuler
 * if (canUndo) undo()
 * ```
 */
export function useUndoRedo<T>(
  initialState: T,
  options: UseUndoRedoOptions<T> = {}
): UseUndoRedoReturn<T> {
  const {
    maxHistory = 20,
    onUndo,
    onRedo,
    onChange,
    debounceMs = 300,
  } = options

  // Etat actuel
  const [state, setInternalState] = useState<T>(initialState)

  // Historique pour undo (pile)
  const undoStack = useRef<UndoRedoAction<T>[]>([])

  // Historique pour redo (pile)
  const redoStack = useRef<UndoRedoAction<T>[]>([])

  // Ref pour le debounce
  const lastActionTime = useRef<number>(0)
  const lastDescription = useRef<string | undefined>()

  // Force re-render pour canUndo/canRedo
  const [, forceUpdate] = useState({})

  /**
   * Met a jour l'etat et ajoute a l'historique undo
   */
  const setState = useCallback((
    newStateOrUpdater: T | ((prev: T) => T),
    description?: string
  ): void => {
    setInternalState(prevState => {
      const newState = typeof newStateOrUpdater === 'function'
        ? (newStateOrUpdater as (prev: T) => T)(prevState)
        : newStateOrUpdater

      // Verifier si l'etat a vraiment change (comparaison superficielle)
      if (JSON.stringify(prevState) === JSON.stringify(newState)) {
        return prevState
      }

      const now = Date.now()
      const timeSinceLastAction = now - lastActionTime.current

      // Grouper les actions rapides avec la meme description
      if (
        timeSinceLastAction < debounceMs &&
        description === lastDescription.current &&
        undoStack.current.length > 0
      ) {
        // Mettre a jour la derniere action au lieu d'en ajouter une nouvelle
        const lastAction = undoStack.current[undoStack.current.length - 1]
        lastAction.nextState = newState
        lastAction.timestamp = now
      } else {
        // Ajouter une nouvelle action
        const action: UndoRedoAction<T> = {
          previousState: prevState,
          nextState: newState,
          description,
          timestamp: now,
        }

        undoStack.current.push(action)

        // Limiter la taille de l'historique
        if (undoStack.current.length > maxHistory) {
          undoStack.current.shift()
        }
      }

      lastActionTime.current = now
      lastDescription.current = description

      // Vider le redo stack (on ne peut plus refaire apres une nouvelle action)
      redoStack.current = []

      // Forcer le re-render pour mettre a jour canUndo/canRedo
      forceUpdate({})

      // Callback onChange
      if (onChange) {
        onChange(newState)
      }

      return newState
    })
  }, [maxHistory, debounceMs, onChange])

  /**
   * Annule la derniere action
   */
  const undo = useCallback((): void => {
    if (undoStack.current.length === 0) return

    const action = undoStack.current.pop()!

    // Ajouter au redo stack
    redoStack.current.push(action)

    // Restaurer l'etat precedent
    setInternalState(action.previousState)

    // Forcer le re-render
    forceUpdate({})

    // Callback
    if (onUndo) {
      onUndo(action.previousState, action)
    }
    if (onChange) {
      onChange(action.previousState)
    }
  }, [onUndo, onChange])

  /**
   * Refait la derniere action annulee
   */
  const redo = useCallback((): void => {
    if (redoStack.current.length === 0) return

    const action = redoStack.current.pop()!

    // Remettre dans le undo stack
    undoStack.current.push(action)

    // Restaurer l'etat suivant
    setInternalState(action.nextState)

    // Forcer le re-render
    forceUpdate({})

    // Callback
    if (onRedo) {
      onRedo(action.nextState, action)
    }
    if (onChange) {
      onChange(action.nextState)
    }
  }, [onRedo, onChange])

  /**
   * Vide tout l'historique
   */
  const clear = useCallback((): void => {
    undoStack.current = []
    redoStack.current = []
    lastActionTime.current = 0
    lastDescription.current = undefined
    forceUpdate({})
  }, [])

  /**
   * Reinitialise l'etat sans ajouter a l'historique
   * Utile pour charger des donnees externes
   */
  const reset = useCallback((newState: T): void => {
    setInternalState(newState)
    clear()
    if (onChange) {
      onChange(newState)
    }
  }, [clear, onChange])

  // Derniere action pour l'UI
  const lastAction = undoStack.current.length > 0
    ? undoStack.current[undoStack.current.length - 1]
    : null

  return {
    state,
    setState,
    undo,
    redo,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
    clear,
    reset,
    undoCount: undoStack.current.length,
    redoCount: redoStack.current.length,
    lastAction,
  }
}

/**
 * Hook pour les raccourcis clavier undo/redo (Ctrl+Z / Ctrl+Shift+Z)
 *
 * @param undo - Fonction undo a appeler
 * @param redo - Fonction redo a appeler
 * @param enabled - Activer/desactiver les raccourcis
 */
export function useUndoRedoKeyboard(
  undo: () => void,
  redo: () => void,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent): void => {
      // Ignorer si on est dans un champ de saisie
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifierKey = isMac ? event.metaKey : event.ctrlKey

      if (modifierKey && event.key.toLowerCase() === 'z') {
        event.preventDefault()

        if (event.shiftKey) {
          // Ctrl+Shift+Z (ou Cmd+Shift+Z sur Mac) = Redo
          redo()
        } else {
          // Ctrl+Z (ou Cmd+Z sur Mac) = Undo
          undo()
        }
      }

      // Support pour Ctrl+Y (Windows) = Redo
      if (!isMac && event.ctrlKey && event.key.toLowerCase() === 'y') {
        event.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, enabled])
}

/**
 * Type utilitaire pour creer un wrapper undo/redo autour d'un etat existant
 */
export type UndoRedoWrapper<T> = {
  value: T
  history: {
    undo: () => void
    redo: () => void
    canUndo: boolean
    canRedo: boolean
    clear: () => void
  }
}
