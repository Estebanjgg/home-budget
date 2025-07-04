import { useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChartData, CategoryData, YearComparisonData } from '../types'
import { CATEGORY_COLORS } from '../constants'

/**
 * Hook para generar predicciones basadas en tendencias históricas
 */
export function usePredictions(monthlyData: ChartData[]) {
  return useMemo(() => {
    if (!monthlyData || monthlyData.length < 3) return monthlyData

    const lastThreeMonths = monthlyData.slice(-3)
    
    // Calcular tendencias de crecimiento
    const calculateGrowthRate = (data: ChartData[], key: keyof ChartData) => {
      return lastThreeMonths.reduce((acc, curr, index) => {
        if (index === 0) return 0
        const prev = lastThreeMonths[index - 1]
        const current = curr[key] as number
        const previous = prev[key] as number
        
        if (previous === 0) return acc
        return acc + ((current - previous) / previous)
      }, 0) / 2
    }

    const incomeGrowthRate = calculateGrowthRate(lastThreeMonths, 'income')
    const expenseGrowthRate = calculateGrowthRate(lastThreeMonths, 'expenses')
    
    const lastMonth = monthlyData[monthlyData.length - 1]
    const predictions: ChartData[] = []

    // Generar predicciones para los próximos 3 meses
    for (let i = 1; i <= 3; i++) {
      const futureDate = new Date()
      futureDate.setMonth(futureDate.getMonth() + i)
      
      const predictedIncome = Math.max(0, lastMonth.income * (1 + incomeGrowthRate * i))
      const predictedExpenses = Math.max(0, lastMonth.expenses * (1 + expenseGrowthRate * i))
      
      predictions.push({
        month: format(futureDate, 'MMM', { locale: es }),
        income: predictedIncome,
        expenses: predictedExpenses,
        balance: predictedIncome - predictedExpenses,
        savings: Math.max(0, predictedIncome * 0.2), // 20% objetivo de ahorro
        isPrediction: true
      })
    }

    return [...monthlyData, ...predictions]
  }, [monthlyData])
}

/**
 * Hook para generar datos de desglose por categorías
 */
export function useCategoryBreakdown(monthlyData: ChartData[]): CategoryData[] {
  return useMemo(() => {
    const lastMonth = monthlyData?.[monthlyData.length - 1]
    if (!lastMonth) return []

    const categories = [
      { name: 'Gastos Fijos', percentage: 0.6 },
      { name: 'Alimentación', percentage: 0.25 },
      { name: 'Entretenimiento', percentage: 0.1 },
      { name: 'Otros', percentage: 0.05 }
    ]

    return categories.map((category, index) => {
      const value = lastMonth.expenses * category.percentage
      return {
        name: category.name,
        value,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        percentage: category.percentage * 100
      }
    })
  }, [monthlyData])
}

/**
 * Hook para generar datos de comparación año a año
 */
export function useYearComparison(monthlyData: ChartData[]): YearComparisonData[] {
  return useMemo(() => {
    if (!monthlyData || monthlyData.length < 6) return []

    const currentYear = new Date().getFullYear()
    const lastYear = currentYear - 1
    
    // Tomar los últimos 6 meses para la comparación
    return monthlyData.slice(-6).map((month) => {
      const currentYearBalance = month.income - month.expenses
      // Simular datos del año anterior con variación realista
      const lastYearBalance = currentYearBalance * (0.8 + Math.random() * 0.4)
      
      return {
        month: month.month,
        [`${currentYear}`]: currentYearBalance,
        [`${lastYear}`]: lastYearBalance
      }
    })
  }, [monthlyData])
}

/**
 * Hook para calcular métricas financieras
 */
export function useFinancialMetrics(monthlyData: ChartData[]) {
  return useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        averageBalance: 0,
        savingsRate: 0,
        trend: 'neutral' as const
      }
    }

    const totalIncome = monthlyData.reduce((sum, month) => sum + month.income, 0)
    const totalExpenses = monthlyData.reduce((sum, month) => sum + month.expenses, 0)
    const averageBalance = monthlyData.reduce((sum, month) => sum + month.balance, 0) / monthlyData.length
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
    
    // Determinar tendencia basada en los últimos 3 meses
    let trend: 'positive' | 'negative' | 'neutral' = 'neutral'
    if (monthlyData.length >= 3) {
      const lastThree = monthlyData.slice(-3)
      const firstBalance = lastThree[0].balance
      const lastBalance = lastThree[lastThree.length - 1].balance
      
      if (lastBalance > firstBalance * 1.05) trend = 'positive'
      else if (lastBalance < firstBalance * 0.95) trend = 'negative'
    }

    return {
      totalIncome,
      totalExpenses,
      averageBalance,
      savingsRate,
      trend
    }
  }, [monthlyData])
}

/**
 * Hook principal que combina todos los hooks de datos
 */
export function useChartData(data: ChartData[], showPredictions: boolean = false) {
  const predictions = usePredictions(data)
  const categoryBreakdown = useCategoryBreakdown(data)
  const yearComparison = useYearComparison(data)
  const metrics = useFinancialMetrics(data)
  
  const chartData = showPredictions ? predictions : data
  
  return {
    chartData,
    categoryBreakdown,
    yearComparison,
    metrics
  }
}