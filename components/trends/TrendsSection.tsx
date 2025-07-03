import { useState, useEffect } from 'react'
import { getBudgetItems } from '@/lib/budget-queries'
import type { BudgetItem, ExpenseCategory, Budget } from '@/lib/types'

interface TrendsSectionProps {
  monthlyData: any[]
  groceryMetrics: any
  formatCurrency: (amount: number) => string
  budgets: Budget[]
  calculateSummary: (budgetId: string) => Promise<any>
}

interface MonthlyGroceryData {
  month: string
  grocerySpent: number
  groceryBudget: number
  groceryEfficiency: number
  totalIncome: number
  groceryPercentage: number
}

export function TrendsSection({ 
  monthlyData, 
  groceryMetrics, 
  formatCurrency, 
  budgets, 
  calculateSummary 
}: TrendsSectionProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'grocery'>('general')
  const [groceryTrends, setGroceryTrends] = useState<MonthlyGroceryData[]>([])
  const [loading, setLoading] = useState(false)

  // Calcular tendencias de supermercado
  const calculateGroceryTrends = async () => {
    setLoading(true)
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()
    
    const groceryData: MonthlyGroceryData[] = []
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1 - i, 1)
      const month = date.getMonth() + 1
      const year = date.getFullYear()
      const budget = budgets.find(b => b.month === month && b.year === year)
      
      if (budget) {
        const [summary, items] = await Promise.all([
          calculateSummary(budget.id),
          getBudgetItems(budget.id)
        ])
        
        // Filtrar gastos de supermercado
        const groceryItems = items.filter((item: BudgetItem & { category: ExpenseCategory | null }) => 
          item.category?.name?.toLowerCase().includes('supermercado') ||
          item.category?.name?.toLowerCase().includes('comida') ||
          item.category?.name?.toLowerCase().includes('alimentación') ||
          item.category?.name?.toLowerCase().includes('grocery') ||
          item.description?.toLowerCase().includes('supermercado') ||
          item.description?.toLowerCase().includes('grocery')
        )
        
        const grocerySpent = groceryItems.reduce((sum: number, item: BudgetItem) => 
          sum + (item.estimated_amount || 0), 0
        )
        
        const totalIncome = summary?.totalIncome || 0
        const groceryBudget = totalIncome * 0.25 // 25% como presupuesto recomendado
        const groceryEfficiency = groceryBudget > 0 ? ((groceryBudget - grocerySpent) / groceryBudget) * 100 : 0
        const groceryPercentage = totalIncome > 0 ? (grocerySpent / totalIncome) * 100 : 0
        
        groceryData.push({
          month: date.toLocaleDateString('es-ES', { month: 'short' }),
          grocerySpent,
          groceryBudget,
          groceryEfficiency,
          totalIncome,
          groceryPercentage
        })
      } else {
        groceryData.push({
          month: date.toLocaleDateString('es-ES', { month: 'short' }),
          grocerySpent: 0,
          groceryBudget: 0,
          groceryEfficiency: 0,
          totalIncome: 0,
          groceryPercentage: 0
        })
      }
    }
    
    setGroceryTrends(groceryData)
    setLoading(false)
  }

  useEffect(() => {
    if (activeTab === 'grocery' && budgets.length > 0) {
      calculateGroceryTrends()
    }
  }, [activeTab, budgets])

  const maxGrocerySpent = Math.max(...groceryTrends.map(m => m.grocerySpent), 1)
  const maxGroceryBudget = Math.max(...groceryTrends.map(m => m.groceryBudget), 1)

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-100">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8 space-y-4 lg:space-y-0">
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center">
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-full p-2 sm:p-3 mr-3 sm:mr-4 flex-shrink-0">
            📊
          </span>
          <span className="leading-tight">Análisis de Tendencias - Últimos 6 Meses</span>
        </h3>
        
        {/* Pestañas */}
        <div className="flex bg-gray-100 rounded-xl sm:rounded-2xl p-1 w-full lg:w-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 lg:flex-none px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-300 text-sm sm:text-base ${
              activeTab === 'general'
                ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="hidden sm:inline">💰 Presupuesto General</span>
            <span className="sm:hidden">💰 Presupuesto</span>
          </button>
          <button
            onClick={() => setActiveTab('grocery')}
            className={`flex-1 lg:flex-none px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-300 text-sm sm:text-base ${
              activeTab === 'grocery'
                ? 'bg-white text-orange-600 shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="hidden sm:inline">🛒 Gastos de Supermercado</span>
            <span className="sm:hidden">🛒 Supermercado</span>
          </button>
        </div>
      </div>

      {activeTab === 'general' && (
        <div>
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200">
            <h4 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
              <span className="text-xl mr-2">📈</span>
              Tendencias de Ingresos y Gastos Generales
            </h4>
            <p className="text-gray-600 text-sm">
              Visualización completa de todos tus ingresos y gastos mensuales, incluyendo todas las categorías de tu presupuesto.
            </p>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4">
            {monthlyData.map((month: any, index: number) => (
              <div key={index} className="text-center">
                <div className="mb-2">
                  <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{month.month}</div>
                  <div className="relative h-24 sm:h-32 lg:h-40 bg-gradient-to-t from-gray-100 to-gray-50 rounded-lg sm:rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                    <div 
                      className="absolute bottom-0 left-0 w-1/2 bg-gradient-to-t from-green-500 to-green-400 rounded-tl-xl transition-all duration-1000 shadow-lg"
                      style={{ height: `${Math.min(100, Math.max((month.income / (Math.max(...monthlyData.map((m: any) => m.income)) || 1)) * 100, 5))}%` }}
                    ></div>
                    <div 
                      className="absolute bottom-0 right-0 w-1/2 bg-gradient-to-t from-red-500 to-red-400 rounded-tr-xl transition-all duration-1000 shadow-lg"
                      style={{ height: `${Math.min(100, Math.max((month.expenses / (Math.max(...monthlyData.map((m: any) => m.expenses)) || 1)) * 100, 5))}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-xs space-y-1">
                  <div className="text-green-600 font-medium text-xs sm:text-sm">
                    <span className="hidden sm:inline">{formatCurrency(month.income)}</span>
                    <span className="sm:hidden">${(month.income/1000).toFixed(0)}k</span>
                  </div>
                  <div className="text-red-600 font-medium text-xs sm:text-sm">
                    <span className="hidden sm:inline">{formatCurrency(month.expenses)}</span>
                    <span className="sm:hidden">${(month.expenses/1000).toFixed(0)}k</span>
                  </div>
                  <div className={`font-bold text-xs sm:text-sm ${month.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    <span className="hidden sm:inline">{month.balance >= 0 ? '+' : ''}{formatCurrency(month.balance)}</span>
                    <span className="sm:hidden">{month.balance >= 0 ? '+' : ''}${(month.balance/1000).toFixed(0)}k</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-6 space-x-8 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-400 rounded mr-2 shadow"></div>
              <span className="text-gray-600 font-medium">Ingresos Totales</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-400 rounded mr-2 shadow"></div>
              <span className="text-gray-600 font-medium">Gastos Totales</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'grocery' && (
        <div>
          <div className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-200">
            <h4 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
              <span className="text-xl mr-2">🛒</span>
              Análisis Específico de Gastos de Supermercado
            </h4>
            <p className="text-gray-600 text-sm">
              Seguimiento detallado de tus gastos en alimentación y supermercado, con comparación contra el presupuesto recomendado (25% de ingresos).
            </p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600"></div>
              <span className="ml-4 text-gray-600">Calculando tendencias de supermercado...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4">
                {groceryTrends.map((month, index) => (
                  <div key={index} className="text-center">
                    <div className="mb-2">
                      <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{month.month}</div>
                      <div className="relative h-24 sm:h-32 lg:h-40 bg-gradient-to-t from-gray-100 to-gray-50 rounded-lg sm:rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                        {/* Presupuesto recomendado (fondo) */}
                        <div 
                          className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-gray-300 to-gray-200 rounded-xl transition-all duration-1000"
                          style={{ height: `${Math.min(100, Math.max((month.groceryBudget / maxGroceryBudget) * 100, 5))}%` }}
                        ></div>
                        {/* Gasto real */}
                        <div 
                          className={`absolute bottom-0 left-0 w-full rounded-xl transition-all duration-1000 shadow-lg ${
                            month.grocerySpent <= month.groceryBudget 
                              ? 'bg-gradient-to-t from-green-500 to-green-400'
                              : 'bg-gradient-to-t from-red-500 to-red-400'
                          }`}
                          style={{ height: `${Math.min(100, Math.max((month.grocerySpent / maxGroceryBudget) * 100, 5))}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-xs space-y-1">
                      <div className={`font-medium text-xs sm:text-sm ${
                        month.grocerySpent <= month.groceryBudget ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <span className="hidden sm:inline">{formatCurrency(month.grocerySpent)}</span>
                        <span className="sm:hidden">${(month.grocerySpent/1000).toFixed(0)}k</span>
                      </div>
                      <div className="text-gray-500 text-xs sm:text-sm">
                        <span className="hidden sm:inline">Meta: {formatCurrency(month.groceryBudget)}</span>
                        <span className="sm:hidden">${(month.groceryBudget/1000).toFixed(0)}k</span>
                      </div>
                      <div className={`font-bold text-xs ${
                        month.groceryPercentage <= 25 ? 'text-green-700' : 
                        month.groceryPercentage <= 35 ? 'text-yellow-700' : 'text-red-700'
                      }`}>
                        {month.groceryPercentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <div className="flex justify-center space-x-8 text-sm mb-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gradient-to-r from-gray-300 to-gray-200 rounded mr-2 shadow"></div>
                    <span className="text-gray-600 font-medium">Presupuesto Recomendado (25%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-400 rounded mr-2 shadow"></div>
                    <span className="text-gray-600 font-medium">Gasto Dentro del Presupuesto</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-400 rounded mr-2 shadow"></div>
                    <span className="text-gray-600 font-medium">Gasto Excedido</span>
                  </div>
                </div>
                
                {/* Métricas adicionales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
                    <div className="text-center">
                      <div className="text-2xl mb-2">📊</div>
                      <div className="text-lg font-bold text-green-800">
                        {groceryTrends.filter(m => m.grocerySpent <= m.groceryBudget).length}/6
                      </div>
                      <div className="text-sm text-green-600">Meses dentro del presupuesto</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
                    <div className="text-center">
                      <div className="text-2xl mb-2">💰</div>
                      <div className="text-lg font-bold text-blue-800">
                        {formatCurrency(groceryTrends.reduce((sum, m) => sum + m.grocerySpent, 0) / 6)}
                      </div>
                      <div className="text-sm text-blue-600">Promedio mensual gastado</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
                    <div className="text-center">
                      <div className="text-2xl mb-2">⚡</div>
                      <div className="text-lg font-bold text-purple-800">
                        {(groceryTrends.reduce((sum, m) => sum + m.groceryPercentage, 0) / 6).toFixed(1)}%
                      </div>
                      <div className="text-sm text-purple-600">Promedio % de ingresos</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}