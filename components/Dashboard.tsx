import { useState, useEffect } from 'react'
import { useBudgets } from '@/hooks/useBudgets'
import { useEducationalContent } from '@/hooks/useEducationalContent'
import { getBudgetItems } from '@/lib/budget-queries'
import { EducationAdmin } from './education/EducationAdmin'
import { FeaturedVideos } from './education/FeaturedVideos'
import { VideoPlayer } from './education/VideoPlayer'
import { ArticleViewer } from './education/ArticleViewer'
import { TrendsSection } from './trends/TrendsSection'
import { MetricsOverview } from './dashboard/MetricsOverview'
import { FinancialHealthIndicators } from './dashboard/FinancialHealthIndicators'
import { QuickActions } from './dashboard/QuickActions'
import { EducationCenter } from './dashboard/EducationCenter'

import type { BudgetItem, ExpenseCategory, EducationalContent } from '@/lib/types'

interface EducationalContentItem {
  id: string
  title: string
  summary: string
  type: 'article' | 'video'
  category: string
  url?: string
  image_emoji?: string
  duration?: string
  read_time?: string
  is_featured?: boolean
}

export function Dashboard() {
  const { budgets, loading, error, calculateSummary } = useBudgets()
  const { content: educationalContent, featuredContent, isAdmin, loading: educationLoading } = useEducationalContent()
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null)
  const [groceryMetrics, setGroceryMetrics] = useState<any>(null)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<EducationalContent | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<EducationalContent | null>(null)

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

    await Promise.all(
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

  const handleContentClick = (contentItem: EducationalContentItem) => {
    if (contentItem.type === 'video' && contentItem.url) {
      setSelectedVideo(contentItem as EducationalContent)
    } else if (contentItem.type === 'article') {
      setSelectedArticle(contentItem as EducationalContent)
    } else if (contentItem.url) {
      window.open(contentItem.url, '_blank')
    }
  }

  if (loading || educationLoading) {
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

  // Si no hay presupuestos, mostrar pantalla de bienvenida
  if (budgets.length === 0) {
    return (
      <div className="space-y-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen p-6">
        {showAdminPanel && (
          <EducationAdmin onClose={() => setShowAdminPanel(false)} />
        )}

        {/* Sección de Bienvenida para Usuarios Nuevos */}
        <div className="text-center bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-4 mr-4">
              <span className="text-4xl">🎉</span>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                ¡Bienvenido a tu Dashboard Financiero!
              </h1>
              <p className="text-xl text-gray-600">Comienza tu viaje hacia la libertad financiera</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-center">
              <span className="text-3xl mr-3">🚀</span>
              ¿Listo para tomar control de tus finanzas?
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Te ayudamos a organizar tus gastos, planificar tus compras de supermercado y alcanzar tus metas financieras.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl text-white">💰</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Crear tu Primer Presupuesto</h3>
                  <p className="text-gray-600 mb-4">Registra tus ingresos y gastos para tener un control total de tu dinero</p>
                  <button 
                     onClick={() => {
                       // Buscar el componente padre que tiene setActiveTab
                       const event = new CustomEvent('changeTab', { detail: 'budgets' });
                       window.dispatchEvent(event);
                     }}
                     className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
                   >
                     🎯 Crear Presupuesto
                   </button>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl text-white">🛒</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Organizar Compras de Supermercado</h3>
                  <p className="text-gray-600 mb-4">Planifica tus compras, compara precios y ahorra dinero en cada visita</p>
                  <button 
                     onClick={() => {
                       // Buscar el componente padre que tiene setActiveTab
                       const event = new CustomEvent('changeTab', { detail: 'grocery' });
                       window.dispatchEvent(event);
                     }}
                     className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
                   >
                     🛍️ Gestionar Compras
                   </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-8 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-500">Presupuestos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">100%</div>
              <div className="text-sm text-gray-500">Potencial</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">∞</div>
              <div className="text-sm text-gray-500">Posibilidades</div>
            </div>
          </div>
        </div>

        {/* Sección de Educación Financiera para Usuarios Nuevos */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <h3 className="text-3xl font-bold text-gray-800 mb-8 flex items-center justify-center">
            <span className="bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full p-3 mr-4">
              📚
            </span>
            Aprende Mientras Empiezas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {educationalContent.slice(0, 4).map((content) => (
              <div key={content.id} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
                <div className="mb-4">
                  {content.image_url ? (
                    <div className="relative w-full h-32 mb-3 rounded-xl overflow-hidden">
                      <img 
                        src={content.image_url} 
                        alt={content.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'flex';
                          }
                        }}
                      />
                      <div className="hidden absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 items-center justify-center">
                        <span className="text-4xl text-white">{content.image_emoji || '📄'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-32 mb-3 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-4xl text-white">{content.image_emoji || '📄'}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      content.type === 'video' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {content.type === 'video' ? '📹 Video' : '📄 Artículo'}
                    </span>
                  </div>
                </div>
                
                <div className="flex-grow">
                  <h4 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2">
                    {content.title}
                  </h4>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-4">
                    {content.summary || 'Contenido educativo disponible para mejorar tus conocimientos financieros.'}
                  </p>
                </div>
                
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      content.category === 'Ahorro' ? 'bg-green-100 text-green-700' :
                      content.category === 'Presupuesto' ? 'bg-blue-100 text-blue-700' :
                      content.category === 'Inversión' ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {content.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {content.type === 'video' ? content.duration : content.duration}
                    </span>
                  </div>
                  
                  <button onClick={() => handleContentClick(content)} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                    {content.type === 'video' ? '🎥 Ver Video' : '📖 Leer Artículo'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Sección de videos destacados para usuarios nuevos */}
          <FeaturedVideos featuredContent={featuredContent} />
        </div>

        {/* Consejos Rápidos para Empezar */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <h3 className="text-3xl font-bold text-gray-800 mb-8 flex items-center justify-center">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-3 mr-4">
              💡
            </span>
            Consejos para Empezar
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
              <div className="text-center">
                <div className="text-4xl mb-4">📊</div>
                <h4 className="text-xl font-bold text-gray-800 mb-3">1. Registra tus Ingresos</h4>
                <p className="text-gray-600">Anota todos tus ingresos mensuales: salario, trabajos extras, inversiones, etc.</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
              <div className="text-center">
                <div className="text-4xl mb-4">📝</div>
                <h4 className="text-xl font-bold text-gray-800 mb-3">2. Lista tus Gastos</h4>
                <p className="text-gray-600">Categoriza tus gastos: vivienda, alimentación, transporte, entretenimiento, etc.</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h4 className="text-xl font-bold text-gray-800 mb-3">3. Define tus Metas</h4>
                <p className="text-gray-600">Establece objetivos de ahorro y planifica cómo alcanzarlos mes a mes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Renderizado condicional del VideoPlayer */}
        {selectedVideo && (
          <VideoPlayer
            url={selectedVideo.url!}
            title={selectedVideo.title}
            onClose={() => setSelectedVideo(null)}
          />
        )}

        {/* Renderizado condicional del ArticleViewer */}
        {selectedArticle && (
          <ArticleViewer
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen p-6">
      {showAdminPanel && (
        <EducationAdmin onClose={() => setShowAdminPanel(false)} />
      )}

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

      {dashboardMetrics && (
        <>
          <MetricsOverview 
            dashboardMetrics={dashboardMetrics}
            groceryMetrics={groceryMetrics}
            formatCurrency={formatCurrency}
          />

          <FinancialHealthIndicators 
            dashboardMetrics={dashboardMetrics}
            groceryMetrics={groceryMetrics}
            formatCurrency={formatCurrency}
          />

          <QuickActions 
            dashboardMetrics={dashboardMetrics}
            groceryMetrics={groceryMetrics}
            formatCurrency={formatCurrency}
          />

          {dashboardMetrics.monthlyData && (
            <TrendsSection 
              monthlyData={dashboardMetrics.monthlyData}
              groceryMetrics={groceryMetrics}
              formatCurrency={formatCurrency}
              budgets={budgets}
              calculateSummary={calculateSummary}
            />
          )}
          
          <EducationCenter 
            dashboardMetrics={dashboardMetrics}
            groceryMetrics={groceryMetrics}
            formatCurrency={formatCurrency}
            educationalContent={educationalContent}
            featuredContent={featuredContent}
            handleContentClick={handleContentClick}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

      {/* Renderizado condicional del VideoPlayer */}
      {selectedVideo && (
        <VideoPlayer
          url={selectedVideo.url!}
          title={selectedVideo.title}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      {/* Renderizado condicional del ArticleViewer */}
      {selectedArticle && (
        <ArticleViewer
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  )
}