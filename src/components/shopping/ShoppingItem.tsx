import { useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { motion } from 'motion/react'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import type { ShoppingItem as ShoppingItemType, User } from '../../types'

export interface ShoppingItemProps {
  item: ShoppingItemType
  categoryId: string
  users?: User[]
  onToggle: (categoryId: string, itemId: string) => void
  onUpdate: (categoryId: string, itemId: string, updates: Partial<ShoppingItemType>) => void
  onRemove: (categoryId: string, itemId: string) => void
  onAssign: (categoryId: string, itemId: string, userId: string | null) => void
}

/**
 * Un item de la liste de courses
 */
export function ShoppingItem({
  item,
  categoryId,
  users = [],
  onToggle,
  onUpdate,
  onRemove,
  onAssign,
}: ShoppingItemProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(item.name)
  const [editQuantity, setEditQuantity] = useState(item.quantity || '')
  const [editUnit, setEditUnit] = useState(item.unit || '')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const assignedUser = users.find(u => u.id === item.assignedTo)
  const itemName = item.name || 'Sans nom'

  const handleSave = (): void => {
    onUpdate(categoryId, item.id, {
      name: editName,
      quantity: editQuantity,
      unit: editUnit,
    })
    setIsEditing(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSave()
    }
    if (e.key === 'Escape') {
      setEditName(item.name)
      setEditQuantity(item.quantity || '')
      setEditUnit(item.unit || '')
      setIsEditing(false)
    }
  }

  const handleConfirmDelete = (): void => {
    onRemove(categoryId, item.id)
    setShowDeleteConfirm(false)
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        className={`
          flex items-center gap-3 p-3 rounded-lg border transition-colors
          ${item.isChecked
            ? 'bg-gray-50 border-gray-200'
            : 'bg-white border-gray-200 hover:border-gray-300'
          }
        `}
      >
        {/* Checkbox */}
        <button
          onClick={() => onToggle(categoryId, item.id)}
          className={`
            w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors
            ${item.isChecked
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-green-400'
            }
          `}
        >
          {item.isChecked && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        {isEditing ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={editName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nom de l'article"
              autoFocus
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={editQuantity}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEditQuantity(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Qte"
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={editUnit}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEditUnit(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Unite"
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSave}
              className="p-1 text-green-600 hover:bg-green-50 rounded"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={() => {
                setEditName(item.name)
                setEditQuantity(item.quantity || '')
                setEditUnit(item.unit || '')
                setIsEditing(false)
              }}
              className="p-1 text-gray-400 hover:bg-gray-100 rounded"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div
            className="flex-1 flex items-center gap-2 cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            <span className={`flex-1 ${item.isChecked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {item.name || <span className="text-gray-400 italic">Sans nom</span>}
            </span>
            {(item.quantity || item.unit) && (
              <span className={`text-sm ${item.isChecked ? 'text-gray-400' : 'text-gray-500'}`}>
                {item.quantity}{item.unit && ` ${item.unit}`}
              </span>
            )}
          </div>
        )}

        {/* User badge */}
        {assignedUser && !isEditing && (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
            style={{ backgroundColor: assignedUser.color }}
            title={assignedUser.name}
          >
            {assignedUser.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Actions */}
        {!isEditing && (
          <div className="flex items-center gap-1">
            {/* Assign dropdown */}
            {users.length > 0 && (
              <select
                value={item.assignedTo || ''}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => onAssign(categoryId, item.id, e.target.value || null)}
                className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">-</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            )}

            {/* Delete button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              aria-label={`Supprimer l'article ${itemName}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </motion.div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        title="Supprimer cet article ?"
        message={`L'article "${itemName}" sera supprime de la liste.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
      />
    </>
  )
}
