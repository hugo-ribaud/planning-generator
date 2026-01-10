/**
 * ManualWizard - Container for step-by-step manual planning creation
 */

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Stepper } from '../ui'
import { WizardStep } from './WizardStep'
import { WizardNavigation } from './WizardNavigation'
import { useWizard, PLANNING_WIZARD_STEPS } from '../../hooks/useWizard'
import type { WizardStep as WizardStepType } from '../../hooks/useWizard'
import type { UsePlanningConfigReturn } from '../../hooks'

// Form components
import { GeneralConfigForm } from '../forms/GeneralConfigForm'
import { UsersForm } from '../forms/UsersForm'
import { TasksForm } from '../forms/TasksForm'
import { MilestonesForm } from '../forms/MilestonesForm'
import { ShoppingListEditor } from '../forms/ShoppingListEditor'

export interface ManualWizardProps {
  planningConfig: UsePlanningConfigReturn
  onComplete: () => void
  onBack: () => void
}

export function ManualWizard({
  planningConfig,
  onComplete,
  onBack,
}: ManualWizardProps): JSX.Element {
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')

  // Create validation functions for each step
  const stepsWithValidation = useMemo((): WizardStepType[] => {
    return PLANNING_WIZARD_STEPS.map((step) => {
      switch (step.id) {
        case 'config':
          // Config is always valid
          return { ...step, validate: () => true }
        case 'users':
          // Need at least one user with a name
          return {
            ...step,
            validate: () => planningConfig.users.length > 0 &&
              planningConfig.users.some((u) => u.name.trim() !== ''),
          }
        case 'tasks':
        case 'milestones':
        case 'shopping':
          // Optional steps are always valid
          return { ...step, validate: () => true }
        default:
          return step
      }
    })
  }, [planningConfig.users])

  const wizard = useWizard({
    steps: stepsWithValidation,
    onComplete,
  })

  const handleNext = useCallback(() => {
    setDirection('forward')
    wizard.nextStep()
  }, [wizard])

  const handlePrev = useCallback(() => {
    setDirection('backward')
    wizard.prevStep()
  }, [wizard])

  const handleStepClick = useCallback((step: number) => {
    setDirection(step > wizard.currentStep ? 'forward' : 'backward')
    wizard.goToStep(step)
  }, [wizard])

  const handleSkip = useCallback(() => {
    setDirection('forward')
    wizard.skipOptionalSteps()
  }, [wizard])

  // Render the current step content
  const renderStepContent = (): JSX.Element => {
    const { currentStepData } = wizard

    switch (currentStepData.id) {
      case 'config':
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <GeneralConfigForm
              config={planningConfig.config}
              onConfigChange={planningConfig.updateConfig}
              errors={planningConfig.errors}
            />
          </div>
        )

      case 'users':
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <UsersForm
              users={planningConfig.users}
              onAddUser={planningConfig.addUser}
              onUpdateUser={planningConfig.updateUser}
              onDeleteUser={planningConfig.deleteUser}
              errors={planningConfig.errors}
            />
          </div>
        )

      case 'tasks':
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <TasksForm
              tasks={planningConfig.tasks}
              users={planningConfig.users}
              onAddTask={planningConfig.addTask}
              onUpdateTask={planningConfig.updateTask}
              onDeleteTask={planningConfig.deleteTask}
              errors={planningConfig.errors}
            />
          </div>
        )

      case 'milestones':
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <MilestonesForm
              milestones={planningConfig.milestones}
              users={planningConfig.users}
              onAdd={planningConfig.addMilestone}
              onUpdate={planningConfig.updateMilestone}
              onDelete={planningConfig.deleteMilestone}
            />
          </div>
        )

      case 'shopping':
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <ShoppingListEditor
              shoppingList={planningConfig.shoppingList}
              onUpdate={planningConfig.setShoppingList}
            />
          </div>
        )

      default:
        return <div>Etape inconnue</div>
    }
  }

  return (
    <div className="min-h-[60vh] flex flex-col">
      {/* Header with back button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-6"
      >
        <button
          type="button"
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Retour"
        >
          <ArrowLeftIcon />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Creation manuelle
          </h1>
          <p className="text-sm text-gray-600">
            Configurez votre planning etape par etape
          </p>
        </div>
      </motion.div>

      {/* Stepper */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Stepper
          steps={stepsWithValidation}
          currentStep={wizard.currentStep}
          completedSteps={wizard.completedSteps}
          onStepClick={handleStepClick}
        />
      </motion.div>

      {/* Step content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <WizardStep
            key={wizard.currentStepData.id}
            stepId={wizard.currentStepData.id}
            direction={direction}
          >
            {renderStepContent()}
          </WizardStep>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <WizardNavigation
        onPrev={handlePrev}
        onNext={handleNext}
        onSkip={handleSkip}
        isFirstStep={wizard.isFirstStep}
        isLastStep={wizard.isLastStep}
        isOptionalStep={wizard.isOptionalStep}
        canProceed={wizard.canProceed}
      />
    </div>
  )
}

function ArrowLeftIcon(): JSX.Element {
  return (
    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  )
}

export default ManualWizard
