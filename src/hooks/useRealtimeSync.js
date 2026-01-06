import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook pour la synchronisation temps réel via Supabase Realtime
 * @param {string} configId - ID de la configuration planning
 * @param {Object} handlers - Callbacks pour chaque type de table
 * @returns {Object} État de connexion et fonctions utilitaires
 */
export function useRealtimeSync(configId, handlers = {}) {
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [lastSync, setLastSync] = useState(null)
  const channelRef = useRef(null)

  // Handle realtime updates
  const handlePayload = useCallback((table, payload) => {
    setLastSync(new Date())

    const handler = handlers[table]
    if (handler) {
      handler(payload)
    }
  }, [handlers])

  useEffect(() => {
    if (!configId) {
      setConnectionStatus('disconnected')
      return
    }

    setConnectionStatus('connecting')

    // Create channel for this config
    const channel = supabase
      .channel(`planning:${configId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'milestones',
          filter: `config_id=eq.${configId}`
        },
        (payload) => handlePayload('milestones', payload)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `config_id=eq.${configId}`
        },
        (payload) => handlePayload('tasks', payload)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'planning_slots',
          filter: `config_id=eq.${configId}`
        },
        (payload) => handlePayload('slots', payload)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'planning_config',
          filter: `id=eq.${configId}`
        },
        (payload) => handlePayload('config', payload)
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
  }, [configId, handlePayload])

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
 * Helper pour traiter les payloads realtime
 * @param {Function} setState - React setState function
 * @param {Object} payload - Supabase realtime payload
 */
export function handleRealtimeUpdate(setState, payload) {
  switch (payload.eventType) {
    case 'INSERT':
      setState(prev => [...prev, payload.new])
      break
    case 'UPDATE':
      setState(prev =>
        prev.map(item => item.id === payload.new.id ? payload.new : item)
      )
      break
    case 'DELETE':
      setState(prev =>
        prev.filter(item => item.id !== payload.old.id)
      )
      break
    default:
      break
  }
}
