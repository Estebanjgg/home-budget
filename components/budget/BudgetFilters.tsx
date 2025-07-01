import { useState } from 'react'

interface BudgetFiltersProps {
  onFilterChange: (filters: BudgetFilters) => void
  totalBudgets: number
}

export interface BudgetFilters {
  sortBy: 'date_newest' | 'date_oldest' | 'month_asc' | 'month_desc' | 'name_asc' | 'name_desc' | 'amount_asc' | 'amount_desc'
  filterBy: 'all' | 'current_month' | 'specific_month' | 'current_year' | 'upcoming'
  specificMonth?: number
  specificYear?: number
  searchTerm: string
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const SORT_OPTIONS = [
  { value: 'date_newest', label: '📅 Más Recientes' },
  { value: 'date_oldest', label: '📅 Más Antiguos' },
  { value: 'month_asc', label: '📆 Por Mes (Ene-Dic)' },
  { value: 'month_desc', label: '📆 Por Mes (Dic-Ene)' },
  { value: 'name_asc', label: '🔤 Por Nombre (A-Z)' },
  { value: 'name_desc', label: '🔤 Por Nombre (Z-A)' },
  { value: 'amount_asc', label: '💰 Por Monto (Menor)' },
  { value: 'amount_desc', label: '💰 Por Monto (Mayor)' }
]

const FILTER_OPTIONS = [
  { value: 'all', label: '📋 Todos los Presupuestos' },
  { value: 'current_month', label: '📅 Mes Actual' },
  { value: 'current_year', label: '🗓️ Año Actual' },
  { value: 'upcoming', label: '⏭️ Próximos Meses' },
  { value: 'specific_month', label: '🎯 Mes Específico' }
]

export function BudgetFilters({ onFilterChange, totalBudgets }: BudgetFiltersProps) {
  const [filters, setFilters] = useState<BudgetFilters>({
    sortBy: 'date_newest',
    filterBy: 'all',
    searchTerm: ''
  })
  
  const [showAdvanced, setShowAdvanced] = useState(false)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  const handleFilterChange = (newFilters: Partial<BudgetFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Búsqueda */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Buscar presupuestos..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange({ searchTerm: e.target.value })}
              className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {filters.searchTerm && (
              <button
                onClick={() => handleFilterChange({ searchTerm: '' })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Ordenar por */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange({ sortBy: e.target.value as BudgetFilters['sortBy'] })}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <optgroup label="Ordenar por:">
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          </select>

          {/* Filtrar por */}
          <select
            value={filters.filterBy}
            onChange={(e) => handleFilterChange({ filterBy: e.target.value as BudgetFilters['filterBy'] })}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <optgroup label="Mostrar:">
              {FILTER_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          </select>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium"
          >
            {showAdvanced ? '🔼 Menos' : '🔽 Más Opciones'}
          </button>
        </div>
      </div>

      {/* Opciones Avanzadas */}
      {showAdvanced && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🎛️ Filtros Avanzados</h3>
          
          {filters.filterBy === 'specific_month' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mes:</label>
                <select
                  value={filters.specificMonth || ''}
                  onChange={(e) => handleFilterChange({ specificMonth: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar mes...</option>
                  {MONTHS.map((month, index) => (
                    <option key={index} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Año:</label>
                <select
                  value={filters.specificYear || ''}
                  onChange={(e) => handleFilterChange({ specificYear: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar año...</option>
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Acciones rápidas */}
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">⚡ Acciones Rápidas:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange({ filterBy: 'current_month', sortBy: 'date_newest' })}
                className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-medium transition-colors"
              >
                📅 Este Mes
              </button>
              <button
                onClick={() => handleFilterChange({ filterBy: 'upcoming', sortBy: 'month_asc' })}
                className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-sm font-medium transition-colors"
              >
                ⏭️ Próximos
              </button>
              <button
                onClick={() => handleFilterChange({ sortBy: 'amount_desc', filterBy: 'all' })}
                className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-sm font-medium transition-colors"
              >
                💰 Mayor Monto
              </button>
              <button
                onClick={() => handleFilterChange({ sortBy: 'date_newest', filterBy: 'all', searchTerm: '' })}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors"
              >
                🔄 Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contador de resultados */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          📊 Mostrando <span className="font-semibold">{totalBudgets}</span> presupuesto{totalBudgets !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}