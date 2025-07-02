import { supabase } from './config/supabase'

import type { Budget, BudgetItem, ExpenseCategory, BudgetSummary } from './types'

// Funciones para Budgets
export async function createBudget(budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const { data, error } = await supabase
    .from('budgets')
    .insert({
      ...budget,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getBudgets() {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (error) throw error
  return data as Budget[]
}

export async function getBudgetById(id: string) {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Budget
}

export async function updateBudget(id: string, updates: Partial<Budget>) {
  const { data, error } = await supabase
    .from('budgets')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteBudget(id: string) {
  try {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase delete error:', error)
      throw error
    }
  } catch (error) {
    console.error('Delete budget error:', error)
    throw new Error('Error al eliminar el presupuesto. Por favor, inténtalo de nuevo.')
  }
}

// Funciones para Budget Items
export async function getBudgetItems(budgetId: string) {
  const { data, error } = await supabase
    .from('budget_items')
    .select(`
      *,
      category:expense_categories(*)
    `)
    .eq('budget_id', budgetId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as (BudgetItem & { category: ExpenseCategory | null })[]
}

export async function createBudgetItem(item: Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('budget_items')
    .insert(item)
    .select(`
      *,
      category:expense_categories(*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function updateBudgetItem(id: string, updates: Partial<BudgetItem>) {
  const { data, error } = await supabase
    .from('budget_items')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      category:expense_categories(*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function deleteBudgetItem(id: string) {
  const { error } = await supabase
    .from('budget_items')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Funciones para Expense Categories
export async function getExpenseCategories() {
  const { data, error } = await supabase
    .from('expense_categories')
    .select('*')
    .order('name')

  if (error) throw error
  return data as ExpenseCategory[]
}

// Función para calcular resumen del presupuesto
export async function getBudgetSummary(budgetId: string): Promise<BudgetSummary> {
  const [budget, items] = await Promise.all([
    getBudgetById(budgetId),
    getBudgetItems(budgetId)
  ])

  const totalIncome = items
    .filter(item => item.type === 'income')
    .reduce((sum, item) => sum + item.estimated_amount, 0)

  const totalExpenses = items
    .filter(item => item.type === 'expense')
    .reduce((sum, item) => sum + item.estimated_amount, 0)

  const titheAmount = budget.tithe_enabled 
    ? (budget.gross_income * budget.tithe_percentage / 100)
    : 0

  const netIncome = budget.gross_income - titheAmount - budget.savings_amount
  const remainingBalance = netIncome + totalIncome - totalExpenses

  return {
    totalIncome,
    totalExpenses,
    titheAmount,
    savingsAmount: budget.savings_amount,
    remainingBalance,
    netIncome
  }
}

// Función para obtener presupuestos por mes y año
export async function getBudgetByMonthYear(month: number, year: number) {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('month', month)
    .eq('year', year)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
  return data as Budget | null
}