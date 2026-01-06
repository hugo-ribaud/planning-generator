import { useState, useCallback } from 'react'
import { generatePlanning, exportPlanning } from '../utils/planningAlgorithm'

/**
 * Hook pour la génération de planning
 */
export function usePlanningGenerator() {
  const [planning, setPlanning] = useState(null)
  const [stats, setStats] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Génère un planning à partir de la configuration
   */
  const generate = useCallback((config, users, tasks) => {
    setIsGenerating(true)
    setError(null)

    try {
      // Préparer la configuration pour l'algorithme
      const algoConfig = {
        period: config.period || 'week',
        startDate: config.startDate || new Date().toISOString().split('T')[0],
        workStart: config.workStart || '09:00',
        workEnd: config.workEnd || '17:00',
        lunchStart: config.lunchStart || '12:30',
        lunchEnd: config.lunchEnd || '14:00',
        slotDuration: config.slotDuration || 30,
      }

      // Préparer les utilisateurs
      const algoUsers = users
        .filter(u => u.name && u.name.trim())
        .map(u => ({
          ...u,
          days_off: u.days_off || [],
        }))

      if (algoUsers.length === 0) {
        throw new Error('Au moins un utilisateur est requis')
      }

      // Préparer les tâches
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
        throw new Error('Au moins une tâche est requise')
      }

      // Générer le planning
      const result = generatePlanning(algoConfig, algoUsers, algoTasks)

      setPlanning(result.planning)
      setStats(result.stats)
      setIsGenerating(false)

      return result
    } catch (err) {
      setError(err.message)
      setIsGenerating(false)
      return null
    }
  }, [])

  /**
   * Réinitialise le planning
   */
  const reset = useCallback(() => {
    setPlanning(null)
    setStats(null)
    setError(null)
  }, [])

  /**
   * Charge un planning existant (depuis la base de données)
   */
  const loadPlanning = useCallback((planningData) => {
    if (planningData) {
      setPlanning(planningData)
      setStats(null) // Stats will be recalculated if needed
      setError(null)
    }
  }, [])

  /**
   * Exporte le planning en JSON
   */
  const exportAsJson = useCallback(() => {
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
