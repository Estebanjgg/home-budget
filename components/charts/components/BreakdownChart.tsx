import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'
import { CategoryData } from '../types'
import { DEFAULT_CHART_CONFIG } from '../constants'
import { CategoryTooltip } from './CustomTooltip'

interface BreakdownChartProps {
  data: CategoryData[]
  formatCurrency: (amount: number) => string
}

/**
 * Gráfico de desglose que muestra la distribución
 * de gastos por categorías
 */
export function BreakdownChart({ data, formatCurrency }: BreakdownChartProps) {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="w-full">
      {/* Header del gráfico */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-1">
          🥧 Desglose por Categorías
        </h4>
        <p className="text-sm text-gray-600">
          Distribución de gastos del último mes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Gráfico de Pizza */}
        <div className="flex justify-center">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage?.toFixed(1)}%`}
                outerRadius={120}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
                strokeWidth={2}
                stroke="#fff"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip 
                content={<CategoryTooltip formatCurrency={formatCurrency} />}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Leyenda y detalles */}
        <div className="space-y-4">
          <div className="mb-6">
            <h5 className="text-lg font-semibold text-gray-800 mb-2">
              Resumen de Gastos
            </h5>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalValue)}
            </div>
            <p className="text-sm text-gray-500">Total del mes</p>
          </div>

          <div className="space-y-3">
            {data.map((item, index) => (
              <CategoryItem
                key={index}
                category={item}
                totalValue={totalValue}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>

          {/* Insights */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h6 className="font-medium text-gray-800 mb-2 flex items-center">
              <span className="mr-2">💡</span>
              Insights
            </h6>
            <CategoryInsights data={data} />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Componente para mostrar cada categoría en la leyenda
 */
interface CategoryItemProps {
  category: CategoryData
  totalValue: number
  formatCurrency: (amount: number) => string
}

function CategoryItem({ category, totalValue, formatCurrency }: CategoryItemProps) {
  const percentage = totalValue > 0 ? (category.value / totalValue) * 100 : 0

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
      <div className="flex items-center space-x-3">
        {/* Indicador de color */}
        <div 
          className="w-4 h-4 rounded-full flex-shrink-0" 
          style={{ backgroundColor: category.color }}
        />
        
        {/* Nombre de la categoría */}
        <span className="font-medium text-gray-700">
          {category.name}
        </span>
      </div>
      
      <div className="text-right">
        {/* Valor */}
        <div className="font-semibold text-gray-900">
          {formatCurrency(category.value)}
        </div>
        
        {/* Porcentaje */}
        <div className="text-sm text-gray-500">
          {percentage.toFixed(1)}%
        </div>
      </div>
    </div>
  )
}

/**
 * Componente para mostrar insights sobre las categorías
 */
interface CategoryInsightsProps {
  data: CategoryData[]
}

function CategoryInsights({ data }: CategoryInsightsProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-gray-600">
        No hay datos suficientes para generar insights.
      </p>
    )
  }

  // Encontrar la categoría con mayor gasto
  const highestCategory = data.reduce((max, current) => 
    current.value > max.value ? current : max
  )

  // Encontrar la categoría con menor gasto
  const lowestCategory = data.reduce((min, current) => 
    current.value < min.value ? current : min
  )

  const totalValue = data.reduce((sum, item) => sum + item.value, 0)
  const averageValue = totalValue / data.length

  return (
    <div className="space-y-2 text-sm text-gray-600">
      <div className="flex items-center space-x-2">
        <span className="w-2 h-2 bg-red-400 rounded-full"></span>
        <span>
          <strong>{highestCategory.name}</strong> representa el mayor gasto 
          ({highestCategory.percentage?.toFixed(1)}%)
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
        <span>
          <strong>{lowestCategory.name}</strong> es tu categoría más eficiente 
          ({lowestCategory.percentage?.toFixed(1)}%)
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
        <span>
          Gasto promedio por categoría: <strong>${(averageValue / 1000).toFixed(1)}k</strong>
        </span>
      </div>
    </div>
  )
}