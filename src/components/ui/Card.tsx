import { motion, HTMLMotionProps } from 'motion/react'
import { ReactNode, HTMLAttributes } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  title?: string
  icon?: ReactNode
  className?: string
  animate?: boolean
  /** Compact padding on mobile */
  compact?: boolean
}

export function Card({
  children,
  title,
  icon,
  className = '',
  animate = true,
  compact = false,
  ...props
}: CardProps): JSX.Element {
  const animationProps: HTMLMotionProps<'div'> = animate ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  } : {}

  // Responsive padding: smaller on mobile, larger on desktop
  const paddingClass = compact
    ? 'p-3 sm:p-4'
    : 'p-4 sm:p-6'

  const cardClassName = `
    bg-white dark:bg-surface-dark rounded-xl shadow-sm
    border border-gray-200 dark:border-border-dark
    border-l-4 border-l-primary ${paddingClass}
    ${className}
  `

  const titleElement = title && (
    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-text-dark mb-3 sm:mb-4 flex items-center gap-2">
      {icon && <span className="text-base sm:text-lg">{icon}</span>}
      {title}
    </h2>
  )

  if (animate) {
    return (
      <motion.div
        className={cardClassName}
        {...animationProps}
        {...(props as HTMLMotionProps<'div'>)}
      >
        {titleElement}
        {children}
      </motion.div>
    )
  }

  return (
    <div
      className={cardClassName}
      {...props}
    >
      {titleElement}
      {children}
    </div>
  )
}
