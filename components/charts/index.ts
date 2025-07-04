// Componente principal
export { default as InteractiveCharts } from './InteractiveCharts'
export { InteractiveCharts as InteractiveChartsNamed } from './InteractiveCharts'

// Componentes individuales de gráficos
export { OverviewChart } from './components/OverviewChart'
export { TrendsChart } from './components/TrendsChart'
export { PredictionsChart } from './components/PredictionsChart'
export { BreakdownChart } from './components/BreakdownChart'
export { ComparisonChart } from './components/ComparisonChart'

// Componentes de utilidad
export { CustomTooltip, CategoryTooltip } from './components/CustomTooltip'

// Hooks personalizados
export { useChartData } from './hooks/useChartData'

// Tipos y constantes
export type {
  ChartData,
  CategoryData,
  YearComparisonData,
  ChartColors,
  TooltipProps,
  ChartType,
  ChartConfig,
  OverviewChartProps,
  TrendsChartProps,
  PredictionsChartProps,
  BreakdownChartProps,
  ComparisonChartProps
} from './types'

export {
  CHART_COLORS,
  CATEGORY_COLORS,
  CHART_CONFIGS,
  DEFAULT_CHART_CONFIG,
  TOOLTIP_CONFIG,
  AXIS_CONFIG
} from './constants'

// Examples
export { DashboardExample } from './examples/DashboardExample'
export { IntegrationExample } from './examples/IntegrationExample'
export { DashboardIntegration } from './examples/DashboardIntegration'

// Re-exportar Recharts para conveniencia
export {
  LineChart,
  AreaChart,
  BarChart,
  PieChart,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  Area,
  Bar,
  Pie,
  Cell
} from 'recharts'