/**
 * Donnees de test pour le planning familial
 */

import type { User, Task, Milestone, PlanningConfig, MilestoneStatus } from '../types'

interface TestUser extends Omit<User, 'daysOff'> {
  daysOff?: string[]
}

interface TestTask {
  id: string
  name: string
  duration: number
  frequency: string
  assignedTo: string
  priority: string
  preferredTime?: string
  preferredDays?: string[]
}

interface TestMilestone {
  id: string
  title: string
  description: string
  status: MilestoneStatus
  progress: number
  assigned_to: string
  target_date: string
  is_focus: boolean
  created_at: string
  updated_at: string
}

interface TestConfig {
  id: string
  periodType: string
  periodCount: number
  workStart: string
  workEnd: string
  lunchStart: string
  lunchEnd: string
  slotDuration: number
  daysOff: string[]
}

export const TEST_USERS: TestUser[] = [
  {
    id: 'user-hugo',
    name: 'Hugo',
    color: '#3B82F6', // blue
  },
  {
    id: 'user-delphine',
    name: 'Delphine',
    color: '#EC4899', // pink
  },
]

export const TEST_TASKS: TestTask[] = [
  // Taches quotidiennes
  {
    id: 'task-1',
    name: 'Preparer le petit-dejeuner',
    duration: 30,
    frequency: 'daily',
    assignedTo: 'common',
    priority: 'medium',
  },
  {
    id: 'task-2',
    name: 'Sortir le chien',
    duration: 30,
    frequency: 'daily',
    assignedTo: 'user-hugo',
    priority: 'high',
    preferredTime: 'morning',
  },
  {
    id: 'task-3',
    name: 'Preparer le diner',
    duration: 60,
    frequency: 'daily',
    assignedTo: 'common',
    priority: 'high',
    preferredTime: 'evening',
  },
  {
    id: 'task-4',
    name: 'Meditation',
    duration: 20,
    frequency: 'daily',
    assignedTo: 'user-delphine',
    priority: 'medium',
    preferredTime: 'morning',
  },

  // Taches hebdomadaires
  {
    id: 'task-5',
    name: 'Courses alimentaires',
    duration: 90,
    frequency: 'weekly',
    assignedTo: 'common',
    priority: 'high',
    preferredDays: ['samedi'],
  },
  {
    id: 'task-6',
    name: 'Menage salon',
    duration: 45,
    frequency: 'weekly',
    assignedTo: 'user-hugo',
    priority: 'medium',
    preferredDays: ['dimanche'],
  },
  {
    id: 'task-7',
    name: 'Menage cuisine',
    duration: 45,
    frequency: 'weekly',
    assignedTo: 'user-delphine',
    priority: 'medium',
    preferredDays: ['dimanche'],
  },
  {
    id: 'task-8',
    name: 'Lessive',
    duration: 30,
    frequency: 'weekly',
    assignedTo: 'common',
    priority: 'medium',
    preferredDays: ['mercredi', 'samedi'],
  },
  {
    id: 'task-9',
    name: 'Sport (salle)',
    duration: 90,
    frequency: 'weekly',
    assignedTo: 'user-hugo',
    priority: 'high',
    preferredDays: ['mardi', 'jeudi'],
  },
  {
    id: 'task-10',
    name: 'Yoga',
    duration: 60,
    frequency: 'weekly',
    assignedTo: 'user-delphine',
    priority: 'high',
    preferredDays: ['lundi', 'mercredi', 'vendredi'],
  },

  // Taches flexibles
  {
    id: 'task-11',
    name: 'Lecture',
    duration: 45,
    frequency: 'flexible',
    assignedTo: 'user-hugo',
    priority: 'low',
  },
  {
    id: 'task-12',
    name: 'Jardinage',
    duration: 60,
    frequency: 'flexible',
    assignedTo: 'user-delphine',
    priority: 'low',
  },
  {
    id: 'task-13',
    name: 'Projet perso (code)',
    duration: 120,
    frequency: 'flexible',
    assignedTo: 'user-hugo',
    priority: 'medium',
  },
  {
    id: 'task-14',
    name: 'Appeler les parents',
    duration: 30,
    frequency: 'weekly',
    assignedTo: 'common',
    priority: 'medium',
    preferredDays: ['dimanche'],
  },
]

