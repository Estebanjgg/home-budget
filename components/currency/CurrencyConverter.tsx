'use client'

import { useState, useEffect } from 'react'
import { useExchangeRate } from '@/hooks/useExchangeRate'
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react'

interface CurrencyConverterProps {
  amount?: number
  baseCurrency?: string
  className?: string
}

export function CurrencyConverter({ 
  amount = 100, 
  baseCurrency = 'USD',
  className = '' 
}: CurrencyConverterProps) {
  const [selectedCurrencies, setSelectedCurrencies] = useState(['EUR', 'BRL', 'MXN'])
  const [inputAmount, setInputAmount] = useState(amount)
  const { 
    rates, 
    loading, 
    error, 
    lastUpdate, 
    convertAmount, 
    refreshRates, 
    supportedCurrencies 
  } = useExchangeRate(baseCurrency)

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCurrencyName = (code: string) => {
    const names: Record<string, string> = {
      'USD': 'Dólar Estadounidense',
      'EUR': 'Euro',
      'BRL': 'Real Brasileño',
      'MXN': 'Peso Mexicano',
      'ARS': 'Peso Argentino',
      'COP': 'Peso Colombiano',
      'CLP': 'Peso Chileno',
      'PEN': 'Sol Peruano',
      'CAD': 'Dólar Canadiense',
      'GBP': 'Libra Esterlina',
      'JPY': 'Yen Japonés',
      'CNY': 'Yuan Chino'
    }
    return names[code] || code
  }

  const addCurrency = (currency: string) => {
    if (!selectedCurrencies.includes(currency) && selectedCurrencies.length < 6) {
      setSelectedCurrencies([...selectedCurrencies, currency])
    }
  }

  const removeCurrency = (currency: string) => {
    setSelectedCurrencies(selectedCurrencies.filter(c => c !== currency))
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Conversor de Monedas</h3>
        </div>
        <button
          onClick={refreshRates}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Input de cantidad */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cantidad en {baseCurrency}
        </label>
        <input
          type="number"
          value={inputAmount}
          onChange={(e) => setInputAmount(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ingresa la cantidad"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Conversiones */}
      {rates && (
        <div className="space-y-3 mb-6">
          {selectedCurrencies.map((currency) => {
            const convertedAmount = convertAmount(inputAmount, baseCurrency, currency)
            const rate = rates[currency]
            
            return (
              <div key={currency} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-blue-600">{currency}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{getCurrencyName(currency)}</div>
                    <div className="text-xs text-gray-500">1 {baseCurrency} = {rate?.toFixed(4)} {currency}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {convertedAmount ? formatCurrency(convertedAmount, currency) : 'N/A'}
                  </div>
                  <button
                    onClick={() => removeCurrency(currency)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Agregar monedas */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Agregar moneda
        </label>
        <select
          onChange={(e) => {
            if (e.target.value) {
              addCurrency(e.target.value)
              e.target.value = ''
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={selectedCurrencies.length >= 6}
        >
          <option value="">Selecciona una moneda...</option>
          {supportedCurrencies
            .filter(currency => currency !== baseCurrency && !selectedCurrencies.includes(currency))
            .map(currency => (
              <option key={currency} value={currency}>
                {currency} - {getCurrencyName(currency)}
              </option>
            ))
          }
        </select>
        {selectedCurrencies.length >= 6 && (
          <p className="text-xs text-gray-500 mt-1">Máximo 6 monedas permitidas</p>
        )}
      </div>

      {/* Información de actualización */}
      {lastUpdate && (
        <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
          Última actualización: {formatDate(lastUpdate)}
        </div>
      )}
    </div>
  )
}

// Componente compacto para mostrar en el dashboard
export function CurrencyWidget({ amount = 1000, baseCurrency = 'USD' }: CurrencyConverterProps) {
  const { rates, loading, convertAmount } = useExchangeRate(baseCurrency)
  const popularCurrencies = ['EUR', 'BRL', 'MXN']

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="h-4 w-4 text-blue-600" />
          <h4 className="font-medium text-gray-900">Conversión de Monedas</h4>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="h-4 w-4 text-blue-600" />
        <h4 className="font-medium text-gray-900">Conversión de Monedas</h4>
      </div>
      <div className="text-sm text-gray-600 mb-2">
        {formatCurrency(amount, baseCurrency)} equivale a:
      </div>
      <div className="space-y-2">
        {rates && popularCurrencies.map(currency => {
          const converted = convertAmount(amount, baseCurrency, currency)
          return (
            <div key={currency} className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{currency}</span>
              <span className="text-sm text-gray-900">
                {converted ? formatCurrency(converted, currency) : 'N/A'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}