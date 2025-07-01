'use client'

import { useState, useEffect } from 'react'
import { useBudgetItems } from '@/hooks/useBudgetItems'
import { useBudgets } from '@/hooks/useBudgets'
import { BudgetItemForm } from './BudgetItemForm'
import { BudgetSummary } from './BudgetSummary'
import type { Budget, BudgetItem, ExpenseCategory } from '@/lib/types'

interface BudgetDetailProps {
  budget: Budget
  onBack: () => void
}

export function BudgetDetail({ budget, onBack }: BudgetDetailProps) {
  const { items, categories, loading, addItem, editItem, removeItem } = useBudgetItems(budget.id)
  const { calculateSummary, removeBudget } = useBudgets()
  const [showItemForm, setShowItemForm] = useState(false)
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null)
  const [summary, setSummary] = useState<any>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadSummary = async () => {
    const summaryData = await calculateSummary(budget.id)
    setSummary(summaryData)
  }

  useEffect(() => {
    loadSummary()
  }, [items, budget.id])

  const handleAddItem = async (itemData: Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await addItem(itemData)
      setShowItemForm(false)
      loadSummary()
    } catch (error) {
      console.error('Error adding item:', error)
    }
  }

  const handleEditItem = async (id: string, updates: Partial<BudgetItem>) => {
    try {
      await editItem(id, updates)
      setEditingItem(null)
      loadSummary()
    } catch (error) {
      console.error('Error editing item:', error)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este ítem?')) {
      try {
        await removeItem(id)
        loadSummary()
      } catch (error) {
        console.error('Error deleting item:', error)
      }
    }
  }

  const handleDeleteBudget = async () => {
    setIsDeleting(true)
    try {
      await removeBudget(budget.id)
      setShowDeleteModal(false)
      onBack() // Regresar al dashboard después de eliminar
    } catch (error) {
      console.error('Error deleting budget:', error)
      alert('Error al eliminar el presupuesto. Por favor, inténtalo de nuevo.')
    } finally {
      setIsDeleting(false)
    }
  }

  const groupedItems = items.reduce((acc, item) => {
    const key = item.type === 'income' ? 'income' : item.category?.name || 'Sin categoría'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {} as Record<string, typeof items>)

  const formatCurrency = (amount: number) => {
    return '$' + new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Volver a Presupuestos
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setShowItemForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              ➕ Agregar Ingreso
            </button>
            <button
              onClick={() => setShowItemForm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              ➖ Agregar Gasto
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
              title="Eliminar presupuesto completo"
            >
              🗑️ Eliminar Presupuesto
            </button>
          </div>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{budget.name}</h1>
          <p className="text-gray-600">{MONTHS[budget.month - 1]} {budget.year}</p>
        </div>
      </div>

      {/* Resumen */}
      {summary && <BudgetSummary budget={budget} summary={summary} />}

      {/* Formulario de ítem */}
      {showItemForm && (
        <BudgetItemForm
          budgetId={budget.id}
          categories={categories}
          onSubmit={handleAddItem}
          onCancel={() => setShowItemForm(false)}
        />
      )}

      {/* Lista de ítems agrupados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingresos */}
        {groupedItems.income && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-green-600 mb-4 flex items-center">
              💰 Ingresos ({groupedItems.income.length})
            </h3>
            <div className="space-y-3">
              {groupedItems.income.map((item) => (
                <div key={item.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{item.description}</h4>
                      {item.due_date && (
                        <p className="text-sm text-gray-600">Fecha: {new Date(item.due_date).toLocaleDateString('es-CO')}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{formatCurrency(item.estimated_amount)}</p>
                      <div className="flex gap-1 mt-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gastos por categoría */}
        <div className="space-y-6">
          {Object.entries(groupedItems)
            .filter(([key]) => key !== 'income')
            .map(([categoryName, categoryItems]) => {
              const category = categoryItems[0]?.category
              const totalAmount = categoryItems.reduce((sum, item) => sum + item.estimated_amount, 0)
              
              return (
                <div key={categoryName} className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center justify-between">
                    <span className="flex items-center">
                      {category?.icon} {categoryName} ({categoryItems.length})
                    </span>
                    <span className="text-red-600 font-bold">{formatCurrency(totalAmount)}</span>
                  </h3>
                  
                  <div className="space-y-3">
                    {categoryItems.map((item) => (
                      <div key={item.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{item.description}</h4>
                            {item.due_date && (
                              <p className="text-sm text-gray-600">
                                Vence: {new Date(item.due_date).toLocaleDateString('es-CO')}
                              </p>
                            )}
                            <div className="flex items-center mt-1">
                              <input
                                type="checkbox"
                                checked={item.is_paid}
                                onChange={(e) => handleEditItem(item.id, { is_paid: e.target.checked })}
                                className="mr-2"
                              />
                              <span className={`text-sm ${
                                item.is_paid ? 'text-green-600' : 'text-gray-600'
                              }`}>
                                {item.is_paid ? 'Pagado' : 'Pendiente'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-red-600">{formatCurrency(item.estimated_amount)}</p>
                            <div className="flex gap-1 mt-2">
                              <button
                                onClick={() => setEditingItem(item)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* Formulario de edición */}
      {editingItem && (
        <BudgetItemForm
          budgetId={budget.id}
          categories={categories}
          initialData={editingItem}
          onSubmit={(data) => handleEditItem(editingItem.id, data)}
          onCancel={() => setEditingItem(null)}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            {/* Header del modal */}
            <div className="bg-red-50 rounded-t-2xl p-6 border-b border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-800">Eliminar Presupuesto</h3>
                  <p className="text-red-600 text-sm">Esta acción no se puede deshacer</p>
                </div>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">¿Estás seguro de eliminar este presupuesto?</h4>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="font-medium text-gray-800">{budget.name}</p>
                  <p className="text-gray-600 text-sm">{MONTHS[budget.month - 1]} {budget.year}</p>
                </div>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">•</span>
                    <span>Se eliminarán todos los ingresos registrados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">•</span>
                    <span>Se eliminarán todos los gastos registrados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">•</span>
                    <span>Se perderá todo el historial de este presupuesto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">•</span>
                    <span>Esta acción es <strong>irreversible</strong></span>
                  </div>
                </div>
              </div>

              {/* Estadísticas del presupuesto */}
              {summary && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h5 className="font-medium text-blue-800 mb-2">Resumen del presupuesto:</h5>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-blue-600">Total ingresos:</span>
                      <p className="font-semibold text-green-600">{formatCurrency(summary.totalIncome || 0)}</p>
                    </div>
                    <div>
                      <span className="text-blue-600">Total gastos:</span>
                      <p className="font-semibold text-red-600">{formatCurrency(summary.totalExpenses || 0)}</p>
                    </div>
                    <div>
                      <span className="text-blue-600">Items totales:</span>
                      <p className="font-semibold text-gray-700">{items.length} elementos</p>
                    </div>
                    <div>
                      <span className="text-blue-600">Balance:</span>
                      <p className={`font-semibold ${
                        (summary.totalIncome || 0) - (summary.totalExpenses || 0) >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {formatCurrency((summary.totalIncome || 0) - (summary.totalExpenses || 0))}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="bg-gray-50 rounded-b-2xl p-6 flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteBudget}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Eliminando...
                  </>
                ) : (
                  <>
                    🗑️ Sí, eliminar presupuesto
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}