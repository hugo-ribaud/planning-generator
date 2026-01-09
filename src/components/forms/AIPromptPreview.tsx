/**
 * AIPromptPreview - Preview component for AI-generated planning data
 * Shows users what will be created before applying
 */

import { motion } from 'motion/react'
import type { TransformedPlanningData } from '../../hooks'

export interface AIPromptPreviewProps {
  data: TransformedPlanningData
}

export function AIPromptPreview({ data }: AIPromptPreviewProps): JSX.Element {
  const { config, users, tasks, milestones, shoppingList } = data

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Success banner */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg text-green-600">
          <CheckIcon />
        </div>
        <div>
          <p className="font-medium text-green-800">Planning genere avec succes</p>
          <p className="text-sm text-green-600">
            Verifiez les donnees avant de les appliquer
          </p>
        </div>
      </div>

      {/* Config preview */}
      <PreviewSection title="Configuration" icon={<SettingsIcon />}>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <PreviewItem label="Nom" value={config.name || 'Non defini'} />
          <PreviewItem label="Periode" value={config.period === 'week' ? 'Semaine' : 'Mois'} />
          <PreviewItem label="Date de debut" value={config.startDate || 'Non definie'} />
          <PreviewItem label="Duree creneaux" value={`${config.slotDuration || 60} min`} />
          <PreviewItem label="Debut journee" value={config.workStart || '09:00'} />
          <PreviewItem label="Fin journee" value={config.workEnd || '18:00'} />
          <PreviewItem label="Debut pause" value={config.lunchStart || '12:00'} />
          <PreviewItem label="Fin pause" value={config.lunchEnd || '13:00'} />
        </div>
      </PreviewSection>

      {/* Users preview */}
      <PreviewSection title={`Utilisateurs (${users.length})`} icon={<UsersIcon />}>
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: user.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{user.name}</p>
                {user.daysOff && user.daysOff.length > 0 && (
                  <p className="text-xs text-gray-500">
                    Repos: {user.daysOff.join(', ')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </PreviewSection>

      {/* Tasks preview */}
      <PreviewSection title={`Taches (${tasks.length})`} icon={<TasksIcon />}>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <PriorityBadge priority={task.priority} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{task.name}</p>
                  <p className="text-xs text-gray-500">
                    {task.duration} min • {getRecurrenceLabel(task.recurrence)} • {getTypeLabel(task.type)}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-400 ml-2">
                {getTimePreferenceLabel(task.preferredTime)}
              </span>
            </div>
          ))}
        </div>
      </PreviewSection>

      {/* Milestones preview (if any) */}
      {milestones && milestones.length > 0 && (
        <PreviewSection title={`Objectifs (${milestones.length})`} icon={<FlagIcon />}>
          <div className="space-y-2">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: milestone.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{milestone.name}</p>
                  {milestone.description && (
                    <p className="text-xs text-gray-500 truncate">{milestone.description}</p>
                  )}
                </div>
                <StatusBadge status={milestone.status} />
              </div>
            ))}
          </div>
        </PreviewSection>
      )}

      {/* Shopping list preview (if any) */}
      {shoppingList && shoppingList.categories.length > 0 && (
        <PreviewSection
          title={`Liste de courses (${shoppingList.categories.reduce((acc, cat) => acc + cat.items.length, 0)} articles)`}
          icon={<ShoppingCartIcon />}
        >
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {shoppingList.categories.map((category) => (
              <div key={category.id} className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                  <span className="text-xs text-gray-400">({category.items.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-6">
                  {category.items.map((item) => (
                    <span
                      key={item.id}
                      className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full"
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PreviewSection>
      )}
    </motion.div>
  )
}

// Helper components
interface PreviewSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}

function PreviewSection({ title, icon, children }: PreviewSectionProps): JSX.Element {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
        <span className="text-gray-500">{icon}</span>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

interface PreviewItemProps {
  label: string
  value: string
}

function PreviewItem({ label, value }: PreviewItemProps): JSX.Element {
  return (
    <div>
      <span className="text-gray-500">{label}:</span>{' '}
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}

interface PriorityBadgeProps {
  priority: 1 | 2 | 3 | 4
}

function PriorityBadge({ priority }: PriorityBadgeProps): JSX.Element {
  const colors = {
    1: 'bg-red-100 text-red-700',
    2: 'bg-orange-100 text-orange-700',
    3: 'bg-blue-100 text-blue-700',
    4: 'bg-gray-100 text-gray-700',
  }

  const labels = {
    1: 'Urgent',
    2: 'Haute',
    3: 'Normale',
    4: 'Basse',
  }

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[priority]}`}>
      {labels[priority]}
    </span>
  )
}

interface StatusBadgeProps {
  status: 'not_started' | 'in_progress' | 'completed'
}

function StatusBadge({ status }: StatusBadgeProps): JSX.Element {
  const styles = {
    not_started: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  }

  const labels = {
    not_started: 'Non commence',
    in_progress: 'En cours',
    completed: 'Termine',
  }

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

// Helper functions
function getRecurrenceLabel(recurrence: string): string {
  const labels: Record<string, string> = {
    daily: 'Quotidien',
    weekly: 'Hebdo',
    once: 'Une fois',
    custom: 'Personnalise',
  }
  return labels[recurrence] || recurrence
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    solo: 'Solo',
    common: 'Commun',
    flexible: 'Flexible',
  }
  return labels[type] || type
}

function getTimePreferenceLabel(time: string): string {
  const labels: Record<string, string> = {
    morning: 'Matin',
    afternoon: 'Apres-midi',
    evening: 'Soir',
    any: 'Indifferent',
  }
  return labels[time] || time
}

// Icons
function CheckIcon(): JSX.Element {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function SettingsIcon(): JSX.Element {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function UsersIcon(): JSX.Element {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

function TasksIcon(): JSX.Element {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  )
}

function FlagIcon(): JSX.Element {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
    </svg>
  )
}

function ShoppingCartIcon(): JSX.Element {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}

export default AIPromptPreview
