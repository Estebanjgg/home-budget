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
    <div className="space-y-6 sm:space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">💰 Mis Presupuestos</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Gestiona y organiza tus finanzas</p>
        </div>
        <button
          onClick={onCreateNew}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          ➕ Nuevo Presupuesto
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="w-full">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Buscar presupuesto
            </label>
            <input
              type="text"
              placeholder="Buscar por nombre o categoría..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Filtrar por
              </label>
              <select
                value={filters.filterBy}
                onChange={(e) => setFilters(prev => ({ ...prev, filterBy: e.target.value as any }))}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="all">Todos</option>
                <option value="current_month">Mes actual</option>
                <option value="current_year">Año actual</option>
                <option value="upcoming">Próximos</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="date_newest">Fecha (más reciente)</option>
                <option value="date_oldest">Fecha (más antiguo)</option>
                <option value="name_asc">Nombre (A-Z)</option>
                <option value="name_desc">Nombre (Z-A)</option>
                <option value="amount_desc">Monto (mayor)</option>
                <option value="amount_asc">Monto (menor)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-xs sm:text-sm text-gray-500">
              {filteredAndSortedBudgets.length} presupuesto{filteredAndSortedBudgets.length !== 1 ? 's' : ''} encontrado{filteredAndSortedBudgets.length !== 1 ? 's' : ''}
            </span>
            {(filters.searchTerm || filters.filterBy !== 'all') && (
              <button
                onClick={() => setFilters({ sortBy: 'date_newest', filterBy: 'all', searchTerm: '' })}
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

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
        <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center">
          <div className="text-4xl sm:text-6xl mb-4">🔍</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No se encontraron presupuestos</h3>
          <p className="text-sm sm:text-base text-gray-500 mb-6 px-4">Intenta ajustar los filtros o crear un nuevo presupuesto</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setFilters({ sortBy: 'date_newest', filterBy: 'all', searchTerm: '' })}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              🔄 Limpiar Filtros
            </button>
            <button
              onClick={onCreateNew}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm sm:text-base"
            >
              ➕ Nuevo Presupuesto
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredAndSortedBudgets.map((budget) => {
            const status = getBudgetStatus(budget)
            const availableAmount = getAvailableAmount(budget)
            
            return (
              <div
                key={budget.id}
                onClick={() => onSelectBudget(budget)}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 sm:hover:-translate-y-2 border border-gray-100 overflow-hidden"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0 pr-3">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 truncate">{budget.name}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {MONTHS[budget.month - 1]} {budget.year}
                        </p>
                        <span className={`text-xs font-medium ${status.color} self-start sm:self-auto`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                      <span className="text-xl sm:text-2xl">💰</span>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600">Ingresos Brutos:</span>
                      <span className="font-semibold text-green-600 text-sm sm:text-base truncate ml-2">
                        {formatCurrency(budget.gross_income)}
                      </span>
                    </div>

                    {budget.tithe_enabled && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-gray-600">Diezmo ({budget.tithe_percentage}%):</span>
                        <span className="font-medium text-blue-600 text-sm sm:text-base truncate ml-2">
                          {formatCurrency(budget.gross_income * budget.tithe_percentage / 100)}
                        </span>
                      </div>
                    )}

                    {budget.savings_amount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-gray-600">Ahorros:</span>
                        <span className="font-medium text-purple-600 text-sm sm:text-base truncate ml-2">
                          {formatCurrency(budget.savings_amount)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600">Disponible:</span>
                      <span className={`font-bold text-base sm:text-lg truncate ml-2 ${
                        availableAmount >= 0 ? 'text-gray-800' : 'text-red-600'
                      }`}>
                        {formatCurrency(availableAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 sm:px-6 py-2 sm:py-3">
                  <p className="text-xs sm:text-sm text-gray-600 text-center">
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