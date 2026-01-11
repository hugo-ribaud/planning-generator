/**
 * ThemeToggle - Button to toggle between light/dark/system themes
 * Features: Animated icon transitions, dropdown menu for theme selection
 */

import { motion, AnimatePresence } from 'motion/react'
import { useState, useRef, useEffect } from 'react'
import { useTheme, type Theme } from '../../contexts/ThemeContext'

interface ThemeOption {
  value: Theme
  label: string
  icon: JSX.Element
}

const SunIcon = (): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const MoonIcon = (): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const SystemIcon = (): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
)

const themeOptions: ThemeOption[] = [
  { value: 'light', label: 'Clair', icon: <SunIcon /> },
  { value: 'dark', label: 'Sombre', icon: <MoonIcon /> },
  { value: 'system', label: 'Système', icon: <SystemIcon /> },
]

export interface ThemeToggleProps {
  /** Show dropdown menu instead of simple toggle */
  showMenu?: boolean
  className?: string
}

export function ThemeToggle({ showMenu = true, className = '' }: ThemeToggleProps): JSX.Element {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close menu on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const currentIcon = resolvedTheme === 'dark' ? <MoonIcon /> : <SunIcon />

  // Simple toggle mode
  if (!showMenu) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        className={`
          p-2 rounded-lg transition-colors
          bg-gray-100 dark:bg-surface-dark
          text-gray-600 dark:text-gray-300
          hover:bg-gray-200 dark:hover:bg-surface-elevated-dark
          focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2
          dark:focus:ring-offset-background-dark
          ${className}
        `}
        aria-label={`Basculer vers le mode ${resolvedTheme === 'dark' ? 'clair' : 'sombre'}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={resolvedTheme}
            initial={{ y: -10, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 10, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
            className="block"
          >
            {currentIcon}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    )
  }

  // Dropdown menu mode
  return (
    <div ref={menuRef} className={`relative ${className}`}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          p-2 rounded-lg transition-colors
          bg-gray-100 dark:bg-surface-dark
          text-gray-600 dark:text-gray-300
          hover:bg-gray-200 dark:hover:bg-surface-elevated-dark
          focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2
          dark:focus:ring-offset-background-dark
        `}
        aria-label="Changer le thème"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={resolvedTheme}
            initial={{ y: -10, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 10, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
            className="block"
          >
            {currentIcon}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute right-0 mt-2 py-1 w-36 rounded-lg shadow-lg
              bg-white dark:bg-surface-dark
              border border-gray-200 dark:border-border-dark
              z-50
            `}
            role="menu"
          >
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value)
                  setIsOpen(false)
                }}
                className={`
                  w-full px-3 py-2 flex items-center gap-2 text-sm
                  transition-colors text-left
                  ${theme === option.value
                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-elevated-dark'
                  }
                `}
                role="menuitem"
              >
                <span className="opacity-70">{option.icon}</span>
                <span>{option.label}</span>
                {theme === option.value && (
                  <span className="ml-auto text-primary">✓</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
