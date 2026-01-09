import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChangeEvent } from 'react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Select, SelectOption } from '../ui/Select'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { TASK_TYPES, RECURRENCE_TYPES, TIME_PREFERENCES, DAYS_OF_WEEK } from '../../data/defaults'
import type { Task, User } from '../../types'

const DURATION_OPTIONS: SelectOption[] = [
  { value: '30', label: '30 min' },
  { value: '60', label: '1h' },
  { value: '90', label: '1h30' },
  { value: '120', label: '2h' },
  { value: '180', label: '3h' },
]

const PRIORITY_OPTIONS: SelectOption[] = [
  { value: '1', label: 'Urgent' },
  { value: '2', label: 'Haute' },
  { value: '3', label: 'Normale' },
  { value: '4', label: 'Basse' },
]

interface TaskCardProps {
  task: Task
  users: User[]
  onUpdate: (id: string, field: keyof Task, value: unknown) => void
  onRemove: (id: string) => void
}

function TaskCard({ task, users, onUpdate, onRemove }: TaskCardProps): JSX.Element {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleChange = (field: keyof Task) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = ['duration', 'priority'].includes(field)
      ? parseInt(e.target.value, 10)
      : e.target.value
    onUpdate(task.id, field, value)
  }

  const togglePreferredDay = (day: string): void => {
    const currentDays = task.preferredDays || []
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day]
    onUpdate(task.id, 'preferredDays', newDays)
  }

  const handleConfirmDelete = (): void => {
    onRemove(task.id)
    setShowDeleteConfirm(false)
  }

  // Build assignee options from users
  const assigneeOptions: SelectOption[] = [
    { value: 'common', label: 'Commun (tous)' },
    ...users.map(u => ({ value: u.id, label: u.name || 'Sans nom' }))
  ]

  const taskName = task.name || 'Sans nom'

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="p-4 border border-gray-200 rounded-lg bg-gray-50"
      >
        <div className="space-y-4">
          {/* Header with name and remove */}
          <div className="flex items-start gap-3">
            <input
              type="color"
              value={task.color || '#6B7280'}
              onChange={handleChange('color')}
              aria-label={`Couleur de la tache ${taskName}`}
              className="w-8 h-8 rounded cursor-pointer border-2 border-white shadow-sm mt-1"
            />
            <Input
              label="Nom de la tache"
              value={task.name}
              onChange={handleChange('name')}
              placeholder="Ex: Conversari, Sport, TFT..."
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              aria-label={`Supprimer la tache ${taskName}`}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-6"
            >
              <span aria-hidden="true">&#10005;</span>
            </Button>
          </div>

          {/* Row 1: Assignee, Type, Recurrence */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select
              label="Assigne a"
              value={task.assignedTo || ''}
              onChange={handleChange('assignedTo')}
              options={assigneeOptions}
              placeholder="Selectionner..."
            />
            <Select
              label="Type"
              value={task.type}
              onChange={handleChange('type')}
              options={TASK_TYPES}
            />
            <Select
              label="Recurrence"
              value={task.recurrence}
              onChange={handleChange('recurrence')}
              options={RECURRENCE_TYPES}
            />
          </div>

          {/* Row 2: Duration, Priority, Preferred time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select
              label="Duree"
              value={String(task.duration)}
              onChange={handleChange('duration')}
              options={DURATION_OPTIONS}
            />
            <Select
              label="Priorite"
              value={String(task.priority)}
              onChange={handleChange('priority')}
              options={PRIORITY_OPTIONS}
            />
            <Select
              label="Creneau prefere"
              value={task.preferredTime}
              onChange={handleChange('preferredTime')}
              options={TIME_PREFERENCES}
            />
          </div>

          {/* Preferred days */}
          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-2">
              Jours preferes (optionnel)
            </legend>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Selection des jours preferes">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = (task.preferredDays || []).includes(day.value)
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => togglePreferredDay(day.value)}
                    aria-pressed={isSelected}
                    className={`
                      px-3 py-1 text-sm rounded-full transition-colors
                      focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1
                      ${isSelected
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }
                    `}
                  >
                    {day.label.slice(0, 3)}
                  </button>
                )
              })}
            </div>
          </fieldset>
        </div>
      </motion.div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        title="Supprimer cette tache ?"
        message={`La tache "${taskName}" sera definitivement supprimee.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
      />
    </>
  )
}

export interface TasksFormProps {
  tasks: Task[]
  users: User[]
  onUpdate: (id: string, field: keyof Task, value: unknown) => void
  onAdd: () => void
  onRemove: (id: string) => void
}

export function TasksForm({ tasks, users, onUpdate, onAdd, onRemove }: TasksFormProps): JSX.Element {
  return (
    <Card title="Taches a planifier" icon="&#128203;">
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">Aucune tache ajoutee</p>
            <p className="text-sm">Ajoutez vos taches recurrentes ou ponctuelles</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                users={users}
                onUpdate={onUpdate}
                onRemove={onRemove}
              />
            ))}
          </AnimatePresence>
        )}

        <Button
          variant="secondary"
          onClick={onAdd}
          className="w-full"
        >
          + Ajouter une tache
        </Button>
      </div>
    </Card>
  )
}
