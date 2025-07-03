'use client'

import { useState, useEffect } from 'react'
import { useBudgets } from '@/hooks/useBudgets'
import { useBudgetItems } from '@/hooks/useBudgetItems'
import { BudgetList } from './BudgetList'
import { BudgetForm } from './BudgetForm'
import { BudgetDetail } from './BudgetDetail'
import { FinancialAssistant } from '../ai/FinancialAssistant'
import type { Budget, BudgetSummary, BudgetItem, ExpenseCategory } from '@/lib/types'

export function BudgetDashboard() {
  const { budgets, loading, error, addBudget, calculateSummary } = useBudgets()
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null)
  const [currentBudgetItems, setCurrentBudgetItems] = useState<BudgetItem[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  
  // Get current month budget for FinancialAssistant
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()
  const currentBudget = budgets.find(b => b.month === currentMonth && b.year === currentYear)
  
  const { items, categories: budgetCategories } = useBudgetItems(currentBudget?.id || null)

  // Calcular métricas del dashboard
  const calculateDashboardMetrics = async () => {
    if (budgets.length === 0) return

    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear

    // Presupuesto actual
    const currentBudget = budgets.find(b => b.month === currentMonth && b.year === currentYear)
    const lastMonthBudget = budgets.find(b => b.month === lastMonth && b.year === lastMonthYear)

    // Calcular totales generales
    let totalIncome = 0
    let totalExpenses = 0
    let totalSavings = 0
    let totalTithe = 0
    let budgetCount = budgets.length

    const summaries = await Promise.all(
      budgets.map(async (budget) => {
        const summary = await calculateSummary(budget.id)
        if (summary) {
          totalIncome += summary.totalIncome || 0
          totalExpenses += summary.totalExpenses || 0
          totalSavings += summary.savingsAmount || 0
          totalTithe += summary.titheAmount || 0
        }
        return { budget, summary }
      })
    )

    // Métricas por mes (últimos 6 meses)
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1 - i, 1)
      const month = date.getMonth() + 1
      const year = date.getFullYear()
      const budget = budgets.find(b => b.month === month && b.year === year)
      const summary = budget ? await calculateSummary(budget.id) : null
      
      monthlyData.push({
        month: date.toLocaleDateString('es-ES', { month: 'short' }),
        income: summary?.totalIncome || 0,
        expenses: summary?.totalExpenses || 0,
        balance: (summary?.totalIncome || 0) - (summary?.totalExpenses || 0)
      })
    }

    // Categorías más gastadas
    const categoryExpenses: { [key: string]: number } = {}
    summaries.forEach(({ summary }) => {
      if (summary) {
        // Aquí necesitarías obtener los gastos por categoría desde los budget items
        // Por simplicidad, usaremos datos simulados
      }
    })

    setDashboardMetrics({
      totalIncome,
      totalExpenses,
      totalSavings,
      totalTithe,
      budgetCount,
      currentBudget,
      lastMonthBudget,
      monthlyData,
      averageMonthlyIncome: totalIncome / Math.max(budgetCount, 1),
      averageMonthlyExpenses: totalExpenses / Math.max(budgetCount, 1),
      savingsRate: totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0,
      expenseRatio: totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0
    })
  }

  useEffect(() => {
    if (budgets.length > 0) {
      calculateDashboardMetrics()
    }
  }, [budgets])

  useEffect(() => {
    setCurrentBudgetItems(items)
  }, [items])

  useEffect(() => {
    setCategories(budgetCategories)
  }, [budgetCategories])

  const formatCurrency = (amount: number) => {
    return '$' + new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

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
          <>
            {/* Header del Dashboard */}
            <div className="mb-8">
              <div className="text-center mb-8">
                <h1 className="text-5xl font-bold text-gray-800 mb-3">💰 Home Budget</h1>
                <p className="text-xl text-gray-600 mb-2">Tu gestor financiero inteligente</p>
                <p className="text-gray-500">Controla, analiza y optimiza tus finanzas personales</p>
              </div>

              {/* Métricas Principales */}
              {dashboardMetrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Total Ingresos */}
                  <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">Total Ingresos</p>
                        <p className="text-3xl font-bold">{formatCurrency(dashboardMetrics.totalIncome)}</p>
                        <p className="text-green-100 text-sm mt-1">Promedio: {formatCurrency(dashboardMetrics.averageMonthlyIncome)}</p>
                      </div>
                      <div className="text-4xl opacity-80">📈</div>
                    </div>
                  </div>

                  {/* Total Gastos */}
                  <div className="bg-gradient-to-r from-red-400 to-red-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100 text-sm font-medium">Total Gastos</p>
                        <p className="text-3xl font-bold">{formatCurrency(dashboardMetrics.totalExpenses)}</p>
                        <p className="text-red-100 text-sm mt-1">Promedio: {formatCurrency(dashboardMetrics.averageMonthlyExpenses)}</p>
                      </div>
                      <div className="text-4xl opacity-80">💸</div>
                    </div>
                  </div>

                  {/* Total Ahorros */}
                  <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Total Ahorros</p>
                        <p className="text-3xl font-bold">{formatCurrency(dashboardMetrics.totalSavings)}</p>
                        <p className="text-blue-100 text-sm mt-1">Tasa: {dashboardMetrics.savingsRate.toFixed(1)}%</p>
                      </div>
                      <div className="text-4xl opacity-80">🏦</div>
                    </div>
                  </div>

                  {/* Balance General */}
                  <div className={`bg-gradient-to-r ${(dashboardMetrics.totalIncome - dashboardMetrics.totalExpenses) >= 0 ? 'from-purple-400 to-purple-600' : 'from-orange-400 to-orange-600'} rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Balance Total</p>
                        <p className="text-3xl font-bold">{formatCurrency(dashboardMetrics.totalIncome - dashboardMetrics.totalExpenses)}</p>
                        <p className="text-purple-100 text-sm mt-1">{dashboardMetrics.budgetCount} presupuestos</p>
                      </div>
                      <div className="text-4xl opacity-80">{(dashboardMetrics.totalIncome - dashboardMetrics.totalExpenses) >= 0 ? '✅' : '⚠️'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Asistente Financiero IA */}
              <div className="mb-8">
                <FinancialAssistant 
                  budgets={budgets} 
                  currentBudgetItems={currentBudgetItems}
                  categories={categories}
                  formatCurrency={formatCurrency}
                />
              </div>

              {/* Gráfico de Tendencias Mensuales */}
              {dashboardMetrics && dashboardMetrics.monthlyData && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    📊 Tendencias de los Últimos 6 Meses
                  </h3>
                  <div className="grid grid-cols-6 gap-4">
                    {dashboardMetrics.monthlyData.map((month: any, index: number) => (
                      <div key={index} className="text-center">
                        <div className="mb-2">
                          <div className="text-sm font-medium text-gray-600 mb-1">{month.month}</div>
                          <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                            {/* Barra de ingresos */}
                            <div 
                              className="absolute bottom-0 left-0 w-1/2 bg-green-400 rounded-tl-lg transition-all duration-500"
                              style={{ height: `${Math.max((month.income / Math.max(...dashboardMetrics.monthlyData.map((m: any) => m.income))) * 100, 5)}%` }}
                            ></div>
                            {/* Barra de gastos */}
                            <div 
                              className="absolute bottom-0 right-0 w-1/2 bg-red-400 rounded-tr-lg transition-all duration-500"
                              style={{ height: `${Math.max((month.expenses / Math.max(...dashboardMetrics.monthlyData.map((m: any) => m.expenses))) * 100, 5)}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-xs space-y-1">
                          <div className="text-green-600 font-medium">{formatCurrency(month.income)}</div>
                          <div className="text-red-600 font-medium">{formatCurrency(month.expenses)}</div>
                          <div className={`font-bold ${month.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {month.balance >= 0 ? '+' : ''}{formatCurrency(month.balance)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center mt-4 space-x-6 text-sm">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-400 rounded mr-2"></div>
                      <span className="text-gray-600">Ingresos</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-400 rounded mr-2"></div>
                      <span className="text-gray-600">Gastos</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Estadísticas Adicionales */}
              {dashboardMetrics && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* Ratio de Gastos */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      📈 Ratio de Gastos
                    </h4>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                        <div 
                          className="bg-gradient-to-r from-yellow-400 to-red-500 h-4 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(dashboardMetrics.expenseRatio, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>0%</span>
                        <span className="font-bold">{dashboardMetrics.expenseRatio.toFixed(1)}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {dashboardMetrics.expenseRatio < 70 ? '✅ Excelente control' : 
                       dashboardMetrics.expenseRatio < 85 ? '⚠️ Moderado' : '🚨 Alto riesgo'}
                    </p>
                  </div>

                  {/* Tasa de Ahorro */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      🏦 Tasa de Ahorro
                    </h4>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-green-500 h-4 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(dashboardMetrics.savingsRate, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>0%</span>
                        <span className="font-bold">{dashboardMetrics.savingsRate.toFixed(1)}%</span>
                        <span>30%</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {dashboardMetrics.savingsRate >= 20 ? '🌟 Excelente' : 
                       dashboardMetrics.savingsRate >= 10 ? '👍 Bueno' : '📈 Mejorable'}
                    </p>
                  </div>

                  {/* Resumen Rápido */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      ⚡ Resumen Rápido
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Presupuestos:</span>
                        <span className="font-bold text-gray-800">{dashboardMetrics.budgetCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Diezmo total:</span>
                        <span className="font-bold text-purple-600">{formatCurrency(dashboardMetrics.totalTithe)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Promedio mensual:</span>
                        <span className="font-bold text-blue-600">{formatCurrency((dashboardMetrics.totalIncome - dashboardMetrics.totalExpenses) / Math.max(dashboardMetrics.budgetCount, 1))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
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