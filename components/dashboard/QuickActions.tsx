import React from 'react'
import Link from 'next/link'

interface QuickActionsProps {
  dashboardMetrics: {
    totalIncome: number
    totalExpenses: number
    totalSavings: number
    savingsRate: number
    expenseRatio: number
  }
  groceryMetrics: {
    totalSpent: number
    percentageOfIncome: number
    efficiency: number
  }
  formatCurrency: (amount: number) => string
}

export function QuickActions({ dashboardMetrics, groceryMetrics, formatCurrency }: QuickActionsProps) {
  // Generar recomendaciones inteligentes basadas en las métricas
  const getSmartRecommendations = () => {
    const recommendations = []
    
    if (dashboardMetrics.savingsRate < 10) {
      recommendations.push({
        title: 'Aumentar Ahorros',
        description: 'Tu tasa de ahorro está por debajo del 10%. Considera reducir gastos no esenciales.',
        action: 'Crear Plan de Ahorro',
        link: '/budget',
        icon: '💰',
        color: 'blue',
        priority: 'high'
      })
    }
    
    if (groceryMetrics.percentageOfIncome > 25) {
      recommendations.push({
        title: 'Optimizar Gastos de Supermercado',
        description: 'Gastas más del 25% de tus ingresos en supermercado. Planifica mejor tus compras.',
        action: 'Planificar Compras',
        link: '/grocery',
        icon: '🛒',
        color: 'orange',
        priority: 'high'
      })
    }
    
    if (groceryMetrics.efficiency < 10) {
      recommendations.push({
        title: 'Mejorar Eficiencia de Compras',
        description: 'Tu eficiencia de compras es baja. Usa listas y compara precios.',
        action: 'Ver Consejos',
        link: '/grocery',
        icon: '⚡',
        color: 'purple',
        priority: 'medium'
      })
    }
    
    if (dashboardMetrics.expenseRatio > 85) {
      recommendations.push({
        title: 'Controlar Gastos',
        description: 'Tus gastos superan el 85% de tus ingresos. Revisa tu presupuesto.',
        action: 'Revisar Presupuesto',
        link: '/budget',
        icon: '📊',
        color: 'red',
        priority: 'high'
      })
    }
    
    // Recomendaciones positivas
    if (dashboardMetrics.savingsRate >= 20) {
      recommendations.push({
        title: 'Invertir Ahorros',
        description: '¡Excelente! Tienes una buena tasa de ahorro. Considera opciones de inversión.',
        action: 'Explorar Inversiones',
        link: '/education',
        icon: '📈',
        color: 'green',
        priority: 'low'
      })
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder: Record<'high' | 'medium' | 'low', number> = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority as 'high' | 'medium' | 'low'] - priorityOrder[a.priority as 'high' | 'medium' | 'low']
    })
  }
  
  const recommendations = getSmartRecommendations()
  
  const quickActions = [
    {
      title: 'Nuevo Presupuesto',
      description: 'Crea o ajusta tu presupuesto mensual',
      icon: '📋',
      link: '/budget',
      color: 'blue'
    },
    {
      title: 'Lista de Compras',
      description: 'Planifica tu próxima ida al supermercado',
      icon: '📝',
      link: '/grocery',
      color: 'green'
    },
    {
      title: 'Registrar Gasto',
      description: 'Añade un nuevo gasto a tu presupuesto',
      icon: '💸',
      link: '/budget',
      color: 'orange'
    },
    {
      title: 'Ver Reportes',
      description: 'Analiza tus patrones de gasto',
      icon: '📊',
      link: '/reports',
      color: 'purple'
    }
  ]
  
  return (
    <div className="space-y-8">
      {/* Recomendaciones Inteligentes */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <h3 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-3 mr-4">
              🎯
            </span>
            Recomendaciones Personalizadas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.slice(0, 4).map((rec, index) => (
              <div key={index} className={`relative overflow-hidden rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                rec.priority === 'high' ? 'border-red-200 bg-red-50' :
                rec.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                'border-green-200 bg-green-50'
              }`}>
                <div className="flex items-start space-x-4">
                  <div className={`text-4xl p-3 rounded-full ${
                    rec.color === 'blue' ? 'bg-blue-100' :
                    rec.color === 'orange' ? 'bg-orange-100' :
                    rec.color === 'purple' ? 'bg-purple-100' :
                    rec.color === 'red' ? 'bg-red-100' :
                    'bg-green-100'
                  }`}>
                    {rec.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-800 mb-2">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">{rec.description}</p>
                    <Link href={rec.link}>
                      <button className={`px-4 py-2 rounded-xl text-white font-medium transition-all duration-300 hover:shadow-lg ${
                        rec.color === 'blue' ? 'bg-blue-500 hover:bg-blue-600' :
                        rec.color === 'orange' ? 'bg-orange-500 hover:bg-orange-600' :
                        rec.color === 'purple' ? 'bg-purple-500 hover:bg-purple-600' :
                        rec.color === 'red' ? 'bg-red-500 hover:bg-red-600' :
                        'bg-green-500 hover:bg-green-600'
                      }`}>
                        {rec.action}
                      </button>
                    </Link>
                  </div>
                </div>
                
                {/* Indicador de prioridad */}
                <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
                  rec.priority === 'high' ? 'bg-red-500' :
                  rec.priority === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}></div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Acciones Rápidas */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <h3 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-full p-3 mr-4">
            ⚡
          </span>
          Acciones Rápidas
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.link}>
              <div className="group cursor-pointer bg-gray-50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:bg-white border border-gray-100">
                <div className={`text-4xl mb-4 p-3 rounded-full w-fit mx-auto transition-all duration-300 group-hover:scale-110 ${
                  action.color === 'blue' ? 'bg-blue-100 group-hover:bg-blue-200' :
                  action.color === 'green' ? 'bg-green-100 group-hover:bg-green-200' :
                  action.color === 'orange' ? 'bg-orange-100 group-hover:bg-orange-200' :
                  'bg-purple-100 group-hover:bg-purple-200'
                }`}>
                  {action.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2 text-center group-hover:text-gray-900">
                  {action.title}
                </h4>
                <p className="text-sm text-gray-600 text-center group-hover:text-gray-700">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Resumen de Metas */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <h3 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full p-3 mr-4">
            🎯
          </span>
          Progreso de Metas
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Meta de Ahorro */}
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-blue-800">Meta de Ahorro</h4>
              <span className="text-2xl">💰</span>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-blue-600 mb-2">
                <span>Actual: {dashboardMetrics.savingsRate.toFixed(1)}%</span>
                <span>Meta: 20%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(dashboardMetrics.savingsRate * 5, 100)}%` }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-blue-600">
              {dashboardMetrics.savingsRate >= 20 ? '🌟 ¡Meta alcanzada!' :
               `Faltan ${(20 - dashboardMetrics.savingsRate).toFixed(1)}% para la meta`}
            </p>
          </div>
          
          {/* Meta de Gastos de Supermercado */}
          <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-orange-800">Gastos Supermercado</h4>
              <span className="text-2xl">🛒</span>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-orange-600 mb-2">
                <span>Actual: {groceryMetrics.percentageOfIncome.toFixed(1)}%</span>
                <span>Meta: &lt;20%</span>
              </div>
              <div className="w-full bg-orange-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    groceryMetrics.percentageOfIncome <= 20 ? 'bg-green-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min(groceryMetrics.percentageOfIncome * 5, 100)}%` }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-orange-600">
              {groceryMetrics.percentageOfIncome <= 20 ? '✅ Dentro de la meta' :
               `${(groceryMetrics.percentageOfIncome - 20).toFixed(1)}% por encima de la meta`}
            </p>
          </div>
          
          {/* Meta de Eficiencia */}
          <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-purple-800">Eficiencia</h4>
              <span className="text-2xl">⚡</span>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-purple-600 mb-2">
                <span>Actual: {groceryMetrics.efficiency.toFixed(1)}%</span>
                <span>Meta: &gt;20%</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    groceryMetrics.efficiency >= 20 ? 'bg-green-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${Math.min(Math.max(groceryMetrics.efficiency, 0) * 2.5, 100)}%` }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-purple-600">
              {groceryMetrics.efficiency >= 20 ? '🌟 ¡Excelente eficiencia!' :
               `Mejora ${(20 - groceryMetrics.efficiency).toFixed(1)}% más`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}