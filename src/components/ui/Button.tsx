import { motion, HTMLMotionProps } from 'motion/react'
import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary/90 active:bg-primary/80',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200',
}

// Touch-friendly sizes with minimum 44px touch target on mobile
const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm min-h-[36px] sm:min-h-[32px] sm:py-1.5',
  md: 'px-4 py-2.5 text-base min-h-[44px] sm:min-h-[40px] sm:py-2',
  lg: 'px-6 py-3 text-lg min-h-[48px] sm:min-h-[44px]',
}

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type']
  className?: string
  /** Full width on mobile, auto on larger screens */
  fullWidthMobile?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    type = 'button',
    onClick,
    className = '',
    fullWidthMobile = false,
    ...props
  },
  ref
) {
  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-lg font-medium transition-colors
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        select-none touch-manipulation
        ${fullWidthMobile ? 'w-full sm:w-auto' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  )
})
