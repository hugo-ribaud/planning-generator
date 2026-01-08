import type { Milestone, User } from '../../../types'

/**
 * FocusArticle - Magazine-style article for the focus milestone
 * Large typography, detailed description, progress visualization
 */

interface PrintableMilestone extends Milestone {
  status?: 'todo' | 'in_progress' | 'done' | 'blocked'
  progress?: number
  assigned_to?: string
  target_date?: string
  title?: string
}

export interface FocusArticleProps {
  milestone?: PrintableMilestone | null
  users: User[]
}

export function FocusArticle({ milestone, users }: FocusArticleProps): JSX.Element {
  if (!milestone) {
    return (
      <article className="focus-article bg-gray-50 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4 opacity-20">&#9678;</div>
        <h3 className="font-serif text-xl text-gray-500 italic">
          Aucun objectif en focus cette semaine
        </h3>
        <p className="text-sm text-gray-400 mt-2">
          Definissez un objectif prioritaire pour le mettre en avant
        </p>
      </article>
    )
  }

  const assignedUser = users.find(u => u.id === milestone.assigned_to)
  const progress = milestone.progress || 0
  const targetDate = milestone.target_date ? new Date(milestone.target_date) : null
  const daysRemaining = targetDate
    ? Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  const displayTitle = milestone.title || milestone.name

  // Status text and style
  const getStatusInfo = (): { text: string; color: string; bg: string } => {
    switch (milestone.status) {
      case 'done':
        return { text: 'Termine', color: 'text-emerald-600', bg: 'bg-emerald-50' }
      case 'in_progress':
        return { text: 'En cours', color: 'text-blue-600', bg: 'bg-blue-50' }
      default:
        return { text: 'A faire', color: 'text-gray-600', bg: 'bg-gray-100' }
    }
  }

  const statusInfo = getStatusInfo()

  // Deadline status
  const getDeadlineStatus = (): { text: string; urgent: boolean } | null => {
    if (daysRemaining === null) return null
    if (daysRemaining < 0) return { text: `En retard de ${Math.abs(daysRemaining)} jour${Math.abs(daysRemaining) > 1 ? 's' : ''}`, urgent: true }
    if (daysRemaining === 0) return { text: "Echeance aujourd'hui", urgent: true }
    if (daysRemaining === 1) return { text: 'Demain', urgent: true }
    if (daysRemaining <= 3) return { text: `${daysRemaining} jours restants`, urgent: true }
    if (daysRemaining <= 7) return { text: `${daysRemaining} jours restants`, urgent: false }
    return { text: `${daysRemaining} jours restants`, urgent: false }
  }

  const deadlineStatus = getDeadlineStatus()

  return (
    <article className="focus-article bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Top banner */}
      <div className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">&#9678;</span>
          <span className="text-sm font-medium uppercase tracking-wider">
            Objectif Focus
          </span>
        </div>
        {deadlineStatus && (
          <span className={`text-sm ${deadlineStatus.urgent ? 'text-amber-300 font-medium' : 'text-gray-400'}`}>
            {deadlineStatus.text}
          </span>
        )}
      </div>

      <div className="p-6">
        {/* Article layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Main content */}
          <div className="col-span-8">
            {/* Large title */}
            <h2 className="font-serif text-4xl font-bold text-gray-900 leading-tight mb-4">
              {displayTitle}
            </h2>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
              <span className={`px-3 py-1 rounded-full font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                {statusInfo.text}
              </span>

              {assignedUser && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: assignedUser.color }}
                  />
                  <span className="text-gray-600">{assignedUser.name}</span>
                </div>
              )}

              {milestone.assigned_to === 'common' && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500" />
                  <span className="text-gray-600">Objectif commun</span>
                </div>
              )}

              {targetDate && (
                <div className="flex items-center gap-1 text-gray-500">
                  <span>&#128197;</span>
                  <span>
                    {targetDate.toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Description as article body */}
            {milestone.description && (
              <div className="prose prose-gray max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1">
                  {milestone.description}
                </p>
              </div>
            )}

            {/* Progress bar */}
            <div className="mt-8">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Progression</span>
                <span className="font-serif text-2xl font-bold text-gray-900">{progress}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: assignedUser?.color || '#10B981'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Side visual - Progress circle */}
          <div className="col-span-4 flex items-center justify-center">
            <div className="relative w-40 h-40">
              {/* Background circle */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={assignedUser?.color || '#10B981'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(progress / 100) * 283} 283`}
                />
              </svg>

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-serif text-4xl font-bold text-gray-900">
                  {progress}
                </span>
                <span className="text-sm text-gray-500">pour cent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Call to action quote */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <blockquote className="font-serif text-lg italic text-gray-600 text-center">
            {progress < 25 && '"Le voyage de mille lieues commence par un pas."'}
            {progress >= 25 && progress < 50 && '"Chaque effort compte, continuez ainsi."'}
            {progress >= 50 && progress < 75 && '"A mi-chemin, l\'objectif se rapproche."'}
            {progress >= 75 && progress < 100 && '"La ligne d\'arrivee est en vue, derniere ligne droite !"'}
            {progress >= 100 && '"Objectif atteint, bravo pour cet accomplissement !"'}
          </blockquote>
        </div>
      </div>
    </article>
  )
}
