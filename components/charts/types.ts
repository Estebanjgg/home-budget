// Tipos y interfaces para los componentes de gráficos
export interface ChartData {
  month: string
  income: number
  expenses: number
  balance: number
  savings?: number
  category?: string
  isPrediction?: boolean
}

export interface CategoryData {
  name: string
  value: number
  color: string
  percentage?: number
}

export interface YearComparisonData {
  month: string
  [year: string]: string | number
}

export interface ChartColors {
  income: string
  expenses: string
  balance: string
  savings: string
  predicted: string
  primary: string
  secondary: string
  accent: string
}

export interface TooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
  formatCurrency: (amount: number) => string
}

export type ChartType = 'overview' | 'trends' | 'predictions' | 'breakdown' | 'comparison'

export interface ChartConfig {
  type: ChartType
  title: string
  description: string
  icon: string
  height: number
  margin: {
    top: number
    right: number
    left: number
    bottom: number
  }
  animationDuration: number
}

// Props interfaces for chart components
export interface OverviewChartProps {
  data: ChartData[]
  showPredictions: boolean
  formatCurrency: (amount: number) => string
}

export interface TrendsChartProps {
  data: ChartData[]
  formatCurrency: (amount: number) => string
}

export interface PredictionsChartProps {
  data: ChartData[]
  formatCurrency: (amount: number) => string
}

export interface BreakdownChartProps {
  data: CategoryData[]
  formatCurrency: (amount: number) => string
}

export interface ComparisonChartProps {
  data: YearComparisonData[]
  formatCurrency: (amount: number) => string
}

export interface AdvancedChartsProps {
  monthlyData: ChartData[]
  formatCurrency: (amount: number) => string
  className?: string
}

export interface InteractiveChartsProps {
  monthlyData: ChartData[]
  formatCurrency: (amount: number) => string
  className?: string
}