import { motion, AnimatePresence } from 'motion/react'
import type { ConnectionStatus } from '../../hooks/useRealtimeSync'

interface StatusConfig {
  icon: string
  label: string
  className: string
}

const statusConfig: Record<ConnectionStatus, StatusConfig> = {
  connected: {
    icon: '🟢',
    label: 'Synchronisé',
    className: 'bg-green-50 text-green-700 border-green-200',
  },
  connecting: {
    icon: '🟡',
    label: 'Connexion...',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  disconnected: {
    icon: '⚪',
    label: 'Hors ligne',
    className: 'bg-gray-50 text-gray-600 border-gray-200',
  },
  error: {
    icon: '🔴',
    label: 'Erreur',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
}

export interface SyncStatusProps {
  status: ConnectionStatus
  lastSync?: Date | null
  onReconnect?: () => void
}

/**
 * Indicateur de statut de synchronisation
 */
export function SyncStatus({ status, lastSync, onReconnect }: SyncStatusProps): JSX.Element {
  const config = statusConfig[status] || statusConfig.disconnected

  const formatLastSync = (): string => {
    if (!lastSync) return ''
    const now = new Date()
    const diff = Math.floor((now.getTime() - lastSync.getTime()) / 1000)

    if (diff < 5) return "à l'instant"
    if (diff < 60) return `il y a ${diff}s`
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`
    return lastSync.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${config.className}`}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={status}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className={status === 'connecting' ? 'animate-pulse' : ''}
        >
          {config.icon}
        </motion.span>
      </AnimatePresence>

      <span>{config.label}</span>

      {status === 'connected' && lastSync && (
        <span className="text-green-600/70">• {formatLastSync()}</span>
      )}

      {status === 'error' && onReconnect && (
        <button
          onClick={onReconnect}
          className="ml-1 px-2 py-0.5 bg-red-100 hover:bg-red-200 rounded text-red-800 transition-colors"
        >
          Reconnecter
        </button>
      )}
    </motion.div>
  )
}
