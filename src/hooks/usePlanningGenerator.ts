import { useState, useCallback } from 'react'
import { generatePlanning, exportPlanning } from '../utils/planningAlgorithm'
import type { User, Task, PlanningWeek, PlanningStats, ExportedPlanning } from '../types'

export interface AlgoConfig {
  period?: string
  startDate?: string
  workStart?: string
  workEnd?: string
  lunchStart?: string
  lunchEnd?: string
  slotDuration?: number
}

export interface GenerateResult {
  planning: PlanningWeek[]
  grid: unknown
  stats: PlanningStats
}

export interface UsePlanningGeneratorReturn {
  planning: PlanningWeek[] | null
  stats: PlanningStats | null
  isGenerating: boolean
  error: string | null
  generate: (config: AlgoConfig, users: User[], tasks: Task[]) => GenerateResult | null
  reset: () => void
  loadPlanning: (planningData: PlanningWeek[] | null) => void
  exportAsJson: () => ExportedPlanning | null
}

/**
 * Hook pour la generation de planning
 */
export function usePlanningGenerator(): UsePlanningGeneratorReturn {
  const [planning, setPlanning] = useState<PlanningWeek[] | null>(null)
  const [stats, setStats] = useState<PlanningStats | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Genere un planning a partir de la configuration
   */
  const generate = useCallback((config: AlgoConfig, users: User[], tasks: Task[]): GenerateResult | null => {
    setIsGenerating(true)
    setError(null)

    try {
      // Preparer la configuration pour l'algorithme
      const algoConfig = {
        period: config.period || 'week',
        startDate: config.startDate || new Date().toISOString().split('T')[0],
        workStart: config.workStart || '09:00',
        workEnd: config.workEnd || '17:00',
        lunchStart: config.lunchStart || '12:30',
        lunchEnd: config.lunchEnd || '14:00',
        slotDuration: config.slotDuration || 30,
      }

      // Preparer les utilisateurs
      const algoUsers = users
        .filter(u => u.name && u.name.trim())
        .map(u => ({
          ...u,
          daysOff: u.daysOff || [],
        }))

      if (algoUsers.length === 0) {
        throw new Error('Au moins un utilisateur est requis')
      }

      // Preparer les taches
      const algoTasks = tasks
        .filter(t => t.name && t.name.trim())
        .map(t => ({
          ...t,
          duration: t.duration || 30,
          priority: t.priority || 3,
          recurrence: t.recurrence || 'once',
          type: t.type || 'solo',
          preferredTime: t.preferredTime || 'any',
          preferredDays: t.preferredDays || [],
        }))

      if (algoTasks.length === 0) {
        throw new Error('Au moins une tache est requise')
      }

      // Generer le planning
      const result = generatePlanning(algoConfig, algoUsers, algoTasks)

      setPlanning(result.planning)
      setStats(result.stats)
      setIsGenerating(false)

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue'
      setError(errorMessage)
      setIsGenerating(false)
      return null
    }
  }, [])

  /**
   * Reinitialise le planning
   */
  const reset = useCallback((): void => {
    setPlanning(null)
    setStats(null)
    setError(null)
  }, [])

  /**
   * Charge un planning existant (depuis la base de donnees)
   */
  const loadPlanning = useCallback((planningData: PlanningWeek[] | null): void => {
    if (planningData) {
      setPlanning(planningData)
      setStats(null) // Stats will be recalculated if needed
      setError(null)
    }
  }, [])

  /**
   * Exporte le planning en JSON
   */
  const exportAsJson = useCallback((): ExportedPlanning | null => {
    if (!planning) return null
    return exportPlanning(planning)
  }, [planning])

  return {
    planning,
    stats,
    isGenerating,
    error,
    generate,
    reset,
    loadPlanning,
    exportAsJson,
  }
}
