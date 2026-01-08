import { useState, useCallback } from 'react'

/**
 * Categories par defaut pour une liste de courses
 */
const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Fruits & Legumes', icon: '🥬', order: 0, items: [] },
  { id: '2', name: 'Viandes & Poissons', icon: '🥩', order: 1, items: [] },
  { id: '3', name: 'Produits Laitiers', icon: '🧀', order: 2, items: [] },
  { id: '4', name: 'Boulangerie', icon: '🥖', order: 3, items: [] },
  { id: '5', name: 'Epicerie', icon: '🥫', order: 4, items: [] },
  { id: '6', name: 'Hygiene & Maison', icon: '🧴', order: 5, items: [] },
  { id: '7', name: 'Surgeles', icon: '❄️', order: 6, items: [] },
  { id: '8', name: 'Boissons', icon: '🍷', order: 7, items: [] },
]

/**
 * Hook pour la gestion des listes de courses
 * @param {Object} initialList - Liste initiale (optionnel)
 */
export function useShoppingList(initialList = null) {
  const [shoppingList, setShoppingList] = useState(() => {
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
  const updateTitle = useCallback((title) => {
    setShoppingList(prev => ({
      ...prev,
      title,
      updated_at: new Date().toISOString(),
    }))
  }, [])

  /**
   * Ajoute une nouvelle categorie
   */
  const addCategory = useCallback((category) => {
    const newCategory = {
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
  const updateCategory = useCallback((categoryId, updates) => {
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
  const removeCategory = useCallback((categoryId) => {
    setShoppingList(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat.id !== categoryId),
      updated_at: new Date().toISOString(),
    }))
  }, [])

  /**
   * Reordonne les categories
   */
  const reorderCategories = useCallback((newOrder) => {
    setShoppingList(prev => ({
      ...prev,
      categories: newOrder.map((id, index) => {
        const cat = prev.categories.find(c => c.id === id)
        return cat ? { ...cat, order: index } : null
      }).filter(Boolean),
      updated_at: new Date().toISOString(),
    }))
  }, [])

  /**
   * Ajoute un item a une categorie
   */
  const addItem = useCallback((categoryId, item) => {
    const newItem = {
      id: crypto.randomUUID(),
      name: item.name || '',
      quantity: item.quantity || '1',
      unit: item.unit || '',
      is_checked: false,
      assigned_to: item.assigned_to || null,
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
  const updateItem = useCallback((categoryId, itemId, updates) => {
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
  const removeItem = useCallback((categoryId, itemId) => {
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
  const toggleItem = useCallback((categoryId, itemId) => {
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
  const assignItem = useCallback((categoryId, itemId, userId) => {
    updateItem(categoryId, itemId, { assigned_to: userId })
  }, [updateItem])

  /**
   * Deplace un item vers une autre categorie
   */
  const moveItem = useCallback((fromCategoryId, toCategoryId, itemId) => {
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
  const clearCheckedItems = useCallback(() => {
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
  const uncheckAllItems = useCallback(() => {
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
  const resetToDefault = useCallback(() => {
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
  const loadShoppingList = useCallback((list) => {
    if (list) {
      setShoppingList(list)
    }
  }, [])

  /**
   * Retourne les statistiques de la liste
   */
  const getStats = useCallback(() => {
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
