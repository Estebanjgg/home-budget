import React from 'react'
import { TooltipProps } from '../types'

/**
 * Componente de tooltip personalizado para los gráficos
 */
export function CustomTooltip({ active, payload, label, formatCurrency }: TooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
      {/* Título del tooltip */}
      <p className="font-semibold text-gray-800 mb-3 text-sm">
        {label}
      </p>
      
      {/* Lista de valores */}
      <div className="space-y-2">
        {payload.map((entry: any, index: number) => {
          const isPredicted = entry.payload?.predicted
          
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* Indicador de color */}
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                
                {/* Nombre del dato */}
                <span className="text-sm text-gray-600">
                  {entry.name}
                </span>
                
                {/* Indicador de predicción */}
                {isPredicted && (
                  <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">
                    Predicción
                  </span>
                )}
              </div>
              
              {/* Valor formateado */}
              <span 
                className="font-medium text-sm"
                style={{ color: entry.color }}
              >
                {formatCurrency(entry.value)}
              </span>
            </div>
          )
        })}
      </div>
      
      {/* Información adicional si hay predicciones */}
      {payload.some(entry => entry.payload?.predicted) && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            💡 Basado en tendencias históricas
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Tooltip simplificado para gráficos de categorías
 */
export function CategoryTooltip({ active, payload, formatCurrency }: TooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const data = payload[0]?.payload
  if (!data) return null

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      <div className="flex items-center space-x-2 mb-2">
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: data.color }}
        />
        <span className="font-medium text-gray-800 text-sm">
          {data.name}
        </span>
      </div>
      
      <div className="space-y-1">
        <div className="text-lg font-bold text-gray-900">
          {formatCurrency(data.value)}
        </div>
        
        {data.percentage && (
          <div className="text-sm text-gray-500">
            {data.percentage.toFixed(1)}% del total
          </div>
        )}
      </div>
    </div>
  )
}