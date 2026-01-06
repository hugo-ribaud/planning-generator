import { motion } from 'motion/react'

export function MilestoneProgress({ progress = 0, size = 'md', showLabel = true }) {
  const sizes = {
    sm: { height: 'h-1.5', text: 'text-xs' },
    md: { height: 'h-2', text: 'text-sm' },
    lg: { height: 'h-3', text: 'text-base' },
  }

  const { height, text } = sizes[size] || sizes.md

  const getProgressColor = (value) => {
    if (value >= 100) return 'bg-green-500'
    if (value >= 75) return 'bg-green-400'
    if (value >= 50) return 'bg-yellow-400'
    if (value >= 25) return 'bg-orange-400'
    return 'bg-gray-300'
  }

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${height}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${getProgressColor(progress)}`}
        />
      </div>
      {showLabel && (
        <div className={`mt-1 ${text} text-gray-500 text-right`}>
          {progress}%
        </div>
      )}
    </div>
  )
}
