import { motion, AnimatePresence } from 'motion/react'
import { ChangeEvent } from 'react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { DAYS_OF_WEEK } from '../../data/defaults'
import type { User } from '../../types'

interface UserCardProps {
  user: User
  onUpdate: (id: string, field: keyof User, value: unknown) => void
  onRemove: (id: string) => void
  canRemove: boolean
}

function UserCard({ user, onUpdate, onRemove, canRemove }: UserCardProps): JSX.Element {
  const handleChange = (field: keyof User) => (e: ChangeEvent<HTMLInputElement>) => {
    onUpdate(user.id, field, e.target.value)
  }

  const toggleDayOff = (day: string): void => {
    const currentDays = user.daysOff || []
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day]
    onUpdate(user.id, 'daysOff', newDays)
  }

  const userName = user.name || 'Sans nom'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-4 border border-gray-200 rounded-lg bg-gray-50"
    >
      <div className="flex items-start gap-4">
        {/* Color picker */}
        <div className="flex flex-col items-center gap-1">
          <input
            type="color"
            value={user.color}
            onChange={handleChange('color')}
            aria-label={`Couleur de ${userName}`}
            className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white shadow-sm"
          />
          <span className="text-xs text-gray-500" aria-hidden="true">Couleur</span>
        </div>

        {/* User info */}
        <div className="flex-1 space-y-3">
          <Input
            label="Nom"
            value={user.name}
            onChange={handleChange('name')}
            placeholder="Ex: Hugo"
          />

          {/* Days off */}
          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-2">
              Jours off
            </legend>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Sélection des jours off">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = (user.daysOff || []).includes(day.value)
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDayOff(day.value)}
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

          {/* Constraints */}
          <Input
            label="Contraintes (optionnel)"
            value={user.constraints || ''}
            onChange={handleChange('constraints')}
            placeholder="Ex: Repos prioritaire, pas le matin..."
          />
        </div>

        {/* Remove button */}
        {canRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(user.id)}
            aria-label={`Supprimer l'utilisateur ${userName}`}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <span aria-hidden="true">✕</span>
          </Button>
        )}
      </div>
    </motion.div>
  )
}

export interface UsersFormProps {
  users: User[]
  onUpdate: (id: string, field: keyof User, value: unknown) => void
  onAdd: () => void
  onRemove: (id: string) => void
}

export function UsersForm({ users, onUpdate, onAdd, onRemove }: UsersFormProps): JSX.Element {
  return (
    <Card title="Utilisateurs" icon="👥">
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onUpdate={onUpdate}
              onRemove={onRemove}
              canRemove={users.length > 1}
            />
          ))}
        </AnimatePresence>

        <Button
          variant="secondary"
          onClick={onAdd}
          className="w-full"
        >
          + Ajouter un utilisateur
        </Button>
      </div>
    </Card>
  )
}
