import { useState, useCallback } from 'react'
import type { ShoppingList, ShoppingCategory, ShoppingItem } from '../types'

/**
 * Categories par defaut pour une liste de courses
 */
const DEFAULT_CATEGORIES: Omit<ShoppingCategory, 'id'>[] = [
  { name: 'Fruits & Legumes', icon: '🥬', order: 0, items: [] },
  { name: 'Viandes & Poissons', icon: '🥩', order: 1, items: [] },
  { name: 'Produits Laitiers', icon: '🧀', order: 2, items: [] },
  { name: 'Boulangerie', icon: '🥖', order: 3, items: [] },
  { name: 'Epicerie', icon: '🥫', order: 4, items: [] },
  { name: 'Hygiene & Maison', icon: '🧴', order: 5, items: [] },
  { name: 'Surgeles', icon: '❄️', order: 6, items: [] },
  { name: 'Boissons', icon: '🍷', order: 7, items: [] },
]

export interface ShoppingListStats {
  totalItems: number
  checkedItems: number
  uncheckedItems: number
  progress: number
  categoriesCount: number
  emptyCategoriesCount: number
}

export interface UseShoppingListReturn {
  shoppingList: ShoppingList
  // Title
  updateTitle: (title: string) => void
  // Categories CRUD
  addCategory: (category: Partial<ShoppingCategory>) => ShoppingCategory
  updateCategory: (categoryId: string, updates: Partial<ShoppingCategory>) => void
  removeCategory: (categoryId: string) => void
  reorderCategories: (newOrder: string[]) => void
  // Items CRUD
  addItem: (categoryId: string, item: Partial<ShoppingItem>) => ShoppingItem
  updateItem: (categoryId: string, itemId: string, updates: Partial<ShoppingItem>) => void
  removeItem: (categoryId: string, itemId: string) => void
  toggleItem: (categoryId: string, itemId: string) => void
  assignItem: (categoryId: string, itemId: string, userId: string | null) => void
  moveItem: (fromCategoryId: string, toCategoryId: string, itemId: string) => void
  // Bulk operations
  clearCheckedItems: () => void
  uncheckAllItems: () => void
  resetToDefault: () => void
  // Load
  loadShoppingList: (list: ShoppingList | null) => void
  // Stats
  getStats: () => ShoppingListStats
  // Default categories for reference
  DEFAULT_CATEGORIES: typeof DEFAULT_CATEGORIES
}

/**
 * Hook pour la gestion des listes de courses
 */
