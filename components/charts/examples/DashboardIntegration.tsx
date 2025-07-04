'use client'

import React, { useMemo } from 'react'
import { InteractiveCharts } from '../InteractiveCharts'
import type { ChartData } from '../types'

// Simulación de datos reales del dashboard
interface DashboardMetrics {
  monthlyData: {
    month: string
    income: number
    expenses: number
    balance: number
  }[]
  totalIncome: number
  totalExpenses: number
  totalSavings: number
  budgetCount: number
}

interface DashboardIntegrationProps {
  dashboardMetrics: DashboardMetrics | null
  formatCurrency: (amount: number) => string
}

/**
 * Ejemplo de integración de los gráficos interactivos con datos reales del dashboard
 * Este componente muestra cómo transformar los datos del dashboard existente
 * al formato requerido por los gráficos interactivos
 */
export function DashboardIntegration({ 
  dashboardMetrics, 
  formatCurrency 
}: DashboardIntegrationProps) {
  // Transformar datos del dashboard al formato de ChartData
  const chartData: ChartData[] = useMemo(() => {
    if (!dashboardMetrics?.monthlyData) {
      // Datos de ejemplo si no hay datos reales
      return [
        {
          month: 'Ene',
          income: 5000,
          expenses: 3500,
          balance: 1500,
          savings: 1000,
          category: 'general',
          isPrediction: false,
          date: new Date(2024, 0, 1).toISOString()
        },
        {
          month: 'Feb',
          income: 5200,
          expenses: 3600,
          balance: 1600,
          savings: 1040,
          category: 'general',
          isPrediction: false,
          date: new Date(2024, 1, 1).toISOString()
        },
        {
          month: 'Mar',
          income: 4800,
          expenses: 3400,
          balance: 1400,
          savings: 960,
          category: 'general',
          isPrediction: false,
          date: new Date(2024, 2, 1).toISOString()
        }
      ]
    }
    
    return dashboardMetrics.monthlyData.map((item, index) => {
      const currentDate = new Date()
      const monthDate = new Date(
        currentDate.getFullYear(), 
        currentDate.getMonth() - (dashboardMetrics.monthlyData.length - 1 - index), 
        1
      )
      
      return {
        month: item.month,
        income: item.income || 0,
        expenses: item.expenses || 0,
        balance: item.balance || 0,
        savings: Math.max(0, (item.income || 0) * 0.2), // 20% de ahorro objetivo
        category: 'general',
        isPrediction: false,
        date: monthDate.toISOString()
      }
    })
  }, [dashboardMetrics])

  // Métricas adicionales calculadas
  const additionalMetrics = useMemo(() => {
    if (!dashboardMetrics) return null
    
    const avgIncome = dashboardMetrics.totalIncome / Math.max(dashboardMetrics.budgetCount, 1)
    const avgExpenses = dashboardMetrics.totalExpenses / Math.max(dashboardMetrics.budgetCount, 1)
    const savingsRate = dashboardMetrics.totalIncome > 0 
      ? (dashboardMetrics.totalSavings / dashboardMetrics.totalIncome) * 100 
      : 0
    const expenseRatio = dashboardMetrics.totalIncome > 0 
      ? (dashboardMetrics.totalExpenses / dashboardMetrics.totalIncome) * 100 
      : 0
    
    return {
      avgIncome,
      avgExpenses,
      savingsRate,
      expenseRatio
    }
  }, [dashboardMetrics])

  if (!dashboardMetrics) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos financieros...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Métricas de resumen */}
      {additionalMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Ingreso Promedio</p>
                <p className="text-2xl font-bold">{formatCurrency(additionalMetrics.avgIncome)}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Gasto Promedio</p>
                <p className="text-2xl font-bold">{formatCurrency(additionalMetrics.avgExpenses)}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <span className="text-2xl">💸</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Tasa de Ahorro</p>
                <p className="text-2xl font-bold">{additionalMetrics.savingsRate.toFixed(1)}%</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <span className="text-2xl">🏦</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Ratio de Gastos</p>
                <p className="text-2xl font-bold">{additionalMetrics.expenseRatio.toFixed(1)}%</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Gráficos interactivos */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-2 mr-3">
              📈
            </span>
            Análisis Financiero Interactivo
          </h3>
          <div className="text-sm text-gray-500">
            {chartData.length} meses de datos
          </div>
        </div>
        
        <InteractiveCharts 
          data={chartData}
          className="w-full"
        />
      </div>
      
      {/* Insights automáticos */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-100">
        <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full p-2 mr-3">
            🧠
          </span>
          Insights Automáticos
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h5 className="font-semibold text-gray-800 mb-3">📊 Análisis de Tendencias</h5>
            <ul className="space-y-2 text-sm text-gray-600">
              {additionalMetrics && (
                <>
                  <li className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      additionalMetrics.savingsRate >= 20 ? 'bg-green-500' : 
                      additionalMetrics.savingsRate >= 10 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></span>
                    Tasa de ahorro: {additionalMetrics.savingsRate >= 20 ? 'Excelente' : 
                      additionalMetrics.savingsRate >= 10 ? 'Buena' : 'Necesita mejora'}
                  </li>
                  <li className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      additionalMetrics.expenseRatio <= 70 ? 'bg-green-500' : 
                      additionalMetrics.expenseRatio <= 85 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></span>
                    Control de gastos: {additionalMetrics.expenseRatio <= 70 ? 'Excelente' : 
                      additionalMetrics.expenseRatio <= 85 ? 'Moderado' : 'Alto riesgo'}
                  </li>
                </>
              )}
            </ul>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h5 className="font-semibold text-gray-800 mb-3">💡 Recomendaciones</h5>
            <ul className="space-y-2 text-sm text-gray-600">
              {additionalMetrics && (
                <>
                  {additionalMetrics.savingsRate < 20 && (
                    <li>• Considera aumentar tu tasa de ahorro al 20%</li>
                  )}
                  {additionalMetrics.expenseRatio > 85 && (
                    <li>• Revisa y reduce gastos no esenciales</li>
                  )}
                  <li>• Utiliza las predicciones para planificar mejor</li>
                  <li>• Revisa regularmente tus categorías de gastos</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardIntegration