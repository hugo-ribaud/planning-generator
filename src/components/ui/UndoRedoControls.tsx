import { motion } from 'motion/react'

export interface UndoRedoControlsProps {
  /** Fonction undo */
  onUndo: () => void
  /** Fonction redo */
  onRedo: () => void
  /** Est-ce qu'on peut annuler? */
  canUndo: boolean
  /** Est-ce qu'on peut refaire? */
  canRedo: boolean
  /** Nombre d'actions undo disponibles */
  undoCount?: number
  /** Nombre d'actions redo disponibles */
  redoCount?: number
  /** Description de la derniere action */
  lastActionDescription?: string
  /** Afficher les compteurs */
  showCounts?: boolean
  /** Taille des boutons */
  size?: 'sm' | 'md' | 'lg'
  /** Classes CSS supplementaires */
  className?: string
}

const sizes = {
  sm: {
    button: 'p-1.5',
    icon: 'w-4 h-4',
    text: 'text-xs',
  },
  md: {
    button: 'p-2',
    icon: 'w-5 h-5',
    text: 'text-sm',
  },
  lg: {
    button: 'p-2.5',
    icon: 'w-6 h-6',
    text: 'text-base',
  },
}

/**
 * Icone Undo (fleche vers la gauche avec courbure)
 */
function UndoIcon({ className = '' }: { className?: string }): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  )
}

/**
 * Icone Redo (fleche vers la droite avec courbure)
 */
function RedoIcon({ className = '' }: { className?: string }): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
    </svg>
  )
}

/**
 * Composant de controles Undo/Redo
 *
 * @example
 * ```tsx
 * <UndoRedoControls
 *   onUndo={undo}
 *   onRedo={redo}
 *   canUndo={canUndo}
 *   canRedo={canRedo}
 * />
 * ```
 */
export function UndoRedoControls({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  undoCount = 0,
  redoCount = 0,
  lastActionDescription,
  showCounts = false,
  size = 'md',
  className = '',
}: UndoRedoControlsProps): JSX.Element {
  const sizeStyles = sizes[size]

  // Detecter si c'est Mac pour afficher le bon raccourci
  const isMac = typeof navigator !== 'undefined' &&
    navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const modifierKey = isMac ? 'Cmd' : 'Ctrl'

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Bouton Undo */}
      <motion.button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        title={canUndo
          ? `Annuler${lastActionDescription ? `: ${lastActionDescription}` : ''} (${modifierKey}+Z)`
          : 'Rien a annuler'
        }
        aria-label={canUndo
          ? `Annuler${lastActionDescription ? `: ${lastActionDescription}` : ''}`
          : 'Rien a annuler'
        }
        whileHover={{ scale: canUndo ? 1.05 : 1 }}
        whileTap={{ scale: canUndo ? 0.95 : 1 }}
        className={`
          ${sizeStyles.button}
          rounded-lg transition-colors
          ${canUndo
            ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            : 'text-gray-300 cursor-not-allowed'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        `}
      >
        <UndoIcon className={sizeStyles.icon} />
        {showCounts && undoCount > 0 && (
          <span className={`ml-1 ${sizeStyles.text} text-gray-500`}>
            {undoCount}
          </span>
        )}
      </motion.button>

      {/* Bouton Redo */}
      <motion.button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        title={canRedo
          ? `Refaire (${modifierKey}+Shift+Z)`
          : 'Rien a refaire'
        }
        aria-label={canRedo ? 'Refaire' : 'Rien a refaire'}
        whileHover={{ scale: canRedo ? 1.05 : 1 }}
        whileTap={{ scale: canRedo ? 0.95 : 1 }}
        className={`
          ${sizeStyles.button}
          rounded-lg transition-colors
          ${canRedo
            ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            : 'text-gray-300 cursor-not-allowed'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        `}
      >
        <RedoIcon className={sizeStyles.icon} />
        {showCounts && redoCount > 0 && (
          <span className={`ml-1 ${sizeStyles.text} text-gray-500`}>
            {redoCount}
          </span>
        )}
      </motion.button>
    </div>
  )
}

/**
 * Version compacte avec tooltip pour les espaces reduits
 */
export function UndoRedoControlsCompact({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  className = '',
}: Pick<UndoRedoControlsProps, 'onUndo' | 'onRedo' | 'canUndo' | 'canRedo' | 'className'>): JSX.Element {
  return (
    <UndoRedoControls
      onUndo={onUndo}
      onRedo={onRedo}
      canUndo={canUndo}
      canRedo={canRedo}
      size="sm"
      className={className}
    />
  )
}
