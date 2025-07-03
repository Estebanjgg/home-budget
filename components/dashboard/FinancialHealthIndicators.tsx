import React from 'react'

interface FinancialHealthIndicatorsProps {
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

export function FinancialHealthIndicators({ dashboardMetrics, groceryMetrics, formatCurrency }: FinancialHealthIndicatorsProps) {
  // Calcular puntuación de salud financiera (0-100)
  const calculateHealthScore = () => {
    let score = 0
    
    // Tasa de ahorro (30 puntos máximo)
    if (dashboardMetrics.savingsRate >= 20) score += 30
    else if (dashboardMetrics.savingsRate >= 15) score += 25
    else if (dashboardMetrics.savingsRate >= 10) score += 20
    else if (dashboardMetrics.savingsRate >= 5) score += 15
    else score += Math.max(0, dashboardMetrics.savingsRate)
    
    // Ratio de gastos (25 puntos máximo)
    if (dashboardMetrics.expenseRatio <= 70) score += 25
    else if (dashboardMetrics.expenseRatio <= 80) score += 20
    else if (dashboardMetrics.expenseRatio <= 90) score += 15
    else score += Math.max(0, 25 - (dashboardMetrics.expenseRatio - 70))
    
    // Gastos de supermercado (25 puntos máximo)
    if (groceryMetrics.percentageOfIncome <= 15) score += 25
    else if (groceryMetrics.percentageOfIncome <= 20) score += 20
    else if (groceryMetrics.percentageOfIncome <= 25) score += 15
    else score += Math.max(0, 25 - (groceryMetrics.percentageOfIncome - 15))
    
    // Eficiencia de supermercado (20 puntos máximo)
    if (groceryMetrics.efficiency >= 20) score += 20
    else if (groceryMetrics.efficiency >= 10) score += 15
    else if (groceryMetrics.efficiency >= 0) score += 10
    else score += 5
    
    return Math.min(100, Math.max(0, score))
  }
  
  const healthScore = calculateHealthScore()
  
  const getHealthStatus = (score: number) => {
    if (score >= 85) return { status: 'Excelente', color: 'green', emoji: '🌟', description: 'Tu salud financiera es excepcional' }
    if (score >= 70) return { status: 'Muy Buena', color: 'blue', emoji: '💪', description: 'Tienes un buen control financiero' }
    if (score >= 55) return { status: 'Buena', color: 'yellow', emoji: '👍', description: 'Vas por buen camino, sigue mejorando' }
    if (score >= 40) return { status: 'Regular', color: 'orange', emoji: '⚠️', description: 'Necesitas mejorar algunos aspectos' }
    return { status: 'Necesita Atención', color: 'red', emoji: '🚨', description: 'Es momento de tomar acción' }
  }
  
  const health = getHealthStatus(healthScore)
  
  return (
    <div className="space-y-6">
      {/* Puntuación General de Salud Financiera */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center">
            <span className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full p-3 mr-4">
              🏥
            </span>
            Salud Financiera Integral
          </h3>
          
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Círculo de fondo */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              {/* Círculo de progreso */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke={health.color === 'green' ? '#10b981' : 
                       health.color === 'blue' ? '#3b82f6' :
                       health.color === 'yellow' ? '#f59e0b' :
                       health.color === 'orange' ? '#f97316' : '#ef4444'}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${healthScore * 2.51} 251`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">{health.emoji}</div>
                <div className="text-3xl font-bold text-gray-800">{healthScore}</div>
                <div className="text-sm text-gray-500">/ 100</div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <h4 className={`text-2xl font-bold mb-2 ${
              health.color === 'green' ? 'text-green-600' :
              health.color === 'blue' ? 'text-blue-600' :
              health.color === 'yellow' ? 'text-yellow-600' :
              health.color === 'orange' ? 'text-orange-600' : 'text-red-600'
            }`}>
              {health.status}
            </h4>
            <p className="text-gray-600">{health.description}</p>
          </div>
        </div>
      </div>
      
      {/* Indicadores Detallados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Indicador de Ahorros */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-gradient-to-r from-blue-400 to-green-500 rounded-full p-2 mr-3">
              🏦
            </span>
            Capacidad de Ahorro
          </h4>
          <div className="relative mb-4">
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div 
                className="bg-gradient-to-r from-blue-400 to-green-500 h-6 rounded-full transition-all duration-1000 flex items-center justify-end pr-2"
                style={{ width: `${Math.min(dashboardMetrics.savingsRate * 3.33, 100)}%` }}
              >
                <span className="text-white text-xs font-bold">
                  {dashboardMetrics.savingsRate.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>0%</span>
              <span className="font-bold">Meta: 20%</span>
              <span>30%</span>
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm text-blue-800 font-medium mb-2">
              💰 Ahorros actuales: {formatCurrency(dashboardMetrics.totalSavings)}
            </p>
            <p className="text-xs text-blue-600">
              {dashboardMetrics.savingsRate >= 20 ? '🌟 ¡Excelente! Superas la meta recomendada' :
               dashboardMetrics.savingsRate >= 10 ? '👍 Buen ritmo, intenta llegar al 20%' :
               '📈 Aumenta gradualmente tu tasa de ahorro'}
            </p>
          </div>
        </div>
        
        {/* Indicador de Control de Gastos */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-gradient-to-r from-yellow-400 to-red-500 rounded-full p-2 mr-3">
              📊
            </span>
            Control de Gastos
          </h4>
          <div className="relative mb-4">
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div 
                className={`h-6 rounded-full transition-all duration-1000 flex items-center justify-end pr-2 ${
                  dashboardMetrics.expenseRatio <= 70 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                  dashboardMetrics.expenseRatio <= 85 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                  'bg-gradient-to-r from-red-400 to-red-500'
                }`}
                style={{ width: `${Math.min(dashboardMetrics.expenseRatio, 100)}%` }}
              >
                <span className="text-white text-xs font-bold">
                  {dashboardMetrics.expenseRatio.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>0%</span>
              <span className="font-bold">Meta: &lt;70%</span>
              <span>100%</span>
            </div>
          </div>
          <div className={`rounded-xl p-4 ${
            dashboardMetrics.expenseRatio <= 70 ? 'bg-green-50' :
            dashboardMetrics.expenseRatio <= 85 ? 'bg-yellow-50' : 'bg-red-50'
          }`}>
            <p className={`text-sm font-medium mb-2 ${
              dashboardMetrics.expenseRatio <= 70 ? 'text-green-800' :
              dashboardMetrics.expenseRatio <= 85 ? 'text-yellow-800' : 'text-red-800'
            }`}>
              💸 Gastos: {formatCurrency(dashboardMetrics.totalExpenses)}
            </p>
            <p className={`text-xs ${
              dashboardMetrics.expenseRatio <= 70 ? 'text-green-600' :
              dashboardMetrics.expenseRatio <= 85 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {dashboardMetrics.expenseRatio <= 70 ? '✅ Excelente control de gastos' :
               dashboardMetrics.expenseRatio <= 85 ? '⚠️ Control moderado, puedes mejorar' :
               '🚨 Gastos altos, revisa tu presupuesto'}
            </p>
          </div>
        </div>
        
        {/* Indicador de Gastos de Supermercado */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-gradient-to-r from-orange-400 to-red-500 rounded-full p-2 mr-3">
              🛒
            </span>
            Gastos de Supermercado
          </h4>
          <div className="relative mb-4">
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div 
                className={`h-6 rounded-full transition-all duration-1000 flex items-center justify-end pr-2 ${
                  groceryMetrics.percentageOfIncome <= 15 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                  groceryMetrics.percentageOfIncome <= 25 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                  'bg-gradient-to-r from-red-400 to-red-500'
                }`}
                style={{ width: `${Math.min(groceryMetrics.percentageOfIncome * 2.5, 100)}%` }}
              >
                <span className="text-white text-xs font-bold">
                  {groceryMetrics.percentageOfIncome.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>0%</span>
              <span className="font-bold">Meta: &lt;20%</span>
              <span>40%</span>
            </div>
          </div>
          <div className={`rounded-xl p-4 ${
            groceryMetrics.percentageOfIncome <= 15 ? 'bg-green-50' :
            groceryMetrics.percentageOfIncome <= 25 ? 'bg-yellow-50' : 'bg-red-50'
          }`}>
            <p className={`text-sm font-medium mb-2 ${
              groceryMetrics.percentageOfIncome <= 15 ? 'text-green-800' :
              groceryMetrics.percentageOfIncome <= 25 ? 'text-yellow-800' : 'text-red-800'
            }`}>
              🛍️ Supermercado: {formatCurrency(groceryMetrics.totalSpent)}
            </p>
            <p className={`text-xs ${
              groceryMetrics.percentageOfIncome <= 15 ? 'text-green-600' :
              groceryMetrics.percentageOfIncome <= 25 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {groceryMetrics.percentageOfIncome <= 15 ? '🌟 Gastos de alimentación óptimos' :
               groceryMetrics.percentageOfIncome <= 25 ? '👍 Gastos razonables, puedes optimizar' :
               '⚠️ Gastos altos en alimentación'}
            </p>
          </div>
        </div>
        
        {/* Indicador de Eficiencia */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-full p-2 mr-3">
              ⚡
            </span>
            Eficiencia de Compras
          </h4>
          <div className="relative mb-4">
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div 
                className={`h-6 rounded-full transition-all duration-1000 flex items-center justify-end pr-2 ${
                  groceryMetrics.efficiency >= 20 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                  groceryMetrics.efficiency >= 10 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                  'bg-gradient-to-r from-red-400 to-red-500'
                }`}
                style={{ width: `${Math.min(Math.max(groceryMetrics.efficiency, 0) * 2, 100)}%` }}
              >
                <span className="text-white text-xs font-bold">
                  {groceryMetrics.efficiency.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>0%</span>
              <span className="font-bold">Meta: &gt;20%</span>
              <span>50%</span>
            </div>
          </div>
          <div className={`rounded-xl p-4 ${
            groceryMetrics.efficiency >= 20 ? 'bg-green-50' :
            groceryMetrics.efficiency >= 10 ? 'bg-yellow-50' : 'bg-red-50'
          }`}>
            <p className={`text-sm font-medium mb-2 ${
              groceryMetrics.efficiency >= 20 ? 'text-green-800' :
              groceryMetrics.efficiency >= 10 ? 'text-yellow-800' : 'text-red-800'
            }`}>
              💡 Eficiencia: {groceryMetrics.efficiency.toFixed(1)}%
            </p>
            <p className={`text-xs ${
              groceryMetrics.efficiency >= 20 ? 'text-green-600' :
              groceryMetrics.efficiency >= 10 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {groceryMetrics.efficiency >= 20 ? '🌟 Excelente planificación de compras' :
               groceryMetrics.efficiency >= 10 ? '👍 Buena eficiencia, sigue mejorando' :
               '📈 Planifica mejor tus compras'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}