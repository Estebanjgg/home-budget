'use client'

import { useState, useMemo } from 'react'
import type { Budget } from '@/lib/types'
import { BudgetFilters } from './BudgetFilters'
import type { BudgetFilters as BudgetFiltersType } from './BudgetFilters'

interface BudgetListProps {
  budgets: Budget[]
  onSelectBudget: (budget: Budget) => void
  onCreateNew: () => void
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export function BudgetList({ budgets, onSelectBudget, onCreateNew }: BudgetListProps) {
  const [filters, setFilters] = useState<BudgetFiltersType>({
    sortBy: 'date_newest',
    filterBy: 'all',
    searchTerm: ''
  })

  const formatCurrency = (amount: number) => {
    return '$' + new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const filteredAndSortedBudgets = useMemo(() => {
    let filtered = [...budgets]
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    // Aplicar filtros
    switch (filters.filterBy) {
      case 'current_month':
        filtered = filtered.filter(b => b.month === currentMonth && b.year === currentYear)
        break
      case 'current_year':
        filtered = filtered.filter(b => b.year === currentYear)
        break
      case 'upcoming':
        filtered = filtered.filter(b => {
          const budgetDate = new Date(b.year, b.month - 1)
          const currentDateStart = new Date(currentYear, currentMonth - 1)
          return budgetDate >= currentDateStart
        })
        break
      case 'specific_month':
        if (filters.specificMonth && filters.specificYear) {
          filtered = filtered.filter(b => 
            b.month === filters.specificMonth && b.year === filters.specificYear
          )
        } else if (filters.specificMonth) {
          filtered = filtered.filter(b => b.month === filters.specificMonth)
        } else if (filters.specificYear) {
          filtered = filtered.filter(b => b.year === filters.specificYear)
        }
        break
    }

    // Aplicar búsqueda
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(b => 
        b.name.toLowerCase().includes(searchLower) ||
        `${MONTHS[b.month - 1]} ${b.year}`.toLowerCase().includes(searchLower)
      )
    }

    // Aplicar ordenamiento
    switch (filters.sortBy) {
      case 'date_newest':
        filtered.sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year
          return b.month - a.month
        })
        break
      case 'date_oldest':
        filtered.sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year
          return a.month - b.month
        })
        break
      case 'month_asc':
        filtered.sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year
          return a.month - b.month
        })
        break
      case 'month_desc':
        filtered.sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year
          return b.month - a.month
        })
        break
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name_desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'amount_asc':
        filtered.sort((a, b) => a.gross_income - b.gross_income)
        break
      case 'amount_desc':
        filtered.sort((a, b) => b.gross_income - a.gross_income)
        break
    }

    return filtered
  }, [budgets, filters])

  const getAvailableAmount = (budget: Budget) => {
    return budget.gross_income - 
           (budget.tithe_enabled ? budget.gross_income * budget.tithe_percentage / 100 : 0) - 
           budget.savings_amount
  }

  const getBudgetStatus = (budget: Budget) => {
    const currentDate = new Date()
    const budgetDate = new Date(budget.year, budget.month - 1)
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth())
    
    if (budgetDate < currentMonthStart) {
      return { status: 'past', label: '📅 Pasado', color: 'text-gray-500' }
    } else if (budgetDate.getTime() === currentMonthStart.getTime()) {
      return { status: 'current', label: '🔥 Actual', color: 'text-green-600' }
    } else {
      return { status: 'future', label: '⏭️ Futuro', color: 'text-blue-600' }
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">💰 Mis Presupuestos</h2>
          <p className="text-gray-600 mt-1">Gestiona y organiza tus finanzas</p>
        </div>
        <button
          onClick={onCreateNew}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          ➕ Nuevo Presupuesto
        </button>
      </div>

      {/* Filtros */}
      <BudgetFilters 
        onFilterChange={setFilters} 
        totalBudgets={filteredAndSortedBudgets.length}
      />

      {/* Lista de presupuestos */}
      {budgets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No tienes presupuestos aún</h3>
          <p className="text-gray-500 mb-6">Crea tu primer presupuesto para comenzar a gestionar tus finanzas</p>
          <button
            onClick={onCreateNew}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            Crear Mi Primer Presupuesto
          </button>
        </div>
      ) : filteredAndSortedBudgets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron presupuestos</h3>
          <p className="text-gray-500 mb-6">Intenta ajustar los filtros o crear un nuevo presupuesto</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setFilters({ sortBy: 'date_newest', filterBy: 'all', searchTerm: '' })}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
            >
              🔄 Limpiar Filtros
            </button>
            <button
              onClick={onCreateNew}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              ➕ Nuevo Presupuesto
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedBudgets.map((budget) => {
            const status = getBudgetStatus(budget)
            const availableAmount = getAvailableAmount(budget)
            
            return (
              <div
                key={budget.id}
                onClick={() => onSelectBudget(budget)}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">{budget.name}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500">
                          {MONTHS[budget.month - 1]} {budget.year}
                        </p>
                        <span className={`text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-2 rounded-lg">
                      <span className="text-2xl">💰</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Ingresos Brutos:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(budget.gross_income)}
                      </span>
                    </div>

                    {budget.tithe_enabled && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Diezmo ({budget.tithe_percentage}%):</span>
                        <span className="font-medium text-blue-600">
                          {formatCurrency(budget.gross_income * budget.tithe_percentage / 100)}
                        </span>
                      </div>
                    )}

                    {budget.savings_amount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Ahorros:</span>
                        <span className="font-medium text-purple-600">
                          {formatCurrency(budget.savings_amount)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Disponible:</span>
                      <span className={`font-bold text-lg ${
                        availableAmount >= 0 ? 'text-gray-800' : 'text-red-600'
                      }`}>
                        {formatCurrency(availableAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3">
                  <p className="text-sm text-gray-600 text-center">
                    Clic para ver detalles →
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}