export function useShoppingList(initialList: ShoppingList | null = null): UseShoppingListReturn {
  const [shoppingList, setShoppingList] = useState<ShoppingList>(() => {
    if (initialList) {
      return initialList
    }
    return {
      id: crypto.randomUUID(),
      title: 'Liste de courses',
      categories: DEFAULT_CATEGORIES.map(cat => ({ ...cat, id: crypto.randomUUID() })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  })

  /**
   * Met a jour le titre de la liste
   */
  const updateTitle = useCallback((title: string): void => {
    setShoppingList(prev => ({
      ...prev,
      title,
      updated_at: new Date().toISOString(),
    }))
  }, [])

  /**
   * Ajoute une nouvelle categorie
   */
  const addCategory = useCallback((category: Partial<ShoppingCategory>): ShoppingCategory => {
    const newCategory: ShoppingCategory = {
      id: crypto.randomUUID(),
      name: category.name || 'Nouvelle categorie',
      icon: category.icon || '📦',
      order: shoppingList.categories.length,
      items: [],
    }

    setShoppingList(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory],
      updated_at: new Date().toISOString(),
    }))

    return newCategory
  }, [shoppingList.categories.length])

  /**
   * Met a jour une categorie
   */
  const updateCategory = useCallback((categoryId: string, updates: Partial<ShoppingCategory>): void => {
    setShoppingList(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId ? { ...cat, ...updates } : cat
      ),
      updated_at: new Date().toISOString(),
    }))
  }, [])

  /**
   * Supprime une categorie
   */
  const removeCategory = useCallback((categoryId: string): void => {
    setShoppingList(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat.id !== categoryId),
      updated_at: new Date().toISOString(),
    }))
  }, [])

  /**
   * Reordonne les categories
   */
  const reorderCategories = useCallback((newOrder: string[]): void => {
    setShoppingList(prev => ({
      ...prev,
      categories: newOrder.map((id, index) => {
        const cat = prev.categories.find(c => c.id === id)
        return cat ? { ...cat, order: index } : null
      }).filter((cat): cat is ShoppingCategory => cat !== null),
      updated_at: new Date().toISOString(),
    }))
  }, [])

  /**
   * Ajoute un item a une categorie
   */
  const addItem = useCallback((categoryId: string, item: Partial<ShoppingItem>): ShoppingItem => {
    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      name: item.name || '',
      quantity: item.quantity || '1',
      unit: item.unit || '',
      is_checked: false,
      assigned_to: item.assigned_to || undefined,
      notes: item.notes || '',
    }

    setShoppingList(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, items: [...cat.items, newItem] }
          : cat
      ),
      updated_at: new Date().toISOString(),
    }))

    return newItem
  }, [])

  /**
   * Met a jour un item
   */
  const updateItem = useCallback((categoryId: string, itemId: string, updates: Partial<ShoppingItem>): void => {
    setShoppingList(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map(item =>
                item.id === itemId ? { ...item, ...updates } : item
              ),
            }
          : cat
      ),
      updated_at: new Date().toISOString(),
    }))
  }, [])

  /**
   * Supprime un item
   */
  const removeItem = useCallback((categoryId: string, itemId: string): void => {
    setShoppingList(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, items: cat.items.filter(item => item.id !== itemId) }
          : cat
      ),
      updated_at: new Date().toISOString(),
    }))
  }, [])

  /**
   * Toggle le statut checked d'un item
   */
  const toggleItem = useCallback((categoryId: string, itemId: string): void => {
    setShoppingList(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map(item =>
                item.id === itemId ? { ...item, is_checked: !item.is_checked } : item
              ),
            }
          : cat
      ),
      updated_at: new Date().toISOString(),
    }))
  }, [])

  /**
   * Assigne un item a un utilisateur
   */
  const assignItem = useCallback((categoryId: string, itemId: string, userId: string | null): void => {
    updateItem(categoryId, itemId, { assigned_to: userId || undefined })
  }, [updateItem])

  /**
   * Deplace un item vers une autre categorie
   */
  const moveItem = useCallback((fromCategoryId: string, toCategoryId: string, itemId: string): void => {
    setShoppingList(prev => {
      const fromCat = prev.categories.find(c => c.id === fromCategoryId)
      const item = fromCat?.items.find(i => i.id === itemId)

      if (!item) return prev

      return {
        ...prev,
        categories: prev.categories.map(cat => {
          if (cat.id === fromCategoryId) {
            return { ...cat, items: cat.items.filter(i => i.id !== itemId) }
          }
          if (cat.id === toCategoryId) {
            return { ...cat, items: [...cat.items, item] }
          }
          return cat
        }),
        updated_at: new Date().toISOString(),
      }
    })
  }, [])

  /**
   * Vide tous les items coches
   */
  const clearCheckedItems = useCallback((): void => {
    setShoppingList(prev => ({
      ...prev,
      categories: prev.categories.map(cat => ({
        ...cat,
        items: cat.items.filter(item => !item.is_checked),
      })),
      updated_at: new Date().toISOString(),
    }))
  }, [])

  /**
   * Decoche tous les items
   */
  const uncheckAllItems = useCallback((): void => {
    setShoppingList(prev => ({
      ...prev,
      categories: prev.categories.map(cat => ({
        ...cat,
        items: cat.items.map(item => ({ ...item, is_checked: false })),
      })),
      updated_at: new Date().toISOString(),
    }))
  }, [])

  /**
   * Reinitialise la liste avec les categories par defaut
   */
  const resetToDefault = useCallback((): void => {
    setShoppingList({
      id: crypto.randomUUID(),
      title: 'Liste de courses',
      categories: DEFAULT_CATEGORIES.map(cat => ({ ...cat, id: crypto.randomUUID() })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }, [])

  /**
   * Charge une liste existante
   */
  const loadShoppingList = useCallback((list: ShoppingList | null): void => {
    if (list) {
      setShoppingList(list)
    }
  }, [])

  /**
   * Retourne les statistiques de la liste
   */
  const getStats = useCallback((): ShoppingListStats => {
    const allItems = shoppingList.categories.flatMap(cat => cat.items)
    const checkedItems = allItems.filter(item => item.is_checked)

    return {
      totalItems: allItems.length,
      checkedItems: checkedItems.length,
      uncheckedItems: allItems.length - checkedItems.length,
      progress: allItems.length > 0
        ? Math.round((checkedItems.length / allItems.length) * 100)
        : 0,
      categoriesCount: shoppingList.categories.length,
      emptyCategoriesCount: shoppingList.categories.filter(cat => cat.items.length === 0).length,
    }
  }, [shoppingList])

  return {
    shoppingList,
    // Title
    updateTitle,
    // Categories CRUD
    addCategory,
    updateCategory,
    removeCategory,
    reorderCategories,
    // Items CRUD
    addItem,
    updateItem,
    removeItem,
    toggleItem,
    assignItem,
    moveItem,
    // Bulk operations
    clearCheckedItems,
    uncheckAllItems,
    resetToDefault,
    // Load
    loadShoppingList,
    // Stats
    getStats,
    // Default categories for reference
    DEFAULT_CATEGORIES,
  }
}
