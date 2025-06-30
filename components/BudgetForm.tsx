'use client'

import { useState } from 'react'
import type { Budget } from '@/lib/types'

interface BudgetFormProps {
  onSubmit: (budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  onCancel: () => void
  initialData?: Partial<Budget>
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export function BudgetForm({ onSubmit, onCancel, initialData }: BudgetFormProps) {
  const currentDate = new Date()
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    month: initialData?.month || currentDate.getMonth() + 1,
    year: initialData?.year || currentDate.getFullYear(),
    gross_income: initialData?.gross_income || 0,
    tithe_percentage: initialData?.tithe_percentage || 10,
    tithe_enabled: initialData?.tithe_enabled || false,
    savings_amount: initialData?.savings_amount || 0
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }

    if (formData.gross_income < 0) {
      newErrors.gross_income = 'Los ingresos no pueden ser negativos'
    }

    if (formData.tithe_percentage < 0 || formData.tithe_percentage > 100) {
      newErrors.tithe_percentage = 'El porcentaje debe estar entre 0 y 100'
    }

    if (formData.savings_amount < 0) {
      newErrors.savings_amount = 'Los ahorros no pueden ser negativos'
    }

    if (formData.savings_amount > formData.gross_income) {
      newErrors.savings_amount = 'Los ahorros no pueden ser mayores a los ingresos'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const titheAmount = formData.tithe_enabled ? (formData.gross_income * formData.tithe_percentage / 100) : 0
  const availableAmount = formData.gross_income - titheAmount - formData.savings_amount

  return (
    <div className="bg-white rounded-xl shadow-lg max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
        <h2 className="text-2xl font-bold">💰 {initialData ? 'Editar' : 'Crear'} Presupuesto</h2>
        <p className="text-blue-100 mt-1">Define tu presupuesto mensual</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Presupuesto
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Presupuesto Enero"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mes
            </label>
            <select
              value={formData.month}
              onChange={(e) => handleInputChange('month', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {MONTHS.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Año
            </label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
              min="2020"
              max="2030"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Ingresos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ingresos Brutos Mensuales
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              value={formData.gross_income}
              onChange={(e) => handleInputChange('gross_income', parseFloat(e.target.value) || 0)}
              className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.gross_income ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>
          {errors.gross_income && <p className="text-red-500 text-sm mt-1">{errors.gross_income}</p>}
        </div>

        {/* Diezmo */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.tithe_enabled}
                onChange={(e) => handleInputChange('tithe_enabled', e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Incluir Diezmo</span>
            </label>
            {formData.tithe_enabled && (
              <span className="text-blue-600 font-semibold">
                ${titheAmount.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
              </span>
            )}
          </div>
          
          {formData.tithe_enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Porcentaje del Diezmo (%)
              </label>
              <input
                type="number"
                value={formData.tithe_percentage}
                onChange={(e) => handleInputChange('tithe_percentage', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.tithe_percentage ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                max="100"
                step="0.1"
              />
              {errors.tithe_percentage && <p className="text-red-500 text-sm mt-1">{errors.tithe_percentage}</p>}
            </div>
          )}
        </div>

        {/* Ahorros */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monto para Ahorros/Cofre
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              value={formData.savings_amount}
              onChange={(e) => handleInputChange('savings_amount', parseFloat(e.target.value) || 0)}
              className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.savings_amount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>
          {errors.savings_amount && <p className="text-red-500 text-sm mt-1">{errors.savings_amount}</p>}
        </div>

        {/* Resumen */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">📊 Resumen</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Ingresos Brutos:</span>
              <span className="font-medium">${formData.gross_income.toLocaleString('es-CO')}</span>
            </div>
            {formData.tithe_enabled && (
              <div className="flex justify-between">
                <span className="text-gray-600">Diezmo ({formData.tithe_percentage}%):</span>
                <span className="font-medium text-blue-600">-${titheAmount.toLocaleString('es-CO')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Ahorros:</span>
              <span className="font-medium text-purple-600">-${formData.savings_amount.toLocaleString('es-CO')}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-semibold text-gray-800">Disponible para Gastos:</span>
              <span className={`font-bold text-lg ${
                availableAmount >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${availableAmount.toLocaleString('es-CO')}
              </span>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || availableAmount < 0}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear Presupuesto')}
          </button>
        </div>
      </form>
    </div>
  )
}