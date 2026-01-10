/**
 * Stepper - Visual step indicator for wizard navigation
 * Responsive: compact on mobile, full labels on desktop
 */

import { motion } from 'motion/react'
import type { WizardStep } from '../../hooks/useWizard'

export interface StepperProps {
  steps: WizardStep[]
  currentStep: number
  completedSteps: number[]
  onStepClick?: (step: number) => void
  className?: string
}

export function Stepper({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  className = '',
}: StepperProps): JSX.Element {
  const getStepStatus = (index: number): 'completed' | 'active' | 'pending' => {
    if (completedSteps.includes(index)) return 'completed'
    if (index === currentStep) return 'active'
    return 'pending'
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Mobile: Icons only */}
      <div className="flex items-center justify-between md:hidden">
        {steps.map((step, index) => {
          const status = getStepStatus(index)
          const isClickable = onStepClick && (completedSteps.includes(index) || index <= currentStep)

          return (
            <div key={step.id} className="flex items-center">
              <motion.button
                type="button"
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable}
                className={`
                  relative flex items-center justify-center w-10 h-10 rounded-full
                  transition-all duration-200
                  ${status === 'completed'
                    ? 'bg-primary text-white'
                    : status === 'active'
                      ? 'bg-primary text-white ring-4 ring-primary/20'
                      : 'bg-gray-100 text-gray-400'
                  }
                  ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                  ${step.isOptional ? 'border-2 border-dashed border-current' : ''}
                `}
                whileTap={isClickable ? { scale: 0.95 } : undefined}
              >
                {status === 'completed' ? (
                  <CheckIcon />
                ) : (
                  <span className="text-lg">{step.icon}</span>
                )}
              </motion.button>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    w-full h-0.5 mx-1 flex-1 min-w-4
                    ${completedSteps.includes(index) ? 'bg-primary' : 'bg-gray-200'}
                  `}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Desktop: Full labels */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(index)
          const isClickable = onStepClick && (completedSteps.includes(index) || index <= currentStep)

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <motion.button
                  type="button"
                  onClick={() => isClickable && onStepClick?.(index)}
                  disabled={!isClickable}
                  className={`
                    relative flex items-center justify-center w-12 h-12 rounded-full
                    transition-all duration-200
                    ${status === 'completed'
                      ? 'bg-primary text-white'
                      : status === 'active'
                        ? 'bg-primary text-white ring-4 ring-primary/20 scale-110'
                        : 'bg-gray-100 text-gray-400'
                    }
                    ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                    ${step.isOptional ? 'border-2 border-dashed border-current' : ''}
                  `}
                  whileTap={isClickable ? { scale: 0.95 } : undefined}
                  animate={status === 'active' ? { scale: 1.1 } : { scale: 1 }}
                >
                  {status === 'completed' ? (
                    <CheckIcon />
                  ) : (
                    <span className="text-xl">{step.icon}</span>
                  )}
                </motion.button>

                <div className="mt-2 text-center">
                  <p
                    className={`
                      text-sm font-medium
                      ${status === 'active' ? 'text-primary' : status === 'completed' ? 'text-gray-700' : 'text-gray-400'}
                    `}
                  >
                    {step.label}
                  </p>
                  {step.isOptional && (
                    <p className="text-xs text-gray-400">Optionnel</p>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-4
                    ${completedSteps.includes(index) ? 'bg-primary' : 'bg-gray-200'}
                  `}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Progress bar (mobile only) */}
      <div className="mt-3 md:hidden">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Etape {currentStep + 1} sur {steps.length}</span>
          <span>{steps[currentStep]?.label}</span>
        </div>
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  )
}

function CheckIcon(): JSX.Element {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <motion.path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3 }}
      />
    </svg>
  )
}

export default Stepper
