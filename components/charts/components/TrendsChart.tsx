import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { ChartData } from '../types'
import { CHART_COLORS, DEFAULT_CHART_CONFIG, AXIS_CONFIG } from '../constants'
import { CustomTooltip } from './CustomTooltip'

interface TrendsChartProps {
  data: ChartData[]
  formatCurrency: (amount: number) => string
}

/**
 * Gráfico de tendencias que muestra la evolución temporal
 * de ingresos, gastos y ahorros
 */
export function TrendsChart({ data, formatCurrency }: TrendsChartProps) {
  // Solo mostrar datos reales (no predicciones)
  const realData = data.filter(item => !item.isPrediction)

  return (
    <div className="w-full">
      {/* Header del gráfico */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-1">
          📈 Análisis de Tendencias
        </h4>
        <p className="text-sm text-gray-600">
          Evolución histórica de tus finanzas personales
        </p>
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={DEFAULT_CHART_CONFIG.height}>
        <LineChart
          data={realData}
          margin={DEFAULT_CHART_CONFIG.margin}
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
          
          {/* Línea de ingresos */}
          <Line
            type="monotone"
            dataKey="income"
            stroke={CHART_COLORS.income}
            strokeWidth={DEFAULT_CHART_CONFIG.strokeWidth + 1}
            name="Ingresos"
            dot={{ 
              fill: CHART_COLORS.income, 
              strokeWidth: 2, 
              r: DEFAULT_CHART_CONFIG.dotRadius + 1,
              stroke: '#fff'
            }}
            activeDot={{ 
              r: DEFAULT_CHART_CONFIG.dotRadius + 3, 
              fill: CHART_COLORS.income,
              strokeWidth: 3,
              stroke: '#fff',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}
          />
          
          {/* Línea de gastos */}
          <Line
            type="monotone"
            dataKey="expenses"
            stroke={CHART_COLORS.expenses}
            strokeWidth={DEFAULT_CHART_CONFIG.strokeWidth + 1}
            name="Gastos"
            dot={{ 
              fill: CHART_COLORS.expenses, 
              strokeWidth: 2, 
              r: DEFAULT_CHART_CONFIG.dotRadius + 1,
              stroke: '#fff'
            }}
            activeDot={{ 
              r: DEFAULT_CHART_CONFIG.dotRadius + 3, 
              fill: CHART_COLORS.expenses,
              strokeWidth: 3,
              stroke: '#fff',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}
          />
          
          {/* Línea de ahorros */}
          <Line
            type="monotone"
            dataKey="savings"
            stroke={CHART_COLORS.savings}
            strokeWidth={DEFAULT_CHART_CONFIG.strokeWidth + 1}
            name="Ahorros"
            dot={{ 
              fill: CHART_COLORS.savings, 
              strokeWidth: 2, 
              r: DEFAULT_CHART_CONFIG.dotRadius + 1,
              stroke: '#fff'
            }}
            activeDot={{ 
              r: DEFAULT_CHART_CONFIG.dotRadius + 3, 
              fill: CHART_COLORS.savings,
              strokeWidth: 3,
              stroke: '#fff',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Métricas de tendencia */}
      {realData.length >= 2 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tendencia de ingresos */}
          <TrendMetric
            title="Ingresos"
            data={realData}
            dataKey="income"
            color={CHART_COLORS.income}
            formatCurrency={formatCurrency}
          />
          
          {/* Tendencia de gastos */}
          <TrendMetric
            title="Gastos"
            data={realData}
            dataKey="expenses"
            color={CHART_COLORS.expenses}
            formatCurrency={formatCurrency}
          />
          
          {/* Tendencia de ahorros */}
          <TrendMetric
            title="Ahorros"
            data={realData}
            dataKey="savings"
            color={CHART_COLORS.savings}
            formatCurrency={formatCurrency}
          />
        </div>
      )}
    </div>
  )
}

/**
 * Componente para mostrar métricas de tendencia
 */
interface TrendMetricProps {
  title: string
  data: ChartData[]
  dataKey: keyof ChartData
  color: string
  formatCurrency: (amount: number) => string
}

function TrendMetric({ title, data, dataKey, color, formatCurrency }: TrendMetricProps) {
  const firstValue = data[0]?.[dataKey] as number || 0
  const lastValue = data[data.length - 1]?.[dataKey] as number || 0
  const change = lastValue - firstValue
  const changePercent = firstValue !== 0 ? (change / firstValue) * 100 : 0
  
  const isPositive = change > 0
  const isNeutral = Math.abs(changePercent) < 1

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h5 className="font-medium text-gray-700">{title}</h5>
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: color }}
        />
      </div>
      
      <div className="space-y-1">
        <div className="text-lg font-bold text-gray-900">
          {formatCurrency(lastValue)}
        </div>
        
        <div className="flex items-center space-x-1">
          <span className={`text-sm font-medium ${
            isNeutral ? 'text-gray-500' :
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isNeutral ? '→' : isPositive ? '↗' : '↘'}
            {Math.abs(changePercent).toFixed(1)}%
          </span>
          <span className="text-xs text-gray-500">
            vs período anterior
          </span>
        </div>
      </div>
    </div>
  )
}