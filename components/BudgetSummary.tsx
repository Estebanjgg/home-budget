'use client'

import type { Budget, BudgetSummary as BudgetSummaryType } from '@/lib/types'

interface BudgetSummaryProps {
  budget: Budget
  summary: BudgetSummaryType
}

export function BudgetSummary({ budget, summary }: BudgetSummaryProps) {
  const formatCurrency = (amount: number) => {
    return '$' + new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600'
    if (balance < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getBalanceIcon = (balance: number) => {
    if (balance > 0) return '✅'
    if (balance < 0) return '⚠️'
    return '⚖️'
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        📊 Resumen Financiero
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Ingresos Brutos */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-800">Ingresos Brutos</h3>
            <span className="text-blue-600">💰</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(budget.gross_income)}</p>
        </div>

        {/* Diezmo */}
        {budget.tithe_enabled && (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-purple-800">Diezmo ({budget.tithe_percentage}%)</h3>
              <span className="text-purple-600">🙏</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">-{formatCurrency(summary.titheAmount)}</p>
          </div>
        )}

        {/* Ahorros */}
        {budget.savings_amount > 0 && (
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-indigo-800">Ahorros/Cofre</h3>
              <span className="text-indigo-600">🏦</span>
            </div>
            <p className="text-2xl font-bold text-indigo-600">-{formatCurrency(summary.savingsAmount)}</p>
          </div>
        )}

        {/* Ingresos Netos */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-800">Ingresos Netos</h3>
            <span className="text-green-600">💵</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.netIncome)}</p>
          <p className="text-xs text-green-600 mt-1">Después de diezmo y ahorros</p>
        </div>
      </div>

      {/* Segunda fila */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Ingresos Adicionales */}
        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-emerald-800">Ingresos Adicionales</h3>
            <span className="text-emerald-600">➕</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">+{formatCurrency(summary.totalIncome)}</p>
          <p className="text-xs text-emerald-600 mt-1">Ingresos extra del mes</p>
        </div>

        {/* Total Gastos */}
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-red-800">Total Gastos</h3>
            <span className="text-red-600">💸</span>
          </div>
          <p className="text-2xl font-bold text-red-600">-{formatCurrency(summary.totalExpenses)}</p>
          <p className="text-xs text-red-600 mt-1">Gastos planificados</p>
        </div>

        {/* Saldo Final */}
        <div className={`p-4 rounded-lg border-2 ${
          summary.remainingBalance > 0 
            ? 'bg-green-50 border-green-300' 
            : summary.remainingBalance < 0 
            ? 'bg-red-50 border-red-300'
            : 'bg-gray-50 border-gray-300'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-medium ${
              summary.remainingBalance > 0 
                ? 'text-green-800' 
                : summary.remainingBalance < 0 
                ? 'text-red-800'
                : 'text-gray-800'
            }`}>
              Saldo Final
            </h3>
            <span className="text-2xl">{getBalanceIcon(summary.remainingBalance)}</span>
          </div>
          <p className={`text-3xl font-bold ${getBalanceColor(summary.remainingBalance)}`}>
            {formatCurrency(summary.remainingBalance)}
          </p>
          <p className={`text-xs mt-1 ${
            summary.remainingBalance > 0 
              ? 'text-green-600' 
              : summary.remainingBalance < 0 
              ? 'text-red-600'
              : 'text-gray-600'
          }`}>
            {summary.remainingBalance > 0 
              ? 'Tienes dinero disponible' 
              : summary.remainingBalance < 0 
              ? 'Estás sobrepasando el presupuesto'
              : 'Presupuesto equilibrado'
            }
          </p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-700">Uso del Presupuesto</h3>
          <span className="text-sm text-gray-600">
            {summary.totalExpenses > 0 && summary.netIncome > 0 
              ? `${Math.round((summary.totalExpenses / (summary.netIncome + summary.totalIncome)) * 100)}%`
              : '0%'
            }
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${
              summary.remainingBalance >= 0 ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{ 
              width: `${Math.min(
                100, 
                summary.netIncome + summary.totalIncome > 0 
                  ? (summary.totalExpenses / (summary.netIncome + summary.totalIncome)) * 100 
                  : 0
              )}%` 
            }}
          ></div>
        </div>
      </div>

      {/* Consejos */}
      {summary.remainingBalance < 0 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-red-500 mr-2">⚠️</span>
            <div>
              <h4 className="text-red-800 font-medium">Presupuesto Sobrepasado</h4>
              <p className="text-red-700 text-sm mt-1">
                Tus gastos superan tus ingresos disponibles. Considera reducir algunos gastos o buscar ingresos adicionales.
              </p>
            </div>
          </div>
        </div>
      )}

      {summary.remainingBalance > summary.netIncome * 0.2 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-blue-500 mr-2">💡</span>
            <div>
              <h4 className="text-blue-800 font-medium">Oportunidad de Ahorro</h4>
              <p className="text-blue-700 text-sm mt-1">
                Tienes un buen margen disponible. Considera aumentar tus ahorros o invertir en algo importante.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}