import { motion, HTMLMotionProps } from 'motion/react'
import { ReactNode, HTMLAttributes } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  title?: string
  icon?: ReactNode
  className?: string
  animate?: boolean
}

export function Card({
  children,
  title,
  icon,
  className = '',
  animate = true,
  ...props
}: CardProps): JSX.Element {
  const animationProps: HTMLMotionProps<'div'> = animate ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  } : {}

  if (animate) {
    return (
      <motion.div
        className={`
          bg-white rounded-xl shadow-sm border border-gray-200 p-6
          ${className}
        `}
        {...animationProps}
        {...(props as HTMLMotionProps<'div'>)}
      >
        {title && (
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            {icon && <span>{icon}</span>}
            {title}
          </h2>
        )}
        {children}
      </motion.div>
    )
  }

  return (
    <div
      className={`
        bg-white rounded-xl shadow-sm border border-gray-200 p-6
        ${className}
      `}
      {...props}
    >
      {title && (
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </h2>
      )}
      {children}
    </div>
  )
}
