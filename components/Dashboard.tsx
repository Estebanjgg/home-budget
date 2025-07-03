import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useBudgets } from '@/hooks/useBudgets';
import { useBudgetItems } from '@/hooks/useBudgetItems';
import { useEducationalContent } from '@/hooks/useEducationalContent';
import { useOptimizedDashboardMetrics, useOptimizedGroceryMetrics } from '@/hooks/useOptimizedQueries';
import { getBudgetItems } from '@/lib/budget-queries';
import { Toaster } from 'react-hot-toast';
import PWAInstaller from './PWAInstaller';

// Lazy loading components
import {
  LazyMetricsOverview,
  LazyFinancialHealthIndicators,
  LazySmartAlerts,
  LazyQuickActions,
  LazyAdvancedCharts,
  LazyTrendsSection,
  LazyFinancialAssistant,
  LazyEducationCenter,
  LazyVideoPlayer,
  LazyArticleViewer,
} from '@/components/lazy/LazyComponents';

// UI Components
import SuspenseWrapper, { DashboardSuspense, ChartSuspense } from '@/components/ui/SuspenseWrapper';
import { EducationAdmin } from './education/EducationAdmin';
import { FeaturedVideos } from './education/FeaturedVideos';

// Types
import type { BudgetItem, ExpenseCategory, EducationalContent } from '@/lib/types';

// REFACTOR: Centralize the sections array. It will be used to render components dynamically.
const sectionsConfig = [
  { id: 'metrics', title: '📊 Métricas', Component: LazyMetricsOverview },
  { id: 'health', title: '💚 Salud Financiera', Component: LazyFinancialHealthIndicators },
  { id: 'alerts', title: '🚨 Alertas', Component: LazySmartAlerts },
  { id: 'actions', title: '⚡ Acciones Rápidas', Component: LazyQuickActions },
  { id: 'charts', title: '📈 Gráficos', Component: LazyAdvancedCharts },
  { id: 'trends', title: '📊 Tendencias', Component: LazyTrendsSection },
  { id: 'assistant', title: '🤖 Asistente IA', Component: LazyFinancialAssistant },
  { id: 'education', title: '📚 Educación', Component: LazyEducationCenter },
  // Summary is a special case, handled separately.
];

const getCategoryLimitPercentage = (categoryName: string): number => {
    const category = categoryName.toLowerCase();
    if (category.includes('vivienda') || category.includes('alquiler')) return 0.30;
    if (category.includes('alimentación') || category.includes('supermercado')) return 0.15;
    if (category.includes('transporte') || category.includes('gasolina')) return 0.15;
    if (category.includes('entretenimiento') || category.includes('ocio')) return 0.05;
    if (category.includes('salud') || category.includes('médico')) return 0.10;
    if (category.includes('educación') || category.includes('estudio')) return 0.10;
    return 0.10; // Default
};

