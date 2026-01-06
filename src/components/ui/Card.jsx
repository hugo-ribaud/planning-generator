import { motion } from 'motion/react'

export function Card({
  children,
  title,
  icon,
  className = '',
  animate = true,
  ...props
}) {
  const Wrapper = animate ? motion.div : 'div'
  const animationProps = animate ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  } : {}

  return (
    <Wrapper
      className={`
        bg-white rounded-xl shadow-sm border border-gray-200 p-6
        ${className}
      `}
      {...animationProps}
      {...props}
    >
      {title && (
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </h2>
      )}
      {children}
    </Wrapper>
  )
}
