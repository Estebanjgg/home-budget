import { useState, useEffect, useMemo } from 'react'
import { useExchangeRate } from './useExchangeRate'
import { Budget, BudgetItem } from '@/lib/types'

interface CurrencyBudgetItem extends BudgetItem {
  originalCurrency: string
  convertedAmount?: number
}

interface CurrencyBudget extends Budget {
  originalCurrency: string
  convertedAmount?: number
  items?: CurrencyBudgetItem[]
}

interface CurrencyBudgetHook {
  convertedBudgets: CurrencyBudget[]
  convertedItems: CurrencyBudgetItem[]
  displayCurrency: string
  setDisplayCurrency: (currency: string) => void
  getTotalInCurrency: (currency: string) => number
  convertAmount: (amount: number, fromCurrency: string, toCurrency: string) => number | null
  supportedCurrencies: string[]
  loading: boolean
  error: string | null
}

export function useCurrencyBudget(
  budgets: Budget[],
  budgetItems: BudgetItem[],
  defaultCurrency: string = 'USD'
): CurrencyBudgetHook {
  const [displayCurrency, setDisplayCurrency] = useState(defaultCurrency)
  const { convertAmount, supportedCurrencies, loading, error } = useExchangeRate(defaultCurrency)

  // Detectar monedas usadas en los presupuestos
  const detectedCurrencies = useMemo(() => {
    const currencies = new Set<string>()
    
    // Agregar monedas de los presupuestos
    budgets.forEach(budget => {
      // Asumimos que los presupuestos tienen una propiedad currency, si no, usar USD
      const currency = (budget as any).currency || 'USD'
      currencies.add(currency)
    })
    
    // Agregar monedas de los items
    budgetItems.forEach(item => {
      // Asumimos que los items tienen una propiedad currency, si no, usar USD
      const currency = (item as any).currency || 'USD'
      currencies.add(currency)
    })
    
    return Array.from(currencies)
  }, [budgets, budgetItems])

  // Convertir presupuestos a la moneda de visualización
  const convertedBudgets = useMemo(() => {
    return budgets.map(budget => {
      const originalCurrency = (budget as any).currency || 'USD'
      const convertedAmount = convertAmount(budget.amount, originalCurrency, displayCurrency)
      
      return {
        ...budget,
        originalCurrency,
        convertedAmount: convertedAmount || budget.amount
      } as CurrencyBudget
    })
  }, [budgets, convertAmount, displayCurrency])

  // Convertir items de presupuesto a la moneda de visualización
  const convertedItems = useMemo(() => {
    return budgetItems.map(item => {
      const originalCurrency = (item as any).currency || 'USD'
      const convertedAmount = convertAmount(item.amount, originalCurrency, displayCurrency)
      
      return {
        ...item,
        originalCurrency,
        convertedAmount: convertedAmount || item.amount
      } as CurrencyBudgetItem
    })
  }, [budgetItems, convertAmount, displayCurrency])

  // Calcular total en una moneda específica
  const getTotalInCurrency = (currency: string): number => {
    return budgetItems.reduce((total, item) => {
      const originalCurrency = (item as any).currency || 'USD'
      const converted = convertAmount(item.amount, originalCurrency, currency)
      return total + (converted || 0)
    }, 0)
  }

  // Guardar preferencia de moneda en localStorage
  useEffect(() => {
    localStorage.setItem('preferredDisplayCurrency', displayCurrency)
  }, [displayCurrency])

  // Cargar preferencia de moneda al inicializar
  useEffect(() => {
    const saved = localStorage.getItem('preferredDisplayCurrency')
    if (saved && supportedCurrencies.includes(saved)) {
      setDisplayCurrency(saved)
    }
  }, [supportedCurrencies])

  return {
    convertedBudgets,
    convertedItems,
    displayCurrency,
    setDisplayCurrency,
    getTotalInCurrency,
    convertAmount,
    supportedCurrencies,
    loading,
    error
  }
}

// Hook para formatear monedas
export function useCurrencyFormatter() {
  const formatCurrency = (amount: number, currency: string, locale: string = 'es-ES') => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)
    } catch (error) {
      // Fallback si la moneda no es soportada
      return `${currency} ${amount.toFixed(2)}`
    }
  }

  const formatCompactCurrency = (amount: number, currency: string, locale: string = 'es-ES') => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(amount)
    } catch (error) {
      // Fallback para números grandes
      if (amount >= 1000000) {
        return `${currency} ${(amount / 1000000).toFixed(1)}M`
      } else if (amount >= 1000) {
        return `${currency} ${(amount / 1000).toFixed(1)}K`
      }
      return `${currency} ${amount.toFixed(2)}`
    }
  }

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'BRL': 'R$',
      'MXN': '$',
      'ARS': '$',
      'COP': '$',
      'CLP': '$',
      'PEN': 'S/',
      'CAD': 'C$',
      'GBP': '£',
      'JPY': '¥',
      'CNY': '¥'
    }
    return symbols[currency] || currency
  }

  return {
    formatCurrency,
    formatCompactCurrency,
    getCurrencySymbol
  }
}