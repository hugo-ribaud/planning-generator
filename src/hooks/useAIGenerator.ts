/**
 * useAIGenerator - Hook for AI-powered planning generation
 * Manages the state and lifecycle of AI generation requests
 */

import { useState, useCallback } from 'react'
import {
  generatePlanningFromPrompt,
  transformGeneratedData,
  type GeneratedPlanningData,
} from '../services/aiGenerator'
import type { User, Task, Milestone, ShoppingList } from '../types'
import type { PlanningConfigState } from './usePlanningConfig'

export interface TransformedPlanningData {
  config: Partial<PlanningConfigState>
  users: User[]
  tasks: Task[]
  milestones: Milestone[]
  shoppingList: ShoppingList | null
}

export interface UseAIGeneratorReturn {
  // State
  loading: boolean
  error: string | null
  rawResult: GeneratedPlanningData | null
  transformedResult: TransformedPlanningData | null

  // Actions
  generate: (prompt: string) => Promise<void>
  reset: () => void
}

export function useAIGenerator(): UseAIGeneratorReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rawResult, setRawResult] = useState<GeneratedPlanningData | null>(null)
  const [transformedResult, setTransformedResult] = useState<TransformedPlanningData | null>(null)

  const generate = useCallback(async (prompt: string): Promise<void> => {
    if (!prompt.trim()) {
      setError('Veuillez entrer une description de votre planning')
      return
    }

    setLoading(true)
    setError(null)
    setRawResult(null)
    setTransformedResult(null)

    try {
      // Call the Edge Function
      const result = await generatePlanningFromPrompt(prompt)

      // Store raw result
      setRawResult(result)

      // Transform to app-compatible format
      const transformed = transformGeneratedData(result)
      setTransformedResult(transformed)

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
      console.error('AI generation error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback((): void => {
    setLoading(false)
    setError(null)
    setRawResult(null)
    setTransformedResult(null)
  }, [])

  return {
    loading,
    error,
    rawResult,
    transformedResult,
    generate,
    reset,
  }
}
