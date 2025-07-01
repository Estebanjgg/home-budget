import { useState } from 'react'
import { useBudgets } from '@/hooks/useBudgets'
import { BudgetList } from './BudgetList'
import { BudgetForm } from './BudgetForm'
import { BudgetDetail } from './BudgetDetail'
import type { Budget } from '@/lib/types'

export function BudgetManager() {
  const { budgets, loading, error, addBudget, removeBudget } = useBudgets()
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

  const handleDeleteBudget = async (budgetId: string) => {
    try {
      await removeBudget(budgetId)
      setSelectedBudget(null) // Regresar a la lista después de eliminar
    } catch (error) {
      console.error('Error deleting budget:', error)
      throw error // Re-lanzar el error para que BudgetDetail pueda manejarlo
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto shadow-lg"></div>
          <p className="mt-6 text-gray-700 font-medium text-lg">Cargando presupuestos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-red-600 text-center">
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">💰 Mis Presupuestos</h1>
        <p className="text-lg text-gray-600 mb-2">Gestiona y organiza todos tus presupuestos</p>
        <p className="text-gray-500">Crea, edita y controla tus presupuestos mensuales</p>
      </div>

      {/* Content */}
      {selectedBudget ? (
        <BudgetDetail 
          budget={selectedBudget} 
          onBack={() => setSelectedBudget(null)}
          onDelete={handleDeleteBudget}
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
  )
}