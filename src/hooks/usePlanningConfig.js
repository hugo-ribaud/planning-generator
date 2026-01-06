import { useState, useCallback } from 'react'
import { DEFAULT_CONFIG, DEFAULT_USERS } from '../data/defaults'

// Get current Monday
function getCurrentMonday() {
  const today = new Date()
  const day = today.getDay()
  const diff = today.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(today.setDate(diff))
  return monday.toISOString().split('T')[0]
}

const initialConfig = {
  name: 'Planning Familial',
  period: DEFAULT_CONFIG.period,
  startDate: getCurrentMonday(),
  workStart: DEFAULT_CONFIG.work_start,
  workEnd: DEFAULT_CONFIG.work_end,
  lunchStart: DEFAULT_CONFIG.lunch_start,
  lunchEnd: DEFAULT_CONFIG.lunch_end,
  slotDuration: DEFAULT_CONFIG.slot_duration,
}

const initialUsers = DEFAULT_USERS.map((user, index) => ({
  id: `temp-${index}`,
  ...user,
}))

export function usePlanningConfig() {
  const [config, setConfig] = useState(initialConfig)
  const [users, setUsers] = useState(initialUsers)
  const [tasks, setTasks] = useState([])
  const [errors, setErrors] = useState({})

  // Config handlers
  const updateConfig = useCallback((field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    setErrors(prev => ({ ...prev, [field]: null }))
  }, [])

  const validateConfig = useCallback(() => {
    const newErrors = {}

    if (config.workStart >= config.workEnd) {
      newErrors.workEnd = "L'heure de fin doit être après l'heure de début"
    }
    if (config.lunchStart >= config.lunchEnd) {
      newErrors.lunchEnd = "L'heure de fin de pause doit être après le début"
    }
    if (config.lunchStart < config.workStart || config.lunchEnd > config.workEnd) {
      newErrors.lunchStart = "La pause doit être dans les heures de travail"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [config])

  // Users handlers
  const addUser = useCallback(() => {
    const newUser = {
      id: `temp-${Date.now()}`,
      name: '',
      color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
      days_off: [],
      constraints: '',
    }
    setUsers(prev => [...prev, newUser])
  }, [])

  const updateUser = useCallback((id, field, value) => {
    setUsers(prev => prev.map(user =>
      user.id === id ? { ...user, [field]: value } : user
    ))
  }, [])

  const removeUser = useCallback((id) => {
    setUsers(prev => prev.filter(user => user.id !== id))
  }, [])

  // Tasks handlers
  const addTask = useCallback(() => {
    const newTask = {
      id: `temp-${Date.now()}`,
      name: '',
      assignedTo: null,
      type: 'solo',
      recurrence: 'weekly',
      duration: 60,
      priority: 2,
      color: '',
      preferredDays: [],
      preferredTime: 'any',
    }
    setTasks(prev => [...prev, newTask])
  }, [])

  const updateTask = useCallback((id, field, value) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, [field]: value } : task
    ))
  }, [])

  const removeTask = useCallback((id) => {
    setTasks(prev => prev.filter(task => task.id !== id))
  }, [])

  // Bulk loaders for test data
  const loadUsers = useCallback((newUsers) => {
    setUsers(newUsers)
  }, [])

  const loadTasks = useCallback((newTasks) => {
    setTasks(newTasks)
  }, [])

  const loadConfig = useCallback((newConfig) => {
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
