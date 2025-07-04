import React, { useState, useMemo } from 'react'
import { OverviewChart } from './components/OverviewChart'
import { TrendsChart } from './components/TrendsChart'
import { PredictionsChart } from './components/PredictionsChart'
import { BreakdownChart } from './components/BreakdownChart'
import { ComparisonChart } from './components/ComparisonChart'
import { useChartData } from './hooks/useChartData'
import { ChartType, ChartData } from './types'
import { CHART_CONFIGS } from './constants'

interface InteractiveChartsProps {
  data: ChartData[]
  className?: string
}

/**
 * Componente principal de gráficos interactivos
 * Proporciona una interfaz completa para visualizar datos financieros
 */
export function InteractiveCharts({ data, className = '' }: InteractiveChartsProps) {
  const [activeChart, setActiveChart] = useState<ChartType>('overview')
  const [showPredictions, setShowPredictions] = useState(false)
  
  // Hooks personalizados para procesamiento de datos
  const {
    chartData,
    categoryBreakdown,
    yearComparison,
    metrics: financialMetrics
  } = useChartData(data, showPredictions)
  
  // Obtener predicciones por separado
  const predictions = useMemo(() => {
    if (!showPredictions || data.length < 3) return []
    
    const lastThreeMonths = data.slice(-3)
    const avgIncome = lastThreeMonths.reduce((sum, item) => sum + item.income, 0) / 3
    const avgExpenses = lastThreeMonths.reduce((sum, item) => sum + item.expenses, 0) / 3
    
    return Array.from({ length: 3 }, (_, i) => {
       const predictedIncome = avgIncome * (1 + (Math.random() - 0.5) * 0.1)
       const predictedExpenses = avgExpenses * (1 + (Math.random() - 0.5) * 0.1)
       const predictedBalance = predictedIncome - predictedExpenses
       
       return {
         month: `Predicción ${i + 1}`,
         income: predictedIncome,
         expenses: predictedExpenses,
         balance: predictedBalance,
         savings: Math.max(0, predictedBalance * 0.2),
         isPrediction: true
       }
     })
  }, [data, showPredictions])

  // Función para formatear moneda
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Datos combinados para gráficos que incluyen predicciones
  const combinedData = useMemo(() => {
    if (!showPredictions) return data
    return [...data, ...predictions]
  }, [data, predictions, showPredictions])

  // Renderizar el gráfico activo
  const renderActiveChart = () => {
    switch (activeChart) {
      case 'overview':
        return (
          <OverviewChart 
            data={combinedData}
            showPredictions={showPredictions}
            formatCurrency={formatCurrency}
          />
        )
      
      case 'trends':
        return (
          <TrendsChart 
            data={data}
            formatCurrency={formatCurrency}
          />
        )
      
      case 'predictions':
        return (
          <PredictionsChart 
            data={predictions}
            formatCurrency={formatCurrency}
          />
        )
      
      case 'breakdown':
        return (
          <BreakdownChart 
            data={categoryBreakdown}
            formatCurrency={formatCurrency}
          />
        )
      
      case 'comparison':
        return (
          <ComparisonChart 
            data={yearComparison}
            formatCurrency={formatCurrency}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Header con métricas financieras */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              📊 Análisis Financiero Interactivo
            </h2>
            <p className="text-gray-600">
              Visualiza y analiza tus datos financieros con gráficos dinámicos
            </p>
          </div>
          
          {/* Toggle de predicciones */}
          <div className="mt-4 lg:mt-0">
            <label className="flex items-center space-x-3 cursor-pointer">
              <span className="text-sm font-medium text-gray-700">
                Mostrar Predicciones
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={showPredictions}
                  onChange={(e) => setShowPredictions(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                  showPredictions ? 'bg-blue-600' : 'bg-gray-300'
                }`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 mt-1 ml-1 ${
                    showPredictions ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Métricas financieras */}
        <FinancialMetricsDisplay 
          metrics={financialMetrics}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Navegación de gráficos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <ChartNavigation 
          activeChart={activeChart}
          onChartChange={setActiveChart}
        />
        
        {/* Contenedor del gráfico */}
        <div className="mt-6">
          {renderActiveChart()}
        </div>
      </div>
    </div>
  )
}

/**
 * Componente para mostrar métricas financieras
 */
interface FinancialMetricsDisplayProps {
  metrics: {
    totalIncome: number
    totalExpenses: number
    averageBalance: number
    savingsRate: number
  }
  formatCurrency: (amount: number) => string
}

function FinancialMetricsDisplay({ metrics, formatCurrency }: FinancialMetricsDisplayProps) {
  const metricsData = [
    {
      label: 'Ingresos Totales',
      value: formatCurrency(metrics.totalIncome),
      icon: '💰',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      label: 'Gastos Totales',
      value: formatCurrency(metrics.totalExpenses),
      icon: '💸',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      label: 'Balance Promedio',
      value: formatCurrency(metrics.averageBalance),
      icon: '⚖️',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      label: 'Tasa de Ahorro',
      value: `${metrics.savingsRate.toFixed(1)}%`,
      icon: '🎯',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricsData.map((metric, index) => (
        <div 
          key={index}
          className={`p-4 rounded-lg border ${metric.bgColor} ${metric.borderColor}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{metric.icon}</span>
            <div className={`text-lg font-bold ${metric.color}`}>
              {metric.value}
            </div>
          </div>
          <div className="text-sm font-medium text-gray-700">
            {metric.label}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Componente de navegación entre gráficos
 */
interface ChartNavigationProps {
  activeChart: ChartType
  onChartChange: (chart: ChartType) => void
}

function ChartNavigation({ activeChart, onChartChange }: ChartNavigationProps) {
  const chartOptions: Array<{ key: ChartType; label: string; icon: string; description: string }> = [
    {
      key: 'overview',
      label: 'Resumen General',
      icon: '📈',
      description: 'Vista general de ingresos, gastos y balance'
    },
    {
      key: 'trends',
      label: 'Tendencias',
      icon: '📊',
      description: 'Análisis de tendencias temporales'
    },
    {
      key: 'predictions',
      label: 'Predicciones',
      icon: '🔮',
      description: 'Proyecciones basadas en datos históricos'
    },
    {
      key: 'breakdown',
      label: 'Desglose',
      icon: '🥧',
      description: 'Distribución de gastos por categorías'
    },
    {
      key: 'comparison',
      label: 'Comparación',
      icon: '⚖️',
      description: 'Comparativa año a año'
    }
  ]

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Selecciona un Gráfico
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {chartOptions.map((option) => {
          const isActive = activeChart === option.key
          const config = CHART_CONFIGS[option.key]
          
          return (
            <button
              key={option.key}
              onClick={() => onChartChange(option.key)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                isActive
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center mb-2">
                <span className="text-xl mr-2">{option.icon}</span>
                <span className={`font-semibold ${
                  isActive ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {option.label}
                </span>
              </div>
              
              <p className={`text-xs ${
                isActive ? 'text-blue-700' : 'text-gray-600'
              }`}>
                {option.description}
              </p>
              
              {isActive && (
                <div className="mt-2 flex items-center text-xs text-blue-600">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Activo
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default InteractiveCharts