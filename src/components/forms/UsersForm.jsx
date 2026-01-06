import { motion, AnimatePresence } from 'motion/react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { DAYS_OF_WEEK } from '../../data/defaults'

function UserCard({ user, onUpdate, onRemove, canRemove }) {
  const handleChange = (field) => (e) => {
    onUpdate(user.id, field, e.target.value)
  }

  const toggleDayOff = (day) => {
    const currentDays = user.days_off || []
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day]
    onUpdate(user.id, 'days_off', newDays)
  }

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
            className="w-10 h-10 rounded-lg cursor-pointer border-2 border-white shadow-sm"
          />
          <span className="text-xs text-gray-500">Couleur</span>
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
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Jours off
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDayOff(day.value)}
                  className={`
                    px-3 py-1 text-sm rounded-full transition-colors
                    ${(user.days_off || []).includes(day.value)
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }
                  `}
                >
                  {day.label.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

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
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            ✕
          </Button>
        )}
      </div>
    </motion.div>
  )
}

export function UsersForm({ users, onUpdate, onAdd, onRemove }) {
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
