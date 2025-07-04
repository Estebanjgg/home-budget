import { ChartColors, ChartConfig, ChartType } from './types'

// Paleta de colores para los gráficos
export const CHART_COLORS: ChartColors = {
  income: '#10B981',     // Verde esmeralda
  expenses: '#EF4444',   // Rojo
  balance: '#3B82F6',    // Azul
  savings: '#8B5CF6',    // Púrpura
  predicted: '#F59E0B',  // Ámbar
  primary: '#1F2937',    // Gris oscuro
  secondary: '#6B7280',  // Gris medio
  accent: '#EC4899'      // Rosa
}

// Colores adicionales para gráficos de categorías
export const CATEGORY_COLORS = [
  '#3B82F6', // Azul
  '#10B981', // Verde
  '#F59E0B', // Ámbar
  '#EF4444', // Rojo
  '#8B5CF6', // Púrpura
  '#EC4899', // Rosa
  '#06B6D4', // Cian
  '#84CC16'  // Lima
]

// Configuración de los tipos de gráficos
export const CHART_CONFIGS: Record<ChartType, ChartConfig> = {
  overview: {
    type: 'overview',
    title: 'Vista General',
    description: 'Resumen completo de ingresos, gastos y balance',
    icon: '📊',
    height: 400,
    margin: { top: 20, right: 30, left: 20, bottom: 5 },
    animationDuration: 1000
  },
  trends: {
    type: 'trends',
    title: 'Tendencias',
    description: 'Análisis de tendencias financieras',
    icon: '📈',
    height: 350,
    margin: { top: 20, right: 30, left: 20, bottom: 5 },
    animationDuration: 800
  },
  predictions: {
    type: 'predictions',
    title: 'Predicciones',
    description: 'Proyecciones financieras futuras',
    icon: '🔮',
    height: 380,
    margin: { top: 20, right: 30, left: 20, bottom: 5 },
    animationDuration: 1200
  },
  breakdown: {
    type: 'breakdown',
    title: 'Desglose',
    description: 'Distribución de gastos por categorías',
    icon: '🥧',
    height: 400,
    margin: { top: 20, right: 30, left: 20, bottom: 5 },
    animationDuration: 1000
  },
  comparison: {
    type: 'comparison',
    title: 'Comparación',
    description: 'Comparación año tras año',
    icon: '📊',
    height: 350,
    margin: { top: 20, right: 30, left: 20, bottom: 5 },
    animationDuration: 900
  }
}

// Configuración por defecto para los gráficos
export const DEFAULT_CHART_CONFIG = {
  height: 400,
  margin: { top: 20, right: 30, left: 20, bottom: 5 },
  strokeWidth: 2,
  dotRadius: 4,
  animationDuration: 750
}

// Configuración de tooltips
export const TOOLTIP_CONFIG = {
  contentStyle: {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  },
  labelStyle: {
    color: '#374151',
    fontWeight: 600
  }
}

// Configuración de ejes
export const AXIS_CONFIG = {
  fontSize: 12,
  stroke: '#6B7280',
  tickFormatter: (value: number) => `$${(value / 1000).toFixed(0)}k`
}