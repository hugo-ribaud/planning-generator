import type { ChangeEvent } from 'react'
import { motion } from 'motion/react'
import { MilestoneProgress } from './MilestoneProgress'
import { Button } from '../ui/Button'
import { MILESTONE_STATUSES } from '../../data/defaults'
import type { Milestone, User } from '../../types'

export interface MilestoneCardProps {
  milestone: Milestone
  users: User[]
  onUpdate: (id: string, field: keyof Milestone, value: unknown) => void
  onDelete: (id: string) => void
  onToggleFocus: (id: string) => void
}

/**
 * Carte affichant un milestone avec sa progression
 */
export function MilestoneCard({
  milestone,
  users,
  onUpdate,
  onDelete,
  onToggleFocus,
}: MilestoneCardProps): JSX.Element {
  const assignedUser = users.find(u => u.id === milestone.assignedTo)
  const status = MILESTONE_STATUSES.find(s => s.value === milestone.status) || MILESTONE_STATUSES[0]

  const handleProgressChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const newProgress = parseInt(e.target.value, 10)
    onUpdate(milestone.id, 'progress', newProgress)

    // Auto-update status based on progress
    if (newProgress === 100 && milestone.status !== 'done') {
      onUpdate(milestone.id, 'status', 'done')
    } else if (newProgress > 0 && milestone.status === 'todo') {
      onUpdate(milestone.id, 'status', 'in_progress')
    }
  }

  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const newStatus = e.target.value
    onUpdate(milestone.id, 'status', newStatus)

    // Auto-update progress based on status
    if (newStatus === 'done' && (milestone.progress || 0) < 100) {
      onUpdate(milestone.id, 'progress', 100)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        p-4 bg-white border rounded-lg shadow-sm
        ${milestone.isFocus ? 'border-yellow-400 ring-2 ring-yellow-100' : 'border-gray-200'}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {milestone.isFocus && (
              <span className="text-yellow-500" title="Focus de la periode">
                *
              </span>
            )}
            <h4 className="font-semibold text-gray-900">
              {milestone.title || 'Sans titre'}
            </h4>
          </div>

          {assignedUser && (
            <div className="flex items-center gap-1.5 mt-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: assignedUser.color }}
              />
              <span className="text-sm text-gray-500">{assignedUser.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleFocus(milestone.id)}
            className={`
              p-1.5 rounded transition-colors
              ${milestone.isFocus
                ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
              }
            `}
            title={milestone.isFocus ? 'Retirer du focus' : 'Marquer comme focus'}
          >
            {milestone.isFocus ? '*' : 'o'}
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(milestone.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            x
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center gap-3">
          <MilestoneProgress progress={milestone.progress || 0} size="md" showLabel={false} />
          <input
            type="number"
            min="0"
            max="100"
            value={milestone.progress || 0}
            onChange={handleProgressChange}
            className="w-16 px-2 py-1 text-sm border border-gray-200 rounded text-center"
          />
          <span className="text-sm text-gray-500">%</span>
        </div>
      </div>

      {/* Status & Date */}
      <div className="flex items-center justify-between gap-3">
        <select
          value={milestone.status}
          onChange={handleStatusChange}
          className="text-sm px-2 py-1 rounded border border-gray-200 bg-white"
          style={{ color: status.color }}
        >
          {MILESTONE_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {milestone.targetDate && (
          <div className="text-sm text-gray-500">
            Objectif : {new Date(milestone.targetDate).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
            })}
          </div>
        )}
      </div>

      {/* Notes */}
      {milestone.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600">{milestone.notes}</p>
        </div>
      )}
    </motion.div>
  )
}
