import React, { useState, useEffect } from 'react'
import { InteractiveCharts } from '../InteractiveCharts'
import { ChartData } from '../types'

/**
 * Ejemplo de integración de los gráficos interactivos
 * en un dashboard existente con datos reales
 */
export function IntegrationExample() {
  const [monthlyData, setMonthlyData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Función para formatear moneda
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Simular carga de datos (reemplazar con tu API real)
  useEffect(() => {
    const loadFinancialData = async () => {
      try {
        setLoading(true)
        
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Datos de ejemplo - reemplazar con tu fuente de datos real
        const mockData: ChartData[] = [
          {
            month: 'Ene 2024',
            income: 4500000,
            expenses: 3200000,
            balance: 1300000,
            savings: 450000
          },
          {
            month: 'Feb 2024',
            income: 4800000,
            expenses: 3400000,
            balance: 1400000,
            savings: 480000
          },
          {
            month: 'Mar 2024',
            income: 4600000,
            expenses: 3100000,
            balance: 1500000,
            savings: 460000
          },
          {
            month: 'Abr 2024',
            income: 5000000,
            expenses: 3600000,
            balance: 1400000,
            savings: 500000
          },
          {
            month: 'May 2024',
            income: 4900000,
            expenses: 3300000,
            balance: 1600000,
            savings: 490000
          },
          {
            month: 'Jun 2024',
            income: 5200000,
            expenses: 3800000,
            balance: 1400000,
            savings: 520000
          }
        ]
        
        setMonthlyData(mockData)
        setError(null)
      } catch (err) {
        setError('Error al cargar los datos financieros')
        console.error('Error loading financial data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadFinancialData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos financieros...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <span className="text-red-500 text-xl mr-3">⚠️</span>
          <div>
            <h3 className="text-red-800 font-medium">Error al cargar datos</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header del dashboard */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">📊 Dashboard Financiero</h1>
        <p className="text-blue-100">
          Análisis completo de tus finanzas personales con gráficos interactivos
        </p>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Balance Actual"
          value={monthlyData[monthlyData.length - 1]?.balance || 0}
          formatCurrency={formatCurrency}
          icon="💰"
          color="text-green-600"
        />
        <MetricCard
          title="Ingresos del Mes"
          value={monthlyData[monthlyData.length - 1]?.income || 0}
          formatCurrency={formatCurrency}
          icon="📈"
          color="text-blue-600"
        />
        <MetricCard
          title="Gastos del Mes"
          value={monthlyData[monthlyData.length - 1]?.expenses || 0}
          formatCurrency={formatCurrency}
          icon="📉"
          color="text-red-600"
        />
        <MetricCard
          title="Ahorros"
          value={monthlyData[monthlyData.length - 1]?.savings || 0}
          formatCurrency={formatCurrency}
          icon="🏦"
          color="text-purple-600"
        />
      </div>

      {/* Gráficos interactivos */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <InteractiveCharts 
          data={monthlyData}
          className="w-full"
        />
      </div>

      {/* Insights adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InsightCard
          title="💡 Insight del Mes"
          content="Tus gastos han disminuido un 8% comparado con el mes anterior. ¡Excelente trabajo!"
          type="success"
        />
        <InsightCard
          title="🎯 Recomendación"
          content="Considera aumentar tus ahorros al 15% de tus ingresos para alcanzar tus metas financieras más rápido."
          type="info"
        />
      </div>
    </div>
  )
}

/**
 * Componente para mostrar métricas rápidas
 */
interface MetricCardProps {
  title: string
  value: number
  formatCurrency: (amount: number) => string
  icon: string
  color: string
}

function MetricCard({ title, value, formatCurrency, icon, color }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className={`text-sm font-medium ${color}`}>↗</span>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className={`text-xl font-bold ${color}`}>
        {formatCurrency(value)}
      </p>
    </div>
  )
}

/**
 * Componente para mostrar insights
 */
interface InsightCardProps {
  title: string
  content: string
  type: 'success' | 'info' | 'warning'
}

function InsightCard({ title, content, type }: InsightCardProps) {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  }

  return (
    <div className={`rounded-lg p-4 border ${styles[type]}`}>
      <h4 className="font-medium mb-2">{title}</h4>
      <p className="text-sm">{content}</p>
    </div>
  )
}

export default IntegrationExample