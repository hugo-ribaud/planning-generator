/**
 * useWizard - Hook for managing multi-step wizard navigation
 * Handles step progression, validation, and optional step skipping
 */

import { useState, useCallback, useMemo } from 'react'

export interface WizardStep {
  id: string
  label: string
  icon: string
  isOptional: boolean
  validate?: () => boolean
}

export interface UseWizardOptions {
  steps: WizardStep[]
  initialStep?: number
  onComplete?: () => void
}

export interface UseWizardReturn {
  // Current state
  currentStep: number
  currentStepData: WizardStep
  totalSteps: number

  // Navigation
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void

  // Status helpers
  isFirstStep: boolean
  isLastStep: boolean
  isOptionalStep: boolean
  canProceed: boolean

  // Progress
  progress: number
  completedSteps: number[]

  // Actions
  skipOptionalSteps: () => void
  markStepComplete: (step: number) => void
  reset: () => void
}

export function useWizard({
  steps,
  initialStep = 0,
  onComplete,
}: UseWizardOptions): UseWizardReturn {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const totalSteps = steps.length
  const currentStepData = steps[currentStep]

  // Status helpers
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1
  const isOptionalStep = currentStepData?.isOptional ?? false

  // Check if current step can proceed (validation)
  const canProceed = useMemo(() => {
    if (!currentStepData?.validate) return true
    return currentStepData.validate()
  }, [currentStepData])

  // Progress percentage
  const progress = useMemo(() => {
    return Math.round(((currentStep + 1) / totalSteps) * 100)
  }, [currentStep, totalSteps])

  // Navigation functions
  const nextStep = useCallback(() => {
    if (!canProceed) return

    // Mark current step as completed
    setCompletedSteps((prev) =>
      prev.includes(currentStep) ? prev : [...prev, currentStep]
    )

    if (isLastStep) {
      onComplete?.()
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1))
    }
  }, [canProceed, currentStep, isLastStep, onComplete, totalSteps])

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }, [])

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step)
    }
  }, [totalSteps])

  // Skip all remaining optional steps
  const skipOptionalSteps = useCallback(() => {
    // Find the next non-optional step or go to end
    let nextRequired = currentStep + 1
    while (nextRequired < totalSteps && steps[nextRequired]?.isOptional) {
      nextRequired++
    }

    if (nextRequired >= totalSteps) {
      // All remaining steps are optional, complete the wizard
      onComplete?.()
    } else {
      setCurrentStep(nextRequired)
    }
  }, [currentStep, steps, totalSteps, onComplete])

  const markStepComplete = useCallback((step: number) => {
    setCompletedSteps((prev) =>
      prev.includes(step) ? prev : [...prev, step]
    )
  }, [])

  const reset = useCallback(() => {
    setCurrentStep(initialStep)
    setCompletedSteps([])
  }, [initialStep])

  return {
    currentStep,
    currentStepData,
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
    isFirstStep,
    isLastStep,
    isOptionalStep,
    canProceed,
    progress,
    completedSteps,
    skipOptionalSteps,
    markStepComplete,
    reset,
  }
}

// Default wizard steps for planning creation
export const PLANNING_WIZARD_STEPS: WizardStep[] = [
  {
    id: 'config',
    label: 'Configuration',
    icon: '⚙️',
    isOptional: false,
  },
  {
    id: 'users',
    label: 'Utilisateurs',
    icon: '👥',
    isOptional: false,
  },
  {
    id: 'tasks',
    label: 'Taches',
    icon: '✅',
    isOptional: true,
  },
  {
    id: 'milestones',
    label: 'Objectifs',
    icon: '🎯',
    isOptional: true,
  },
  {
    id: 'shopping',
    label: 'Courses',
    icon: '🛒',
    isOptional: true,
  },
]

export default useWizard
