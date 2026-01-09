/**
 * PlanningHistoryPage - List of user's saved plannings
 * Provides actions: load, duplicate, archive, delete, share
 */

import { useState, useEffect, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../contexts/AuthContext'
import { usePlannings } from '../hooks/usePlannings'
import { Button, Card, ConfirmDialog } from '../components/ui'
import type { Planning, PlanningConfig } from '../types'

// Filter options
const FILTERS: Record<string, string> = {
  all: 'Tous',
  active: 'Actifs',
  archived: 'Archives',
}

type FilterKey = 'all' | 'active' | 'archived'

interface PlanningWithMeta extends Planning {
  is_archived?: boolean
  is_public?: boolean
  share_token?: string
  config?: PlanningConfig
}

// Format relative date
function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "a l'instant"
  if (diffMins < 60) return `il y a ${diffMins} min`
  if (diffHours < 24) return `il y a ${diffHours}h`
  if (diffDays < 7) return `il y a ${diffDays}j`

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

// Planning Card Component Props
interface PlanningCardProps {
  planning: PlanningWithMeta
  onLoad: (id: string) => void
  onDuplicate: (id: string) => void
  onArchive: (id: string, archive: boolean) => void
  onDelete: (id: string) => void
  onShare: (planning: PlanningWithMeta) => void
}

// Planning Card Component
function PlanningCard({ planning, onLoad, onDuplicate, onArchive, onDelete, onShare }: PlanningCardProps): JSX.Element {
  const [showActions, setShowActions] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const usersCount = planning.users_data?.length || 0
  const tasksCount = planning.tasks_data?.length || 0
  const hasResult = !!planning.planning_result

  const handleConfirmDelete = (): void => {
    onDelete(planning.id)
    setShowDeleteConfirm(false)
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative"
      >
        <Card
          className={`
            cursor-pointer hover:shadow-md transition-shadow
            ${planning.is_archived ? 'opacity-60' : ''}
          `}
          animate={false}
          onClick={() => onLoad(planning.id)}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => {
            setShowActions(false)
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {planning.name}
              </h3>
              <p className="text-sm text-gray-500">
                {formatRelativeDate(planning.updated_at)}
              </p>
            </div>

            {/* Status badges */}
            <div className="flex gap-1">
              {planning.is_public && (
                <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                  Partage
                </span>
              )}
              {planning.is_archived && (
                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                  Archive
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm text-gray-600 mb-3">
            <span>{usersCount} utilisateur{usersCount > 1 ? 's' : ''}</span>
            <span>{tasksCount} tache{tasksCount > 1 ? 's' : ''}</span>
            {hasResult && (
              <span className="text-green-600">Genere</span>
            )}
          </div>

          {/* Config summary */}
          {planning.config && (
            <div className="text-xs text-gray-500">
              {planning.config.startDate && (
                <span>
                  Du {new Date(planning.config.startDate).toLocaleDateString('fr-FR')}
                  {planning.config.endDate && ` au ${new Date(planning.config.endDate).toLocaleDateString('fr-FR')}`}
                </span>
              )}
            </div>
          )}

          {/* Action buttons (on hover) */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/95 rounded-xl flex items-center justify-center gap-2 p-4"
                onClick={(e: MouseEvent) => e.stopPropagation()}
              >
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onLoad(planning.id)}
                >
                  Ouvrir
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onDuplicate(planning.id)}
                >
                  Dupliquer
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onShare(planning)}
                >
                  {planning.is_public ? 'Lien' : 'Partager'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onArchive(planning.id, !planning.is_archived)}
                >
                  {planning.is_archived ? 'Restaurer' : 'Archiver'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Supprimer
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        title="Supprimer ce planning ?"
        message={`Le planning "${planning.name}" sera definitivement supprime avec toutes ses donnees.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
      />
    </>
  )
}

// Empty state props
interface EmptyStateProps {
  filter: FilterKey
  onCreateNew: () => void
}

// Empty state
function EmptyState({ filter, onCreateNew }: EmptyStateProps): JSX.Element {
  const messages: Record<FilterKey, string> = {
    all: "Vous n'avez pas encore de planning",
    active: "Aucun planning actif",
    archived: "Aucun planning archive",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <div className="text-6xl mb-4">&#128197;</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {messages[filter]}
      </h3>
      <p className="text-gray-600 mb-6">
        Creez votre premier planning familial en quelques clics
      </p>
      <Button variant="primary" onClick={onCreateNew}>
        Creer un planning
      </Button>
    </motion.div>
  )
}

// Share modal props
interface ShareModalProps {
  planning: PlanningWithMeta
  shareUrl: string | null
  onClose: () => void
  onCopyLink: (url: string) => Promise<void>
  onUnshare: () => void
}

// Share modal
function ShareModal({ planning, shareUrl, onClose, onCopyLink, onUnshare }: ShareModalProps): JSX.Element {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (): Promise<void> => {
    if (!shareUrl) return
    await onCopyLink(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
        onClick={(e: MouseEvent) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Partager "{planning.name}"
        </h2>

        {shareUrl ? (
          <>
            <p className="text-gray-600 mb-4">
              Partagez ce lien pour permettre a d'autres de consulter votre planning (lecture seule).
            </p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm"
              />
              <Button variant="primary" onClick={handleCopy}>
                {copied ? 'Copie !' : 'Copier'}
              </Button>
            </div>
            <Button
              variant="ghost"
              className="w-full text-red-600"
              onClick={onUnshare}
            >
              Arreter le partage
            </Button>
          </>
        ) : (
          <p className="text-gray-600">
            Chargement du lien de partage...
          </p>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function PlanningHistoryPage(): JSX.Element {
  const navigate = useNavigate()
  const { displayName, signOut } = useAuth()
  const {
    plannings,
    loading,
    error,
    fetchPlannings,
    duplicatePlanning,
    archivePlanning,
    restorePlanning,
    deletePlanning,
    sharePlanning,
    unsharePlanning,
  } = usePlannings()

  const [filter, setFilter] = useState<FilterKey>('active')
  const [shareModal, setShareModal] = useState<PlanningWithMeta | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)

  // Fetch plannings on mount
  useEffect(() => {
    fetchPlannings({ includeArchived: true })
  }, [fetchPlannings])

  // Filter plannings
  const filteredPlannings = (plannings as PlanningWithMeta[]).filter((p) => {
    if (filter === 'active') return !p.is_archived
    if (filter === 'archived') return p.is_archived
    return true
  })

  // Handlers
  const handleLoad = (id: string): void => {
    navigate(`/planning/${id}`)
  }

  const handleCreateNew = (): void => {
    navigate('/planning/new')
  }

  const handleDuplicate = async (id: string): Promise<void> => {
    await duplicatePlanning(id)
    fetchPlannings({ includeArchived: true })
  }

  const handleArchive = async (id: string, archive: boolean): Promise<void> => {
    if (archive) {
      await archivePlanning(id)
    } else {
      await restorePlanning(id)
    }
    fetchPlannings({ includeArchived: true })
  }

  const handleDelete = async (id: string): Promise<void> => {
    await deletePlanning(id)
    fetchPlannings({ includeArchived: true })
  }

  const handleShare = async (planning: PlanningWithMeta): Promise<void> => {
    setShareModal(planning)

    if (planning.is_public && planning.share_token) {
      setShareUrl(`${window.location.origin}/shared/${planning.share_token}`)
    } else {
      const { shareUrl } = await sharePlanning(planning.id)
      setShareUrl(shareUrl || null)
      fetchPlannings({ includeArchived: true })
    }
  }

  const handleUnshare = async (): Promise<void> => {
    if (shareModal) {
      await unsharePlanning(shareModal.id)
      setShareModal(null)
      setShareUrl(null)
      fetchPlannings({ includeArchived: true })
    }
  }

  const handleCopyLink = async (url: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(url)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleSignOut = async (): Promise<void> => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Planning Familial
            </h1>
            <p className="text-sm text-gray-500">
              Bonjour, {displayName}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={handleCreateNew}>
              + Nouveau planning
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              Deconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(Object.entries(FILTERS) as [FilterKey, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${filter === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              {label}
              {key !== 'all' && (
                <span className="ml-2 text-sm opacity-70">
                  ({(plannings as PlanningWithMeta[]).filter(p =>
                    key === 'active' ? !p.is_archived : p.is_archived
                  ).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
          >
            {error}
          </motion.div>
        )}

        {/* Loading state */}
        {loading && plannings.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        )}

        {/* Plannings grid or empty state */}
        {!loading && filteredPlannings.length === 0 ? (
          <EmptyState filter={filter} onCreateNew={handleCreateNew} />
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredPlannings.map((planning) => (
                <PlanningCard
                  key={planning.id}
                  planning={planning}
                  onLoad={handleLoad}
                  onDuplicate={handleDuplicate}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                  onShare={handleShare}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Share Modal */}
      <AnimatePresence>
        {shareModal && (
          <ShareModal
            planning={shareModal}
            shareUrl={shareUrl}
            onClose={() => {
              setShareModal(null)
              setShareUrl(null)
            }}
            onCopyLink={handleCopyLink}
            onUnshare={handleUnshare}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default PlanningHistoryPage
