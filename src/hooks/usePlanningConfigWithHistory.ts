import { useCallback, useMemo, useRef, useEffect } from 'react'
import { usePlanningConfig, type UsePlanningConfigReturn, type PlanningConfigState } from './usePlanningConfig'
import { useUndoRedo, useUndoRedoKeyboard, type UseUndoRedoReturn } from './useUndoRedo'
import type { User, Task } from '../types'

/**
 * Etat complet pour l'historique undo/redo
 * Combine config, users et tasks en un seul snapshot
 */
export interface PlanningSnapshot {
  config: PlanningConfigState
  users: User[]
  tasks: Task[]
}

/**
 * Options pour le hook usePlanningConfigWithHistory
 */
export interface UsePlanningConfigWithHistoryOptions {
  /** Taille max de l'historique (defaut: 20) */
  maxHistory?: number
  /** Activer les raccourcis clavier (defaut: true) */
  enableKeyboardShortcuts?: boolean
  /** Callback quand on annule une action */
  onUndo?: (snapshot: PlanningSnapshot, description?: string) => void
  /** Callback quand on refait une action */
  onRedo?: (snapshot: PlanningSnapshot, description?: string) => void
}

/**
 * Retour du hook usePlanningConfigWithHistory
 */
export interface UsePlanningConfigWithHistoryReturn extends UsePlanningConfigReturn {
  // Historique undo/redo
  history: {
    undo: () => void
    redo: () => void
    canUndo: boolean
    canRedo: boolean
    undoCount: number
    redoCount: number
    lastActionDescription: string | undefined
    clear: () => void
  }
}

/**
 * Hook qui etend usePlanningConfig avec support undo/redo
 *
 * @example
 * ```tsx
 * const {
 *   config, users, tasks,
 *   addUser, removeUser,
 *   addTask, removeTask,
 *   history,
 * } = usePlanningConfigWithHistory({
 *   onUndo: (_, desc) => toast.info(`Annulation: ${desc}`),
 * })
 *
 * // Utiliser history.undo() et history.redo()
 * // Ou Ctrl+Z / Ctrl+Shift+Z si enableKeyboardShortcuts est true
 * ```
 */
