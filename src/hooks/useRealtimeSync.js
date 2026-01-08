import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook pour la synchronisation temps réel via Supabase Realtime
 * Écoute les changements sur la table plannings (structure JSONB)
 *
 * @param {string} planningId - ID du planning à synchroniser
 * @param {Object} handlers - Callbacks pour les mises à jour
 * @param {Function} handlers.onUpdate - Callback appelé lors d'une mise à jour
 * @returns {Object} État de connexion et fonctions utilitaires
 */
export function useRealtimeSync(planningId, handlers = {}) {
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [lastSync, setLastSync] = useState(null)
  const channelRef = useRef(null)
  const handlersRef = useRef(handlers)

  // Keep handlers ref updated to avoid stale closures
  useEffect(() => {
    handlersRef.current = handlers
  }, [handlers])

  // Handle realtime updates from plannings table
  const handlePayload = useCallback((payload) => {
    setLastSync(new Date())

    // Only process UPDATE events (INSERT/DELETE are handled by navigation)
    if (payload.eventType === 'UPDATE' && payload.new) {
      const handler = handlersRef.current.onUpdate
      if (handler) {
        handler(payload)
      }
    }
  }, [])

  useEffect(() => {
    if (!planningId) {
      setConnectionStatus('disconnected')
      return
    }

    setConnectionStatus('connecting')

    // Create channel for this planning - subscribe to plannings table
    const channel = supabase
      .channel(`planning:${planningId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'plannings',
          filter: `id=eq.${planningId}`
        },
        (payload) => handlePayload(payload)
      )
      .subscribe((status) => {
        switch (status) {
          case 'SUBSCRIBED':
            setConnectionStatus('connected')
            setLastSync(new Date())
            break
          case 'CLOSED':
            setConnectionStatus('disconnected')
            break
          case 'CHANNEL_ERROR':
            setConnectionStatus('error')
            break
          default:
            setConnectionStatus('connecting')
        }
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [planningId, handlePayload])

  // Force reconnect
  const reconnect = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }
    setConnectionStatus('connecting')
    // The useEffect will re-run and create a new channel
  }, [])

  return {
    connectionStatus,
    lastSync,
    reconnect,
    isConnected: connectionStatus === 'connected',
    isConnecting: connectionStatus === 'connecting',
    hasError: connectionStatus === 'error',
  }
}

/**
 * Détecte les champs modifiés entre l'ancien et le nouveau payload
 * @param {Object} oldData - Anciennes données
 * @param {Object} newData - Nouvelles données
 * @returns {Array<string>} Liste des champs modifiés
 */
export function detectChangedFields(oldData, newData) {
  const changedFields = []
  const fieldsToCheck = ['config', 'users_data', 'tasks_data', 'milestones_data', 'planning_result', 'name']

  for (const field of fieldsToCheck) {
    const oldValue = JSON.stringify(oldData?.[field])
    const newValue = JSON.stringify(newData?.[field])
    if (oldValue !== newValue) {
      changedFields.push(field)
    }
  }

  return changedFields
}

/**
 * Mappe les noms de champs DB vers des labels lisibles
 * @param {string} field - Nom du champ DB
 * @returns {string} Label en français
 */
export function getFieldLabel(field) {
  const labels = {
    config: 'configuration',
    users_data: 'utilisateurs',
    tasks_data: 'tâches',
    milestones_data: 'objectifs',
    planning_result: 'planning généré',
    name: 'nom',
  }
  return labels[field] || field
}
