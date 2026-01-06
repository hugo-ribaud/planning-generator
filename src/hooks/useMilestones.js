import { useState, useCallback } from 'react'

/**
 * Hook pour la gestion des milestones/objectifs
 * Version locale (sans Supabase pour l'instant)
 */
export function useMilestones() {
  const [milestones, setMilestones] = useState([])

  /**
   * Ajoute un nouveau milestone
   */
  const addMilestone = useCallback((milestone) => {
    const newMilestone = {
      ...milestone,
      id: milestone.id || crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setMilestones(prev => [...prev, newMilestone])
    return newMilestone
  }, [])

  /**
   * Met à jour un champ d'un milestone
   */
  const updateMilestone = useCallback((id, field, value) => {
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
  const removeMilestone = useCallback((id) => {
    setMilestones(prev => prev.filter(m => m.id !== id))
  }, [])

  /**
   * Toggle le focus d'un milestone
   * Si un autre milestone était en focus, le retire
   */
  const toggleFocus = useCallback((id) => {
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
  const getFocusMilestone = useCallback(() => {
    return milestones.find(m => m.is_focus)
  }, [milestones])

  /**
   * Retourne les milestones par statut
   */
  const getMilestonesByStatus = useCallback((status) => {
    return milestones.filter(m => m.status === status)
  }, [milestones])

  /**
   * Retourne les statistiques
   */
  const getStats = useCallback(() => {
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
   * Charge une liste de milestones (pour données de test)
   */
  const loadMilestones = useCallback((newMilestones) => {
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
