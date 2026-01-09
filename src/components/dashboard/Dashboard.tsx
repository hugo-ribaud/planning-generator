import { motion } from 'motion/react'
import { Card } from '../ui/Card'
import { FocusBanner } from './FocusBanner'
import { StatsOverview } from './StatsOverview'
import { UserProgress } from './UserProgress'
import { MilestoneTimeline } from './MilestoneTimeline'
import { useDashboardStats } from '../../hooks/useDashboardStats'
import type { Milestone, Task, User, PlanningWeek } from '../../types'

export interface DashboardProps {
  milestones: Milestone[]
  tasks: Task[]
  users: User[]
  planning: PlanningWeek[] | null
}

/**
 * Dashboard principal avec vue d'ensemble de l'avancement
 * Responsive: single column mobile, 2 columns tablet/desktop
 */
export function Dashboard({ milestones, tasks, users, planning }: DashboardProps): JSX.Element {
  const stats = useDashboardStats(milestones, tasks, users, planning)

  return (
    <Card title="Tableau de bord" icon="📊">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4 sm:space-y-6"
      >
        {/* Focus Banner */}
        <FocusBanner
          milestone={stats.focusMilestone}
          users={users}
        />

        {/* Stats Overview */}
        <StatsOverview stats={stats} />

        {/* Two columns on tablet/desktop, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* User Progress */}
          <UserProgress userStats={stats.users} />

          {/* Timeline */}
          <MilestoneTimeline
            upcomingMilestones={stats.upcomingMilestones}
            overdueMilestones={stats.overdueMilestones}
            users={users}
          />
        </div>

        {/* Alerts section */}
        {(stats.overdueMilestones.length > 0 || stats.milestones.avgProgress < 25) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg"
          >
            <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2 text-sm sm:text-base">
              <span>💡</span>
              Suggestions
            </h4>
            <ul className="space-y-1 text-xs sm:text-sm text-amber-700">
              {stats.overdueMilestones.length > 0 && (
                <li>
                  {stats.overdueMilestones.length} objectif{stats.overdueMilestones.length > 1 ? 's' : ''} en retard - pensez a les mettre a jour ou ajuster les dates
                </li>
              )}
              {stats.milestones.avgProgress < 25 && stats.milestones.total > 0 && (
                <li>
                  Progression moyenne faible ({stats.milestones.avgProgress}%) - concentrez-vous sur un objectif a la fois
                </li>
              )}
              {stats.milestones.todo > stats.milestones.inProgress * 2 && stats.milestones.total > 3 && (
                <li>
                  Beaucoup d'objectifs en attente - commencez par les plus importants
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </motion.div>
    </Card>
  )
}
