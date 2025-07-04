import { useState, useEffect, useCallback } from 'react'

interface ExchangeRateData {
  base_code: string
  conversion_rates: Record<string, number>
  time_last_update_utc: string
}

interface ExchangeRateHook {
  rates: Record<string, number> | null
  loading: boolean
  error: string | null
  lastUpdate: string | null
  convertAmount: (amount: number, fromCurrency: string, toCurrency: string) => number | null
  refreshRates: () => Promise<void>
  supportedCurrencies: string[]
}

const API_KEY = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY || 'cf1287c1ebc8b4c0e3b5e24e'
const BASE_URL = 'https://v6.exchangerate-api.com/v6'

// Monedas más comunes para el presupuesto familiar
const SUPPORTED_CURRENCIES = [
  'USD', // Dólar estadounidense
  'EUR', // Euro
  'BRL', // Real brasileño
  'MXN', // Peso mexicano
  'ARS', // Peso argentino
  'COP', // Peso colombiano
  'CLP', // Peso chileno
  'PEN', // Sol peruano
  'CAD', // Dólar canadiense
  'GBP', // Libra esterlina
  'JPY', // Yen japonés
  'CNY', // Yuan chino
]

export function useExchangeRate(baseCurrency: string = 'USD'): ExchangeRateHook {
  const [rates, setRates] = useState<Record<string, number> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  const fetchRates = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${BASE_URL}/${API_KEY}/latest/${baseCurrency}`)
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const data: ExchangeRateData = await response.json()
      
      if (data.conversion_rates) {
        setRates(data.conversion_rates)
        setLastUpdate(data.time_last_update_utc)
        
        // Guardar en localStorage para uso offline
        localStorage.setItem('exchangeRates', JSON.stringify({
          rates: data.conversion_rates,
          lastUpdate: data.time_last_update_utc,
          baseCurrency
        }))
      } else {
        throw new Error('No se pudieron obtener las tasas de cambio')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      
      // Intentar cargar desde localStorage si hay error
      const cached = localStorage.getItem('exchangeRates')
      if (cached) {
        try {
          const cachedData = JSON.parse(cached)
          if (cachedData.baseCurrency === baseCurrency) {
            setRates(cachedData.rates)
            setLastUpdate(cachedData.lastUpdate)
            setError(`${errorMessage} (usando datos en caché)`)
          }
        } catch {
          // Ignorar errores de parsing
        }
      }
    } finally {
      setLoading(false)
    }
  }, [baseCurrency])

  const convertAmount = useCallback((amount: number, fromCurrency: string, toCurrency: string): number | null => {
    if (!rates || !amount) return null
    
    // Si es la misma moneda, no hay conversión
    if (fromCurrency === toCurrency) return amount
    
    // Si fromCurrency es la base, usar directamente la tasa
    if (fromCurrency === baseCurrency) {
      const rate = rates[toCurrency]
      return rate ? amount * rate : null
    }
    
    // Si toCurrency es la base, dividir por la tasa
    if (toCurrency === baseCurrency) {
      const rate = rates[fromCurrency]
      return rate ? amount / rate : null
    }
    
    // Para conversión entre dos monedas no base, convertir primero a base y luego a destino
    const fromRate = rates[fromCurrency]
    const toRate = rates[toCurrency]
    
    if (fromRate && toRate) {
      const baseAmount = amount / fromRate
      return baseAmount * toRate
    }
    
    return null
  }, [rates, baseCurrency])

  const refreshRates = useCallback(async () => {
    await fetchRates()
  }, [fetchRates])

  // Cargar tasas al montar el componente
  useEffect(() => {
    // Intentar cargar desde localStorage primero
    const cached = localStorage.getItem('exchangeRates')
    if (cached) {
      try {
        const cachedData = JSON.parse(cached)
        if (cachedData.baseCurrency === baseCurrency) {
          setRates(cachedData.rates)
          setLastUpdate(cachedData.lastUpdate)
        }
      } catch {
        // Ignorar errores de parsing
      }
    }
    
    // Luego obtener datos frescos
    fetchRates()
  }, [fetchRates])

  return {
    rates,
    loading,
    error,
    lastUpdate,
    convertAmount,
    refreshRates,
    supportedCurrencies: SUPPORTED_CURRENCIES
  }
}