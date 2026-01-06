import { useMemo } from 'react'

/**
 * Hook pour calculer les statistiques du dashboard
 */
export function useDashboardStats(milestones, tasks, users, planning) {
  const stats = useMemo(() => {
    // Milestone stats
    const milestoneStats = {
      total: milestones.length,
      todo: milestones.filter(m => m.status === 'todo').length,
      inProgress: milestones.filter(m => m.status === 'in_progress').length,
      done: milestones.filter(m => m.status === 'done').length,
      avgProgress: milestones.length > 0
        ? Math.round(milestones.reduce((acc, m) => acc + (m.progress || 0), 0) / milestones.length)
        : 0,
    }

    // Task stats
    const taskStats = {
      total: tasks.length,
      byFrequency: {
        daily: tasks.filter(t => t.frequency === 'daily').length,
        weekly: tasks.filter(t => t.frequency === 'weekly').length,
        once: tasks.filter(t => t.frequency === 'once').length,
        flexible: tasks.filter(t => t.frequency === 'flexible').length,
        custom: tasks.filter(t => t.frequency === 'custom').length,
      },
      byPriority: {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length,
      },
    }

    // User stats
    const userStats = users.map(user => {
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
    const commonStats = {
      taskCount: commonTasks.length,
      byFrequency: {
        daily: commonTasks.filter(t => t.frequency === 'daily').length,
        weekly: commonTasks.filter(t => t.frequency === 'weekly').length,
      },
    }

    // Planning stats (if generated)
    const planningStats = planning ? {
      totalSlots: planning.reduce((acc, week) =>
        acc + week.days.reduce((dayAcc, day) => dayAcc + day.slots.length, 0), 0
      ),
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
      .sort((a, b) => new Date(a.target_date) - new Date(b.target_date))

    // Overdue milestones
    const overdueMilestones = milestones
      .filter(m => {
        if (!m.target_date || m.status === 'done') return false
        return new Date(m.target_date) < today
      })
      .sort((a, b) => new Date(a.target_date) - new Date(b.target_date))

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