export function Dashboard() {
  const { budgets, loading, error, calculateSummary } = useBudgets();
  const { content: educationalContent, featuredContent, isAdmin, loading: educationLoading } = useEducationalContent();
  
  const currentDate = new Date();
  const currentBudget = budgets.find(b => b.month === currentDate.getMonth() + 1 && b.year === currentDate.getFullYear());
  
  const { data: dashboardMetrics, isLoading: dashboardLoading } = useOptimizedDashboardMetrics(currentBudget?.id || null);
  const { data: groceryMetrics, isLoading: groceryLoading } = useOptimizedGroceryMetrics(currentBudget?.id || null);
  const { items: currentBudgetItems, categories } = useBudgetItems(currentBudget?.id || null);
  
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<EducationalContent | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<EducationalContent | null>(null);
  const [budgetLimits, setBudgetLimits] = useState<{ [category: string]: number }>({});
  const [categoryExpenses, setCategoryExpenses] = useState<{ [category: string]: number }>({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  
  // Effect for calculating category limits and expenses
  useEffect(() => {
    const calculateCategoryLimits = async () => {
      if (!currentBudget) return;
      
      try {
        const items = await getBudgetItems(currentBudget.id);
        const summary = await calculateSummary(currentBudget.id);
        
        const limits: { [category: string]: number } = {};
        const expenses: { [category: string]: number } = {};
        
        if (summary) {
          categories.forEach(category => {
            const percentage = getCategoryLimitPercentage(category.name);
            limits[category.name] = summary.totalIncome * percentage;
            
            const categoryItems = items.filter(item => item.category?.name === category.name);
            expenses[category.name] = categoryItems.reduce((sum, item) => sum + item.estimated_amount, 0);
          });
        }
        
        setBudgetLimits(limits);
        setCategoryExpenses(expenses);
      } catch (error) {
        console.error('Error calculating category limits:', error);
      }
    };
    
    calculateCategoryLimits();
  }, [budgets, calculateSummary, currentBudget, categories]);

  // Swipe gesture logic
  const swipeRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const element = swipeRef.current;
    if (!element) return;
    
    let startX = 0;
    let startY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0 && currentSectionIndex > 0) {
          setCurrentSectionIndex(prev => prev - 1);
        } else if (deltaX < 0 && currentSectionIndex < sectionsConfig.length) {
          setCurrentSectionIndex(prev => prev + 1);
        }
      }
    };
    
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentSectionIndex]);

  const formatCurrency = useCallback((amount: number) => {
    return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  }, []);

  const handleContentClick = useCallback((contentItem: EducationalContent) => {
    if (contentItem.type === 'video' && contentItem.url) {
      setSelectedVideo(contentItem);
    } else if (contentItem.type === 'article') {
      setSelectedArticle(contentItem);
    } else if (contentItem.url) {
      window.open(contentItem.url, '_blank');
    }
  }, []);
  
  // Loading state
  if (loading || educationLoading || dashboardLoading || groceryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 font-medium">Cargando tu dashboard financiero...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
        <div className="text-center space-y-4 p-8">
          <div className="text-6xl">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600">Error al cargar datos</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Welcome screen for new users (budgets.length === 0)
  if (budgets.length === 0) {
    return (
      <div className="space-y-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen p-6">
        <PWAInstaller />
        
        <div className="text-center bg-white rounded-3xl shadow-xl p-12 border border-gray-100">
          <div className="text-8xl mb-6">🎯</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">¡Bienvenido a tu Dashboard Financiero!</h1>
          <p className="text-xl text-gray-600 mb-8">Comienza creando tu primer presupuesto para ver métricas detalladas</p>
          
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-3">Métricas Inteligentes</h3>
              <p className="text-blue-100">Visualiza tus gastos, ingresos y tendencias con gráficos interactivos</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-8 text-white">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold mb-3">Asistente IA</h3>
              <p className="text-green-100">Recibe consejos personalizados y análisis de tus hábitos financieros</p>
            </div>
          </div>
        </div>
        
        {featuredContent && featuredContent.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">📚 Contenido Educativo Destacado</h2>
            <FeaturedVideos 
              featuredContent={featuredContent} 
            />
          </div>
        )}
      </div>
    );
  }

  // REFACTOR: Combine all props for components into a single object for cleaner passing.
  const defaultDashboardMetrics = {
    totalIncome: 3000,
    totalExpenses: 2400,
    totalSavings: 600,
    totalTithe: 265.79,
    budgetCount: 1,
    averageMonthlyIncome: 3000,
    averageMonthlyExpenses: 2400,
    savingsRate: 20,
    expenseRatio: 80
  };
  
  const defaultGroceryMetrics = {
    totalSpent: 450,
    budgetTotal: 500,
    averageMonthly: 450,
    percentageOfIncome: 15,
    efficiency: 18
  };
  
  const finalDashboardMetrics = dashboardMetrics || defaultDashboardMetrics;
  const finalGroceryMetrics = groceryMetrics || defaultGroceryMetrics;
  
  // Generar datos mensuales simulados para AdvancedCharts
  const generateMonthlyData = () => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      income: finalDashboardMetrics.totalIncome + (Math.random() - 0.5) * 1000,
      expenses: finalDashboardMetrics.totalExpenses + (Math.random() - 0.5) * 800,
      balance: finalDashboardMetrics.totalIncome - finalDashboardMetrics.totalExpenses + (Math.random() - 0.5) * 500,
      savings: finalDashboardMetrics.totalSavings + (Math.random() - 0.5) * 300
    }));
  };

  const componentProps = {
    dashboardMetrics: finalDashboardMetrics,
    groceryMetrics: finalGroceryMetrics,
    monthlyIncome: finalDashboardMetrics.totalIncome,
    monthlyExpenses: finalDashboardMetrics.totalExpenses,
    monthlyData: generateMonthlyData(),
    budgetLimits,
    categoryExpenses,
    budgets,
    currentBudgetItems,
    categories,
    educationalContent,
    featuredContent,
    formatCurrency,
    handleContentClick,
    calculateSummary,
  };

  return (
    <div ref={swipeRef} className="space-y-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen p-6">
      <PWAInstaller />
      {isAdmin && showAdminPanel && <EducationAdmin onClose={() => setShowAdminPanel(false)} />}

      {/* Header */}
      <div className="text-center bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="text-6xl">💰</div>
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Dashboard Financiero</h1>
            <p className="text-gray-600 text-lg mt-2">
              {currentBudget ? 
                `Presupuesto de ${new Date(currentBudget.year, currentBudget.month - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}` : 
                'Sin presupuesto activo'
              }
            </p>
          </div>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => setShowAdminPanel(true)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            🔧 Panel de Administración
          </button>
        )}
      </div>

      {/* Mobile Navigation */}
      <div className="text-center md:hidden">
        <div className="flex justify-center space-x-2 mb-4">
          {sectionsConfig.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSectionIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSectionIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentSectionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentSectionIndex === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>
          
          <span className="text-sm text-gray-600 font-medium">
            {sectionsConfig[currentSectionIndex]?.title || 'Sección'}
          </span>
          
          <button
            onClick={() => setCurrentSectionIndex(prev => Math.min(sectionsConfig.length - 1, prev + 1))}
            disabled={currentSectionIndex === sectionsConfig.length - 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente →
          </button>
        </div>
      </div>

      {/* REFACTOR: Unified Content Area. One block of code for both mobile and desktop. */}
      <div className="space-y-8">
        {sectionsConfig.map((section, index) => {
          const { id, Component } = section;
          // Mobile: Render only the current section. Desktop: Render all.
          const isVisible = `md:block ${index === currentSectionIndex ? 'block' : 'hidden'}`;
        
          return (
            <div key={id} className={isVisible}>
              <DashboardSuspense>
                <Component {...componentProps} />
              </DashboardSuspense>
            </div>
          );
        })}
      </div>
    
      {/* FIX: Centralized Modal Rendering. This logic is now outside of any conditional returns. */}
      {selectedVideo && (
        <SuspenseWrapper>
          <LazyVideoPlayer
            url={selectedVideo.url!}
            title={selectedVideo.title}
            onClose={() => setSelectedVideo(null)}
          />
        </SuspenseWrapper>
      )}

      {selectedArticle && (
        <SuspenseWrapper>
          <LazyArticleViewer
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
          />
        </SuspenseWrapper>
      )}
    
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500'
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff'
            }
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff'
            }
          }
        }}
      />
    </div>
  );
}

