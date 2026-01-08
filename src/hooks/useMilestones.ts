import { useState, useCallback } from 'react'
import type { Milestone, MilestoneStatus } from '../types'

export interface MilestoneStats {
  total: number
  todo: number
  inProgress: number
  done: number
  avgProgress: number
}

export interface UseMilestonesReturn {
  milestones: Milestone[]
  addMilestone: (milestone: Partial<Milestone>) => Milestone
  updateMilestone: (id: string, field: keyof Milestone, value: unknown) => void
  removeMilestone: (id: string) => void
  toggleFocus: (id: string) => void
  getFocusMilestone: () => Milestone | undefined
  getMilestonesByStatus: (status: MilestoneStatus) => Milestone[]
  getStats: () => MilestoneStats
  loadMilestones: (newMilestones: Milestone[]) => void
}

/**
 * Hook pour la gestion des milestones/objectifs
 * Version locale (sans Supabase pour l'instant)
 */
export function useMilestones(): UseMilestonesReturn {
  const [milestones, setMilestones] = useState<Milestone[]>([])

  /**
   * Ajoute un nouveau milestone
   */
  const addMilestone = useCallback((milestone: Partial<Milestone>): Milestone => {
    const newMilestone: Milestone = {
      id: milestone.id || crypto.randomUUID(),
      name: milestone.name || '',
      description: milestone.description,
      target_date: milestone.target_date,
      is_completed: milestone.is_completed ?? false,
      is_focused: milestone.is_focused ?? false,
      color: milestone.color || '#6B7280',
      status: milestone.status || 'todo',
      progress: milestone.progress || 0,
      assigned_to: milestone.assigned_to,
      is_focus: milestone.is_focus ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setMilestones(prev => [...prev, newMilestone])
    return newMilestone
  }, [])

  /**
   * Met a jour un champ d'un milestone
   */
  const updateMilestone = useCallback((id: string, field: keyof Milestone, value: unknown): void => {
    setMilestones(prev =>
      prev.map(m =>
        m.id === id
          ? { ...m, [field]: value, updated_at: new Date().toISOString() }
          : m
      )
    )
  }, [])

  /**
   * Supprime un milestone
   */
  const removeMilestone = useCallback((id: string): void => {
    setMilestones(prev => prev.filter(m => m.id !== id))
  }, [])

  /**
   * Toggle le focus d'un milestone
   * Si un autre milestone etait en focus, le retire
   */
  const toggleFocus = useCallback((id: string): void => {
    setMilestones(prev => {
      const milestone = prev.find(m => m.id === id)
      if (!milestone) return prev

      // If we're setting a new focus, remove focus from others
      if (!milestone.is_focus) {
        return prev.map(m => ({
          ...m,
          is_focus: m.id === id,
          updated_at: m.id === id ? new Date().toISOString() : m.updated_at,
        }))
      }

      // Just toggle off the current one
      return prev.map(m =>
        m.id === id
          ? { ...m, is_focus: false, updated_at: new Date().toISOString() }
          : m
      )
    })
  }, [])

  /**
   * Retourne le milestone en focus
   */
  const getFocusMilestone = useCallback((): Milestone | undefined => {
    return milestones.find(m => m.is_focus)
  }, [milestones])

  /**
   * Retourne les milestones par statut
   */
  const getMilestonesByStatus = useCallback((status: MilestoneStatus): Milestone[] => {
    return milestones.filter(m => m.status === status)
  }, [milestones])

  /**
   * Retourne les statistiques
   */
  const getStats = useCallback((): MilestoneStats => {
    const total = milestones.length
    if (total === 0) {
      return {
        total: 0,
        todo: 0,
        inProgress: 0,
        done: 0,
        avgProgress: 0,
      }
    }

    return {
      total,
      todo: milestones.filter(m => m.status === 'todo').length,
      inProgress: milestones.filter(m => m.status === 'in_progress').length,
      done: milestones.filter(m => m.status === 'done').length,
      avgProgress: Math.round(
        milestones.reduce((acc, m) => acc + (m.progress || 0), 0) / total
      ),
    }
  }, [milestones])

  /**
   * Charge une liste de milestones (pour donnees de test)
   */
  const loadMilestones = useCallback((newMilestones: Milestone[]): void => {
    setMilestones(newMilestones)
  }, [])

  return {
    milestones,
    addMilestone,
    updateMilestone,
    removeMilestone,
    toggleFocus,
    getFocusMilestone,
    getMilestonesByStatus,
    getStats,
    loadMilestones,
  }
}
