/**
 * usePlannings - Hook for managing plannings CRUD operations with Supabase
 * Provides fetch, create, update, delete, archive, and share functionality
 */

import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function usePlannings() {
  const { user } = useAuth()
  const [plannings, setPlannings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch all plannings for current user
  const fetchPlannings = useCallback(async (options = {}) => {
    if (!user) return { data: null, error: new Error('Not authenticated') }

    const { includeArchived = false, orderBy = 'updated_at', ascending = false } = options

    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('plannings')
        .select('*')
        .eq('user_id', user.id)
        .order(orderBy, { ascending })

      if (!includeArchived) {
        query = query.eq('is_archived', false)
      }

      const { data, error } = await query

      if (error) throw error

      setPlannings(data || [])
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }, [user])

  // Fetch a single planning by ID
  const fetchPlanning = useCallback(async (id) => {
    if (!user) return { data: null, error: new Error('Not authenticated') }

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('plannings')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }, [user])

  // Create a new planning
  const createPlanning = useCallback(async (planningData) => {
    if (!user) return { data: null, error: new Error('Not authenticated') }

    setLoading(true)
    setError(null)

    try {
      const newPlanning = {
        user_id: user.id,
        name: planningData.name || 'Planning sans titre',
        config: planningData.config || {},
        users_data: planningData.users || [],
        tasks_data: planningData.tasks || [],
        milestones_data: planningData.milestones || [],
        planning_result: planningData.planningResult || null,
        shopping_list: planningData.shoppingList || null,
      }

      const { data, error } = await supabase
        .from('plannings')
        .insert([newPlanning])
        .select()
        .single()

      if (error) throw error

      setPlannings(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }, [user])

  // Update an existing planning
  const updatePlanning = useCallback(async (id, updates) => {
    if (!user) return { data: null, error: new Error('Not authenticated') }

    setLoading(true)
    setError(null)

    try {
      // Map frontend fields to database fields
      const dbUpdates = {}
      if (updates.name !== undefined) dbUpdates.name = updates.name
      if (updates.config !== undefined) dbUpdates.config = updates.config
      if (updates.users !== undefined) dbUpdates.users_data = updates.users
      if (updates.tasks !== undefined) dbUpdates.tasks_data = updates.tasks
      if (updates.milestones !== undefined) dbUpdates.milestones_data = updates.milestones
      if (updates.planningResult !== undefined) dbUpdates.planning_result = updates.planningResult
      if (updates.shoppingList !== undefined) dbUpdates.shopping_list = updates.shoppingList
      if (updates.isArchived !== undefined) dbUpdates.is_archived = updates.isArchived

      const { data, error } = await supabase
        .from('plannings')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      // Update local state
      setPlannings(prev => prev.map(p => p.id === id ? data : p))

      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }, [user])

  // Delete a planning
  const deletePlanning = useCallback(async (id) => {
    if (!user) return { error: new Error('Not authenticated') }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('plannings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      // Update local state
      setPlannings(prev => prev.filter(p => p.id !== id))

      return { error: null }
    } catch (err) {
      setError(err.message)
      return { error: err }
    } finally {
      setLoading(false)
    }
  }, [user])

  // Archive a planning
  const archivePlanning = useCallback(async (id) => {
    return updatePlanning(id, { isArchived: true })
  }, [updatePlanning])

  // Restore a planning from archive
  const restorePlanning = useCallback(async (id) => {
    return updatePlanning(id, { isArchived: false })
  }, [updatePlanning])

  // Duplicate a planning
  const duplicatePlanning = useCallback(async (id) => {
    if (!user) return { data: null, error: new Error('Not authenticated') }

    setLoading(true)
    setError(null)

    try {
      // Fetch the original planning
      const { data: original, error: fetchError } = await supabase
        .from('plannings')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (fetchError) throw fetchError

      // Create a copy
      const duplicate = {
        user_id: user.id,
        name: `${original.name} (copie)`,
        config: original.config,
        users_data: original.users_data,
        tasks_data: original.tasks_data,
        milestones_data: original.milestones_data,
        planning_result: null, // Don't copy the generated result
        shopping_list: original.shopping_list,
      }

      const { data, error } = await supabase
        .from('plannings')
        .insert([duplicate])
        .select()
        .single()

      if (error) throw error

      setPlannings(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }, [user])

  // Generate share token for a planning
  const sharePlanning = useCallback(async (id) => {
    if (!user) return { data: null, error: new Error('Not authenticated') }

    setLoading(true)
    setError(null)

    try {
      // Generate a unique share token
      const shareToken = crypto.randomUUID().replace(/-/g, '').slice(0, 16)

      const { data, error } = await supabase
        .from('plannings')
        .update({
          share_token: shareToken,
          is_public: true,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      // Update local state
      setPlannings(prev => prev.map(p => p.id === id ? data : p))

      return { data, shareUrl: `${window.location.origin}/shared/${shareToken}`, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }, [user])

  // Remove share from a planning
  const unsharePlanning = useCallback(async (id) => {
    if (!user) return { data: null, error: new Error('Not authenticated') }

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('plannings')
        .update({
          share_token: null,
          is_public: false,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      // Update local state
      setPlannings(prev => prev.map(p => p.id === id ? data : p))

      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }, [user])

  // Fetch a shared planning by token (public access)
  const fetchSharedPlanning = useCallback(async (shareToken) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('plannings')
        .select('*')
        .eq('share_token', shareToken)
        .eq('is_public', true)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    plannings,
    loading,
    error,

    // Fetch operations
    fetchPlannings,
    fetchPlanning,
    fetchSharedPlanning,

    // CRUD operations
    createPlanning,
    updatePlanning,
    deletePlanning,

    // Archive operations
    archivePlanning,
    restorePlanning,

    // Duplicate
    duplicatePlanning,

    // Share operations
    sharePlanning,
    unsharePlanning,

    // Utils
    clearError,
  }
}

export default usePlannings
