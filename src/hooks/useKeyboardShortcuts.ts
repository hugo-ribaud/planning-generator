/**
 * useKeyboardShortcuts - Hook pour gérer les raccourcis clavier
 * Supporte les modificateurs Ctrl/Cmd de manière cross-platform
 */

import { useEffect, useCallback, useRef } from 'react'

export interface KeyboardShortcut {
  /** Touches du raccourci (ex: 'mod+n', 'escape', '1') */
  key: string
  /** Callback à exécuter */
  handler: () => void
  /** Description pour l'aide */
  description?: string
  /** Désactiver si un input est focus */
  disableOnInput?: boolean
}

interface UseKeyboardShortcutsOptions {
  /** Activer/désactiver tous les raccourcis */
  enabled?: boolean
}

/**
 * Normalise une touche pour comparaison
 * - 'mod' devient 'ctrl' sur Windows/Linux, 'meta' sur Mac
 */
function normalizeKey(key: string): { key: string; ctrl: boolean; shift: boolean; alt: boolean; meta: boolean } {
  const parts = key.toLowerCase().split('+')
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

  let ctrl = false
  let shift = false
  let alt = false
  let meta = false
  let mainKey = ''

  for (const part of parts) {
    switch (part) {
      case 'mod':
        if (isMac) meta = true
        else ctrl = true
        break
      case 'ctrl':
      case 'control':
        ctrl = true
        break
      case 'shift':
        shift = true
        break
      case 'alt':
      case 'option':
        alt = true
        break
      case 'meta':
      case 'cmd':
      case 'command':
        meta = true
        break
      default:
        mainKey = part
    }
  }

  return { key: mainKey, ctrl, shift, alt, meta }
}

/**
 * Vérifie si l'élément actif est un champ de saisie
 */
function isInputFocused(): boolean {
  const activeElement = document.activeElement
  if (!activeElement) return false

  const tagName = activeElement.tagName.toLowerCase()
  const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select'
  const isContentEditable = activeElement.getAttribute('contenteditable') === 'true'

  return isInput || isContentEditable
}

/**
 * Hook pour gérer les raccourcis clavier
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts([
 *   { key: 'mod+n', handler: () => addTask(), description: 'Nouvelle tâche' },
 *   { key: 'escape', handler: () => closeModal(), description: 'Fermer' },
 *   { key: '1', handler: () => goToSection(0), disableOnInput: true },
 * ])
 * ```
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
): void {
  const { enabled = true } = options
  const shortcutsRef = useRef(shortcuts)

  // Mettre à jour la référence si les shortcuts changent
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    for (const shortcut of shortcutsRef.current) {
      const normalized = normalizeKey(shortcut.key)

      // Vérifier les modificateurs
      const ctrlMatch = normalized.ctrl === (event.ctrlKey || false)
      const shiftMatch = normalized.shift === (event.shiftKey || false)
      const altMatch = normalized.alt === (event.altKey || false)
      const metaMatch = normalized.meta === (event.metaKey || false)

      // Vérifier la touche principale
      const keyMatch = event.key.toLowerCase() === normalized.key ||
                       event.code.toLowerCase() === `key${normalized.key}` ||
                       event.code.toLowerCase() === `digit${normalized.key}` ||
                       event.code.toLowerCase() === normalized.key

      if (ctrlMatch && shiftMatch && altMatch && metaMatch && keyMatch) {
        // Vérifier si on doit ignorer les inputs
        if (shortcut.disableOnInput !== false && isInputFocused()) {
          // Pour les raccourcis avec modificateurs, on les exécute quand même
          if (!normalized.ctrl && !normalized.meta && !normalized.alt) {
            continue
          }
        }

        // Empêcher le comportement par défaut (sauf pour certaines touches)
        if (normalized.ctrl || normalized.meta) {
          event.preventDefault()
        }

        shortcut.handler()
        return
      }
    }
  }, [enabled])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * Retourne le symbole du modificateur pour l'OS actuel
 */
export function getModifierSymbol(): string {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  return isMac ? '⌘' : 'Ctrl'
}

/**
 * Formate un raccourci pour l'affichage
 * @example formatShortcut('mod+n') // '⌘N' sur Mac, 'Ctrl+N' sur Windows
 */
export function formatShortcut(shortcut: string): string {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

  return shortcut
    .split('+')
    .map(part => {
      switch (part.toLowerCase()) {
        case 'mod':
          return isMac ? '⌘' : 'Ctrl'
        case 'ctrl':
        case 'control':
          return isMac ? '⌃' : 'Ctrl'
        case 'shift':
          return isMac ? '⇧' : 'Shift'
        case 'alt':
        case 'option':
          return isMac ? '⌥' : 'Alt'
        case 'meta':
        case 'cmd':
        case 'command':
          return '⌘'
        case 'escape':
          return 'Esc'
        case 'enter':
          return '↵'
        case 'backspace':
          return '⌫'
        case 'delete':
          return '⌦'
        case 'arrowup':
          return '↑'
        case 'arrowdown':
          return '↓'
        case 'arrowleft':
          return '←'
        case 'arrowright':
          return '→'
        default:
          return part.toUpperCase()
      }
    })
    .join(isMac ? '' : '+')
}

/**
 * Liste des raccourcis disponibles pour l'aide
 */
export const SHORTCUTS_LIST = {
  navigation: [
    { key: 'mod+s', description: 'Sauvegarder' },
    { key: 'mod+n', description: 'Nouvelle tâche' },
    { key: 'mod+u', description: 'Nouvel utilisateur' },
    { key: 'escape', description: 'Fermer modal' },
  ],
  editing: [
    { key: 'mod+z', description: 'Annuler' },
    { key: 'mod+shift+z', description: 'Rétablir' },
    { key: 'mod+g', description: 'Générer planning' },
    { key: 'mod+p', description: 'Imprimer' },
  ],
  sections: [
    { key: '1', description: 'Configuration' },
    { key: '2', description: 'Utilisateurs' },
    { key: '3', description: 'Tâches' },
    { key: '4', description: 'Objectifs' },
    { key: '5', description: 'Courses' },
  ],
  help: [
    { key: '?', description: 'Afficher l\'aide' },
  ],
} as const

export default useKeyboardShortcuts
