'use client'

import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { X, AlertTriangle, TrendingUp, TrendingDown, Target, DollarSign, Eye, EyeOff, Trash2, RotateCcw, CheckCircle, Info } from 'lucide-react'
import { useSwipeGestures } from '../../hooks/useSwipeGestures'

interface Alert {
  id: string
  type: 'warning' | 'danger' | 'info' | 'success'
  title: string
  message: string
  timestamp: Date
  category?: string
  amount?: number
  limit?: number
  dismissed?: boolean
}

interface SmartAlertsProps {
  monthlyIncome: number
  monthlyExpenses: number
  budgetLimits: { [category: string]: number }
  categoryExpenses: { [category: string]: number }
  formatCurrency: (amount: number) => string
}

const ALERT_THRESHOLDS = {
  EXPENSE_WARNING: 0.8, // 80% del límite
  EXPENSE_DANGER: 1.0,   // 100% del límite
  SAVINGS_WARNING: 0.1,  // Menos del 10% de ahorro
  INCOME_VARIANCE: 0.15  // 15% de variación en ingresos
}

// Claves para localStorage
const DISMISSED_ALERTS_KEY = 'home-budget-dismissed-alerts'
const ALERTS_VISIBILITY_KEY = 'home-budget-alerts-visibility'
const LAST_ALERT_DATE_KEY = 'home-budget-last-alert-date'

// Funciones para manejar localStorage
const getDismissedAlerts = (): Set<string> => {
  if (typeof window === 'undefined') return new Set()
  try {
    const stored = localStorage.getItem(DISMISSED_ALERTS_KEY)
    return stored ? new Set(JSON.parse(stored)) : new Set()
  } catch {
    return new Set()
  }
}

const saveDismissedAlerts = (dismissedIds: Set<string>) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify([...dismissedIds]))
  } catch {
    // Silently fail if localStorage is not available
  }
}

const getAlertsVisibility = (): boolean => {
  if (typeof window === 'undefined') return true
  try {
    const stored = localStorage.getItem(ALERTS_VISIBILITY_KEY)
    return stored ? JSON.parse(stored) : true
  } catch {
    return true
  }
}

const saveAlertsVisibility = (visible: boolean) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ALERTS_VISIBILITY_KEY, JSON.stringify(visible))
  } catch {
    // Silently fail if localStorage is not available
  }
}

// Funciones para manejar la fecha de última alerta
const getLastAlertDate = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(LAST_ALERT_DATE_KEY)
  } catch {
    return null
  }
}

const saveLastAlertDate = (date: string) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LAST_ALERT_DATE_KEY, date)
  } catch {
    // Silently fail if localStorage is not available
  }
}

const shouldShowAlertsToday = (): boolean => {
  const today = new Date().toDateString()
  const lastAlertDate = getLastAlertDate()
  return lastAlertDate !== today
}

export function SmartAlerts({ 
  monthlyIncome, 
  monthlyExpenses, 
  budgetLimits, 
  categoryExpenses, 
  formatCurrency 
}: SmartAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [showAlerts, setShowAlerts] = useState(true)
  const [lastIncome, setLastIncome] = useState<number>(0)
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
  const [newAlertsToShow, setNewAlertsToShow] = useState<Alert[]>([])
  const [swipingAlerts, setSwipingAlerts] = useState<Set<string>>(new Set())
  const [mounted, setMounted] = useState(false)
  const alertRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // Cargar estado inicial desde localStorage solo después del montaje
  useEffect(() => {
    setMounted(true)
    setDismissedAlerts(getDismissedAlerts())
    setShowAlerts(getAlertsVisibility())
  }, [])

  // Generar alertas basadas en los datos actuales
  useEffect(() => {
    const newAlerts: Alert[] = []
    const now = new Date()
    const existingAlertIds = new Set(alerts.filter(a => !a.dismissed).map(a => a.id))

    // Función helper para verificar si una alerta debe ser creada
    const shouldCreateAlert = (baseId: string): boolean => {
      return !dismissedAlerts.has(baseId) && !existingAlertIds.has(baseId)
    }

    // 1. Alertas de límites de categorías
    Object.entries(categoryExpenses).forEach(([category, spent]) => {
      const limit = budgetLimits[category]
      if (!limit) return

      const percentage = spent / limit
      
      if (percentage >= ALERT_THRESHOLDS.EXPENSE_DANGER) {
        const baseId = `category-danger-${category}`
        if (shouldCreateAlert(baseId)) {
          newAlerts.push({
            id: `${baseId}-${now.getTime()}`,
            type: 'danger',
            title: '🚨 Límite Excedido',
            message: `Has superado el límite en ${category}. Gastado: ${formatCurrency(spent)} de ${formatCurrency(limit)}`,
            timestamp: now,
            category,
            amount: spent,
            limit
          })
        }
      } else if (percentage >= ALERT_THRESHOLDS.EXPENSE_WARNING) {
        const baseId = `category-warning-${category}`
        if (shouldCreateAlert(baseId)) {
          newAlerts.push({
            id: `${baseId}-${now.getTime()}`,
            type: 'warning',
            title: '⚠️ Acercándose al Límite',
            message: `Has gastado ${(percentage * 100).toFixed(0)}% del límite en ${category}`,
            timestamp: now,
            category,
            amount: spent,
            limit
          })
        }
      }
    })

    // 2. Alerta de ahorro bajo
    const savingsRate = (monthlyIncome - monthlyExpenses) / monthlyIncome
    if (savingsRate < ALERT_THRESHOLDS.SAVINGS_WARNING && monthlyIncome > 0) {
      const baseId = 'low-savings'
      if (shouldCreateAlert(baseId)) {
        newAlerts.push({
          id: `${baseId}-${now.getTime()}`,
          type: 'warning',
          title: '💰 Ahorro Bajo',
          message: `Tu tasa de ahorro es solo del ${(savingsRate * 100).toFixed(1)}%. Se recomienda al menos 20%`,
          timestamp: now
        })
      }
    }

    // 3. Alerta de gastos totales altos
    const expenseRate = monthlyExpenses / monthlyIncome
    if (expenseRate > 0.9 && monthlyIncome > 0) {
      const baseId = 'high-expenses'
      if (shouldCreateAlert(baseId)) {
        newAlerts.push({
          id: `${baseId}-${now.getTime()}`,
          type: 'danger',
          title: '📈 Gastos Elevados',
          message: `Estás gastando ${(expenseRate * 100).toFixed(0)}% de tus ingresos. Considera reducir gastos`,
          timestamp: now
        })
      }
    }

    // 4. Alerta de variación en ingresos
    if (lastIncome > 0) {
      const incomeVariance = Math.abs(monthlyIncome - lastIncome) / lastIncome
      if (incomeVariance > ALERT_THRESHOLDS.INCOME_VARIANCE) {
        const isIncrease = monthlyIncome > lastIncome
        const baseId = 'income-variance'
        if (shouldCreateAlert(baseId)) {
          newAlerts.push({
            id: `${baseId}-${now.getTime()}`,
            type: isIncrease ? 'success' : 'info',
            title: isIncrease ? '📈 Aumento de Ingresos' : '📉 Reducción de Ingresos',
            message: `Tus ingresos ${isIncrease ? 'aumentaron' : 'disminuyeron'} ${(incomeVariance * 100).toFixed(0)}% respecto al mes anterior`,
            timestamp: now
          })
        }
      }
    }

    // 5. Alertas positivas
    if (savingsRate > 0.3) {
      const baseId = 'excellent-savings'
      if (shouldCreateAlert(baseId)) {
        newAlerts.push({
          id: `${baseId}-${now.getTime()}`,
          type: 'success',
          title: '🎉 ¡Excelente Ahorro!',
          message: `¡Felicitaciones! Estás ahorrando ${(savingsRate * 100).toFixed(0)}% de tus ingresos`,
          timestamp: now
        })
      }
    }

    // Solo agregar nuevas alertas si hay alguna
    if (newAlerts.length > 0) {
      setAlerts(prev => {
        // Filtrar alertas duplicadas
        const existingIds = new Set(prev.filter(a => !a.dismissed).map(a => a.id.split('-').slice(0, -1).join('-')))
        const uniqueNewAlerts = newAlerts.filter(alert => {
          const baseId = alert.id.split('-').slice(0, -1).join('-')
          return !existingIds.has(baseId)
        })
        
        if (uniqueNewAlerts.length > 0) {
          // Solo mostrar toasts si es la primera vez hoy
          if (shouldShowAlertsToday()) {
            setNewAlertsToShow(uniqueNewAlerts)
            // Marcar que ya se mostraron alertas hoy
            saveLastAlertDate(new Date().toDateString())
          }
          return [...prev, ...uniqueNewAlerts]
        }
        
        return prev
      })
    }

    setLastIncome(monthlyIncome)
  }, [monthlyIncome, monthlyExpenses, budgetLimits, categoryExpenses, formatCurrency, lastIncome])

  // useEffect separado para manejar las notificaciones toast
  useEffect(() => {
    if (newAlertsToShow.length > 0) {
      newAlertsToShow.forEach(alert => {
        if (alert.type === 'danger') {
          toast.error(alert.title, {
            duration: 5000,
            position: 'top-right'
          })
        } else if (alert.type === 'warning') {
          toast(alert.title, {
            icon: '⚠️',
            duration: 4000,
            position: 'top-right'
          })
        } else if (alert.type === 'success') {
          toast.success(alert.title, {
            duration: 3000,
            position: 'top-right'
          })
        }
      })
      // Limpiar las alertas después de mostrarlas
      setNewAlertsToShow([])
    }
  }, [newAlertsToShow])

  const dismissAlert = (alertId: string) => {
    // Extraer el baseId del alertId completo
    const baseId = alertId.split('-').slice(0, -1).join('-')
    
    // Actualizar el estado local
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, dismissed: true } : alert
      )
    )
    
    // Guardar en localStorage
    const newDismissedAlerts = new Set([...dismissedAlerts, baseId])
    setDismissedAlerts(newDismissedAlerts)
    saveDismissedAlerts(newDismissedAlerts)
  }

  const clearAllAlerts = () => {
    const activeAlerts = alerts.filter(alert => !alert.dismissed)
    const baseIds = activeAlerts.map(alert => alert.id.split('-').slice(0, -1).join('-'))
    
    // Actualizar el estado local
    setAlerts(prev => prev.map(alert => ({ ...alert, dismissed: true })))
    
    // Guardar en localStorage
    const newDismissedAlerts = new Set([...dismissedAlerts, ...baseIds])
    setDismissedAlerts(newDismissedAlerts)
    saveDismissedAlerts(newDismissedAlerts)
  }

  const toggleAlertsVisibility = () => {
    const newVisibility = !showAlerts
    setShowAlerts(newVisibility)
    saveAlertsVisibility(newVisibility)
  }

  const resetAllAlerts = () => {
    // Limpiar todas las alertas descartadas
    setDismissedAlerts(new Set())
    saveDismissedAlerts(new Set())
    
    // Mostrar alertas nuevamente
    setShowAlerts(true)
    saveAlertsVisibility(true)
    
    // Limpiar alertas actuales para que se regeneren
    setAlerts([])
  }

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'success':
        return <TrendingUp className="w-5 h-5 text-green-500" />
      case 'info':
        return <TrendingDown className="w-5 h-5 text-blue-500" />
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />
    }
  }

  const getAlertBorderColor = (type: Alert['type']) => {
    switch (type) {
      case 'danger':
        return 'border-l-red-500 bg-red-50'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'success':
        return 'border-l-green-500 bg-green-50'
      case 'info':
        return 'border-l-blue-500 bg-blue-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const activeAlerts = alerts.filter(alert => !alert.dismissed)
  const criticalAlerts = activeAlerts.filter(alert => alert.type === 'danger')
  const warningAlerts = activeAlerts.filter(alert => alert.type === 'warning')

  // Evitar hidratación hasta que el componente esté montado
  if (!mounted) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg bg-gray-100">
            <AlertTriangle className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">🛡️ Alertas Inteligentes</h3>
            <p className="text-sm text-gray-600">Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
      {/* Header - siempre visible */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className={`p-1.5 sm:p-2 rounded-lg ${
            criticalAlerts.length > 0 ? 'bg-red-100' : 
            warningAlerts.length > 0 ? 'bg-yellow-100' : 'bg-green-100'
          }`}>
            <AlertTriangle className={`w-5 h-5 sm:w-6 sm:h-6 ${
              criticalAlerts.length > 0 ? 'text-red-600' : 
              warningAlerts.length > 0 ? 'text-yellow-600' : 'text-green-600'
            }`} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">🛡️ Alertas Inteligentes</h3>
            <p className="text-xs sm:text-sm text-gray-600">
              {showAlerts ? 
                `${activeAlerts.length} alerta${activeAlerts.length !== 1 ? 's' : ''} activa${activeAlerts.length !== 1 ? 's' : ''}` :
                'Alertas ocultas'
              }
            </p>
          </div>
        </div>
        
        {/* Controles - siempre visibles */}
        <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
          <button
            onClick={toggleAlertsVisibility}
            className="px-2 sm:px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
          >
            {showAlerts ? 'Ocultar' : 'Mostrar'}
          </button>
          {showAlerts && activeAlerts.length > 0 && (
            <button
              onClick={clearAllAlerts}
              className="px-2 sm:px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              Limpiar Todo
            </button>
          )}
          <button
            onClick={resetAllAlerts}
            className="px-2 sm:px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors whitespace-nowrap"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Resumen de alertas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-red-800">Críticas</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{criticalAlerts.length}</p>
            </div>
            <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-yellow-800">Advertencias</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">{warningAlerts.length}</p>
            </div>
            <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-800">Informativas</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">
                {activeAlerts.filter(a => a.type === 'info' || a.type === 'success').length}
              </p>
            </div>
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
        {!showAlerts ? (
          <div className="text-center py-6 sm:py-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />
            </div>
            <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Alertas ocultas</h4>
            <p className="text-sm sm:text-base text-gray-600">Haz clic en "Mostrar" para ver las alertas.</p>
          </div>
        ) : activeAlerts.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">¡Todo en orden!</h4>
            <p className="text-sm sm:text-base text-gray-600">No hay alertas activas. Tus finanzas están bajo control.</p>
          </div>
        ) : (
          activeAlerts
            .sort((a, b) => {
              // Ordenar por prioridad: danger > warning > info > success
              const priority = { danger: 4, warning: 3, info: 2, success: 1 }
              return priority[b.type] - priority[a.type]
            })
            .map((alert) => {
              const AlertComponent = () => {
                const alertRef = useRef<HTMLDivElement>(null)
                
                // Configurar swipe para esta alerta específica
                useSwipeGestures({
                  onSwipeLeft: () => {
                    setSwipingAlerts(prev => new Set([...prev, alert.id]))
                    setTimeout(() => {
                      dismissAlert(alert.id)
                      setSwipingAlerts(prev => {
                        const newSet = new Set(prev)
                        newSet.delete(alert.id)
                        return newSet
                      })
                    }, 300)
                  },
                  onSwipeRight: () => {
                    setSwipingAlerts(prev => new Set([...prev, alert.id]))
                    setTimeout(() => {
                      dismissAlert(alert.id)
                      setSwipingAlerts(prev => {
                        const newSet = new Set(prev)
                        newSet.delete(alert.id)
                        return newSet
                      })
                    }, 300)
                  },
                  element: alertRef.current,
                  threshold: 50
                })
                
                const isSwipingThis = swipingAlerts.has(alert.id)
                
                return (
                  <div
                    ref={alertRef}
                    className={`border-l-4 p-3 sm:p-4 rounded-r-lg ${getAlertBorderColor(alert.type)} transition-all duration-300 hover:shadow-md relative overflow-hidden ${
                      isSwipingThis ? 'transform translate-x-full opacity-0' : 'transform translate-x-0 opacity-100'
                    }`}
                  >
                    {/* Swipe indicator for mobile */}
                    <div className="md:hidden absolute top-2 right-2 text-xs text-gray-400 opacity-50">
                      👈 Desliza
                    </div>
                    
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-1">{alert.title}</h4>
                          <p className="text-xs sm:text-sm text-gray-600 mb-2 break-words">{alert.message}</p>
                          
                          {alert.category && alert.amount && alert.limit && (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs text-gray-500">
                              <span>Categoría: {alert.category}</span>
                              <span>Progreso: {((alert.amount / alert.limit) * 100).toFixed(0)}%</span>
                            </div>
                          )}
                          
                          <p className="text-xs text-gray-400 mt-2">
                            {alert.timestamp.toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors ml-1 sm:ml-2 flex-shrink-0"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                )
              }
              
              return <AlertComponent key={alert.id} />
            })
        )}
      </div>
    </div>
  )
}