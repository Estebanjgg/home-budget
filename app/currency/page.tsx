'use client'

import { useState } from 'react'
import { CurrencyConverter } from '@/components/currency/CurrencyConverter'
import { useCurrencyBudget, useCurrencyFormatter } from '@/hooks/useCurrencyBudget'
import { useBudgets } from '@/hooks/useBudgets'
import { useBudgetItems } from '@/hooks/useBudgetItems'
import { ArrowLeft, TrendingUp, Globe, Calculator } from 'lucide-react'
import Link from 'next/link'

export default function CurrencyPage() {
  const { budgets } = useBudgets()
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null)
  const { items } = useBudgetItems(selectedBudgetId)
  const { formatCurrency, formatCompactCurrency } = useCurrencyFormatter()
  
  const {
    convertedBudgets,
    convertedItems,
    displayCurrency,
    setDisplayCurrency,
    getTotalInCurrency,
    supportedCurrencies,
    loading,
    error
  } = useCurrencyBudget(budgets, items)

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()
  const currentBudget = budgets.find(b => b.month === currentMonth && b.year === currentYear)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              href="/"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Volver al Dashboard</span>
            </Link>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-3">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Centro de Conversión de Monedas
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Convierte tus presupuestos y gastos entre diferentes monedas en tiempo real
            </p>
          </div>
        </div>

        {/* Currency Selector */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">Moneda de Visualización</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {supportedCurrencies.map(currency => (
              <button
                key={currency}
                onClick={() => setDisplayCurrency(currency)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  displayCurrency === currency
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="font-bold text-lg">{currency}</div>
                <div className="text-xs opacity-75">
                  {currency === 'USD' && 'Dólar US'}
                  {currency === 'EUR' && 'Euro'}
                  {currency === 'BRL' && 'Real'}
                  {currency === 'MXN' && 'Peso MX'}
                  {currency === 'ARS' && 'Peso AR'}
                  {currency === 'COP' && 'Peso CO'}
                  {currency === 'CLP' && 'Peso CL'}
                  {currency === 'PEN' && 'Sol'}
                  {currency === 'CAD' && 'Dólar CA'}
                  {currency === 'GBP' && 'Libra'}
                  {currency === 'JPY' && 'Yen'}
                  {currency === 'CNY' && 'Yuan'}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Conversor Principal */}
          <div>
            <CurrencyConverter 
              amount={1000}
              baseCurrency={displayCurrency}
              className="h-fit"
            />
          </div>

          {/* Resumen de Presupuestos */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-6 w-6 text-green-600" />
              <h3 className="text-2xl font-bold text-gray-800">Resumen de Presupuestos</h3>
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando conversiones...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {!loading && convertedBudgets.length > 0 && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-gray-800 mb-2">Total General</h4>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(getTotalInCurrency(displayCurrency), displayCurrency)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Suma de todos los presupuestos en {displayCurrency}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">Presupuestos por Mes</h4>
                  {convertedBudgets.slice(0, 6).map(budget => (
                    <div key={budget.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800">
                          {new Date(budget.year, budget.month - 1).toLocaleDateString('es-ES', {
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-sm text-gray-600">
                          Original: {formatCurrency(budget.amount, budget.originalCurrency)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          {formatCurrency(budget.convertedAmount || budget.amount, displayCurrency)}
                        </div>
                        {budget.originalCurrency !== displayCurrency && (
                          <div className="text-xs text-blue-600">
                            Convertido de {budget.originalCurrency}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {convertedBudgets.length > 6 && (
                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-500">
                      Y {convertedBudgets.length - 6} presupuestos más...
                    </p>
                  </div>
                )}
              </div>
            )}

            {!loading && convertedBudgets.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <Calculator className="h-12 w-12 mx-auto" />
                </div>
                <p className="text-gray-600">No hay presupuestos para mostrar</p>
                <p className="text-sm text-gray-500 mt-2">
                  Crea tu primer presupuesto para ver las conversiones
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">💡 Información sobre Conversiones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">🔄 Actualizaciones</h4>
              <p className="text-sm text-blue-700">
                Las tasas de cambio se actualizan automáticamente y se almacenan localmente para uso offline.
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">💾 Almacenamiento</h4>
              <p className="text-sm text-green-700">
                Tus preferencias de moneda se guardan automáticamente para futuras sesiones.
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">🌍 Cobertura</h4>
              <p className="text-sm text-purple-700">
                Soportamos las principales monedas mundiales con datos en tiempo real.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}