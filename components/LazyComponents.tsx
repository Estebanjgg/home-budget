'use client'

import React, { lazy, Suspense, ComponentType, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

// ————————————
// 1) Spinners y loaders personalizados
// ————————————

const LoadingSpinner: React.FC<{ message?: string }> = ({
  message = 'Cargando...',
}) => (
  <div className="flex items-center justify-center py-8">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  </div>
)

const DashboardSectionLoader: React.FC<{ title: string }> = ({ title }) => (
  <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
    <div className="animate-pulse">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
        <div className="h-6 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <p className="text-center text-gray-500 text-sm mt-4">
      Cargando {title}...
    </p>
  </div>
)

const ChartLoader: React.FC = () => (
  <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-500">Generando gráficos...</p>
        </div>
      </div>
    </div>
  </div>
)

// ————————————
// 2) HOC genérico para Suspense + lazy
// ————————————

function withLazyLoading<T extends object>(
  LazyComponent: ComponentType<T>,
  fallback: ReactNode = <LoadingSpinner />
) {
  return (props: T) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

// ————————————
// 3) Componentes lazy del dashboard
// ————————————

export const LazyAdvancedCharts = withLazyLoading(
  lazy(() =>
    import('./dashboard/AdvancedCharts').then(module => ({
      default: module.AdvancedCharts,
    }))
  ),
  <ChartLoader />
)

export const LazyFinancialHealthIndicators = withLazyLoading(
  lazy(() =>
    import('./dashboard/FinancialHealthIndicators').then(module => ({
      // Aquí apuntamos al named export real:
      default: module.FinancialHealthIndicators,
    }))
  ),
  <DashboardSectionLoader title="Indicadores de Salud Financiera" />
)

export const LazyEducationCenter = withLazyLoading(
  lazy(() =>
    import('./dashboard/EducationCenter').then(module => ({
      default: module.EducationCenter,
    }))
  ),
  <DashboardSectionLoader title="Centro Educativo" />
)

export const LazySmartAlerts = withLazyLoading(
  lazy(() =>
    import('./dashboard/SmartAlerts').then(module => ({
      default: module.SmartAlerts,
    }))
  ),
  <DashboardSectionLoader title="Alertas Inteligentes" />
)

export const LazyTrendsSection = withLazyLoading(
  lazy(() =>
    import('./trends/TrendsSection').then(module => ({
      default: module.TrendsSection,
    }))
  ),
  <DashboardSectionLoader title="Análisis de Tendencias" />
)

export const LazyFinancialAssistant = withLazyLoading(
  lazy(() =>
    import('./ai/FinancialAssistant').then(module => ({
      default: module.FinancialAssistant,
    }))
  ),
  <DashboardSectionLoader title="Asistente Financiero IA" />
)

// ————————————
// 4) Componentes lazy de presupuesto
// ————————————

export const LazyBudgetManager = withLazyLoading(
  lazy(() =>
    import('./budget/BudgetManager').then(module => ({
      default: module.BudgetManager,
    }))
  ),
  <LoadingSpinner message="Cargando gestor de presupuestos..." />
)

export const LazyBudgetDashboard = withLazyLoading(
  lazy(() =>
    import('./budget/BudgetDashboard').then(module => ({
      default: module.BudgetDashboard,
    }))
  ),
  <LoadingSpinner message="Cargando dashboard de presupuestos..." />
)

// ————————————
// 5) Componentes lazy de educación
// ————————————

export const LazyEducationAdmin = withLazyLoading(
  lazy(() =>
    import('./education/EducationAdmin').then(module => ({
      default: module.EducationAdmin,
    }))
  ),
  <LoadingSpinner message="Cargando panel de administración..." />
)

export const LazyVideoPlayer = withLazyLoading(
  lazy(() =>
    import('./education/VideoPlayer').then(module => ({
      default: module.VideoPlayer,
    }))
  ),
  <LoadingSpinner message="Cargando reproductor de video..." />
)

export const LazyArticleViewer = withLazyLoading(
  lazy(() =>
    import('./education/ArticleViewer').then(module => ({
      default: module.ArticleViewer,
    }))
  ),
  <LoadingSpinner message="Cargando artículo..." />
)

export const LazyFeaturedVideos = withLazyLoading(
  lazy(() =>
    import('./education/FeaturedVideos').then(module => ({
      default: module.FeaturedVideos,
    }))
  ),
  <DashboardSectionLoader title="Videos Destacados" />
)

// ————————————
// 6) Componente de supermercado y usuario
// ————————————

export const LazyGroceryManager = withLazyLoading(
  lazy(() => import('./grocery/GroceryManager')),
  <LoadingSpinner message="Cargando gestor de supermercado..." />
)

export const LazyUserProfile = withLazyLoading(
  lazy(() => import('./user/UserProfile')),
  <LoadingSpinner message="Cargando perfil de usuario..." />
)

// ————————————
// 7) Exportar loaders por si los quieres usar directo
// ————————————

export { LoadingSpinner, DashboardSectionLoader, ChartLoader }
