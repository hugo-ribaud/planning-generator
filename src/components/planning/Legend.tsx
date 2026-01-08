import { motion } from 'motion/react'
import type { User } from '../../types'

export interface LegendProps {
  users: User[]
}

/**
 * Légende affichant les couleurs des utilisateurs
 */
export function Legend({ users }: LegendProps): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white rounded-lg border border-gray-200"
    >
      <span className="text-sm font-medium text-gray-500">Legende :</span>

      {users.map((user) => (
        <div key={user.id} className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full shadow-sm"
            style={{ backgroundColor: user.color }}
          />
          <span className="text-sm font-medium text-gray-700">{user.name}</span>
        </div>
      ))}

      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-common shadow-sm" />
        <span className="text-sm font-medium text-gray-700">Commun</span>
      </div>

      <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
        <span className="px-2 py-1 bg-gray-100 rounded">OFF</span>
        <span>= Jour de repos</span>
      </div>
    </motion.div>
  )
}
