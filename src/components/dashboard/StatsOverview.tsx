import { motion } from 'motion/react'
import type { DashboardStats } from '../../hooks/useDashboardStats'

interface SubStat {
  label: string
  value: number
  color?: string
}

interface StatCard {
  label: string
  value: number | string
  subStats?: SubStat[]
  icon: string
  isPercentage?: boolean
  progress?: number
  progressColor?: string
}

export interface StatsOverviewProps {
  stats: DashboardStats
}

/**
 * Vue d'ensemble des statistiques globales
 */
export function StatsOverview({ stats }: StatsOverviewProps): JSX.Element {
  const cards: StatCard[] = [
    {
      label: 'Objectifs',
      value: stats.milestones.total,
      subStats: [
        { label: 'Terminés', value: stats.milestones.done, color: 'text-green-600' },
        { label: 'En cours', value: stats.milestones.inProgress, color: 'text-yellow-600' },
        { label: 'À faire', value: stats.milestones.todo, color: 'text-gray-500' },
      ],
      icon: '🎯',
      progress: stats.milestones.total > 0
        ? Math.round((stats.milestones.done / stats.milestones.total) * 100)
        : 0,
      progressColor: 'bg-green-500',
    },
    {
      label: 'Progression moyenne',
      value: `${stats.milestones.avgProgress}%`,
      icon: '📈',
      isPercentage: true,
      progress: stats.milestones.avgProgress,
      progressColor: 'bg-primary',
    },
    {
      label: 'Tâches planifiées',
      value: stats.tasks.total,
      subStats: [
        { label: 'Quotidiennes', value: stats.tasks.byFrequency.daily, color: 'text-blue-600' },
        { label: 'Hebdo', value: stats.tasks.byFrequency.weekly, color: 'text-purple-600' },
        { label: 'Flexibles', value: stats.tasks.byFrequency.flexible, color: 'text-gray-500' },
      ],
      icon: '📋',
    },
    {
      label: 'Tâches communes',
      value: stats.common.taskCount,
      subStats: [
        { label: 'Quotidiennes', value: stats.common.byFrequency.daily },
        { label: 'Hebdo', value: stats.common.byFrequency.weekly },
      ],
      icon: '👥',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm"
        >
          <div className="flex items-start justify-between mb-1 sm:mb-2">
            <span className="text-xl sm:text-2xl">{card.icon}</span>
            <span className={`text-xl sm:text-2xl font-bold ${card.isPercentage ? 'text-primary' : 'text-gray-900'}`}>
              {card.value}
            </span>
          </div>

          <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 truncate">{card.label}</h4>

          {card.progress !== undefined && (
            <div className="h-1 sm:h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1 sm:mb-2">
              <motion.div
                className={`h-full ${card.progressColor} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${card.progress}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              />
            </div>
          )}

          {card.subStats && (
            <div className="space-y-0.5 sm:space-y-1">
              {card.subStats.map((sub) => (
                <div key={sub.label} className="flex items-center justify-between text-[10px] sm:text-xs">
                  <span className="text-gray-500 truncate">{sub.label}</span>
                  <span className={`font-medium ${sub.color || 'text-gray-700'}`}>{sub.value}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
