import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { ChartData } from '../types'
import { CHART_COLORS, DEFAULT_CHART_CONFIG, AXIS_CONFIG } from '../constants'
import { CustomTooltip } from './CustomTooltip'

interface PredictionsChartProps {
  data: ChartData[]
  formatCurrency: (amount: number) => string
}

/**
 * Gráfico de predicciones que muestra proyecciones futuras
 * basadas en tendencias históricas
 */
export function PredictionsChart({ data, formatCurrency }: PredictionsChartProps) {
  // Separar datos reales de predicciones
  const realData = data.filter(item => !item.isPrediction)
  const predictedData = data.filter(item => item.isPrediction)
  const lastRealIndex = realData.length - 1

  return (
    <div className="w-full">
      {/* Header del gráfico */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-1">
          🔮 Proyecciones Financieras
        </h4>
        <p className="text-sm text-gray-600">
          Predicciones basadas en tendencias de los últimos 3 meses
        </p>
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={DEFAULT_CHART_CONFIG.height}>
        <AreaChart
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
          
          {/* Línea de referencia para separar datos reales de predicciones */}
          {lastRealIndex >= 0 && (
            <ReferenceLine 
              x={realData[lastRealIndex]?.month} 
              stroke={CHART_COLORS.secondary}
              strokeDasharray="5 5"
              strokeWidth={2}
            />
          )}
          
          {/* Tooltip y Leyenda */}
          <Tooltip 
            content={<CustomTooltip formatCurrency={formatCurrency} />}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
          />
          
          {/* Área de balance real */}
          <Area
            type="monotone"
            dataKey="balance"
            stroke={CHART_COLORS.balance}
            fill={CHART_COLORS.balance}
            fillOpacity={0.6}
            strokeWidth={DEFAULT_CHART_CONFIG.strokeWidth + 1}
            name="Balance Histórico"
            connectNulls={false}
            dot={false}
            activeDot={{ 
              r: DEFAULT_CHART_CONFIG.dotRadius + 1, 
              fill: CHART_COLORS.balance,
              strokeWidth: 2,
              stroke: '#fff'
            }}
          />
          
          {/* Área de predicciones */}
          <Area
            type="monotone"
            dataKey={(entry: ChartData) => entry.isPrediction ? entry.balance : null}
            stroke={CHART_COLORS.predicted}
            fill={CHART_COLORS.predicted}
            fillOpacity={0.3}
            strokeWidth={DEFAULT_CHART_CONFIG.strokeWidth}
            strokeDasharray="8 4"
            name="Proyección"
            connectNulls={false}
            dot={false}
            activeDot={{ 
              r: DEFAULT_CHART_CONFIG.dotRadius + 1, 
              fill: CHART_COLORS.predicted,
              strokeWidth: 2,
              stroke: '#fff'
            }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Información sobre las predicciones */}
      <div className="mt-6 space-y-4">
        {/* Metodología */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h5 className="font-medium text-blue-800 mb-2 flex items-center">
            <span className="mr-2">🧮</span>
            Metodología de Predicción
          </h5>
          <p className="text-sm text-blue-700">
            Las proyecciones se calculan analizando las tendencias de crecimiento 
            de los últimos 3 meses y aplicando algoritmos de regresión lineal.
          </p>
        </div>

        {/* Métricas de predicción */}
        {predictedData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PredictionMetric
              title="Balance Proyectado"
              icon="💰"
              value={predictedData[predictedData.length - 1]?.balance || 0}
              formatCurrency={formatCurrency}
              color={CHART_COLORS.balance}
            />
            
            <PredictionMetric
              title="Ingresos Estimados"
              icon="📈"
              value={predictedData[predictedData.length - 1]?.income || 0}
              formatCurrency={formatCurrency}
              color={CHART_COLORS.income}
            />
            
            <PredictionMetric
              title="Gastos Estimados"
              icon="📉"
              value={predictedData[predictedData.length - 1]?.expenses || 0}
              formatCurrency={formatCurrency}
              color={CHART_COLORS.expenses}
            />
          </div>
        )}

        {/* Disclaimer */}
        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-700 flex items-center">
            <span className="mr-2">⚠️</span>
            <strong>Nota:</strong> Las predicciones son estimaciones basadas en datos históricos 
            y pueden variar según cambios en tus hábitos financieros.
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Componente para mostrar métricas de predicción
 */
interface PredictionMetricProps {
  title: string
  icon: string
  value: number
  formatCurrency: (amount: number) => string
  color: string
}

function PredictionMetric({ title, icon, value, formatCurrency, color }: PredictionMetricProps) {
  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: color }}
        />
      </div>
      
      <h5 className="font-medium text-gray-700 mb-1">{title}</h5>
      
      <div className="text-xl font-bold" style={{ color }}>
        {formatCurrency(value)}
      </div>
      
      <p className="text-xs text-gray-500 mt-1">
        En 3 meses
      </p>
    </div>
  )
}