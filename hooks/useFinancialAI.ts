import { useState, useEffect, useMemo } from 'react'
import type { Budget, BudgetItem, ExpenseCategory } from '@/lib/types'

export interface SpendingPattern {
  category: string
  averageAmount: number
  frequency: number
  trend: 'increasing' | 'decreasing' | 'stable'
  anomalies: number
  monthlyGrowth: number
}

export interface AIRecommendation {
  id: string
  type: 'savings' | 'spending' | 'budget' | 'category' | 'investment'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  potentialSavings?: number
  action: string
  priority: number
}

export interface UnusualExpense {
  item: BudgetItem
  reason: string
  severity: 'high' | 'medium' | 'low'
  suggestedAction: string
  deviationPercentage: number
}

export interface CategorizationSuggestion {
  item: BudgetItem
  suggestedCategory: ExpenseCategory
  confidence: number
  reasoning: string
}

export interface FinancialHealthScore {
  overall: number
  savings: number
  spending: number
  budgetAdherence: number
  categories: { [key: string]: number }
}

interface UseFinancialAIProps {
  budgets: Budget[]
  currentBudgetItems: BudgetItem[]
  categories: ExpenseCategory[]
}

export function useFinancialAI({ budgets, currentBudgetItems, categories }: UseFinancialAIProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null)

  // Análisis avanzado de patrones de gasto
  const spendingPatterns = useMemo((): SpendingPattern[] => {
    if (!budgets.length || !currentBudgetItems.length) return []

    const patterns: { [category: string]: { amounts: number[], dates: Date[], budgetIds: string[] } } = {}
    
    // Recopilar datos históricos por categoría
    budgets.forEach(budget => {
      currentBudgetItems
        .filter(item => item.budget_id === budget.id && item.type === 'expense' && item.actual_amount)
        .forEach(item => {
          const categoryName = item.category?.name || 'Sin categoría'
          if (!patterns[categoryName]) {
            patterns[categoryName] = { amounts: [], dates: [], budgetIds: [] }
          }
          patterns[categoryName].amounts.push(item.actual_amount!)
          patterns[categoryName].dates.push(new Date(item.created_at))
          patterns[categoryName].budgetIds.push(budget.id)
        })
    })

    // Analizar patrones con algoritmos más sofisticados
    return Object.entries(patterns).map(([category, data]) => {
      const averageAmount = data.amounts.reduce((sum, amount) => sum + amount, 0) / data.amounts.length
      const frequency = data.amounts.length
      
      // Calcular tendencia usando regresión lineal simple
      const n = data.amounts.length
      const sumX = data.amounts.reduce((sum, _, index) => sum + index, 0)
      const sumY = data.amounts.reduce((sum, amount) => sum + amount, 0)
      const sumXY = data.amounts.reduce((sum, amount, index) => sum + (index * amount), 0)
      const sumXX = data.amounts.reduce((sum, _, index) => sum + (index * index), 0)
      
      const slope = n > 1 ? (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) : 0
      const monthlyGrowth = (slope / averageAmount) * 100
      
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
      if (monthlyGrowth > 5) trend = 'increasing'
      else if (monthlyGrowth < -5) trend = 'decreasing'
      
      // Detectar anomalías usando desviación estándar
      const variance = data.amounts.reduce((sum, amount) => sum + Math.pow(amount - averageAmount, 2), 0) / n
      const stdDev = Math.sqrt(variance)
      const anomalies = data.amounts.filter(amount => Math.abs(amount - averageAmount) > 2 * stdDev).length
      
      return {
        category,
        averageAmount,
        frequency,
        trend,
        anomalies,
        monthlyGrowth
      }
    }).sort((a, b) => b.averageAmount - a.averageAmount)
  }, [budgets, currentBudgetItems])

  // Detectar gastos inusuales con IA
  const unusualExpenses = useMemo((): UnusualExpense[] => {
    if (!currentBudgetItems.length || !spendingPatterns.length) return []

    const unusual: UnusualExpense[] = []
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    
    // Obtener gastos del mes actual
    const currentMonthExpenses = currentBudgetItems.filter(item => {
      const itemDate = new Date(item.created_at)
      return item.type === 'expense' && 
             item.actual_amount && 
             itemDate.getMonth() + 1 === currentMonth && 
             itemDate.getFullYear() === currentYear
    })

    // Crear mapa de promedios y desviaciones por categoría
    const categoryStats: { [category: string]: { avg: number, stdDev: number } } = {}
    spendingPatterns.forEach(pattern => {
      // Calcular desviación estándar para cada categoría
      const categoryExpenses = currentBudgetItems
        .filter(item => item.category?.name === pattern.category && item.actual_amount)
        .map(item => item.actual_amount!)
      
      if (categoryExpenses.length > 1) {
        const variance = categoryExpenses.reduce((sum, amount) => 
          sum + Math.pow(amount - pattern.averageAmount, 2), 0) / categoryExpenses.length
        categoryStats[pattern.category] = {
          avg: pattern.averageAmount,
          stdDev: Math.sqrt(variance)
        }
      }
    })

    currentMonthExpenses.forEach(item => {
      const categoryName = item.category?.name || 'Sin categoría'
      const stats = categoryStats[categoryName]
      
      if (stats && item.actual_amount!) {
        const deviationPercentage = ((item.actual_amount! - stats.avg) / stats.avg) * 100
        const zScore = (item.actual_amount! - stats.avg) / stats.stdDev
        
        if (Math.abs(zScore) > 2) { // Más de 2 desviaciones estándar
          let severity: 'high' | 'medium' | 'low' = 'low'
          if (Math.abs(zScore) > 3) severity = 'high'
          else if (Math.abs(zScore) > 2.5) severity = 'medium'
          
          unusual.push({
            item,
            reason: `Gasto ${deviationPercentage > 0 ? 'superior' : 'inferior'} al patrón normal (${Math.abs(deviationPercentage).toFixed(1)}% de desviación)`,
            severity,
            suggestedAction: deviationPercentage > 0 
              ? 'Revisar si este gasto era planificado y considerar ajustar el presupuesto'
              : 'Excelente control de gastos en esta categoría',
            deviationPercentage
          })
        }
      }
    })

    return unusual.sort((a, b) => Math.abs(b.deviationPercentage) - Math.abs(a.deviationPercentage))
  }, [currentBudgetItems, spendingPatterns])

  // Generar recomendaciones inteligentes
  const recommendations = useMemo((): AIRecommendation[] => {
    const recs: AIRecommendation[] = []
    let priority = 1
    
    // Análisis de tendencias de gasto
    spendingPatterns.forEach(pattern => {
      if (pattern.trend === 'increasing' && pattern.monthlyGrowth > 10) {
        recs.push({
          id: `trend-${pattern.category}`,
          type: 'spending',
          title: `Controlar crecimiento en ${pattern.category}`,
          description: `Los gastos en ${pattern.category} están creciendo ${pattern.monthlyGrowth.toFixed(1)}% mensual`,
          impact: pattern.monthlyGrowth > 20 ? 'high' : 'medium',
          potentialSavings: pattern.averageAmount * (pattern.monthlyGrowth / 100),
          action: 'Establecer límites estrictos y buscar alternativas más económicas',
          priority: priority++
        })
      }
      
      if (pattern.anomalies > pattern.frequency * 0.3) {
        recs.push({
          id: `consistency-${pattern.category}`,
          type: 'budget',
          title: `Mejorar consistencia en ${pattern.category}`,
          description: `${Math.round((pattern.anomalies / pattern.frequency) * 100)}% de gastos irregulares`,
          impact: 'medium',
          action: 'Planificar gastos con mayor anticipación y establecer presupuestos más realistas',
          priority: priority++
        })
      }
    })

    // Análisis de salud financiera
    const totalExpenses = currentBudgetItems
      .filter(item => item.type === 'expense' && item.actual_amount)
      .reduce((sum, item) => sum + item.actual_amount!, 0)
    
    const totalIncome = currentBudgetItems
      .filter(item => item.type === 'income' && item.actual_amount)
      .reduce((sum, item) => sum + item.actual_amount!, 0)
    
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
    
    // Recomendaciones de ahorro
    if (savingsRate < 10) {
      recs.push({
        id: 'savings-rate',
        type: 'savings',
        title: 'Aumentar tasa de ahorro',
        description: `Tasa actual: ${savingsRate.toFixed(1)}%. Meta recomendada: 20%`,
        impact: 'high',
        potentialSavings: totalIncome * 0.2 - (totalIncome - totalExpenses),
        action: 'Implementar ahorro automático del 20% de ingresos',
        priority: priority++
      })
    } else if (savingsRate > 30) {
      recs.push({
        id: 'investment-opportunity',
        type: 'investment',
        title: 'Oportunidad de inversión',
        description: `Excelente tasa de ahorro: ${savingsRate.toFixed(1)}%`,
        impact: 'medium',
        action: 'Considerar diversificar en inversiones de bajo riesgo',
        priority: priority++
      })
    }

    // Análisis por categorías
    const expensesByCategory = spendingPatterns.reduce((acc, pattern) => {
      acc[pattern.category] = pattern.averageAmount * pattern.frequency
      return acc
    }, {} as { [key: string]: number })

    const totalCategoryExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0)
    
    Object.entries(expensesByCategory).forEach(([category, amount]) => {
      const percentage = (amount / totalCategoryExpenses) * 100
      
      if (percentage > 30 && category !== 'Vivienda' && category !== 'Alimentación') {
        recs.push({
          id: `category-${category}`,
          type: 'category',
          title: `Optimizar gastos en ${category}`,
          description: `${category} representa ${percentage.toFixed(1)}% del presupuesto`,
          impact: 'medium',
          potentialSavings: amount * 0.15,
          action: 'Revisar gastos de esta categoría y buscar opciones más económicas',
          priority: priority++
        })
      }
    })

    return recs.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 }
      return impactOrder[b.impact] - impactOrder[a.impact] || a.priority - b.priority
    })
  }, [spendingPatterns, currentBudgetItems])

  // Categorización automática inteligente
  const categorizationSuggestions = useMemo((): CategorizationSuggestion[] => {
    const uncategorizedItems = currentBudgetItems.filter(item => !item.category_id && item.type === 'expense')
    const suggestions: CategorizationSuggestion[] = []

    // Reglas de categorización más sofisticadas
    const categoryRules = [
      {
        keywords: ['supermercado', 'mercado', 'comida', 'alimento', 'grocery', 'walmart', 'soriana', 'chedraui'],
        categoryName: 'Alimentación',
        confidence: 0.95,
        reasoning: 'Palabras clave relacionadas con alimentación y supermercados'
      },
      {
        keywords: ['gasolina', 'combustible', 'gas', 'estación', 'pemex', 'shell', 'bp'],
        categoryName: 'Transporte',
        confidence: 0.9,
        reasoning: 'Términos relacionados con combustible y estaciones de servicio'
      },
      {
        keywords: ['electricidad', 'agua', 'internet', 'teléfono', 'cable', 'cfe', 'telmex', 'totalplay'],
        categoryName: 'Servicios',
        confidence: 0.95,
        reasoning: 'Servicios básicos y empresas de telecomunicaciones'
      },
      {
        keywords: ['médico', 'doctor', 'farmacia', 'medicina', 'hospital', 'consulta', 'guadalajara', 'similares'],
        categoryName: 'Salud',
        confidence: 0.9,
        reasoning: 'Términos médicos y farmacias conocidas'
      },
      {
        keywords: ['ropa', 'zapatos', 'vestido', 'camisa', 'zara', 'liverpool', 'palacio'],
        categoryName: 'Vestimenta',
        confidence: 0.85,
        reasoning: 'Artículos de vestir y tiendas de ropa'
      },
      {
        keywords: ['cine', 'restaurante', 'entretenimiento', 'diversión', 'netflix', 'spotify', 'cinepolis'],
        categoryName: 'Entretenimiento',
        confidence: 0.8,
        reasoning: 'Actividades de entretenimiento y plataformas digitales'
      },
      {
        keywords: ['renta', 'alquiler', 'hipoteca', 'predial', 'mantenimiento'],
        categoryName: 'Vivienda',
        confidence: 0.9,
        reasoning: 'Gastos relacionados con vivienda'
      },
      {
        keywords: ['escuela', 'colegio', 'universidad', 'curso', 'libro', 'material'],
        categoryName: 'Educación',
        confidence: 0.85,
        reasoning: 'Gastos educativos y materiales de estudio'
      }
    ]

    uncategorizedItems.forEach(item => {
      const description = item.description.toLowerCase()
      let bestMatch: { rule: typeof categoryRules[0], score: number } | null = null
      
      for (const rule of categoryRules) {
        const matchCount = rule.keywords.filter(keyword => description.includes(keyword)).length
        const score = (matchCount / rule.keywords.length) * rule.confidence
        
        if (score > 0 && (!bestMatch || score > bestMatch.score)) {
          bestMatch = { rule, score }
        }
      }

      if (bestMatch && bestMatch.score > 0.3) {
        const category = categories.find(cat => 
          cat.name.toLowerCase().includes(bestMatch!.rule.categoryName.toLowerCase())
        )
        
        if (category) {
          suggestions.push({
            item,
            suggestedCategory: category,
            confidence: bestMatch.score,
            reasoning: bestMatch.rule.reasoning
          })
        }
      }
    })

    return suggestions.sort((a, b) => b.confidence - a.confidence)
  }, [currentBudgetItems, categories])

  // Calcular puntuación de salud financiera
  const financialHealthScore = useMemo((): FinancialHealthScore => {
    const totalIncome = currentBudgetItems
      .filter(item => item.type === 'income' && item.actual_amount)
      .reduce((sum, item) => sum + item.actual_amount!, 0)
    
    const totalExpenses = currentBudgetItems
      .filter(item => item.type === 'expense' && item.actual_amount)
      .reduce((sum, item) => sum + item.actual_amount!, 0)
    
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
    
    // Puntuación de ahorro (0-40 puntos)
    let savingsScore = 0
    if (savingsRate >= 20) savingsScore = 40
    else if (savingsRate >= 15) savingsScore = 35
    else if (savingsRate >= 10) savingsScore = 30
    else if (savingsRate >= 5) savingsScore = 20
    else savingsScore = Math.max(0, savingsRate * 2)
    
    // Puntuación de gastos (0-30 puntos)
    const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 100
    let spendingScore = 0
    if (expenseRatio <= 70) spendingScore = 30
    else if (expenseRatio <= 80) spendingScore = 25
    else if (expenseRatio <= 90) spendingScore = 20
    else spendingScore = Math.max(0, 30 - (expenseRatio - 70))
    
    // Puntuación de adherencia al presupuesto (0-30 puntos)
    const budgetVariance = unusualExpenses.length / Math.max(currentBudgetItems.length, 1)
    const budgetScore = Math.max(0, 30 - (budgetVariance * 100))
    
    // Puntuaciones por categoría
    const categoryScores: { [key: string]: number } = {}
    spendingPatterns.forEach(pattern => {
      let score = 80 // Base score
      if (pattern.trend === 'increasing') score -= 20
      if (pattern.anomalies > pattern.frequency * 0.2) score -= 15
      if (pattern.monthlyGrowth > 15) score -= 10
      categoryScores[pattern.category] = Math.max(0, Math.min(100, score))
    })
    
    const overall = Math.round(savingsScore + spendingScore + budgetScore)
    
    return {
      overall: Math.min(100, overall),
      savings: Math.round(savingsScore * 2.5), // Convertir a escala 0-100
      spending: Math.round(spendingScore * 3.33), // Convertir a escala 0-100
      budgetAdherence: Math.round(budgetScore * 3.33), // Convertir a escala 0-100
      categories: categoryScores
    }
  }, [currentBudgetItems, spendingPatterns, unusualExpenses])

  // Función para ejecutar análisis completo
  const runAnalysis = async () => {
    setIsAnalyzing(true)
    
    // Simular procesamiento de IA
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setLastAnalysis(new Date())
    setIsAnalyzing(false)
  }

  // Función para aplicar categorización automática
  const applyCategorization = async (suggestion: CategorizationSuggestion) => {
    // Aquí se implementaría la lógica para actualizar la categoría del item
    // TODO: Implementar actualización en base de datos
  }

  return {
    spendingPatterns,
    unusualExpenses,
    recommendations,
    categorizationSuggestions,
    financialHealthScore,
    isAnalyzing,
    lastAnalysis,
    runAnalysis,
    applyCategorization
  }
}