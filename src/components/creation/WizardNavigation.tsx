/**
 * WizardNavigation - Bottom navigation bar for wizard
 * Fixed on mobile, inline on desktop
 */

import { motion } from 'motion/react'
import { Button } from '../ui'

export interface WizardNavigationProps {
  onPrev: () => void
  onNext: () => void
  onSkip?: () => void
  isFirstStep: boolean
  isLastStep: boolean
  isOptionalStep: boolean
  canProceed: boolean
  loading?: boolean
}

export function WizardNavigation({
  onPrev,
  onNext,
  onSkip,
  isFirstStep,
  isLastStep,
  isOptionalStep,
  canProceed,
  loading = false,
}: WizardNavigationProps): JSX.Element {
  return (
    <>
      {/* Desktop navigation */}
      <div className="hidden sm:flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
        <div>
          {!isFirstStep && (
            <Button variant="ghost" onClick={onPrev} disabled={loading}>
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Precedent
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          {isOptionalStep && onSkip && (
            <Button variant="secondary" onClick={onSkip} disabled={loading}>
              Passer les optionnels
            </Button>
          )}
          <Button
            variant="primary"
            onClick={onNext}
            disabled={!canProceed || loading}
          >
            {loading ? (
              <LoadingSpinner />
            ) : isLastStep ? (
              <>
                Terminer
                <CheckIcon className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Suivant
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile navigation - Fixed bottom */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40"
      >
        <div className="flex gap-3">
          {!isFirstStep && (
            <Button
              variant="secondary"
              onClick={onPrev}
              disabled={loading}
              className="flex-shrink-0"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </Button>
          )}

          {isOptionalStep && onSkip && (
            <Button
              variant="ghost"
              onClick={onSkip}
              disabled={loading}
              className="flex-1 text-sm"
            >
              Passer
            </Button>
          )}

          <Button
            variant="primary"
            onClick={onNext}
            disabled={!canProceed || loading}
            className={`${isFirstStep || !isOptionalStep ? 'flex-1' : 'flex-shrink-0'}`}
          >
            {loading ? (
              <LoadingSpinner />
            ) : isLastStep ? (
              <>
                <CheckIcon className="w-4 h-4 mr-2" />
                Terminer
              </>
            ) : (
              <>
                Suivant
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Spacer for mobile fixed navigation */}
      <div className="h-20 sm:hidden" />
    </>
  )
}

// Icons
function ArrowLeftIcon({ className = 'w-5 h-5' }: { className?: string }): JSX.Element {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  )
}

function ArrowRightIcon({ className = 'w-5 h-5' }: { className?: string }): JSX.Element {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

function CheckIcon({ className = 'w-5 h-5' }: { className?: string }): JSX.Element {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function LoadingSpinner(): JSX.Element {
  return (
    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

export default WizardNavigation
