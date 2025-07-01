'use client'

import { useState } from 'react'
import { useBudgets } from '@/hooks/useBudgets'
import { BudgetList } from './BudgetList'
import { BudgetForm } from './BudgetForm'
import { BudgetDetail } from './BudgetDetail'
import type { Budget } from '@/lib/types'

export function BudgetDashboard() {
  const { budgets, loading, error, addBudget } = useBudgets()
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [showForm, setShowForm] = useState(false)

  const handleCreateBudget = async (budgetData: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const newBudget = await addBudget(budgetData)
      setSelectedBudget(newBudget)
      setShowForm(false)
    } catch (error) {
      console.error('Error creating budget:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto shadow-lg"></div>
          <p className="mt-6 text-gray-700 font-medium text-lg">Cargando presupuestos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-red-600 text-center">
            <h2 className="text-xl font-bold mb-4">Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {!selectedBudget && !showForm && (
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">💰 Home Budget</h1>
            <p className="text-gray-600">Gestiona tus finanzas personales de manera inteligente</p>
          </div>
        )}

        {selectedBudget ? (
          <BudgetDetail 
            budget={selectedBudget} 
            onBack={() => setSelectedBudget(null)}
          />
        ) : showForm ? (
          <BudgetForm 
            onSubmit={handleCreateBudget}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <BudgetList 
            budgets={budgets}
            onSelectBudget={setSelectedBudget}
            onCreateNew={() => setShowForm(true)}
          />
        )}
      </div>
    </div>
  )
}