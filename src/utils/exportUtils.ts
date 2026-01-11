/**
 * exportUtils - Utilitaires pour exporter les donnees du planning
 * Supporte les formats JSON et CSV
 */

import type { PlanningConfig, User, Task, Milestone, PlanningWeek, ShoppingList } from '../types'

/** Version du format d'export */
const EXPORT_VERSION = '1.0'

/** Structure complete du planning pour export JSON */
export interface PlanningExport {
  version: string
  exportedAt: string
  planning: {
    name: string
    config: PlanningConfig
    users: User[]
    tasks: Task[]
    milestones: Milestone[]
    shoppingList: ShoppingList
    result: PlanningWeek[] | null
  }
}

/** Options pour les fonctions d'export */
export interface ExportOptions {
  name: string
  config: PlanningConfig
  users: User[]
  tasks: Task[]
  milestones: Milestone[]
  shoppingList: ShoppingList
  planningResult: PlanningWeek[] | null
}

/**
 * Genere un nom de fichier securise
 */
function sanitizeFilename(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Retire les accents
    .replace(/[^a-zA-Z0-9-_]/g, '-') // Remplace les caracteres speciaux
    .replace(/-+/g, '-') // Evite les tirets multiples
    .toLowerCase()
}

/**
 * Formate la date pour le nom de fichier
 */
function formatDateForFilename(): string {
  const now = new Date()
  return now.toISOString().slice(0, 10) // YYYY-MM-DD
}

/**
 * Telecharge un fichier
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Exporte le planning complet en JSON
 */
export function exportToJSON(options: ExportOptions): void {
  const exportData: PlanningExport = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    planning: {
      name: options.name,
      config: options.config,
      users: options.users,
      tasks: options.tasks,
      milestones: options.milestones,
      shoppingList: options.shoppingList,
      result: options.planningResult,
    },
  }

  const jsonContent = JSON.stringify(exportData, null, 2)
  const filename = `planorai-${sanitizeFilename(options.name)}-${formatDateForFilename()}.json`

  downloadFile(jsonContent, filename, 'application/json')
}

/**
 * Echappe une valeur pour CSV (gere les virgules, guillemets, retours a la ligne)
 */
function escapeCSVValue(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return ''

  const stringValue = String(value)

  // Si la valeur contient des virgules, guillemets ou retours a la ligne, l'entourer de guillemets
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

/**
 * Traduit les valeurs pour l'export CSV
 */
const translations: Record<string, Record<string, string>> = {
  type: {
    solo: 'Solo',
    common: 'Commun',
    flexible: 'Flexible',
  },
  recurrence: {
    daily: 'Quotidien',
    weekly: 'Hebdomadaire',
    once: 'Une fois',
    custom: 'Personnalise',
  },
  priority: {
    urgent: 'Urgente',
    haute: 'Haute',
    normale: 'Normale',
    basse: 'Basse',
  },
  timePreference: {
    morning: 'Matin',
    afternoon: 'Apres-midi',
    evening: 'Soir',
    any: 'Indifferent',
  },
}

/**
 * Exporte les taches en CSV
 */
export function exportTasksToCSV(tasks: Task[], users: User[], name: string): void {
  const headers = [
    'Nom',
    'Assigne a',
    'Type',
    'Recurrence',
    'Duree (min)',
    'Priorite',
    'Preference horaire',
    'Jours',
    'Description',
  ]

  const getUserName = (userId: string | undefined): string => {
    if (!userId) return 'Non assigne'
    const user = users.find(u => u.id === userId)
    return user?.name || userId
  }

  const getDays = (task: Task): string => {
    if (!task.daysOfWeek || task.daysOfWeek.length === 0) return 'Tous'
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    return task.daysOfWeek.map(d => dayNames[d]).join(', ')
  }

  const rows = tasks.map(task => [
    escapeCSVValue(task.name),
    escapeCSVValue(getUserName(task.assignedTo)),
    escapeCSVValue(translations.type[task.type] || task.type),
    escapeCSVValue(translations.recurrence[task.recurrence] || task.recurrence),
    escapeCSVValue(task.duration),
    escapeCSVValue(translations.priority[task.priority] || task.priority),
    escapeCSVValue(translations.timePreference[task.timePreference] || task.timePreference),
    escapeCSVValue(getDays(task)),
    escapeCSVValue(task.description || ''),
  ])

  const csvContent = [
    headers.map(h => escapeCSVValue(h)).join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n')

  // Ajoute BOM pour compatibilite Excel avec UTF-8
  const csvWithBOM = '\uFEFF' + csvContent
  const filename = `planorai-taches-${sanitizeFilename(name)}-${formatDateForFilename()}.csv`

  downloadFile(csvWithBOM, filename, 'text/csv;charset=utf-8')
}

/**
 * Exporte la liste de courses en CSV
 */
export function exportShoppingListToCSV(shoppingList: ShoppingList, users: User[], name: string): void {
  const headers = [
    'Article',
    'Categorie',
    'Quantite',
    'Unite',
    'Assigne a',
    'Coche',
  ]

  const getUserName = (userId: string | undefined): string => {
    if (!userId) return ''
    const user = users.find(u => u.id === userId)
    return user?.name || ''
  }

  const rows: string[][] = []

  for (const category of shoppingList.categories) {
    for (const item of category.items) {
      rows.push([
        escapeCSVValue(item.name),
        escapeCSVValue(category.name),
        escapeCSVValue(item.quantity || ''),
        escapeCSVValue(item.unit || ''),
        escapeCSVValue(getUserName(item.assignedTo)),
        item.checked ? 'Oui' : 'Non',
      ])
    }
  }

  const csvContent = [
    headers.map(h => escapeCSVValue(h)).join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n')

  // Ajoute BOM pour compatibilite Excel avec UTF-8
  const csvWithBOM = '\uFEFF' + csvContent
  const filename = `planorai-courses-${sanitizeFilename(name)}-${formatDateForFilename()}.csv`

  downloadFile(csvWithBOM, filename, 'text/csv;charset=utf-8')
}

/**
 * Exporte tout (JSON + CSVs) dans un zip
 * Note: Pour une version plus complete, on pourrait utiliser JSZip
 * Pour l'instant on exporte fichier par fichier
 */
export function exportAll(options: ExportOptions): void {
  exportToJSON(options)
}
