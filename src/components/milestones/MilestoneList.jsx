import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Card } from '../ui/Card'
import { MilestoneCard } from './MilestoneCard'
import { MilestoneForm } from './MilestoneForm'

const FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'focus', label: 'Focus' },
  { value: 'todo', label: 'A faire' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'done', label: 'Termines' },
]

export function MilestoneList({
  milestones,
  users,
  onAdd,
  onUpdate,
  onDelete,
  onToggleFocus,
}) {
  const [filter, setFilter] = useState('all')

  // Filter milestones
  const filteredMilestones = milestones.filter(m => {
    if (filter === 'all') return true
    if (filter === 'focus') return m.is_focus
    return m.status === filter
  })

  // Sort: focus first, then by progress (ascending), then by target_date
  const sortedMilestones = [...filteredMilestones].sort((a, b) => {
    // Focus first
    if (a.is_focus && !b.is_focus) return -1
    if (!a.is_focus && b.is_focus) return 1

    // Then by status (todo, in_progress, done)
    const statusOrder = { todo: 0, in_progress: 1, done: 2 }
    const statusDiff = statusOrder[a.status] - statusOrder[b.status]
    if (statusDiff !== 0) return statusDiff

    // Then by progress (lower first for motivation)
    return (a.progress || 0) - (b.progress || 0)
  })

  // Calculate stats
  const stats = {
    total: milestones.length,
    done: milestones.filter(m => m.status === 'done').length,
    inProgress: milestones.filter(m => m.status === 'in_progress').length,
    focus: milestones.filter(m => m.is_focus).length,
    avgProgress: milestones.length > 0
      ? Math.round(milestones.reduce((acc, m) => acc + (m.progress || 0), 0) / milestones.length)
      : 0,
  }

  return (
    <Card title="Objectifs" icon="o">
      {/* Stats bar */}
      {milestones.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg text-sm"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">Total:</span>
            <span className="font-semibold">{stats.total}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-500">Termines:</span>
            <span className="font-semibold">{stats.done}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-gray-500">En cours:</span>
            <span className="font-semibold">{stats.inProgress}</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-gray-500">Progression moyenne:</span>
            <span className="font-semibold text-primary">{stats.avgProgress}%</span>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`
              px-3 py-1 text-sm rounded-full transition-colors
              ${filter === f.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {f.label}
            {f.value === 'focus' && stats.focus > 0 && (
              <span className="ml-1">({stats.focus})</span>
            )}
          </button>
        ))}
      </div>

      {/* Milestones list */}
      <div className="space-y-3 mb-4">
        <AnimatePresence mode="popLayout">
          {sortedMilestones.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-gray-500"
            >
              <p className="mb-2">
                {filter === 'all'
                  ? 'Aucun objectif pour le moment'
                  : `Aucun objectif "${FILTERS.find(f => f.value === filter)?.label}"`
                }
              </p>
              {filter === 'all' && (
                <p className="text-sm">Ajoutez vos objectifs pour suivre votre progression</p>
              )}
            </motion.div>
          ) : (
            sortedMilestones.map((milestone) => (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone}
                users={users}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onToggleFocus={onToggleFocus}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add form */}
      <MilestoneForm users={users} onAdd={onAdd} />
    </Card>
  )
}
