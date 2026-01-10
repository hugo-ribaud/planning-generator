/**
 * ShoppingListEditor - Simplified shopping list editor for wizard
 */

import { useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button, Input } from '../ui'
import type { ShoppingList, ShoppingItem } from '../../types'

export interface ShoppingListEditorProps {
  shoppingList: ShoppingList
  onUpdate: (shoppingList: ShoppingList) => void
}

// Category icons mapping
const CATEGORY_ICONS: Record<string, string> = {
  'Fruits & Legumes': '🥬',
  'Viandes & Poissons': '🥩',
  'Produits Laitiers': '🧀',
  'Boulangerie': '🥖',
  'Epicerie': '🥫',
  'Hygiene & Maison': '🧴',
  'Surgeles': '❄️',
  'Boissons': '🍷',
}

/**
 * Simplified shopping list editor for wizard step
 */
export function ShoppingListEditor({
  shoppingList,
  onUpdate,
}: ShoppingListEditorProps): JSX.Element {
  const [newItemText, setNewItemText] = useState<Record<string, string>>({})
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const categories = shoppingList.categories

  const toggleCategory = (categoryId: string): void => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const addItem = (categoryId: string): void => {
    const text = newItemText[categoryId]?.trim()
    if (!text) return

    const newItem: ShoppingItem = {
      id: `item_${Date.now()}`,
      name: text,
      is_checked: false,
      quantity: '1',
    }

    const updatedCategories = categories.map((cat) =>
      cat.id === categoryId
        ? { ...cat, items: [...cat.items, newItem] }
        : cat
    )

    onUpdate({ ...shoppingList, categories: updatedCategories })
    setNewItemText((prev) => ({ ...prev, [categoryId]: '' }))
  }

  const removeItem = (categoryId: string, itemId: string): void => {
    const updatedCategories = categories.map((cat) =>
      cat.id === categoryId
        ? { ...cat, items: cat.items.filter((item) => item.id !== itemId) }
        : cat
    )
    onUpdate({ ...shoppingList, categories: updatedCategories })
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, categoryId: string): void => {
    if (e.key === 'Enter') {
      addItem(categoryId)
    }
  }

  const getTotalItems = (): number => {
    return categories.reduce((acc, cat) => acc + cat.items.length, 0)
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        <p>Preparez votre liste de courses par categorie.</p>
        <p className="text-gray-500 mt-1">Cette etape est optionnelle.</p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg text-sm">
        <span className="text-gray-500">Articles:</span>
        <span className="font-semibold">{getTotalItems()}</span>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        {categories.map((category) => {
          const isExpanded = expandedCategories.has(category.id)
          const icon = category.icon || CATEGORY_ICONS[category.name] || '📦'

          return (
            <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Category header */}
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{icon}</span>
                  <span className="font-medium text-gray-900">{category.name}</span>
                  <span className="text-sm text-gray-500">({category.items.length})</span>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Category content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 space-y-2">
                      {/* Existing items */}
                      {category.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-1.5 px-2 bg-white rounded border border-gray-100"
                        >
                          <span className="text-gray-700">{item.name}</span>
                          <button
                            type="button"
                            onClick={() => removeItem(category.id, item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}

                      {/* Add item input */}
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={newItemText[category.id] || ''}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setNewItemText((prev) => ({ ...prev, [category.id]: e.target.value }))
                          }
                          onKeyDown={(e) => handleKeyDown(e, category.id)}
                          placeholder="Ajouter un article..."
                          className="flex-1"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => addItem(category.id)}
                          disabled={!newItemText[category.id]?.trim()}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {categories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🛒</div>
          <p>Aucune categorie disponible.</p>
          <p className="text-sm mt-1">Les categories seront ajoutees automatiquement.</p>
        </div>
      )}
    </div>
  )
}

export default ShoppingListEditor