export function usePlanningConfigWithHistory(
  options: UsePlanningConfigWithHistoryOptions = {}
): UsePlanningConfigWithHistoryReturn {
  const {
    maxHistory = 20,
    enableKeyboardShortcuts = true,
    onUndo,
    onRedo,
  } = options

  // Hook de base
  const planningConfig = usePlanningConfig()
  const {
    config,
    users,
    tasks,
    errors,
    updateConfig: baseUpdateConfig,
    validateConfig,
    addUser: baseAddUser,
    updateUser: baseUpdateUser,
    removeUser: baseRemoveUser,
    addTask: baseAddTask,
    updateTask: baseUpdateTask,
    removeTask: baseRemoveTask,
    loadUsers,
    loadTasks,
    loadConfig,
  } = planningConfig

  // Creer un snapshot de l'etat actuel
  const createSnapshot = useCallback((): PlanningSnapshot => ({
    config: { ...config },
    users: users.map(u => ({ ...u })),
    tasks: tasks.map(t => ({ ...t })),
  }), [config, users, tasks])

  // Hook undo/redo pour les snapshots
  const {
    setState: setSnapshot,
    undo: undoSnapshot,
    redo: redoSnapshot,
    canUndo,
    canRedo,
    undoCount,
    redoCount,
    lastAction,
    clear: clearHistory,
    reset: resetHistory,
  } = useUndoRedo<PlanningSnapshot>(createSnapshot(), {
    maxHistory,
    onUndo: (snapshot, action) => {
      // Restaurer l'etat depuis le snapshot
      loadConfig(snapshot.config)
      loadUsers(snapshot.users)
      loadTasks(snapshot.tasks)
      if (onUndo) onUndo(snapshot, action.description)
    },
    onRedo: (snapshot, action) => {
      // Restaurer l'etat depuis le snapshot
      loadConfig(snapshot.config)
      loadUsers(snapshot.users)
      loadTasks(snapshot.tasks)
      if (onRedo) onRedo(snapshot, action.description)
    },
  })

  // Ref pour ignorer les mises a jour automatiques (quand on fait undo/redo)
  const isRestoringRef = useRef(false)

  // Enregistrer les changements dans l'historique
  const recordChange = useCallback((description: string) => {
    if (isRestoringRef.current) return
    // Le snapshot est cree avec l'etat APRES le changement
    // setTimeout pour capturer apres que React a mis a jour l'etat
    setTimeout(() => {
      setSnapshot(createSnapshot(), description)
    }, 0)
  }, [setSnapshot, createSnapshot])

  // === Wrappers des methodes avec enregistrement dans l'historique ===

  const updateConfig = useCallback((field: keyof PlanningConfigState, value: string | number): void => {
    baseUpdateConfig(field, value)
    recordChange(`Modification ${field}`)
  }, [baseUpdateConfig, recordChange])

  const addUser = useCallback((): void => {
    baseAddUser()
    recordChange('Ajout utilisateur')
  }, [baseAddUser, recordChange])

  const updateUser = useCallback((id: string, field: keyof User, value: unknown): void => {
    baseUpdateUser(id, field, value)
    recordChange(`Modification utilisateur`)
  }, [baseUpdateUser, recordChange])

  const removeUser = useCallback((id: string): void => {
    // Trouver le nom de l'utilisateur avant suppression
    const user = users.find(u => u.id === id)
    const userName = user?.name || 'utilisateur'
    baseRemoveUser(id)
    recordChange(`Suppression ${userName}`)
  }, [baseRemoveUser, recordChange, users])

  const addTask = useCallback((): void => {
    baseAddTask()
    recordChange('Ajout tache')
  }, [baseAddTask, recordChange])

  const updateTask = useCallback((id: string, field: keyof Task, value: unknown): void => {
    baseUpdateTask(id, field, value)
    recordChange(`Modification tache`)
  }, [baseUpdateTask, recordChange])

  const removeTask = useCallback((id: string): void => {
    // Trouver le nom de la tache avant suppression
    const task = tasks.find(t => t.id === id)
    const taskName = task?.name || 'tache'
    baseRemoveTask(id)
    recordChange(`Suppression ${taskName}`)
  }, [baseRemoveTask, recordChange, tasks])

  // Wrappers undo/redo qui marquent le flag de restauration
  const undo = useCallback(() => {
    isRestoringRef.current = true
    undoSnapshot()
    setTimeout(() => {
      isRestoringRef.current = false
    }, 50)
  }, [undoSnapshot])

  const redo = useCallback(() => {
    isRestoringRef.current = true
    redoSnapshot()
    setTimeout(() => {
      isRestoringRef.current = false
    }, 50)
  }, [redoSnapshot])

  // Raccourcis clavier
  useUndoRedoKeyboard(undo, redo, enableKeyboardShortcuts)

  // Objet history pour l'API
  const history = useMemo(() => ({
    undo,
    redo,
    canUndo,
    canRedo,
    undoCount,
    redoCount,
    lastActionDescription: lastAction?.description,
    clear: clearHistory,
  }), [undo, redo, canUndo, canRedo, undoCount, redoCount, lastAction, clearHistory])

  return {
    // Etat
    config,
    users,
    tasks,
    errors,
    // Config (avec enregistrement)
    updateConfig,
    validateConfig,
    // Users (avec enregistrement)
    addUser,
    updateUser,
    removeUser,
    // Tasks (avec enregistrement)
    addTask,
    updateTask,
    removeTask,
    // Bulk loaders (sans enregistrement, pour chargement initial)
    loadUsers,
    loadTasks,
    loadConfig,
    // Historique
    history,
  }
}
