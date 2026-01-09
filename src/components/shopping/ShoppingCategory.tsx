import { useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ShoppingItem } from './ShoppingItem'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import type { ShoppingCategory as ShoppingCategoryType, ShoppingItem as ShoppingItemType, User } from '../../types'

export interface ShoppingCategoryProps {
  category: ShoppingCategoryType
  users?: User[]
  onUpdateCategory: (categoryId: string, updates: Partial<ShoppingCategoryType>) => void
  onRemoveCategory: (categoryId: string) => void
  onAddItem: (categoryId: string, item: Partial<ShoppingItemType>) => void
  onUpdateItem: (categoryId: string, itemId: string, updates: Partial<ShoppingItemType>) => void
  onRemoveItem: (categoryId: string, itemId: string) => void
  onToggleItem: (categoryId: string, itemId: string) => void
  onAssignItem: (categoryId: string, itemId: string, userId: string | null) => void
}

/**
 * Une categorie de la liste de courses
 */
export function ShoppingCategory({
  category,
  users = [],
  onUpdateCategory,
  onRemoveCategory,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onToggleItem,
  onAssignItem,
}: ShoppingCategoryProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState(category.name)
  const [newItemName, setNewItemName] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const checkedCount = category.items.filter(item => item.isChecked).length
  const totalCount = category.items.length

  const handleSaveName = (): void => {
    onUpdateCategory(category.id, { name: editName })
    setIsEditingName(false)
  }

  const handleAddItem = (): void => {
    if (newItemName.trim()) {
      onAddItem(category.id, { name: newItemName.trim() })
      setNewItemName('')
    }
  }

  const handleKeyDownName = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSaveName()
    }
    if (e.key === 'Escape') {
      setEditName(category.name)
      setIsEditingName(false)
    }
  }

  const handleKeyDownNewItem = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleAddItem()
    }
  }

  const handleConfirmDelete = (): void => {
    onRemoveCategory(category.id)
    setShowDeleteConfirm(false)
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 p-4 bg-gray-50 border-b border-gray-200 cursor-pointer"
          onClick={() => !isEditingName && setIsExpanded(!isExpanded)}
        >
          {/* Expand/Collapse icon */}
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-gray-400"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.div>

          {/* Icon */}
          <span className="text-2xl">{category.icon}</span>

          {/* Name */}
          {isEditingName ? (
            <input
              type="text"
              value={editName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEditName(e.target.value)}
              onKeyDown={handleKeyDownName}
              onBlur={handleSaveName}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              className="flex-1 px-2 py-1 text-lg font-semibold border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <h3
              className="flex-1 text-lg font-semibold text-gray-800"
              onDoubleClick={(e) => {
                e.stopPropagation()
                setIsEditingName(true)
              }}
            >
              {category.name}
            </h3>
          )}

          {/* Count badge */}
          <div className="flex items-center gap-2">
            {totalCount > 0 && (
              <span className={`
                px-2 py-0.5 rounded-full text-xs font-medium
                ${checkedCount === totalCount
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {checkedCount}/{totalCount}
              </span>
            )}

            {/* Edit name button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsEditingName(true)
              }}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>

            {/* Delete category button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowDeleteConfirm(true)
              }}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              aria-label={`Supprimer la categorie ${category.name}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-2">
                {/* Items list */}
                <AnimatePresence>
                  {category.items.map(item => (
                    <ShoppingItem
                      key={item.id}
                      item={item}
                      categoryId={category.id}
                      users={users}
                      onToggle={onToggleItem}
                      onUpdate={onUpdateItem}
                      onRemove={onRemoveItem}
                      onAssign={onAssignItem}
                    />
                  ))}
                </AnimatePresence>

                {/* Empty state */}
                {category.items.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-2">
                    Aucun article dans cette categorie
                  </p>
                )}

                {/* Add item input */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewItemName(e.target.value)}
                    onKeyDown={handleKeyDownNewItem}
                    placeholder="Ajouter un article..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddItem}
                    disabled={!newItemName.trim()}
                    className="px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        title="Supprimer cette categorie ?"
        message={`La categorie "${category.name}" et tous ses articles (${totalCount}) seront definitivement supprimes.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
      />
    </>
  )
}
