import React from 'react'
import type { Budget } from '@/lib/types'

interface MetricsOverviewProps {
  dashboardMetrics: {
    totalIncome: number
    totalExpenses: number
    totalSavings: number
    totalTithe: number
    budgetCount: number
    averageMonthlyIncome: number
    averageMonthlyExpenses: number
    savingsRate: number
    expenseRatio: number
  }
  groceryMetrics: {
    totalSpent: number
    budgetTotal: number
    averageMonthly: number
    percentageOfIncome: number
    efficiency: number
  }
  formatCurrency: (amount: number) => string
}

export function MetricsOverview({ dashboardMetrics, groceryMetrics, formatCurrency }: MetricsOverviewProps) {
  const balance = dashboardMetrics.totalIncome - dashboardMetrics.totalExpenses
  const isPositiveBalance = balance >= 0
  
  // Calcular métricas combinadas
  const groceryPercentage = dashboardMetrics.totalIncome > 0 ? (groceryMetrics.totalSpent / dashboardMetrics.totalIncome) * 100 : 0
  const remainingBudget = dashboardMetrics.totalIncome - dashboardMetrics.totalExpenses - dashboardMetrics.totalSavings
  
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Métricas Principales Unificadas */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-100">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 leading-tight">
            Resumen Financiero Integral
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed">Presupuestos + Supermercado = Control Total</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Ingresos Totales */}
          <div className="bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300 border border-green-300">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-green-100 text-xs sm:text-sm font-medium mb-1">💰 Ingresos Totales</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{formatCurrency(dashboardMetrics.totalIncome)}</p>
                <p className="text-green-100 text-xs mt-1 sm:mt-2 leading-tight">
                  Promedio: {formatCurrency(dashboardMetrics.averageMonthlyIncome)}/mes
                </p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-2 sm:p-3 flex-shrink-0">
                <span className="text-lg sm:text-2xl">📈</span>
              </div>
            </div>
          </div>

          {/* Gastos Totales (incluyendo supermercado) */}
          <div className="bg-gradient-to-br from-red-400 via-red-500 to-red-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300 border border-red-300">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-red-100 text-xs sm:text-sm font-medium mb-1">💸 Gastos Totales</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{formatCurrency(dashboardMetrics.totalExpenses)}</p>
                <p className="text-red-100 text-xs mt-1 sm:mt-2 leading-tight">
                  Supermercado: {formatCurrency(groceryMetrics.totalSpent)} ({groceryPercentage.toFixed(1)}%)
                </p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-2 sm:p-3 flex-shrink-0">
                <span className="text-lg sm:text-2xl">🛒</span>
              </div>
            </div>
          </div>

          {/* Ahorros y Eficiencia */}
          <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300 border border-blue-300">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-blue-100 text-xs sm:text-sm font-medium mb-1">🏦 Ahorros + Eficiencia</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{formatCurrency(dashboardMetrics.totalSavings)}</p>
                <p className="text-blue-100 text-xs mt-1 sm:mt-2 leading-tight">
                  Tasa: {dashboardMetrics.savingsRate.toFixed(1)}% | Efic. Super: {groceryMetrics.efficiency.toFixed(1)}%
                </p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-2 sm:p-3 flex-shrink-0">
                <span className="text-lg sm:text-2xl">💎</span>
              </div>
            </div>
          </div>

          {/* Balance y Estado General */}
          <div className={`bg-gradient-to-br ${
            isPositiveBalance 
              ? 'from-purple-400 via-purple-500 to-purple-600 border-purple-300' 
              : 'from-orange-400 via-orange-500 to-orange-600 border-orange-300'
          } rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-purple-100 text-xs sm:text-sm font-medium mb-1">⚖️ Balance Final</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">
                  {isPositiveBalance ? '+' : ''}{formatCurrency(balance)}
                </p>
                <p className="text-purple-100 text-xs mt-1 sm:mt-2 leading-tight">
                  {isPositiveBalance ? '✅ Situación Positiva' : '⚠️ Revisar Gastos'}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-2 sm:p-3 flex-shrink-0">
                <span className="text-lg sm:text-2xl">{isPositiveBalance ? '🎯' : '⚠️'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Análisis Detallado de Supermercado */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-100">
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 flex items-center">
          <span className="bg-gradient-to-r from-orange-400 to-red-500 rounded-full p-2 sm:p-3 mr-3 sm:mr-4">
            🛒
          </span>
          Análisis Inteligente de Supermercado
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-orange-300">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-orange-700 text-xs sm:text-sm font-medium mb-1">Gasto Total</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-800 truncate">{formatCurrency(groceryMetrics.totalSpent)}</p>
                <p className="text-orange-600 text-xs sm:text-sm mt-1 leading-tight">Mensual: {formatCurrency(groceryMetrics.averageMonthly)}</p>
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl flex-shrink-0">🛍️</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-300">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-green-700 text-xs sm:text-sm font-medium mb-1">% de Ingresos</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800">{groceryMetrics.percentageOfIncome.toFixed(1)}%</p>
                <p className="text-green-600 text-xs sm:text-sm mt-1 leading-tight">
                  {groceryMetrics.percentageOfIncome < 15 ? '🌟 Excelente' : 
                   groceryMetrics.percentageOfIncome < 25 ? '👍 Bueno' : '⚠️ Alto'}
                </p>
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl flex-shrink-0">📊</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-300">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-blue-700 text-xs sm:text-sm font-medium mb-1">Eficiencia</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-800">{groceryMetrics.efficiency.toFixed(1)}%</p>
                <p className="text-blue-600 text-xs sm:text-sm mt-1 leading-tight">
                  {groceryMetrics.efficiency > 20 ? '🌟 Excelente' : 
                   groceryMetrics.efficiency > 0 ? '👍 Bueno' : '📈 Mejorable'}
                </p>
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl flex-shrink-0">⚡</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-300">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-purple-700 text-xs sm:text-sm font-medium mb-1">Ahorro Potencial</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-800 truncate">
                  {formatCurrency(Math.max(0, groceryMetrics.budgetTotal - groceryMetrics.totalSpent))}
                </p>
                <p className="text-purple-600 text-xs sm:text-sm mt-1 leading-tight">vs. presupuesto recomendado</p>
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl flex-shrink-0">💰</div>
            </div>
          </div>
        </div>
        
        {/* Recomendaciones Inteligentes */}
        {(groceryMetrics.efficiency < 10 || groceryMetrics.percentageOfIncome > 25 || dashboardMetrics.savingsRate < 10) && (
          <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border-2 border-amber-200 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-4 lg:mb-6 gap-2 sm:gap-3">
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-full p-2 sm:p-3 self-start sm:self-auto">
                <span className="text-white text-base sm:text-lg lg:text-2xl">💡</span>
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-amber-800">Recomendaciones Personalizadas</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {groceryMetrics.efficiency < 10 && (
                <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-amber-200 shadow-lg">
                  <div className="flex items-center mb-2 sm:mb-3 lg:mb-4">
                    <span className="text-base sm:text-lg lg:text-2xl mr-2 sm:mr-3">🎯</span>
                    <h4 className="font-bold text-amber-800 text-sm sm:text-base lg:text-lg">Optimizar Compras</h4>
                  </div>
                  <p className="text-amber-700 text-xs sm:text-sm leading-relaxed">
                    Tu eficiencia de compras es baja ({groceryMetrics.efficiency.toFixed(1)}%). 
                    Considera planificar mejor tus compras y comparar precios.
                  </p>
                </div>
              )}
              
              {groceryMetrics.percentageOfIncome > 25 && (
                <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-amber-200 shadow-lg">
                  <div className="flex items-center mb-2 sm:mb-3 lg:mb-4">
                    <span className="text-base sm:text-lg lg:text-2xl mr-2 sm:mr-3">📉</span>
                    <h4 className="font-bold text-amber-800 text-sm sm:text-base lg:text-lg">Reducir Gastos</h4>
                  </div>
                  <p className="text-amber-700 text-xs sm:text-sm leading-relaxed">
                    Gastas {groceryMetrics.percentageOfIncome.toFixed(1)}% de tus ingresos en supermercado. 
                    El ideal es mantenerlo bajo 20%.
                  </p>
                </div>
              )}
              
              {dashboardMetrics.savingsRate < 10 && (
                <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 border border-amber-200 shadow-lg">
                  <div className="flex items-center mb-2 sm:mb-3 lg:mb-4">
                    <span className="text-base sm:text-lg lg:text-2xl mr-2 sm:mr-3">🏦</span>
                    <h4 className="font-bold text-amber-800 text-sm sm:text-base lg:text-lg">Aumentar Ahorros</h4>
                  </div>
                  <p className="text-amber-700 text-xs sm:text-sm leading-relaxed">
                    Tu tasa de ahorro es {dashboardMetrics.savingsRate.toFixed(1)}%. 
                    Intenta ahorrar al menos 20% de tus ingresos.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}