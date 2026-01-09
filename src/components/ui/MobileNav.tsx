/**
 * MobileNav - Navigation mobile avec menu hamburger et drawer
 * Composant responsive pour la navigation sur mobile et tablette
 */

import { useState, useCallback, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from './Button'

// Icone hamburger
function HamburgerIcon(): JSX.Element {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  )
}

// Icone fermeture
function CloseIcon(): JSX.Element {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
}

export interface MobileNavProps {
  /** Titre affiche dans le header */
  title?: string
  /** Sous-titre optionnel */
  subtitle?: string
  /** Contenu du drawer (liens de navigation) */
  children?: ReactNode
  /** Actions a droite du header (boutons) */
  headerActions?: ReactNode
  /** Callback quand le drawer est ouvert/ferme */
  onToggle?: (isOpen: boolean) => void
}

export function MobileNav({
  title = 'Planning Familial',
  subtitle,
  children,
  headerActions,
  onToggle,
}: MobileNavProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => {
      const newState = !prev
      onToggle?.(newState)
      return newState
    })
  }, [onToggle])

  const closeMenu = useCallback(() => {
    setIsOpen(false)
    onToggle?.(false)
  }, [onToggle])

  // Fermer le menu avec la touche Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) {
        closeMenu()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeMenu])

  // Bloquer le scroll du body quand le menu est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Header mobile sticky */}
      <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Bouton hamburger */}
          <button
            type="button"
            onClick={toggleMenu}
            className="touch-target flex items-center justify-center -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            <HamburgerIcon />
          </button>

          {/* Titre */}
          <div className="flex-1 text-center px-2">
            <h1 className="text-base font-semibold text-gray-900 truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-gray-500 truncate">{subtitle}</p>
            )}
          </div>

          {/* Actions header */}
          <div className="flex items-center gap-1">
            {headerActions}
          </div>
        </div>
      </header>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeMenu}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            id="mobile-menu"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-[280px] max-w-[85vw] bg-white shadow-xl z-50 lg:hidden safe-area-top"
            aria-label="Menu principal"
          >
            {/* Header du drawer */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                type="button"
                onClick={closeMenu}
                className="touch-target flex items-center justify-center -mr-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Fermer le menu"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Contenu du drawer */}
            <div className="flex-1 overflow-y-auto p-4">
              {children}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}

// Composant pour les liens de navigation dans le drawer
export interface NavLinkProps {
  /** Icone du lien */
  icon?: ReactNode
  /** Texte du lien */
  label: string
  /** Est-ce le lien actif */
  active?: boolean
  /** Callback au clic */
  onClick?: () => void
}

export function NavLink({
  icon,
  label,
  active = false,
  onClick,
}: NavLinkProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left
        transition-colors touch-target
        ${active
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-gray-700 hover:bg-gray-100'
        }
      `}
    >
      {icon && <span className="text-lg">{icon}</span>}
      <span className="text-base">{label}</span>
    </button>
  )
}

// Export des composants utilitaires
export { HamburgerIcon, CloseIcon }
