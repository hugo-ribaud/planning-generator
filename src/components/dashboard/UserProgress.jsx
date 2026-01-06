import { motion } from 'motion/react'

/**
 * Affichage de la progression par utilisateur
 */
export function UserProgress({ userStats }) {
  if (userStats.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progression par membre</h3>
        <p className="text-gray-500 text-center py-4">Aucun membre configure</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Progression par membre</h3>

      <div className="space-y-4">
        {userStats.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4"
          >
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: user.color }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900 truncate">{user.name}</span>
                <span className="text-sm font-semibold text-primary">{user.avgProgress}%</span>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: user.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${user.avgProgress}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span>{user.taskCount} tache{user.taskCount > 1 ? 's' : ''}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span>{user.milestoneCount} objectif{user.milestoneCount > 1 ? 's' : ''}</span>
                {user.milestonesCompleted > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="text-green-600">{user.milestonesCompleted} termine{user.milestonesCompleted > 1 ? 's' : ''}</span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
