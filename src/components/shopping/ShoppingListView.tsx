import { useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ShoppingCategory } from './ShoppingCategory'
import { Button, Input, Card } from '../ui'
import type { ShoppingList, ShoppingCategory as ShoppingCategoryType, ShoppingItem, User } from '../../types'

export interface ShoppingListActions {
  addCategory: (category: Partial<ShoppingCategoryType>) => void
  updateCategory: (categoryId: string, updates: Partial<ShoppingCategoryType>) => void
  removeCategory: (categoryId: string) => void
  addItem: (categoryId: string, item: Partial<ShoppingItem>) => void
  updateItem: (categoryId: string, itemId: string, updates: Partial<ShoppingItem>) => void
  removeItem: (categoryId: string, itemId: string) => void
  toggleItem: (categoryId: string, itemId: string) => void
  assignItem: (categoryId: string, itemId: string, userId: string | null) => void
  clearCheckedItems: () => void
  uncheckAllItems: () => void
  resetToDefault: () => void
  getStats: () => ShoppingStats
}

export interface ShoppingStats {
  totalItems: number
  checkedItems: number
  progress: number
}

export interface ShoppingListViewProps {
  shoppingList: ShoppingList
  users?: User[]
  actions: ShoppingListActions
  onPrint?: () => void
}

/**
 * Vue principale de la liste de courses
 */
export function ShoppingListView({
  shoppingList,
  users = [],
  actions,
  onPrint,
}: ShoppingListViewProps): JSX.Element {
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryIcon, setNewCategoryIcon] = useState('📦')

  const stats = actions.getStats()

  const handleAddCategory = (): void => {
    if (newCategoryName.trim()) {
      actions.addCategory({
        name: newCategoryName.trim(),
        icon: newCategoryIcon,
      })
      setNewCategoryName('')
      setNewCategoryIcon('📦')
      setIsAddingCategory(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleAddCategory()
    }
    if (e.key === 'Escape') {
      setIsAddingCategory(false)
    }
  }

  const sortedCategories = [...shoppingList.categories].sort((a, b) => a.order - b.order)

  return (
    <Card title="Liste de courses" icon="🛒">
      <div className="space-y-6">
        {/* Header stats */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {stats.checkedItems}/{stats.totalItems} articles
            {stats.totalItems > 0 && (
              <span className="ml-2 text-green-600 font-medium">
                ({stats.progress}% complete)
              </span>
            )}
          </p>

          <div className="flex items-center gap-2">
            {stats.checkedItems > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={actions.clearCheckedItems}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Supprimer coches
              </Button>
            )}
            {onPrint && (
              <Button variant="secondary" size="sm" onClick={onPrint}>
                Imprimer
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {stats.totalItems > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-green-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${stats.progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Categories */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {sortedCategories.map((category) => (
              <ShoppingCategory
                key={category.id}
                category={category}
                users={users}
                onUpdateCategory={actions.updateCategory}
                onRemoveCategory={actions.removeCategory}
                onAddItem={actions.addItem}
                onUpdateItem={actions.updateItem}
                onRemoveItem={actions.removeItem}
                onToggleItem={actions.toggleItem}
                onAssignItem={actions.assignItem}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Add Category */}
        {isAddingCategory ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newCategoryIcon}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewCategoryIcon(e.target.value)}
                className="w-12 h-10 text-center text-2xl border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="📦"
                maxLength={2}
              />
              <Input
                value={newCategoryName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewCategoryName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nom de la categorie..."
                autoFocus
                className="flex-1"
              />
              <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
                Ajouter
              </Button>
              <Button variant="ghost" onClick={() => setIsAddingCategory(false)}>
                Annuler
              </Button>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => setIsAddingCategory(true)}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter une categorie
          </button>
        )}

        {/* Empty state */}
        {shoppingList.categories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Votre liste est vide
            </h3>
            <p className="text-gray-500 mb-4">
              Commencez par ajouter une categorie pour organiser vos courses.
            </p>
            <Button onClick={() => setIsAddingCategory(true)}>
              Ajouter une categorie
            </Button>
          </div>
        )}

        {/* Actions rapides */}
        {stats.totalItems > 0 && (
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={actions.uncheckAllItems}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Tout decocher
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={actions.resetToDefault}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Reinitialiser
            </button>
          </div>
        )}
      </div>
    </Card>
  )
}
