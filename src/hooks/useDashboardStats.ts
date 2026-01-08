import { useMemo } from 'react'
import type { Milestone, Task, User, PlanningWeek } from '../types'

export interface MilestoneStats {
  total: number
  todo: number
  inProgress: number
  done: number
  avgProgress: number
}

export interface TaskStatsByFrequency {
  daily: number
  weekly: number
  once: number
  flexible: number
  custom: number
}

export interface TaskStatsByPriority {
  high: number
  medium: number
  low: number
}

export interface TaskStats {
  total: number
  byFrequency: TaskStatsByFrequency
  byPriority: TaskStatsByPriority
}

export interface UserStats {
  id: string
  name: string
  color: string
  taskCount: number
  milestoneCount: number
  milestonesCompleted: number
  avgProgress: number
}

export interface CommonStats {
  taskCount: number
  byFrequency: {
    daily: number
    weekly: number
  }
}

export interface PlanningStats {
  totalSlots: number
  weeksCount: number
}

export interface DashboardStats {
  milestones: MilestoneStats
  tasks: TaskStats
  users: UserStats[]
  common: CommonStats
  planning: PlanningStats | null
  focusMilestone: Milestone | undefined
  upcomingMilestones: Milestone[]
  overdueMilestones: Milestone[]
}

/**
 * Hook pour calculer les statistiques du dashboard
 */
export function useDashboardStats(
  milestones: Milestone[],
  tasks: Task[],
  users: User[],
  planning: PlanningWeek[] | null
): DashboardStats {
  const stats = useMemo<DashboardStats>(() => {
    // Milestone stats
    const milestoneStats: MilestoneStats = {
      total: milestones.length,
      todo: milestones.filter(m => m.status === 'todo').length,
      inProgress: milestones.filter(m => m.status === 'in_progress').length,
      done: milestones.filter(m => m.status === 'done').length,
      avgProgress: milestones.length > 0
        ? Math.round(milestones.reduce((acc, m) => acc + (m.progress || 0), 0) / milestones.length)
        : 0,
    }

    // Task stats
    const taskStats: TaskStats = {
      total: tasks.length,
      byFrequency: {
        daily: tasks.filter(t => t.recurrence === 'daily').length,
        weekly: tasks.filter(t => t.recurrence === 'weekly').length,
        once: tasks.filter(t => t.recurrence === 'once').length,
        flexible: tasks.filter(t => t.type === 'flexible').length,
        custom: tasks.filter(t => t.recurrence === 'custom').length,
      },
      byPriority: {
        high: tasks.filter(t => t.priority === 2).length,
        medium: tasks.filter(t => t.priority === 3).length,
        low: tasks.filter(t => t.priority === 4).length,
      },
    }

    // User stats
    const userStats: UserStats[] = users.map(user => {
      const userTasks = tasks.filter(t => t.assignedTo === user.id)
      const userMilestones = milestones.filter(m => m.assigned_to === user.id)

      return {
        id: user.id,
        name: user.name,
        color: user.color,
        taskCount: userTasks.length,
        milestoneCount: userMilestones.length,
        milestonesCompleted: userMilestones.filter(m => m.status === 'done').length,
        avgProgress: userMilestones.length > 0
          ? Math.round(userMilestones.reduce((acc, m) => acc + (m.progress || 0), 0) / userMilestones.length)
          : 0,
      }
    })

    // Common tasks stats
    const commonTasks = tasks.filter(t => t.assignedTo === 'common')
    const commonStats: CommonStats = {
      taskCount: commonTasks.length,
      byFrequency: {
        daily: commonTasks.filter(t => t.recurrence === 'daily').length,
        weekly: commonTasks.filter(t => t.recurrence === 'weekly').length,
      },
    }

    // Planning stats (if generated)
    const planningStats: PlanningStats | null = planning ? {
      totalSlots: planning.reduce((acc, week) => acc + week.slots.length, 0),
      weeksCount: planning.length,
    } : null

    // Focus milestone
    const focusMilestone = milestones.find(m => m.is_focus)

    // Upcoming milestones (next 7 days)
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const upcomingMilestones = milestones
      .filter(m => {
        if (!m.target_date || m.status === 'done') return false
        const targetDate = new Date(m.target_date)
        return targetDate >= today && targetDate <= nextWeek
      })
      .sort((a, b) => new Date(a.target_date!).getTime() - new Date(b.target_date!).getTime())

    // Overdue milestones
    const overdueMilestones = milestones
      .filter(m => {
        if (!m.target_date || m.status === 'done') return false
        return new Date(m.target_date) < today
      })
      .sort((a, b) => new Date(a.target_date!).getTime() - new Date(b.target_date!).getTime())

    return {
      milestones: milestoneStats,
      tasks: taskStats,
      users: userStats,
      common: commonStats,
      planning: planningStats,
      focusMilestone,
      upcomingMilestones,
      overdueMilestones,
    }
  }, [milestones, tasks, users, planning])

  return stats
}
