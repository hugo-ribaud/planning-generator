import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Planning } from '../types'

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface RealtimeHandlers {
  onUpdate?: (payload: RealtimePostgresChangesPayload<Planning>) => void
}

export interface UseRealtimeSyncReturn {
  connectionStatus: ConnectionStatus
  lastSync: Date | null
  reconnect: () => void
  isConnected: boolean
  isConnecting: boolean
  hasError: boolean
}

/**
 * Hook pour la synchronisation temps reel via Supabase Realtime
 * Ecoute les changements sur la table plannings (structure JSONB)
 */
export function useRealtimeSync(
  planningId: string | null | undefined,
  handlers: RealtimeHandlers = {}
): UseRealtimeSyncReturn {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const handlersRef = useRef(handlers)

  // Keep handlers ref updated to avoid stale closures
  useEffect(() => {
    handlersRef.current = handlers
  }, [handlers])

  // Handle realtime updates from plannings table
  const handlePayload = useCallback((payload: RealtimePostgresChangesPayload<Planning>) => {
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
        (payload) => handlePayload(payload as RealtimePostgresChangesPayload<Planning>)
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
 * Detecte les champs modifies entre l'ancien et le nouveau payload
 */
export function detectChangedFields(
  oldData: Partial<Planning> | null | undefined,
  newData: Partial<Planning> | null | undefined
): string[] {
  const changedFields: string[] = []
  const fieldsToCheck: (keyof Planning)[] = ['config', 'users_data', 'tasks_data', 'milestones_data', 'planning_result', 'name']

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
 */
export function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    config: 'configuration',
    users_data: 'utilisateurs',
    tasks_data: 'taches',
    milestones_data: 'objectifs',
    planning_result: 'planning genere',
    name: 'nom',
  }
  return labels[field] || field
}
