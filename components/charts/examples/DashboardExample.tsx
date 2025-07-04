import React, { useState, useEffect } from 'react'
import { InteractiveCharts } from '../index'
import { ChartData } from '../types'

/**
 * Ejemplo de implementación de los gráficos interactivos
 * en un dashboard financiero real
 */
export function DashboardExample() {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Simular carga de datos desde API
  useEffect(() => {
    const loadFinancialData = async () => {
      try {
        setLoading(true)
        
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Datos de ejemplo más realistas
        const mockData: ChartData[] = [
          {
            month: 'Enero 2024',
            income: 4800000,
            expenses: 3200000,
            balance: 1600000,
            savings: 320000,
            category: 'Alimentación',
            isPrediction: false
          },
          {
            month: 'Febrero 2024',
            income: 5100000,
            expenses: 3400000,
            balance: 1700000,
            savings: 340000,
            category: 'Transporte',
            isPrediction: false
          },
          {
            month: 'Marzo 2024',
            income: 4900000,
            expenses: 3600000,
            balance: 1300000,
            savings: 260000,
            category: 'Entretenimiento',
            isPrediction: false
          },
          {
            month: 'Abril 2024',
            income: 5200000,
            expenses: 3300000,
            balance: 1900000,
            savings: 380000,
            category: 'Salud',
            isPrediction: false
          },
          {
            month: 'Mayo 2024',
            income: 5000000,
            expenses: 3500000,
            balance: 1500000,
            savings: 300000,
            category: 'Educación',
            isPrediction: false
          },
          {
            month: 'Junio 2024',
            income: 5300000,
            expenses: 3700000,
            balance: 1600000,
            savings: 320000,
            category: 'Hogar',
            isPrediction: false
          },
          {
            month: 'Julio 2024',
            income: 5150000,
            expenses: 3450000,
            balance: 1700000,
            savings: 340000,
            category: 'Alimentación',
            isPrediction: false
          },
          {
            month: 'Agosto 2024',
            income: 5400000,
            expenses: 3800000,
            balance: 1600000,
            savings: 320000,
            category: 'Transporte',
            isPrediction: false
          },
          {
            month: 'Septiembre 2024',
            income: 5250000,
            expenses: 3550000,
            balance: 1700000,
            savings: 340000,
            category: 'Entretenimiento',
            isPrediction: false
          },
          {
            month: 'Octubre 2024',
            income: 5500000,
            expenses: 3900000,
            balance: 1600000,
            savings: 320000,
            category: 'Salud',
            isPrediction: false
          },
          {
            month: 'Noviembre 2024',
            income: 5350000,
            expenses: 3650000,
            balance: 1700000,
            savings: 340000,
            category: 'Educación',
            isPrediction: false
          },
          {
            month: 'Diciembre 2024',
            income: 5600000,
            expenses: 4000000,
            balance: 1600000,
            savings: 320000,
            category: 'Hogar',
            isPrediction: false
          }
        ]
        
        setChartData(mockData)
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

  // Función para recargar datos
  const handleRefresh = () => {
    setChartData([])
    setLoading(true)
    // Simular recarga
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState error={error} onRetry={handleRefresh} />
  }

  if (chartData.length === 0) {
    return <EmptyState onRefresh={handleRefresh} />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header del Dashboard */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                💰 Dashboard Financiero
              </h1>
              <p className="mt-2 text-gray-600">
                Análisis completo de tus finanzas personales
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualizar
              </button>
              
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Gráficos Interactivos */}
        <InteractiveCharts 
          data={chartData}
          className="mb-8"
        />

        {/* Información adicional */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickInsights data={chartData} />
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}

/**
 * Estado de carga
 */
function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Cargando datos financieros...
        </h3>
        <p className="text-gray-600">
          Esto puede tomar unos segundos
        </p>
      </div>
    </div>
  )
}

/**
 * Estado de error
 */
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error al cargar datos
        </h3>
        <p className="text-gray-600 mb-6">
          {error}
        </p>
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  )
}

/**
 * Estado vacío
 */
function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay datos disponibles
        </h3>
        <p className="text-gray-600 mb-6">
          Agrega algunas transacciones para ver tus gráficos financieros
        </p>
        <button
          onClick={onRefresh}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Actualizar
        </button>
      </div>
    </div>
  )
}

/**
 * Insights rápidos
 */
function QuickInsights({ data }: { data: ChartData[] }) {
  const totalIncome = data.reduce((sum, item) => sum + item.income, 0)
  const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0)
  const avgBalance = data.reduce((sum, item) => sum + item.balance, 0) / data.length
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        💡 Insights Rápidos
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Mejor mes:</span>
          <span className="font-semibold text-green-600">
            {data.reduce((best, current) => 
              current.balance > best.balance ? current : best
            ).month}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Promedio mensual:</span>
          <span className="font-semibold text-blue-600">
            {formatCurrency(avgBalance)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Tasa de ahorro:</span>
          <span className="font-semibold text-purple-600">
            {((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Actividad reciente
 */
function RecentActivity() {
  const activities = [
    { type: 'income', description: 'Salario recibido', amount: 5600000, time: '2 horas' },
    { type: 'expense', description: 'Compra supermercado', amount: 250000, time: '5 horas' },
    { type: 'expense', description: 'Pago servicios', amount: 180000, time: '1 día' },
    { type: 'income', description: 'Freelance', amount: 800000, time: '2 días' }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        🕒 Actividad Reciente
      </h3>
      
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'income' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500">
                  Hace {activity.time}
                </p>
              </div>
            </div>
            
            <span className={`text-sm font-semibold ${
              activity.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {activity.type === 'income' ? '+' : '-'}{formatCurrency(activity.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DashboardExample