import React from 'react'
import {
  ComposedChart,
  Area,
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

interface OverviewChartProps {
  data: ChartData[]
  formatCurrency: (amount: number) => string
  showPredictions?: boolean
}

/**
 * Gráfico de vista general que combina áreas y líneas
 * Muestra ingresos, gastos y balance en un solo gráfico
 */
export function OverviewChart({ data, formatCurrency, showPredictions = true }: OverviewChartProps) {
  return (
    <div className="w-full">
      {/* Header del gráfico */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-1">
          📊 Vista General Financiera
        </h4>
        <p className="text-sm text-gray-600">
          Evolución de ingresos, gastos y balance mensual
        </p>
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={DEFAULT_CHART_CONFIG.height}>
        <ComposedChart
          data={data}
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
          
          {/* Área de ingresos */}
          <Area
            type="monotone"
            dataKey="income"
            fill={CHART_COLORS.income}
            fillOpacity={0.3}
            stroke={CHART_COLORS.income}
            strokeWidth={DEFAULT_CHART_CONFIG.strokeWidth}
            name="Ingresos"
            dot={false}
            activeDot={{ 
              r: DEFAULT_CHART_CONFIG.dotRadius + 1, 
              fill: CHART_COLORS.income,
              strokeWidth: 2,
              stroke: '#fff'
            }}
          />
          
          {/* Área de gastos */}
          <Area
            type="monotone"
            dataKey="expenses"
            fill={CHART_COLORS.expenses}
            fillOpacity={0.3}
            stroke={CHART_COLORS.expenses}
            strokeWidth={DEFAULT_CHART_CONFIG.strokeWidth}
            name="Gastos"
            dot={false}
            activeDot={{ 
              r: DEFAULT_CHART_CONFIG.dotRadius + 1, 
              fill: CHART_COLORS.expenses,
              strokeWidth: 2,
              stroke: '#fff'
            }}
          />
          
          {/* Línea de balance */}
          <Line
            type="monotone"
            dataKey="balance"
            stroke={CHART_COLORS.balance}
            strokeWidth={DEFAULT_CHART_CONFIG.strokeWidth + 1}
            name="Balance"
            dot={{ 
              fill: CHART_COLORS.balance, 
              strokeWidth: 2, 
              r: DEFAULT_CHART_CONFIG.dotRadius,
              stroke: '#fff'
            }}
            activeDot={{ 
              r: DEFAULT_CHART_CONFIG.dotRadius + 2, 
              fill: CHART_COLORS.balance,
              strokeWidth: 2,
              stroke: '#fff'
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Indicadores de predicción */}
      {showPredictions && data.some(item => item.isPrediction) && (
        <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-400 rounded-full opacity-60"></div>
            <span className="text-sm text-orange-700 font-medium">
              Las proyecciones están basadas en tendencias de los últimos 3 meses
            </span>
          </div>
        </div>
      )}
    </div>
  )
}