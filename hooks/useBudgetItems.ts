import { useState, useEffect } from 'react'
import { 
  getBudgetItems, 
  createBudgetItem, 
  updateBudgetItem, 
  deleteBudgetItem,
  getExpenseCategories
} from '@/lib/budget-queries'
import type { BudgetItem, ExpenseCategory } from '@/lib/types'

export function useBudgetItems(budgetId: string | null) {
  const [items, setItems] = useState<(BudgetItem & { category: ExpenseCategory | null })[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadItems = async () => {
    if (!budgetId) {
      setItems([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await getBudgetItems(budgetId)
      setItems(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar ítems')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await getExpenseCategories()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar categorías')
    }
  }

  const addItem = async (itemData: Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newItem = await createBudgetItem(itemData)
      setItems(prev => [...prev, newItem])
      return newItem
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear ítem')
      throw err
    }
  }

  const editItem = async (id: string, updates: Partial<BudgetItem>) => {
    try {
      const updatedItem = await updateBudgetItem(id, updates)
      setItems(prev => prev.map(item => item.id === id ? updatedItem : item))
      return updatedItem
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar ítem')
      throw err
    }
  }

  const removeItem = async (id: string) => {
    try {
      await deleteBudgetItem(id)
      setItems(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar ítem')
      throw err
    }
  }

  useEffect(() => {
    loadItems()
  }, [budgetId])

  useEffect(() => {
    loadCategories()
  }, [])

  return {
    items,
    categories,
    loading,
    error,
    addItem,
    editItem,
    removeItem,
    refetch: loadItems
  }
}