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
    <div className="space-y-8">
      {/* Métricas Principales Unificadas */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Resumen Financiero Integral
          </h2>
          <p className="text-xl text-gray-600">Presupuestos + Supermercado = Control Total</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Ingresos Totales */}
          <div className="bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-3xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300 border border-green-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">💰 Ingresos Totales</p>
                <p className="text-3xl font-bold">{formatCurrency(dashboardMetrics.totalIncome)}</p>
                <p className="text-green-100 text-xs mt-2">Promedio: {formatCurrency(dashboardMetrics.averageMonthlyIncome)}/mes</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>

          {/* Gastos Totales (incluyendo supermercado) */}
          <div className="bg-gradient-to-br from-red-400 via-red-500 to-red-600 rounded-3xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300 border border-red-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium mb-1">💸 Gastos Totales</p>
                <p className="text-3xl font-bold">{formatCurrency(dashboardMetrics.totalExpenses)}</p>
                <p className="text-red-100 text-xs mt-2">
                  Supermercado: {formatCurrency(groceryMetrics.totalSpent)} ({groceryPercentage.toFixed(1)}%)
                </p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <span className="text-2xl">🛒</span>
              </div>
            </div>
          </div>

          {/* Ahorros y Eficiencia */}
          <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300 border border-blue-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">🏦 Ahorros + Eficiencia</p>
                <p className="text-3xl font-bold">{formatCurrency(dashboardMetrics.totalSavings)}</p>
                <p className="text-blue-100 text-xs mt-2">
                  Tasa: {dashboardMetrics.savingsRate.toFixed(1)}% | Efic. Super: {groceryMetrics.efficiency.toFixed(1)}%
                </p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <span className="text-2xl">💎</span>
              </div>
            </div>
          </div>

          {/* Balance y Estado General */}
          <div className={`bg-gradient-to-br ${
            isPositiveBalance 
              ? 'from-purple-400 via-purple-500 to-purple-600 border-purple-300' 
              : 'from-orange-400 via-orange-500 to-orange-600 border-orange-300'
          } rounded-3xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">⚖️ Balance Final</p>
                <p className="text-3xl font-bold">
                  {isPositiveBalance ? '+' : ''}{formatCurrency(balance)}
                </p>
                <p className="text-purple-100 text-xs mt-2">
                  {isPositiveBalance ? '✅ Situación Positiva' : '⚠️ Revisar Gastos'}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <span className="text-2xl">{isPositiveBalance ? '🎯' : '⚠️'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Análisis Detallado de Supermercado */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <h3 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
          <span className="bg-gradient-to-r from-orange-400 to-red-500 rounded-full p-3 mr-4">
            🛒
          </span>
          Análisis Inteligente de Supermercado
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-6 border border-orange-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-700 text-sm font-medium mb-1">Gasto Total</p>
                <p className="text-3xl font-bold text-orange-800">{formatCurrency(groceryMetrics.totalSpent)}</p>
                <p className="text-orange-600 text-sm mt-1">Mensual: {formatCurrency(groceryMetrics.averageMonthly)}</p>
              </div>
              <div className="text-4xl">🛍️</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-6 border border-green-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-medium mb-1">% de Ingresos</p>
                <p className="text-3xl font-bold text-green-800">{groceryMetrics.percentageOfIncome.toFixed(1)}%</p>
                <p className="text-green-600 text-sm mt-1">
                  {groceryMetrics.percentageOfIncome < 15 ? '🌟 Excelente' : 
                   groceryMetrics.percentageOfIncome < 25 ? '👍 Bueno' : '⚠️ Alto'}
                </p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-6 border border-blue-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-700 text-sm font-medium mb-1">Eficiencia</p>
                <p className="text-3xl font-bold text-blue-800">{groceryMetrics.efficiency.toFixed(1)}%</p>
                <p className="text-blue-600 text-sm mt-1">
                  {groceryMetrics.efficiency > 20 ? '🌟 Excelente' : 
                   groceryMetrics.efficiency > 0 ? '👍 Bueno' : '📈 Mejorable'}
                </p>
              </div>
              <div className="text-4xl">⚡</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-6 border border-purple-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-700 text-sm font-medium mb-1">Ahorro Potencial</p>
                <p className="text-3xl font-bold text-purple-800">
                  {formatCurrency(Math.max(0, groceryMetrics.budgetTotal - groceryMetrics.totalSpent))}
                </p>
                <p className="text-purple-600 text-sm mt-1">vs. presupuesto recomendado</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>
        </div>
        
        {/* Recomendaciones Inteligentes */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
          <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">🤖</span>
            Recomendaciones Inteligentes
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groceryMetrics.percentageOfIncome > 25 && (
              <div className="flex items-start bg-red-50 p-4 rounded-xl border border-red-200">
                <span className="text-lg mr-2">⚠️</span>
                <div>
                  <p className="font-medium text-red-800">Gastos de supermercado altos</p>
                  <p className="text-sm text-red-600">Considera reducir el gasto mensual en {formatCurrency((groceryMetrics.percentageOfIncome - 20) * dashboardMetrics.totalIncome / 100)}</p>
                </div>
              </div>
            )}
            
            {groceryMetrics.efficiency < 10 && (
              <div className="flex items-start bg-blue-50 p-4 rounded-xl border border-blue-200">
                <span className="text-lg mr-2">💡</span>
                <div>
                  <p className="font-medium text-blue-800">Oportunidad de ahorro</p>
                  <p className="text-sm text-blue-600">Planifica mejor tus compras para ahorrar más</p>
                </div>
              </div>
            )}
            
            {dashboardMetrics.savingsRate < 10 && (
              <div className="flex items-start bg-purple-50 p-4 rounded-xl border border-purple-200">
                <span className="text-lg mr-2">🎯</span>
                <div>
                  <p className="font-medium text-purple-800">Aumenta tus ahorros</p>
                  <p className="text-sm text-purple-600">Intenta ahorrar al menos el 10% de tus ingresos</p>
                </div>
              </div>
            )}
            
            {isPositiveBalance && dashboardMetrics.savingsRate > 15 && (
              <div className="flex items-start bg-green-50 p-4 rounded-xl border border-green-200">
                <span className="text-lg mr-2">🌟</span>
                <div>
                  <p className="font-medium text-green-800">¡Excelente gestión!</p>
                  <p className="text-sm text-green-600">Mantén este ritmo de ahorro y control de gastos</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}