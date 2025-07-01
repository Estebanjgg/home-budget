import { useState, useEffect } from 'react'
import { useBudgets } from '@/hooks/useBudgets'
import { getBudgetItems } from '@/lib/budget-queries'
import type { BudgetItem, ExpenseCategory } from '@/lib/types'

export function Dashboard() {
  const { budgets, loading, error, calculateSummary } = useBudgets()
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null)
  const [groceryMetrics, setGroceryMetrics] = useState<any>(null)

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
    let totalGroceries = 0
    let groceryBudgetTotal = 0

    const summaries = await Promise.all(
      budgets.map(async (budget) => {
        const [summary, items] = await Promise.all([
          calculateSummary(budget.id),
          getBudgetItems(budget.id)
        ])
        
        if (summary) {
          totalIncome += summary.totalIncome || 0
          totalExpenses += summary.totalExpenses || 0
          totalSavings += summary.savingsAmount || 0
          totalTithe += summary.titheAmount || 0
          
          // Calcular gastos de supermercado
          const groceryItems = items.filter((item: BudgetItem & { category: ExpenseCategory | null }) => 
            item.category?.name?.toLowerCase().includes('supermercado') ||
            item.category?.name?.toLowerCase().includes('comida') ||
            item.category?.name?.toLowerCase().includes('alimentación') ||
            item.description?.toLowerCase().includes('supermercado')
          )
          
          const grocerySpent = groceryItems.reduce((sum: number, item: BudgetItem) => sum + (item.estimated_amount || 0), 0)
          totalGroceries += grocerySpent
          
          // Presupuesto estimado para supermercado (30% de ingresos como referencia)
          groceryBudgetTotal += (summary.totalIncome || 0) * 0.3
        }
        return { budget, summary, items }
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

    setGroceryMetrics({
      totalSpent: totalGroceries,
      budgetTotal: groceryBudgetTotal,
      averageMonthly: totalGroceries / Math.max(budgetCount, 1),
      percentageOfIncome: totalIncome > 0 ? (totalGroceries / totalIncome) * 100 : 0,
      efficiency: groceryBudgetTotal > 0 ? ((groceryBudgetTotal - totalGroceries) / groceryBudgetTotal) * 100 : 0
    })
  }

  useEffect(() => {
    if (budgets.length > 0) {
      calculateDashboardMetrics()
    }
  }, [budgets])

  const formatCurrency = (amount: number) => {
    return '$' + new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // Datos de noticias financieras (simulados)
  const financialNews = [
    {
      id: 1,
      title: "10 Estrategias para Ahorrar en el Supermercado",
      summary: "Descubre cómo reducir tus gastos de alimentación sin sacrificar calidad.",
      type: "article",
      readTime: "5 min",
      category: "Ahorro",
      image: "🛒"
    },
    {
      id: 2,
      title: "Cómo Crear un Presupuesto Familiar Efectivo",
      summary: "Guía paso a paso para organizar tus finanzas familiares.",
      type: "video",
      duration: "12 min",
      category: "Presupuesto",
      image: "📹"
    },
    {
      id: 3,
      title: "Inversiones Básicas para Principiantes",
      summary: "Aprende los fundamentos de la inversión personal.",
      type: "article",
      readTime: "8 min",
      category: "Inversión",
      image: "📈"
    },
    {
      id: 4,
      title: "Planificación de Emergencias Financieras",
      summary: "Cómo prepararte para gastos inesperados.",
      type: "video",
      duration: "15 min",
      category: "Emergencias",
      image: "🚨"
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto shadow-lg"></div>
          <p className="mt-6 text-gray-700 font-medium text-lg">Cargando métricas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-red-600 text-center">
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen p-6">
      {/* Header del Dashboard Mejorado */}
      <div className="text-center bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-4 mr-4">
            <span className="text-4xl">💰</span>
          </div>
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Dashboard Financiero Premium
            </h1>
            <p className="text-xl text-gray-600">Tu centro de control financiero inteligente</p>
          </div>
        </div>
        <div className="flex justify-center space-x-8 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{dashboardMetrics?.budgetCount || 0}</div>
            <div className="text-sm text-gray-500">Presupuestos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">98%</div>
            <div className="text-sm text-gray-500">Precisión</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">24/7</div>
            <div className="text-sm text-gray-500">Monitoreo</div>
          </div>
        </div>
      </div>

      {/* Métricas Principales Mejoradas */}
      {dashboardMetrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Ingresos */}
            <div className="bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-3xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300 border border-green-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">💵</span>
                    <p className="text-green-100 text-sm font-medium">Total Ingresos</p>
                  </div>
                  <p className="text-4xl font-bold mb-1">{formatCurrency(dashboardMetrics.totalIncome)}</p>
                  <p className="text-green-100 text-sm">Promedio: {formatCurrency(dashboardMetrics.averageMonthlyIncome)}</p>
                </div>
                <div className="text-5xl opacity-80">📈</div>
              </div>
            </div>

            {/* Total Gastos */}
            <div className="bg-gradient-to-br from-red-400 via-red-500 to-red-600 rounded-3xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300 border border-red-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">💳</span>
                    <p className="text-red-100 text-sm font-medium">Total Gastos</p>
                  </div>
                  <p className="text-4xl font-bold mb-1">{formatCurrency(dashboardMetrics.totalExpenses)}</p>
                  <p className="text-red-100 text-sm">Promedio: {formatCurrency(dashboardMetrics.averageMonthlyExpenses)}</p>
                </div>
                <div className="text-5xl opacity-80">💸</div>
              </div>
            </div>

            {/* Total Ahorros */}
            <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300 border border-blue-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">🏦</span>
                    <p className="text-blue-100 text-sm font-medium">Total Ahorros</p>
                  </div>
                  <p className="text-4xl font-bold mb-1">{formatCurrency(dashboardMetrics.totalSavings)}</p>
                  <p className="text-blue-100 text-sm">Tasa: {dashboardMetrics.savingsRate.toFixed(1)}%</p>
                </div>
                <div className="text-5xl opacity-80">💎</div>
              </div>
            </div>

            {/* Balance General */}
            <div className={`bg-gradient-to-br ${(dashboardMetrics.totalIncome - dashboardMetrics.totalExpenses) >= 0 ? 'from-purple-400 via-purple-500 to-purple-600' : 'from-orange-400 via-orange-500 to-orange-600'} rounded-3xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300 border ${(dashboardMetrics.totalIncome - dashboardMetrics.totalExpenses) >= 0 ? 'border-purple-300' : 'border-orange-300'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">⚖️</span>
                    <p className="text-purple-100 text-sm font-medium">Balance Total</p>
                  </div>
                  <p className="text-4xl font-bold mb-1">{formatCurrency(dashboardMetrics.totalIncome - dashboardMetrics.totalExpenses)}</p>
                  <p className="text-purple-100 text-sm">{dashboardMetrics.budgetCount} presupuestos</p>
                </div>
                <div className="text-5xl opacity-80">{(dashboardMetrics.totalIncome - dashboardMetrics.totalExpenses) >= 0 ? '✅' : '⚠️'}</div>
              </div>
            </div>
          </div>

          {/* Métricas del Supermercado */}
          {groceryMetrics && (
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <h3 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
                <span className="bg-gradient-to-r from-orange-400 to-red-500 rounded-full p-3 mr-4">
                  🛒
                </span>
                Métricas del Supermercado
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        {groceryMetrics.percentageOfIncome < 15 ? 'Excelente' : groceryMetrics.percentageOfIncome < 25 ? 'Bueno' : 'Alto'}
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
                        {groceryMetrics.efficiency > 20 ? 'Excelente' : groceryMetrics.efficiency > 0 ? 'Bueno' : 'Revisar'}
                      </p>
                    </div>
                    <div className="text-4xl">⚡</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-6 border border-purple-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-700 text-sm font-medium mb-1">Ahorro Potencial</p>
                      <p className="text-3xl font-bold text-purple-800">{formatCurrency(Math.max(0, groceryMetrics.budgetTotal - groceryMetrics.totalSpent))}</p>
                      <p className="text-purple-600 text-sm mt-1">vs. presupuesto</p>
                    </div>
                    <div className="text-4xl">💰</div>
                  </div>
                </div>
              </div>
              
              {/* Consejos para el supermercado */}
              <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">💡</span>
                  Consejos para Ahorrar en el Supermercado
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <span className="text-lg mr-2">📝</span>
                    <div>
                      <p className="font-medium text-gray-800">Planifica tus compras</p>
                      <p className="text-sm text-gray-600">Haz una lista antes de ir al supermercado</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-lg mr-2">🏷️</span>
                    <div>
                      <p className="font-medium text-gray-800">Compara precios</p>
                      <p className="text-sm text-gray-600">Revisa ofertas y marcas genéricas</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-lg mr-2">📅</span>
                    <div>
                      <p className="font-medium text-gray-800">Compra estacional</p>
                      <p className="text-sm text-gray-600">Aprovecha frutas y verduras de temporada</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-lg mr-2">🥫</span>
                    <div>
                      <p className="font-medium text-gray-800">Compra al por mayor</p>
                      <p className="text-sm text-gray-600">Para productos no perecederos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gráfico de Tendencias Mensuales Mejorado */}
          {dashboardMetrics.monthlyData && (
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <h3 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-full p-3 mr-4">
                  📊
                </span>
                Tendencias de los Últimos 6 Meses
              </h3>
              <div className="grid grid-cols-6 gap-4">
                {dashboardMetrics.monthlyData.map((month: any, index: number) => (
                  <div key={index} className="text-center">
                    <div className="mb-2">
                      <div className="text-sm font-medium text-gray-600 mb-1">{month.month}</div>
                      <div className="relative h-40 bg-gradient-to-t from-gray-100 to-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                        {/* Barra de ingresos */}
                        <div 
                          className="absolute bottom-0 left-0 w-1/2 bg-gradient-to-t from-green-500 to-green-400 rounded-tl-xl transition-all duration-1000 shadow-lg"
                          style={{ height: `${Math.max((month.income / Math.max(...dashboardMetrics.monthlyData.map((m: any) => m.income))) * 100, 5)}%` }}
                        ></div>
                        {/* Barra de gastos */}
                        <div 
                          className="absolute bottom-0 right-0 w-1/2 bg-gradient-to-t from-red-500 to-red-400 rounded-tr-xl transition-all duration-1000 shadow-lg"
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
              <div className="flex justify-center mt-6 space-x-8 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-400 rounded mr-2 shadow"></div>
                  <span className="text-gray-600 font-medium">Ingresos</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-400 rounded mr-2 shadow"></div>
                  <span className="text-gray-600 font-medium">Gastos</span>
                </div>
              </div>
            </div>
          )}

          {/* Sección de Noticias Financieras */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <h3 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
              <span className="bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full p-3 mr-4">
                📰
              </span>
              Centro de Educación Financiera
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {financialNews.map((news) => (
                <div key={news.id} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{news.image}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        news.type === 'video' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {news.type === 'video' ? '📹 Video' : '📄 Artículo'}
                      </span>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2">
                    {news.title}
                  </h4>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {news.summary}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      news.category === 'Ahorro' ? 'bg-green-100 text-green-700' :
                      news.category === 'Presupuesto' ? 'bg-blue-100 text-blue-700' :
                      news.category === 'Inversión' ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {news.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {news.type === 'video' ? news.duration : news.readTime}
                    </span>
                  </div>
                  
                  <button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                    {news.type === 'video' ? 'Ver Video' : 'Leer Artículo'}
                  </button>
                </div>
              ))}
            </div>
            
            {/* Sección de Videos Destacados */}
            <div className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
              <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-3xl mr-3">🎥</span>
                Videos Educativos Destacados
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-lg p-4 mb-4 text-center">
                    <span className="text-4xl text-white">▶️</span>
                  </div>
                  <h5 className="font-bold text-gray-800 mb-2">Presupuesto 50/30/20</h5>
                  <p className="text-sm text-gray-600 mb-3">Aprende la regla de oro para distribuir tus ingresos</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">8 min</span>
                    <button className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600 transition-colors">
                      Ver Ahora
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-lg p-4 mb-4 text-center">
                    <span className="text-4xl text-white">▶️</span>
                  </div>
                  <h5 className="font-bold text-gray-800 mb-2">Fondo de Emergencia</h5>
                  <p className="text-sm text-gray-600 mb-3">Cómo crear tu colchón financiero paso a paso</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">12 min</span>
                    <button className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-600 transition-colors">
                      Ver Ahora
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg p-4 mb-4 text-center">
                    <span className="text-4xl text-white">▶️</span>
                  </div>
                  <h5 className="font-bold text-gray-800 mb-2">Inversión Inteligente</h5>
                  <p className="text-sm text-gray-600 mb-3">Primeros pasos en el mundo de las inversiones</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">15 min</span>
                    <button className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-600 transition-colors">
                      Ver Ahora
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas Adicionales Mejoradas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ratio de Gastos */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2 mr-3">
                  📈
                </span>
                Ratio de Gastos
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
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-gradient-to-r from-blue-400 to-green-500 rounded-full p-2 mr-3">
                  🏦
                </span>
                Tasa de Ahorro
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
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-full p-2 mr-3">
                  ⚡
                </span>
                Resumen Rápido
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Presupuestos:</span>
                  <span className="font-bold text-gray-800 text-lg">{dashboardMetrics.budgetCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Diezmo total:</span>
                  <span className="font-bold text-purple-600 text-lg">{formatCurrency(dashboardMetrics.totalTithe)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Promedio mensual:</span>
                  <span className="font-bold text-blue-600 text-lg">{formatCurrency((dashboardMetrics.totalIncome - dashboardMetrics.totalExpenses) / Math.max(dashboardMetrics.budgetCount, 1))}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}