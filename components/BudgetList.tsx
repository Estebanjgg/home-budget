'use client'

import type { Budget } from '@/lib/types'

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
  const formatCurrency = (amount: number) => {
    return '$' + new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Botón para crear nuevo presupuesto */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Presupuestos Recientes</h2>
        <button
          onClick={onCreateNew}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          ➕ Nuevo Presupuesto
        </button>
      </div>

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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => (
            <div
              key={budget.id}
              onClick={() => onSelectBudget(budget)}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-gray-100"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{budget.name}</h3>
                    <p className="text-sm text-gray-500">
                      {MONTHS[budget.month - 1]} {budget.year}
                    </p>
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
                    <span className="font-bold text-lg text-gray-800">
                      {formatCurrency(
                        budget.gross_income - 
                        (budget.tithe_enabled ? budget.gross_income * budget.tithe_percentage / 100 : 0) - 
                        budget.savings_amount
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3 rounded-b-xl">
                <p className="text-sm text-gray-600 text-center">
                  Clic para ver detalles →
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}