'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Componente de loading personalizado
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Cargando...</span>
  </div>
);

// Lazy loading de componentes del dashboard
export const LazyMetricsOverview = dynamic(
  () => import('@/components/dashboard/MetricsOverview').then(mod => ({ default: mod.MetricsOverview })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false, // Deshabilitar SSR para componentes pesados
  }
);

export const LazyFinancialHealthIndicators = dynamic(
  () => import('@/components/dashboard/FinancialHealthIndicators').then(mod => ({ default: mod.FinancialHealthIndicators })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

export const LazySmartAlerts = dynamic(
  () => import('@/components/dashboard/SmartAlerts').then(mod => ({ default: mod.SmartAlerts })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

export const LazyQuickActions = dynamic(
  () => import('@/components/dashboard/QuickActions').then(mod => ({ default: mod.QuickActions })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

export const LazyAdvancedCharts = dynamic(
  () => import('@/components/dashboard/AdvancedCharts').then(mod => ({ default: mod.AdvancedCharts })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

export const LazyTrendsSection = dynamic(
  () => import('@/components/trends/TrendsSection').then(mod => ({ default: mod.TrendsSection })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

export const LazyFinancialAssistant = dynamic(
  () => import('@/components/ai/FinancialAssistant').then(mod => ({ default: mod.FinancialAssistant })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

export const LazyEducationCenter = dynamic(
  () => import('@/components/dashboard/EducationCenter').then(mod => ({ default: mod.EducationCenter })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

// Lazy loading para componentes de presupuesto
export const LazyBudgetManager = dynamic(
  () => import('@/components/budget/BudgetManager').then(mod => ({ default: mod.BudgetManager || mod.default })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

export const LazyGroceryManager = dynamic(
  () => import('@/components/grocery/GroceryManager').then(mod => ({ default: mod.GroceryManager || mod.default })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

// Lazy loading para componentes de educación
export const LazyVideoPlayer = dynamic(
  () => import('@/components/education/VideoPlayer').then(mod => ({ default: mod.VideoPlayer })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

export const LazyArticleViewer = dynamic(
  () => import('@/components/education/ArticleViewer').then(mod => ({ default: mod.ArticleViewer })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);