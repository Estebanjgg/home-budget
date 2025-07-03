'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'

interface ChartData {
  month: string
  income: number
  expenses: number
  balance: number
  savings: number
  predicted?: boolean
}

interface AdvancedChartsProps {
  monthlyData: ChartData[]
  formatCurrency: (amount: number) => string
}

const COLORS = {
  income: '#10B981',
  expenses: '#EF4444',
  balance: '#3B82F6',
  savings: '#8B5CF6',
  predicted: '#F59E0B'
}

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export function AdvancedCharts({ monthlyData, formatCurrency }: AdvancedChartsProps) {
  const [activeChart, setActiveChart] = useState<'overview' | 'trends' | 'predictions' | 'breakdown'>('overview')
  const [showPredictions, setShowPredictions] = useState(true)

  // Generar predicciones simples basadas en tendencias
  const dataWithPredictions = useMemo(() => {
    if (!monthlyData || monthlyData.length < 3) return monthlyData

    const lastThreeMonths = monthlyData.slice(-3)
    const avgIncomeGrowth = lastThreeMonths.reduce((acc, curr, index) => {
      if (index === 0) return 0
      return acc + ((curr.income - lastThreeMonths[index - 1].income) / lastThreeMonths[index - 1].income)
    }, 0) / 2

    const avgExpenseGrowth = lastThreeMonths.reduce((acc, curr, index) => {
      if (index === 0) return 0
      return acc + ((curr.expenses - lastThreeMonths[index - 1].expenses) / lastThreeMonths[index - 1].expenses)
    }, 0) / 2

    const lastMonth = monthlyData[monthlyData.length - 1]
    const predictions = []

    for (let i = 1; i <= 3; i++) {
      const futureDate = new Date()
      futureDate.setMonth(futureDate.getMonth() + i)
      
      const predictedIncome = lastMonth.income * (1 + avgIncomeGrowth * i)
      const predictedExpenses = lastMonth.expenses * (1 + avgExpenseGrowth * i)
      
      predictions.push({
        month: format(futureDate, 'MMM', { locale: es }),
        income: Math.max(0, predictedIncome),
        expenses: Math.max(0, predictedExpenses),
        balance: predictedIncome - predictedExpenses,
        savings: Math.max(0, predictedIncome * 0.2), // Asumiendo 20% de ahorro objetivo
        predicted: true
      })
    }

    return [...monthlyData, ...predictions]
  }, [monthlyData])

  // Datos para gráfico de breakdown por categorías
  const categoryBreakdown = useMemo(() => {
    const lastMonth = monthlyData?.[monthlyData.length - 1]
    if (!lastMonth) return []

    return [
      { name: 'Gastos Fijos', value: lastMonth.expenses * 0.6, color: CHART_COLORS[0] },
      { name: 'Alimentación', value: lastMonth.expenses * 0.25, color: CHART_COLORS[1] },
      { name: 'Entretenimiento', value: lastMonth.expenses * 0.1, color: CHART_COLORS[2] },
      { name: 'Otros', value: lastMonth.expenses * 0.05, color: CHART_COLORS[3] }
    ]
  }, [monthlyData])

  // Comparativa año a año
  const yearOverYearData = useMemo(() => {
    if (!monthlyData || monthlyData.length < 12) return []

    const currentYear = new Date().getFullYear()
    const lastYear = currentYear - 1
    
    // Simular datos del año anterior (en una app real, esto vendría de la base de datos)
    return monthlyData.slice(-6).map((month, index) => ({
      month: month.month,
      [`${currentYear}`]: month.income - month.expenses,
      [`${lastYear}`]: (month.income - month.expenses) * (0.8 + Math.random() * 0.4) // Simulación
    }))
  }, [monthlyData])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
              {entry.payload.predicted && <span className="text-xs text-orange-500 ml-1">(Predicción)</span>}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    switch (activeChart) {
      case 'overview':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={showPredictions ? dataWithPredictions : monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="income"
                fill={COLORS.income}
                fillOpacity={0.3}
                stroke={COLORS.income}
                strokeWidth={2}
                name="Ingresos"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                fill={COLORS.expenses}
                fillOpacity={0.3}
                stroke={COLORS.expenses}
                strokeWidth={2}
                name="Gastos"
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke={COLORS.balance}
                strokeWidth={3}
                strokeDasharray="0"
                name="Balance"
                dot={{ fill: COLORS.balance, strokeWidth: 2, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )

      case 'trends':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke={COLORS.income}
                strokeWidth={3}
                name="Ingresos"
                dot={{ fill: COLORS.income, strokeWidth: 2, r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke={COLORS.expenses}
                strokeWidth={3}
                name="Gastos"
                dot={{ fill: COLORS.expenses, strokeWidth: 2, r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="savings"
                stroke={COLORS.savings}
                strokeWidth={3}
                name="Ahorros"
                dot={{ fill: COLORS.savings, strokeWidth: 2, r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'predictions':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={dataWithPredictions}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="balance"
                stroke={COLORS.balance}
                fill={COLORS.balance}
                fillOpacity={0.6}
                name="Balance Actual"
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke={COLORS.predicted}
                fill={COLORS.predicted}
                fillOpacity={0.3}
                strokeDasharray="5 5"
                name="Predicción"
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'breakdown':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Gráfico de Pizza */}
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Leyenda y detalles */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Desglose por Categorías</h4>
              <div className="space-y-3">
                {categoryBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="font-medium text-gray-700">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">{formatCurrency(item.value)}</div>
                      <div className="text-sm text-gray-500">
                        {((item.value / categoryBreakdown.reduce((sum, cat) => sum + cat.value, 0)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      {/* Header con controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">📊 Análisis Avanzado</h3>
          <p className="text-gray-600">Visualizaciones interactivas y predicciones inteligentes</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveChart('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeChart === 'overview'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Vista General
          </button>
          <button
            onClick={() => setActiveChart('trends')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeChart === 'trends'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tendencias
          </button>
          <button
            onClick={() => setActiveChart('predictions')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeChart === 'predictions'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Predicciones
          </button>
          <button
            onClick={() => setActiveChart('breakdown')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeChart === 'breakdown'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Desglose
          </button>
        </div>
      </div>

      {/* Toggle para predicciones */}
      {activeChart === 'overview' && (
        <div className="flex items-center mb-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showPredictions}
              onChange={(e) => setShowPredictions(e.target.checked)}
              className="sr-only"
            />
            <div className={`relative w-11 h-6 rounded-full transition-colors ${
              showPredictions ? 'bg-blue-500' : 'bg-gray-300'
            }`}>
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                showPredictions ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              Mostrar predicciones
            </span>
          </label>
        </div>
      )}

      {/* Gráfico */}
      <div className="w-full">
        {renderChart()}
      </div>

      {/* Comparativa año a año */}
      {yearOverYearData.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">📈 Comparativa Año a Año</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearOverYearData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey={`${new Date().getFullYear()}`} fill={COLORS.income} name="Este Año" />
              <Bar dataKey={`${new Date().getFullYear() - 1}`} fill={COLORS.expenses} name="Año Anterior" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}