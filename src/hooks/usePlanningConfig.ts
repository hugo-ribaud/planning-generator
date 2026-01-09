import { useState, useCallback } from 'react'
import { DEFAULT_CONFIG, DEFAULT_USERS } from '../data/defaults'
import { generateId } from '../utils/idGenerator'
import { PRIORITIES, DEFAULT_DURATIONS } from '../utils/constants'
import type { User, Task, Priority, TaskType, RecurrenceType, TimePreference } from '../types'

export interface PlanningConfigState {
  name: string
  period: string
  startDate: string
  workStart: string
  workEnd: string
  lunchStart: string
  lunchEnd: string
  slotDuration: number
}

export interface ConfigErrors {
  workEnd?: string | null
  lunchEnd?: string | null
  lunchStart?: string | null
  [key: string]: string | null | undefined
}

// Get current Monday
function getCurrentMonday(): string {
  const today = new Date()
  const day = today.getDay()
  const diff = today.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(today.setDate(diff))
  return monday.toISOString().split('T')[0]
}

const initialConfig: PlanningConfigState = {
  name: 'Planning Familial',
  period: DEFAULT_CONFIG.period,
  startDate: getCurrentMonday(),
  workStart: DEFAULT_CONFIG.work_start,
  workEnd: DEFAULT_CONFIG.work_end,
  lunchStart: DEFAULT_CONFIG.lunch_start,
  lunchEnd: DEFAULT_CONFIG.lunch_end,
  slotDuration: DEFAULT_CONFIG.slot_duration,
}

const initialUsers: User[] = DEFAULT_USERS.map((user) => ({
  id: generateId('user'),
  name: user.name,
  color: user.color,
  daysOff: user.days_off,
}))

export interface UsePlanningConfigReturn {
  // State
  config: PlanningConfigState
  users: User[]
  tasks: Task[]
  errors: ConfigErrors
  // Config
  updateConfig: (field: keyof PlanningConfigState, value: string | number) => void
  validateConfig: () => boolean
  // Users
  addUser: () => void
  updateUser: (id: string, field: keyof User, value: unknown) => void
  removeUser: (id: string) => void
  // Tasks
  addTask: () => void
  updateTask: (id: string, field: keyof Task, value: unknown) => void
  removeTask: (id: string) => void
  // Bulk loaders
  loadUsers: (newUsers: User[]) => void
  loadTasks: (newTasks: Task[]) => void
  loadConfig: (newConfig: Partial<PlanningConfigState>) => void
}

export function usePlanningConfig(): UsePlanningConfigReturn {
  const [config, setConfig] = useState<PlanningConfigState>(initialConfig)
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [tasks, setTasks] = useState<Task[]>([])
  const [errors, setErrors] = useState<ConfigErrors>({})

  // Real-time validation helper
  const validateTimeFields = useCallback((updatedConfig: PlanningConfigState): ConfigErrors => {
    const newErrors: ConfigErrors = {}

    if (updatedConfig.workStart >= updatedConfig.workEnd) {
      newErrors.workEnd = "L'heure de fin doit etre apres l'heure de debut"
    }
    if (updatedConfig.lunchStart >= updatedConfig.lunchEnd) {
      newErrors.lunchEnd = "L'heure de fin de pause doit etre apres le debut"
    }
    if (updatedConfig.lunchStart < updatedConfig.workStart || updatedConfig.lunchEnd > updatedConfig.workEnd) {
      newErrors.lunchStart = "La pause doit etre dans les heures de travail"
    }

    return newErrors
  }, [])

  // Config handlers with real-time validation
  const updateConfig = useCallback((field: keyof PlanningConfigState, value: string | number): void => {
    setConfig(prev => {
      const updated = { ...prev, [field]: value }
      // Validate in real-time for time fields
      const timeFields = ['workStart', 'workEnd', 'lunchStart', 'lunchEnd']
      if (timeFields.includes(field)) {
        const newErrors = validateTimeFields(updated)
        setErrors(newErrors)
      }
      return updated
    })
  }, [validateTimeFields])

  const validateConfig = useCallback((): boolean => {
    const newErrors = validateTimeFields(config)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [config, validateTimeFields])

  // Users handlers
  const addUser = useCallback((): void => {
    const newUser: User = {
      id: generateId('user'),
      name: '',
      color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
      daysOff: [],
    }
    setUsers(prev => [...prev, newUser])
  }, [])

  const updateUser = useCallback((id: string, field: keyof User, value: unknown): void => {
    setUsers(prev => prev.map(user =>
      user.id === id ? { ...user, [field]: value } : user
    ))
  }, [])

  const removeUser = useCallback((id: string): void => {
    setUsers(prev => prev.filter(user => user.id !== id))
  }, [])

  // Tasks handlers
  const addTask = useCallback((): void => {
    const newTask: Task = {
      id: generateId('task'),
      name: '',
      assignedTo: undefined,
      type: 'solo' as TaskType,
      recurrence: 'weekly' as RecurrenceType,
      duration: DEFAULT_DURATIONS.MEDIUM,
      priority: PRIORITIES.HIGH as Priority,
      color: '',
      preferredDays: [],
      preferredTime: 'any' as TimePreference,
    }
    setTasks(prev => [...prev, newTask])
  }, [])

  const updateTask = useCallback((id: string, field: keyof Task, value: unknown): void => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, [field]: value } : task
    ))
  }, [])

  const removeTask = useCallback((id: string): void => {
    setTasks(prev => prev.filter(task => task.id !== id))
  }, [])

  // Bulk loaders for test data
  const loadUsers = useCallback((newUsers: User[]): void => {
    setUsers(newUsers)
  }, [])

  const loadTasks = useCallback((newTasks: Task[]): void => {
    setTasks(newTasks)
  }, [])

  const loadConfig = useCallback((newConfig: Partial<PlanningConfigState>): void => {
    setConfig(prev => ({ ...prev, ...newConfig }))
  }, [])

  return {
    // State
    config,
    users,
    tasks,
    errors,
    // Config
    updateConfig,
    validateConfig,
    // Users
    addUser,
    updateUser,
    removeUser,
    // Tasks
    addTask,
    updateTask,
    removeTask,
    // Bulk loaders
    loadUsers,
    loadTasks,
    loadConfig,
  }
}
