/**
 * WizardStep - Wrapper component for wizard step content with animations
 */

import { motion } from 'motion/react'
import type { ReactNode } from 'react'

export interface WizardStepProps {
  children: ReactNode
  stepId: string
  direction?: 'forward' | 'backward'
}

export function WizardStep({
  children,
  stepId,
  direction = 'forward',
}: WizardStepProps): JSX.Element {
  const variants = {
    enter: (dir: string) => ({
      x: dir === 'forward' ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: string) => ({
      x: dir === 'forward' ? -50 : 50,
      opacity: 0,
    }),
  }

  return (
    <motion.div
      key={stepId}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  )
}

export default WizardStep
