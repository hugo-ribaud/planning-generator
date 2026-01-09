/**
 * PrintableShoppingList - Magazine-style shopping list for print
 * Displays categories and items in a compact, elegant format
 */

import type { ShoppingList, ShoppingCategory } from '../../../types'

export interface PrintableShoppingListProps {
  shoppingList: ShoppingList
  maxCategories?: number
}

export function PrintableShoppingList({
  shoppingList,
  maxCategories = 8
}: PrintableShoppingListProps): JSX.Element {
  // Filter categories with items
  const categoriesWithItems = shoppingList.categories
    .filter(cat => cat.items && cat.items.length > 0)
    .slice(0, maxCategories)

  // Calculate stats
  const totalItems = shoppingList.categories.reduce(
    (sum, cat) => sum + (cat.items?.length || 0), 0
  )
  const checkedItems = shoppingList.categories.reduce(
    (sum, cat) => sum + (cat.items?.filter(i => i.checked).length || 0), 0
  )

  if (categoriesWithItems.length === 0) {
    return (
      <div className="printable-shopping-empty p-4 text-center text-gray-400 border border-dashed border-gray-300 rounded-lg">
        <span className="text-2xl">🛒</span>
        <p className="text-sm mt-1">Liste de courses vide</p>
      </div>
    )
  }

  return (
    <div className="printable-shopping-list bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-200 bg-emerald-50 flex items-center justify-between">
        <h3 className="font-serif text-sm font-bold text-gray-900 flex items-center gap-2">
          <span className="text-emerald-600">🛒</span>
          Liste de courses
        </h3>
        <span className="text-xs text-gray-500">
          {checkedItems}/{totalItems} articles
        </span>
      </div>

      {/* Categories grid */}
      <div className="p-3">
        <div className="grid grid-cols-2 gap-3">
          {categoriesWithItems.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        {/* Show count of hidden categories if any */}
        {shoppingList.categories.filter(c => c.items?.length).length > maxCategories && (
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            + {shoppingList.categories.filter(c => c.items?.length).length - maxCategories} autres categories
          </p>
        )}
      </div>
    </div>
  )
}

interface CategoryCardProps {
  category: ShoppingCategory
}

function CategoryCard({ category }: CategoryCardProps): JSX.Element {
  const items = category.items || []
  const checkedCount = items.filter(i => i.checked).length
  const allChecked = items.length > 0 && checkedCount === items.length

  return (
    <div className={`
      rounded-md border p-2
      ${allChecked ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}
    `}>
      {/* Category header */}
      <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-gray-100">
        <span className="text-sm">{category.icon}</span>
        <span className="font-medium text-xs text-gray-800 truncate flex-1">
          {category.name}
        </span>
        <span className="text-[10px] text-gray-400">
          {checkedCount}/{items.length}
        </span>
      </div>

      {/* Items list */}
      <ul className="space-y-0.5">
        {items.slice(0, 5).map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-1.5 text-[11px]"
          >
            {/* Checkbox */}
            <div className={`
              w-3 h-3 rounded-sm border flex-shrink-0 mt-0.5
              flex items-center justify-center
              ${item.checked
                ? 'border-emerald-400 bg-emerald-50'
                : 'border-gray-300 bg-white'
              }
            `}>
              {item.checked && (
                <span className="text-emerald-600 text-[8px]">✓</span>
              )}
            </div>

            {/* Item name */}
            <span className={`
              flex-1 leading-tight
              ${item.checked ? 'text-gray-400 line-through' : 'text-gray-700'}
            `}>
              {item.name}
              {item.quantity && item.quantity > 1 && (
                <span className="text-gray-400 ml-1">×{item.quantity}</span>
              )}
            </span>
          </li>
        ))}

        {/* Show more indicator */}
        {items.length > 5 && (
          <li className="text-[10px] text-gray-400 pt-0.5">
            + {items.length - 5} autres...
          </li>
        )}
      </ul>
    </div>
  )
}
