/**
 * Données de test pour le planning familial
 */

export const TEST_USERS = [
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

export const TEST_TASKS = [
  // Tâches quotidiennes
  {
    id: 'task-1',
    name: 'Préparer le petit-déjeuner',
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
    name: 'Préparer le dîner',
    duration: 60,
    frequency: 'daily',
    assignedTo: 'common',
    priority: 'high',
    preferredTime: 'evening',
  },
  {
    id: 'task-4',
    name: 'Méditation',
    duration: 20,
    frequency: 'daily',
    assignedTo: 'user-delphine',
    priority: 'medium',
    preferredTime: 'morning',
  },

  // Tâches hebdomadaires
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
    name: 'Ménage salon',
    duration: 45,
    frequency: 'weekly',
    assignedTo: 'user-hugo',
    priority: 'medium',
    preferredDays: ['dimanche'],
  },
  {
    id: 'task-7',
    name: 'Ménage cuisine',
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

  // Tâches flexibles
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

// Helper pour générer des dates relatives
const today = new Date()
const addDays = (days) => {
  const date = new Date(today)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

export const TEST_MILESTONES = [
  {
    id: 'milestone-1',
    title: 'Finir le projet Conversari',
    description: 'Application de conversation IA avec interface moderne',
    status: 'in_progress',
    progress: 75,
    assigned_to: 'user-hugo',
    target_date: addDays(5),
    is_focus: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'milestone-2',
    title: 'Organiser les vacances été',
    description: 'Réserver hébergement et planifier activités',
    status: 'todo',
    progress: 10,
    assigned_to: 'user-delphine',
    target_date: addDays(14),
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
    target_date: addDays(7),
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
    target_date: addDays(21),
    is_focus: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'milestone-5',
    title: 'Cours de poterie terminé',
    description: 'Finir les 10 séances du cours',
    status: 'in_progress',
    progress: 80,
    assigned_to: 'user-delphine',
    target_date: addDays(3),
    is_focus: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'milestone-6',
    title: 'Réparer la clôture',
    description: 'Remplacer les planches cassées côté jardin',
    status: 'todo',
    progress: 0,
    assigned_to: 'user-hugo',
    target_date: addDays(-2), // En retard !
    is_focus: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'milestone-7',
    title: 'Déclarer les impôts',
    description: 'Déclaration annuelle des revenus',
    status: 'done',
    progress: 100,
    assigned_to: 'common',
    target_date: addDays(-10),
    is_focus: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const TEST_CONFIG = {
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

/**
 * Charge les données de test dans l'application
 */
export function loadTestData(callbacks) {
  const { setUsers, setTasks, setMilestones, setConfig } = callbacks

  // Load users
  if (setUsers) {
    TEST_USERS.forEach(user => setUsers(prev => {
      // Replace default users
      if (prev.length <= 2 && prev.some(u => !u.name || u.name === '')) {
        return TEST_USERS
      }
      return prev
    }))
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
