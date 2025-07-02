'use client'

import { useState } from 'react'
import type { BudgetItem, ExpenseCategory } from '@/lib/types'

interface BudgetItemFormProps {
  budgetId: string
  categories: ExpenseCategory[]
  onSubmit: (item: Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  onCancel: () => void
  initialData?: Partial<BudgetItem>
}

export function BudgetItemForm({ budgetId, categories, onSubmit, onCancel, initialData }: BudgetItemFormProps) {
  const [formData, setFormData] = useState({
    budget_id: budgetId,
    type: (initialData?.type || 'expense') as 'income' | 'expense',
    description: initialData?.description || '',
    estimated_amount: initialData?.estimated_amount || 0,
    actual_amount: initialData?.actual_amount || null,
    due_date: initialData?.due_date || '',
    is_paid: initialData?.is_paid || false,
    category_id: initialData?.category_id || '',
    notes: initialData?.notes || ''  // Nuevo campo
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida'
    }

    if (formData.estimated_amount <= 0) {
      newErrors.estimated_amount = 'El monto debe ser mayor a 0'
    }

    if (formData.type === 'expense' && !formData.category_id) {
      newErrors.category_id = 'Selecciona una categoría para los gastos'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const submitData = {
        ...formData,
        category_id: formData.type === 'income' ? null : formData.category_id || null,
        due_date: formData.due_date || null,
        notes: formData.notes || null  // Incluir notas en el envío
      }
      await onSubmit(submitData)
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xs sm:max-w-md lg:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className={`p-4 sm:p-6 rounded-t-xl text-white ${
          formData.type === 'income' 
            ? 'bg-gradient-to-r from-green-600 to-emerald-600'
            : 'bg-gradient-to-r from-red-600 to-rose-600'
        }`}>
          <h2 className="text-lg sm:text-xl font-bold">
            {formData.type === 'income' ? '💰' : '💸'} 
            {initialData ? 'Editar' : 'Agregar'} {formData.type === 'income' ? 'Ingreso' : 'Gasto'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <label className="flex items-center justify-center sm:justify-start p-2 sm:p-0 border sm:border-0 rounded-lg sm:rounded-none border-green-200 sm:border-transparent bg-green-50 sm:bg-transparent">
                <input
                  type="radio"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="mr-2 text-green-600"
                />
                <span className="text-green-600 text-sm sm:text-base font-medium sm:font-normal">💰 Ingreso</span>
              </label>
              <label className="flex items-center justify-center sm:justify-start p-2 sm:p-0 border sm:border-0 rounded-lg sm:rounded-none border-red-200 sm:border-transparent bg-red-50 sm:bg-transparent">
                <input
                  type="radio"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="mr-2 text-red-600"
                />
                <span className="text-red-600 text-sm sm:text-base font-medium sm:font-normal">💸 Gasto</span>
              </label>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={formData.type === 'income' ? 'Ej: Salario, Freelance...' : 'Ej: Pago del alquiler, Compras...'}
            />
            {errors.description && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Categoría (solo para gastos) */}
          {formData.type === 'expense' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => handleInputChange('category_id', e.target.value)}
                className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.category_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.category_id}</p>}
            </div>
          )}

          {/* Monto estimado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto Estimado
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 text-sm sm:text-base">$</span>
              <input
                type="number"
                value={formData.estimated_amount}
                onChange={(e) => handleInputChange('estimated_amount', parseFloat(e.target.value) || 0)}
                className={`w-full pl-8 pr-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.estimated_amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            {errors.estimated_amount && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.estimated_amount}</p>}
          </div>

          {/* Fecha de vencimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Vencimiento (Opcional)
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => handleInputChange('due_date', e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Estado de pago */}
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={formData.is_paid}
              onChange={(e) => handleInputChange('is_paid', e.target.checked)}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm sm:text-base text-gray-700 font-medium">
              {formData.type === 'income' ? 'Recibido' : 'Pagado'}
            </label>
          </div>

          {/* Campo de Notas - NUEVO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📝 Notas (Opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Agrega notas adicionales sobre este ítem..."
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.notes.length}/500 caracteres
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:flex-1 px-4 py-3 sm:py-2 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:flex-1 px-4 py-3 sm:py-2 text-sm sm:text-base text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium ${
                formData.type === 'income'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                  : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
              }`}
            >
              {loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Agregar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}