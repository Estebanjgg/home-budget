'use client'

import { useState, useEffect } from 'react'
import { useBudgetItems } from '@/hooks/useBudgetItems'
import { useBudgets } from '@/hooks/useBudgets'
import { BudgetItemForm } from './BudgetItemForm'
import { BudgetSummary } from './BudgetSummary'
import type { Budget, BudgetItem, ExpenseCategory } from '@/lib/types'

// Agregar tipo para las vistas
type ViewMode = 'normal' | 'mosaic' | 'lines'

interface BudgetDetailProps {
  budget: Budget
  onBack: () => void
  onDelete?: (budgetId: string) => Promise<void>
}

export function BudgetDetail({ budget, onBack, onDelete }: BudgetDetailProps) {
  const { items, categories, loading, addItem, editItem, removeItem } = useBudgetItems(budget.id)
  const { calculateSummary, removeBudget, editBudget } = useBudgets()
  const [showItemForm, setShowItemForm] = useState(false)
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null)
  const [summary, setSummary] = useState<any>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  // Nuevo estado para el modo de vista
  const [viewMode, setViewMode] = useState<ViewMode>('normal')

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
    // Para simplificar, he quitado la confirmación, puedes volver a añadirla si quieres.
    try {
      await removeItem(id)
      loadSummary()
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }


  const handleDeleteBudget = async () => {
    setIsDeleting(true)
    try {
      if (onDelete) {
        await onDelete(budget.id)
      } else {
        await removeBudget(budget.id)
        onBack()
      }
      setShowDeleteModal(false)
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

  const handleUpdateBudget = async (updates: Partial<Budget>) => {
    try {
      await editBudget(budget.id, updates)
      Object.assign(budget, updates)
      loadSummary()
    } catch (error) {
      console.error('Error updating budget:', error)
      throw error
    }
  }

  // Función para renderizar gastos según el modo de vista
  const renderExpenseItems = (categoryItems: BudgetItem[], categoryName: string, category: any, totalAmount: number) => {
    if (viewMode === 'mosaic') {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {categoryItems.map((item) => (
            <div key={item.id} className="border border-red-200 rounded-lg p-3 bg-white hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <h5 className="font-medium text-gray-800 text-sm truncate">{item.description}</h5>
                <p className="font-semibold text-red-600">{formatCurrency(item.estimated_amount)}</p>
                {item.due_date && (
                  <p className="text-xs text-gray-600">
                    📅 {new Date(item.due_date).toLocaleDateString('es-CO')}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={item.is_paid}
                      onChange={(e) => handleEditItem(item.id, { is_paid: e.target.checked })}
                      className="mr-1 scale-75"
                    />
                    <span className={`text-xs ${
                      item.is_paid ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {item.is_paid ? '✅ Pagado' : '⏳ Pendiente'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                {item.notes && (
                  <div className="mt-1 p-2 bg-red-50 rounded text-xs border-l-2 border-red-300">
                    <span className="text-red-700">📝</span> {item.notes.substring(0, 40)}{item.notes.length > 40 ? '...' : ''}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (viewMode === 'lines') {
      return (
        <div className="space-y-2">
          {categoryItems.map((item) => (
            <div key={item.id} className="border border-red-200 rounded-lg p-2 bg-white hover:bg-red-50 transition-colors">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={item.is_paid}
                    onChange={(e) => handleEditItem(item.id, { is_paid: e.target.checked })}
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-gray-800 truncate">{item.description}</h5>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      {item.due_date && (
                        <span>📅 {new Date(item.due_date).toLocaleDateString('es-CO')}</span>
                      )}
                      {item.notes && (
                        <span className="truncate">📝 {item.notes.substring(0, 30)}{item.notes.length > 30 ? '...' : ''}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.is_paid ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.is_paid ? '✅' : '⏳'}
                  </span>
                  <p className="font-semibold text-red-600 min-w-[70px] text-right">{formatCurrency(item.estimated_amount)}</p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }

    // Vista normal - más compacta
    return (
      <div className="space-y-2">
        {categoryItems.map((item) => (
          <div key={item.id} className="border border-red-200 rounded-lg p-3 bg-white">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h5 className="font-medium text-gray-800">{item.description}</h5>
                <div className="flex items-center space-x-4 mt-1">
                  {item.due_date && (
                    <p className="text-sm text-gray-600">
                      📅 {new Date(item.due_date).toLocaleDateString('es-CO')}
                    </p>
                  )}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={item.is_paid}
                      onChange={(e) => handleEditItem(item.id, { is_paid: e.target.checked })}
                      className="mr-2"
                    />
                    <span className={`text-sm ${
                      item.is_paid ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {item.is_paid ? '✅ Pagado' : '⏳ Pendiente'}
                    </span>
                  </div>
                </div>
                {item.notes && (
                  <div className="mt-2 p-2 bg-red-50 rounded-md border-l-4 border-red-400">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium text-red-700">📝</span> {item.notes}
                    </p>
                  </div>
                )}
              </div>
              <div className="text-right flex-shrink-0 ml-4">
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
    )
  }

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
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base"
          >
            ← Volver a Presupuestos
          </button>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowItemForm(true)}
              className="bg-green-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base font-medium flex items-center justify-center gap-1 sm:gap-2 w-full sm:w-auto"
            >
              <span className="text-base sm:text-lg">➕</span>
              <span className="hidden xs:inline sm:inline">Agregar Ingreso</span>
              <span className="xs:hidden sm:hidden">Ingreso</span>
            </button>
            
            <button
              onClick={() => setShowItemForm(true)}
              className="bg-red-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base font-medium flex items-center justify-center gap-1 sm:gap-2 w-full sm:w-auto"
            >
              <span className="text-base sm:text-lg">➖</span>
              <span className="hidden xs:inline sm:inline">Agregar Gasto</span>
              <span className="xs:hidden sm:hidden">Gasto</span>
            </button>
            
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-gray-800 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-gray-900 transition-colors text-sm sm:text-base font-medium flex items-center justify-center gap-1 sm:gap-2 w-full sm:w-auto"
              title="Eliminar presupuesto completo"
            >
              <span className="text-base sm:text-lg">🗑️</span>
              <span className="hidden xs:inline sm:inline">Eliminar Presupuesto</span>
              <span className="xs:hidden sm:hidden">Eliminar</span>
            </button>
          </div>
        </div>
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{budget.name}</h1>
          <p className="text-gray-600">{MONTHS[budget.month - 1]} {budget.year}</p>
        </div>
      </div>

      {/* Resumen */}
      {summary && (
        <BudgetSummary 
          budget={budget} 
          summary={summary} 
          onUpdateBudget={handleUpdateBudget}
        />
      )}

      {/* Formulario de ítem */}
      {showItemForm && (
        <BudgetItemForm
          budgetId={budget.id}
          categories={categories}
          onSubmit={handleAddItem}
          onCancel={() => setShowItemForm(false)}
        />
      )}

      {/* Selector de Vista para Gastos */}
      {Object.entries(groupedItems).filter(([key]) => key !== 'income').length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Vista de Gastos</h3>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('normal')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'normal'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📋 Normal
              </button>
              <button
                onClick={() => setViewMode('mosaic')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'mosaic'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🔲 Mosaico
              </button>
              <button
                onClick={() => setViewMode('lines')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'lines'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📄 Líneas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de ítems con layout responsivo mejorado */}
      <div className="space-y-6">
        {/* Layout optimizado: Ingresos arriba, gastos en grid abajo */}
        <div className="space-y-6">
          {/* Sección de Ingresos - Ancho completo */}
          {groupedItems.income && groupedItems.income.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                💰 Ingresos ({groupedItems.income.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedItems.income.map((item) => (
                  <div key={item.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-800">{item.description}</h4>
                      <p className="font-semibold text-green-600 text-lg">{formatCurrency(item.estimated_amount)}</p>
                      {item.due_date && (
                        <p className="text-sm text-gray-600">Fecha: {new Date(item.due_date).toLocaleDateString('es-CO')}</p>
                      )}
                      {item.notes && (
                        <div className="p-2 bg-green-100 rounded-md border-l-4 border-green-400">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium text-green-700">📝</span> {item.notes}
                          </p>
                        </div>
                      )}
                      <div className="flex justify-end gap-1 pt-2">
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
                ))}
              </div>
            </div>
          )}

          {/* Sección de Gastos - Grid optimizado */}
          {Object.entries(groupedItems).filter(([key]) => key !== 'income').length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  💸 Gastos ({Object.entries(groupedItems).filter(([key]) => key !== 'income').reduce((total, [, items]) => total + items.length, 0)})
                </h3>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('normal')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'normal'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    📋 Normal
                  </button>
                  <button
                    onClick={() => setViewMode('mosaic')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'mosaic'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    🔲 Mosaico
                  </button>
                  <button
                    onClick={() => setViewMode('lines')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'lines'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    📄 Líneas
                  </button>
                </div>
              </div>
              
              {/* Grid de categorías de gastos - Máximo 2 columnas para mejor aprovechamiento */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {Object.entries(groupedItems)
                  .filter(([key]) => key !== 'income')
                  .map(([categoryName, categoryItems]) => {
                    const category = categoryItems[0]?.category
                    const totalAmount = categoryItems.reduce((sum, item) => sum + item.estimated_amount, 0)
                    
                    return (
                      <div key={categoryName} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                            {category?.icon} {categoryName} ({categoryItems.length})
                          </h4>
                          <span className="text-red-600 font-bold text-lg">{formatCurrency(totalAmount)}</span>
                        </div>
                        
                        {renderExpenseItems(categoryItems, categoryName, category, totalAmount)}
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
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
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-red-500 max-w-md w-full mx-4 transform transition-all">
            <div className="bg-red-50 rounded-t-2xl p-6 border-b border-red-100">
               {/* ... contenido del modal ... */}
            </div>
            <div className="p-6">
               {/* ... contenido del modal ... */}
            </div>
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
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar presupuesto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )}