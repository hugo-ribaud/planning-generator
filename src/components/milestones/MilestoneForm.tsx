import { useState, type ChangeEvent, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { Card } from '../ui/Card'
import { Input, DateInput } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { MILESTONE_STATUSES } from '../../data/defaults'
import type { Milestone, User } from '../../types'

export interface MilestoneFormProps {
  users: User[]
  onAdd: (milestone: Milestone) => void
  onCancel?: () => void
}

type MilestoneFormData = Omit<Milestone, 'id'>

const DEFAULT_MILESTONE: MilestoneFormData = {
  title: '',
  assignedTo: '',
  status: 'todo',
  targetDate: '',
  progress: 0,
  isFocus: false,
  notes: '',
}

/**
 * Formulaire pour ajouter un nouveau milestone
 */
export function MilestoneForm({ users, onAdd, onCancel }: MilestoneFormProps): JSX.Element {
  const [milestone, setMilestone] = useState<MilestoneFormData>(DEFAULT_MILESTONE)
  const [isExpanded, setIsExpanded] = useState(false)

  const assigneeOptions = [
    { value: '', label: 'Selectionner...' },
    { value: 'all', label: 'Tous' },
    ...users.map(u => ({ value: u.id, label: u.name || 'Sans nom' })),
  ]

  const handleChange = (field: keyof MilestoneFormData) => (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const target = e.target
    let value: string | number | boolean

    if (field === 'progress') {
      value = parseInt(target.value, 10) || 0
    } else if (field === 'isFocus' && target instanceof HTMLInputElement) {
      value = target.checked
    } else {
      value = target.value
    }

    setMilestone(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    if (!milestone.title.trim()) {
      return
    }

    onAdd({
      ...milestone,
      id: crypto.randomUUID(),
    })

    setMilestone(DEFAULT_MILESTONE)
    setIsExpanded(false)
  }

  if (!isExpanded) {
    return (
      <Button
        variant="secondary"
        onClick={() => setIsExpanded(true)}
        className="w-full"
      >
        + Ajouter un objectif
      </Button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <Card title="Nouvel objectif" icon="o">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <Input
            label="Titre de l'objectif"
            value={milestone.title}
            onChange={handleChange('title')}
            placeholder="Ex: Terminer Conversari"
            required
          />

          {/* Row: Assignee, Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Assigne a"
              value={milestone.assignedTo}
              onChange={handleChange('assignedTo')}
              options={assigneeOptions}
            />

            <Select
              label="Statut"
              value={milestone.status}
              onChange={handleChange('status')}
              options={MILESTONE_STATUSES}
            />
          </div>

          {/* Row: Target date, Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateInput
              label="Date cible (optionnel)"
              value={milestone.targetDate || ''}
              onChange={handleChange('targetDate')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Progression
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={milestone.progress || 0}
                  onChange={handleChange('progress')}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12 text-right">
                  {milestone.progress || 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Focus checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_focus"
              checked={milestone.isFocus || false}
              onChange={handleChange('isFocus')}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="is_focus" className="text-sm text-gray-700">
              Marquer comme focus de la periode
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optionnel)
            </label>
            <textarea
              value={milestone.notes || ''}
              onChange={handleChange('notes')}
              placeholder="Notes additionnelles..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setMilestone(DEFAULT_MILESTONE)
                setIsExpanded(false)
                onCancel?.()
              }}
            >
              Annuler
            </Button>
            <Button type="submit" variant="primary">
              Ajouter
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  )
}
