import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { YearComparisonData } from '../types'
import { CHART_COLORS, DEFAULT_CHART_CONFIG, AXIS_CONFIG } from '../constants'
import { CustomTooltip } from './CustomTooltip'

interface ComparisonChartProps {
  data: YearComparisonData[]
  formatCurrency: (amount: number) => string
}

/**
 * Gráfico de comparación año a año que muestra
 * la evolución del balance financiero
 */
export function ComparisonChart({ data, formatCurrency }: ComparisonChartProps) {
  if (data.length === 0) {
    return (
      <div className="w-full">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">
            Datos Insuficientes
          </h4>
          <p className="text-gray-600">
            Necesitas al menos 6 meses de datos para ver la comparación año a año
          </p>
        </div>
      </div>
    )
  }

  // Obtener los años de los datos
  const years = Object.keys(data[0] || {}).filter(key => key !== 'month')
  const currentYear = new Date().getFullYear().toString()
  const lastYear = (new Date().getFullYear() - 1).toString()

  return (
    <div className="w-full">
      {/* Header del gráfico */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-1">
          ⚖️ Comparativa Año a Año
        </h4>
        <p className="text-sm text-gray-600">
          Balance financiero: {lastYear} vs {currentYear}
        </p>
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={DEFAULT_CHART_CONFIG.height}>
        <BarChart
          data={data}
          margin={DEFAULT_CHART_CONFIG.margin}
          barCategoryGap="20%"
        >
          {/* Grid */}
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#f0f0f0" 
            opacity={0.7}
          />
          
          {/* Ejes */}
          <XAxis 
            dataKey="month" 
            stroke={AXIS_CONFIG.stroke}
            fontSize={AXIS_CONFIG.fontSize}
            tick={{ fill: AXIS_CONFIG.stroke }}
          />
          <YAxis 
            stroke={AXIS_CONFIG.stroke}
            fontSize={AXIS_CONFIG.fontSize}
            tickFormatter={AXIS_CONFIG.tickFormatter}
            tick={{ fill: AXIS_CONFIG.stroke }}
          />
          
          {/* Tooltip y Leyenda */}
          <Tooltip 
            content={<CustomTooltip formatCurrency={formatCurrency} />}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
          />
          
          {/* Barra del año actual */}
          <Bar 
            dataKey={currentYear} 
            fill={CHART_COLORS.income} 
            name={`${currentYear}`}
            radius={[4, 4, 0, 0]}
            maxBarSize={60}
          />
          
          {/* Barra del año anterior */}
          <Bar 
            dataKey={lastYear} 
            fill={CHART_COLORS.expenses} 
            name={`${lastYear}`}
            radius={[4, 4, 0, 0]}
            maxBarSize={60}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Análisis comparativo */}
      <div className="mt-6 space-y-4">
        <ComparisonAnalysis 
          data={data} 
          currentYear={currentYear} 
          lastYear={lastYear}
          formatCurrency={formatCurrency}
        />
      </div>
    </div>
  )
}

/**
 * Componente para mostrar análisis comparativo
 */
interface ComparisonAnalysisProps {
  data: YearComparisonData[]
  currentYear: string
  lastYear: string
  formatCurrency: (amount: number) => string
}

function ComparisonAnalysis({ data, currentYear, lastYear, formatCurrency }: ComparisonAnalysisProps) {
  // Calcular totales
  const currentYearTotal = data.reduce((sum, month) => {
    const value = month[currentYear] as number
    return sum + (value || 0)
  }, 0)

  const lastYearTotal = data.reduce((sum, month) => {
    const value = month[lastYear] as number
    return sum + (value || 0)
  }, 0)

  const difference = currentYearTotal - lastYearTotal
  const percentageChange = lastYearTotal !== 0 ? (difference / lastYearTotal) * 100 : 0
  const isImprovement = difference > 0

  // Encontrar el mejor y peor mes
  const bestMonth = data.reduce((best, current) => {
    const currentValue = current[currentYear] as number || 0
    const bestValue = best[currentYear] as number || 0
    return currentValue > bestValue ? current : best
  })

  const worstMonth = data.reduce((worst, current) => {
    const currentValue = current[currentYear] as number || 0
    const worstValue = worst[currentYear] as number || 0
    return currentValue < worstValue ? current : worst
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Resumen general */}
      <div className="col-span-1 md:col-span-2 p-4 bg-white rounded-lg border border-gray-200">
        <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
          <span className="mr-2">📈</span>
          Resumen Comparativo
        </h5>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{currentYear}:</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(currentYearTotal)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{lastYear}:</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(lastYearTotal)}
            </span>
          </div>
          
          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Diferencia:</span>
              <div className="text-right">
                <div className={`font-semibold ${
                  isImprovement ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isImprovement ? '+' : ''}{formatCurrency(difference)}
                </div>
                <div className={`text-sm ${
                  isImprovement ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isImprovement ? '↗' : '↘'} {Math.abs(percentageChange).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mejor mes */}
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <h6 className="font-medium text-green-800 mb-2 flex items-center">
          <span className="mr-2">🏆</span>
          Mejor Mes
        </h6>
        <div className="text-lg font-bold text-green-900">
          {bestMonth.month}
        </div>
        <div className="text-sm text-green-700">
          {formatCurrency(bestMonth[currentYear] as number || 0)}
        </div>
      </div>

      {/* Mes más desafiante */}
      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
        <h6 className="font-medium text-red-800 mb-2 flex items-center">
          <span className="mr-2">⚠️</span>
          Más Desafiante
        </h6>
        <div className="text-lg font-bold text-red-900">
          {worstMonth.month}
        </div>
        <div className="text-sm text-red-700">
          {formatCurrency(worstMonth[currentYear] as number || 0)}
        </div>
      </div>
    </div>
  )
}