// Helper pour generer des dates relatives
const today = new Date()
const addDaysToDate = (days: number): string => {
  const date = new Date(today)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

export const TEST_MILESTONES: TestMilestone[] = [
  {
    id: 'milestone-1',
    title: 'Finir le projet Conversari',
    description: 'Application de conversation IA avec interface moderne',
    status: 'in_progress',
    progress: 75,
    assigned_to: 'user-hugo',
    target_date: addDaysToDate(5),
    is_focus: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'milestone-2',
    title: 'Organiser les vacances ete',
    description: 'Reserver hebergement et planifier activites',
    status: 'todo',
    progress: 10,
    assigned_to: 'user-delphine',
    target_date: addDaysToDate(14),
    is_focus: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'milestone-3',
    title: 'Ranger le garage',
    description: 'Trier, jeter, organiser les outils et cartons',
    status: 'in_progress',
    progress: 40,
    assigned_to: 'common',
    target_date: addDaysToDate(7),
    is_focus: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'milestone-4',
    title: 'Certification AWS',
    description: 'Passer la certification Solutions Architect',
    status: 'in_progress',
    progress: 60,
    assigned_to: 'user-hugo',
    target_date: addDaysToDate(21),
    is_focus: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'milestone-5',
    title: 'Cours de poterie termine',
    description: 'Finir les 10 seances du cours',
    status: 'in_progress',
    progress: 80,
    assigned_to: 'user-delphine',
    target_date: addDaysToDate(3),
    is_focus: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'milestone-6',
    title: 'Reparer la cloture',
    description: 'Remplacer les planches cassees cote jardin',
    status: 'todo',
    progress: 0,
    assigned_to: 'user-hugo',
    target_date: addDaysToDate(-2), // En retard !
    is_focus: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'milestone-7',
    title: 'Declarer les impots',
    description: 'Declaration annuelle des revenus',
    status: 'done',
    progress: 100,
    assigned_to: 'common',
    target_date: addDaysToDate(-10),
    is_focus: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const TEST_CONFIG: TestConfig = {
  id: 'config-test',
  periodType: 'week',
  periodCount: 2,
  workStart: '08:00',
  workEnd: '20:00',
  lunchStart: '12:00',
  lunchEnd: '13:30',
  slotDuration: 30,
  daysOff: ['dimanche'],
}

interface LoadTestDataCallbacks {
  setUsers?: (fn: (prev: User[]) => User[]) => void
  setTasks?: (tasks: TestTask[]) => void
  setMilestones?: (milestones: TestMilestone[]) => void
  setConfig?: (config: TestConfig) => void
}

/**
 * Charge les donnees de test dans l'application
 */
export function loadTestData(callbacks: LoadTestDataCallbacks) {
  const { setUsers, setTasks, setMilestones, setConfig } = callbacks

  // Load users
  if (setUsers) {
    setUsers((prev: User[]) => {
      // Replace default users
      if (prev.length <= 2 && prev.some(u => !u.name || u.name === '')) {
        return TEST_USERS as User[]
      }
      return prev
    })
  }

  // Load tasks
  if (setTasks) {
    setTasks(TEST_TASKS)
  }

  // Load milestones
  if (setMilestones) {
    setMilestones(TEST_MILESTONES)
  }

  // Load config
  if (setConfig) {
    setConfig(TEST_CONFIG)
  }

  return {
    users: TEST_USERS,
    tasks: TEST_TASKS,
    milestones: TEST_MILESTONES,
    config: TEST_CONFIG,
  }
}
