'use client'

import { useState } from 'react'
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, DollarSign, PieChart, BarChart3, RefreshCw, CheckCircle, XCircle, Activity } from 'lucide-react'
import { useFinancialAI, CategorizationSuggestion } from '@/hooks/useFinancialAI';
import type { Budget, BudgetItem, ExpenseCategory } from '@/lib/types'

interface FinancialAssistantProps {
  budgets: Budget[]
  currentBudgetItems: BudgetItem[]
  categories: ExpenseCategory[]
  formatCurrency: (amount: number) => string
}

export function FinancialAssistant({ budgets, currentBudgetItems, categories, formatCurrency }: FinancialAssistantProps) {
  const [activeTab, setActiveTab] = useState<'patterns' | 'recommendations' | 'categorization' | 'alerts' | 'health'>('health')
  
  const {
    spendingPatterns,
    unusualExpenses,
    recommendations,
    categorizationSuggestions,
    financialHealthScore,
    isAnalyzing,
    lastAnalysis,
    runAnalysis,
    applyCategorization
  } = useFinancialAI({ budgets, currentBudgetItems, categories })

  // Debug removido para evitar spam en consola

  // Función para manejar la aplicación de categorización
  const handleApplyCategorization = async (suggestion: any) => {
    await applyCategorization(suggestion)
    // Aquí podrías agregar lógica adicional como mostrar notificaciones
  }

  const renderPatterns = () => (
    <div className="space-y-6">
      {spendingPatterns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {spendingPatterns.map((pattern, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{pattern.category}</h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  pattern.trend === 'increasing' ? 'bg-red-100 text-red-800' :
                  pattern.trend === 'decreasing' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {pattern.trend === 'increasing' ? '↗️ Aumentando' :
                   pattern.trend === 'decreasing' ? '↘️ Disminuyendo' : '➡️ Estable'}
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Promedio:</span>
                  <span className="font-medium">{formatCurrency(pattern.averageAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frecuencia:</span>
                  <span className="font-medium">{pattern.frequency} gastos</span>
                </div>
                {pattern.anomalies > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Anomalías:</span>
                    <span className="font-medium">{pattern.anomalies}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-between mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Generando patrones de gasto</h3>
          <p className="text-gray-600 mb-4">Necesitas registrar gastos reales para generar patrones de análisis.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Consejo:</span>
            </div>
            <p className="text-sm text-blue-800">
              Ve a tus presupuestos y registra los montos reales gastados en cada categoría. 
              Con al menos 3-5 gastos por categoría podrás ver patrones interesantes.
            </p>
          </div>
        </div>
      )}
    </div>
  )

  const renderRecommendations = () => (
    <div className="space-y-3 sm:space-y-4">
      {recommendations.map((rec) => (
        <div key={rec.id} className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 space-y-2 sm:space-y-0">
            <div className="flex items-start space-x-2">
              <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
                rec.type === 'savings' ? 'bg-green-100 text-green-600' :
                rec.type === 'spending' ? 'bg-red-100 text-red-600' :
                rec.type === 'budget' ? 'bg-blue-100 text-blue-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                {rec.type === 'savings' ? <Target className="w-3 h-3 sm:w-4 sm:h-4" /> :
                 rec.type === 'spending' ? <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> :
                 rec.type === 'budget' ? <PieChart className="w-3 h-3 sm:w-4 sm:h-4" /> :
                 <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">{rec.title}</h3>
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  rec.impact === 'high' ? 'bg-red-100 text-red-800' :
                  rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  Impacto {rec.impact === 'high' ? 'Alto' : rec.impact === 'medium' ? 'Medio' : 'Bajo'}
                </div>
              </div>
            </div>
            {rec.potentialSavings && (
              <div className="text-left sm:text-right flex-shrink-0">
                <div className="text-xs sm:text-sm text-gray-500">Ahorro potencial</div>
                <div className="text-sm sm:text-base font-semibold text-green-600">{formatCurrency(rec.potentialSavings)}</div>
              </div>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mb-3 break-words">{rec.description}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-blue-900">Acción recomendada:</span>
            </div>
            <p className="text-xs sm:text-sm text-blue-800 mt-1 break-words">{rec.action}</p>
          </div>
        </div>
      ))}
    </div>
  )

  const renderAlerts = () => (
    <div className="space-y-3 sm:space-y-4">
      {unusualExpenses.map((expense, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
                expense.severity === 'high' ? 'bg-red-100 text-red-600' :
                expense.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">{expense.item.description}</h3>
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  expense.severity === 'high' ? 'bg-red-100 text-red-800' :
                  expense.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  Severidad {expense.severity === 'high' ? 'Alta' : expense.severity === 'medium' ? 'Media' : 'Baja'}
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <div className="text-sm sm:text-base font-semibold text-red-600">{formatCurrency(expense.item.actual_amount!)}</div>
              <div className="text-xs sm:text-sm text-gray-500">{expense.item.category?.name || 'Sin categoría'}</div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mb-3 break-words">{expense.reason}</p>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 sm:p-3">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-orange-900">Acción sugerida:</span>
            </div>
            <p className="text-xs sm:text-sm text-orange-800 mt-1 break-words">{expense.suggestedAction}</p>
          </div>
        </div>
      ))}
      {unusualExpenses.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Todo se ve bien!</h3>
          <p className="text-gray-600">No se detectaron gastos inusuales este mes.</p>
        </div>
      )}
    </div>
  )

  const renderCategorization = () => (
    <div className="space-y-3 sm:space-y-4">
      {categorizationSuggestions.map((suggestion: CategorizationSuggestion, index: number) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">{suggestion.item.description}</h3>
              <p className="text-xs sm:text-sm text-gray-600">{formatCurrency(suggestion.item.actual_amount!)}</p>
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <div className="text-xs sm:text-sm text-gray-500">Confianza</div>
              <div className="text-sm sm:text-base font-semibold text-blue-600">{Math.round(suggestion.confidence * 100)}%</div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl flex-shrink-0">{suggestion.suggestedCategory.icon}</span>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-medium text-blue-900">Categoría sugerida:</div>
                  <div className="text-xs sm:text-sm text-blue-800">{suggestion.suggestedCategory.name}</div>
                </div>
              </div>
              <div className="flex space-x-2 flex-shrink-0">
                <button 
                  onClick={() => handleApplyCategorization(suggestion)}
                  className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded-lg text-xs sm:text-sm hover:bg-blue-700 transition-colors"
                >
                  Aplicar
                </button>
                <button className="px-2 sm:px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm hover:bg-gray-300 transition-colors">
                  Ignorar
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      {categorizationSuggestions.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Todo categorizado</h3>
          <p className="text-gray-600">No hay gastos pendientes de categorizar.</p>
        </div>
      )}
    </div>
  )

  const renderHealthScore = () => {
    if (!financialHealthScore) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Calculando salud financiera...</h3>
          <p className="text-gray-600">Ejecuta un análisis para ver tu puntaje de salud financiera.</p>
          <button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? 'Analizando...' : 'Ejecutar Análisis'}
          </button>
        </div>
      )
    }

    const getScoreColor = (score: number) => {
      if (score >= 80) return 'text-green-600'
      if (score >= 60) return 'text-yellow-600'
      return 'text-red-600'
    }

    const getScoreBgColor = (score: number) => {
      if (score >= 80) return 'bg-green-100'
      if (score >= 60) return 'bg-yellow-100'
      return 'bg-red-100'
    }

    return (
      <div className="space-y-6">
        {/* Puntaje General */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full ${getScoreBgColor(financialHealthScore.overall)} mb-3 sm:mb-4`}>
              <span className={`text-2xl sm:text-3xl font-bold ${getScoreColor(financialHealthScore.overall)}`}>
                {Math.round(financialHealthScore.overall)}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Puntaje de Salud Financiera</h3>
            <p className="text-sm sm:text-base text-gray-600">
              {financialHealthScore.overall >= 80 ? 'Excelente salud financiera' :
               financialHealthScore.overall >= 60 ? 'Buena salud financiera' :
               'Necesita mejorar'}
            </p>
          </div>
        </div>

        {/* Métricas Detalladas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h4 className="text-sm sm:text-base font-semibold text-gray-900">Tasa de Ahorro</h4>
              <span className={`text-sm sm:text-base font-bold ${getScoreColor(financialHealthScore.savings)}`}>
                {Math.round(financialHealthScore.savings)}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full ${
                  financialHealthScore.savings >= 80 ? 'bg-green-500' :
                  financialHealthScore.savings >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${financialHealthScore.savings}%` }}
              ></div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              {financialHealthScore.savings >= 20 ? 'Excelente capacidad de ahorro' :
               financialHealthScore.savings >= 10 ? 'Buena capacidad de ahorro' :
               'Considera aumentar tus ahorros'}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h4 className="text-sm sm:text-base font-semibold text-gray-900">Control de Gastos</h4>
              <span className={`text-sm sm:text-base font-bold ${getScoreColor(financialHealthScore.spending)}`}>
                {Math.round(financialHealthScore.spending)}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full ${
                  financialHealthScore.spending >= 80 ? 'bg-green-500' :
                  financialHealthScore.spending >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${financialHealthScore.spending}%` }}
              ></div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              {financialHealthScore.spending >= 80 ? 'Excelente control de gastos' :
               financialHealthScore.spending >= 60 ? 'Buen control de gastos' :
               'Revisa tus gastos recurrentes'}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h4 className="text-sm sm:text-base font-semibold text-gray-900">Adherencia al Presupuesto</h4>
              <span className={`text-sm sm:text-base font-bold ${getScoreColor(financialHealthScore.budgetAdherence)}`}>
                {Math.round(financialHealthScore.budgetAdherence)}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full ${
                  financialHealthScore.budgetAdherence >= 80 ? 'bg-green-500' :
                  financialHealthScore.budgetAdherence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${financialHealthScore.budgetAdherence}%` }}
              ></div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              {financialHealthScore.budgetAdherence >= 80 ? 'Excelente seguimiento del presupuesto' :
               financialHealthScore.budgetAdherence >= 60 ? 'Buen seguimiento del presupuesto' :
               'Mejora el seguimiento de tu presupuesto'}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h4 className="text-sm sm:text-base font-semibold text-gray-900">Diversificación de Gastos</h4>
              <span className={`text-sm sm:text-base font-bold ${getScoreColor(Object.values(financialHealthScore.categories).reduce((sum, score) => sum + score, 0) / Object.keys(financialHealthScore.categories).length || 0)}`}>
                {Math.round(Object.values(financialHealthScore.categories).reduce((sum, score) => sum + score, 0) / Object.keys(financialHealthScore.categories).length || 0)}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full ${
                  (Object.values(financialHealthScore.categories).reduce((sum, score) => sum + score, 0) / Object.keys(financialHealthScore.categories).length || 0) >= 80 ? 'bg-green-500' :
                  (Object.values(financialHealthScore.categories).reduce((sum, score) => sum + score, 0) / Object.keys(financialHealthScore.categories).length || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Object.values(financialHealthScore.categories).reduce((sum, score) => sum + score, 0) / Object.keys(financialHealthScore.categories).length || 0}%` }}
              ></div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              {(Object.values(financialHealthScore.categories).reduce((sum, score) => sum + score, 0) / Object.keys(financialHealthScore.categories).length || 0) >= 80 ? 'Gastos bien distribuidos' :
               (Object.values(financialHealthScore.categories).reduce((sum, score) => sum + score, 0) / Object.keys(financialHealthScore.categories).length || 0) >= 60 ? 'Distribución aceptable' :
               'Considera balancear mejor tus gastos'}
            </p>
          </div>
        </div>

        {/* Última actualización */}
        {lastAnalysis && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Último análisis: {lastAnalysis.toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isAnalyzing ? 'Actualizando...' : 'Actualizar Análisis'}
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-4 sm:mb-6">
        <div className="p-2 sm:p-3 bg-purple-100 rounded-full w-fit">
          <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Asistente Financiero IA</h2>
          <p className="text-sm sm:text-base text-gray-600">Análisis inteligente de tus finanzas personales</p>
        </div>
      </div>

      {/* Tabs - Responsive */}
      <div className="bg-white rounded-lg p-1 mb-4 sm:mb-6 overflow-x-auto">
        <div className="flex space-x-1 min-w-max sm:min-w-0">
          {[
            { id: 'health', label: 'Salud', fullLabel: 'Salud Financiera', icon: Target },
            { id: 'patterns', label: 'Patrones', fullLabel: 'Patrones', icon: TrendingUp },
            { id: 'recommendations', label: 'Tips', fullLabel: 'Recomendaciones', icon: Lightbulb },
            { id: 'alerts', label: 'Alertas', fullLabel: 'Alertas', icon: AlertTriangle },
            { id: 'categorization', label: 'Categorías', fullLabel: 'Categorización', icon: PieChart }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium">
                  <span className="sm:hidden">{tab.label}</span>
                  <span className="hidden sm:inline">{tab.fullLabel}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[300px] sm:min-h-[400px]">
        {activeTab === 'health' && renderHealthScore()}
        {activeTab === 'patterns' && renderPatterns()}
        {activeTab === 'recommendations' && renderRecommendations()}
        {activeTab === 'alerts' && renderAlerts()}
        {activeTab === 'categorization' && renderCategorization()}
      </div>
    </div>
  )
}