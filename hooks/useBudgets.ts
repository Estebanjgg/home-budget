import { useState, useEffect } from 'react'
import { 
  getBudgets, 
  createBudget, 
  updateBudget, 
  deleteBudget,
  getBudgetSummary,
  getBudgetByMonthYear
} from '@/lib/budget-queries'
import type { Budget, BudgetSummary } from '@/lib/types'

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBudgets = async () => {
    try {
      setLoading(true)
      const data = await getBudgets()
      setBudgets(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar presupuestos')
    } finally {
      setLoading(false)
    }
  }

  const addBudget = async (budgetData: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const newBudget = await createBudget(budgetData)
      setBudgets(prev => [newBudget, ...prev])
      return newBudget
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear presupuesto')
      throw err
    }
  }

  const editBudget = async (id: string, updates: Partial<Budget>) => {
    try {
      const updatedBudget = await updateBudget(id, updates)
      setBudgets(prev => prev.map(b => b.id === id ? updatedBudget : b))
      return updatedBudget
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar presupuesto')
      throw err
    }
  }

  const removeBudget = async (id: string) => {
    try {
      await deleteBudget(id)
      setBudgets(prev => prev.filter(b => b.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar presupuesto')
      throw err
    }
  }

  const getBudgetForMonth = async (month: number, year: number) => {
    try {
      return await getBudgetByMonthYear(month, year)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar presupuesto')
      return null
    }
  }

  const calculateSummary = async (budgetId: string): Promise<BudgetSummary | null> => {
    try {
      return await getBudgetSummary(budgetId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al calcular resumen')
      return null
    }
  }

  useEffect(() => {
    loadBudgets()
  }, [])

  return {
    budgets,
    loading,
    error,
    addBudget,
    editBudget,
    removeBudget,
    getBudgetForMonth,
    calculateSummary,
    refetch: loadBudgets
  }
}