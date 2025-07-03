'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, queryConfigs } from '@/lib/query-client';
import { useBudgets } from './useBudgets';
import { useBudgetItems } from './useBudgetItems';
import { useEducationalContent } from './useEducationalContent';

// Hook optimizado para métricas del dashboard
export function useOptimizedDashboardMetrics(budgetId?: string | null) {
  const { budgets } = useBudgets();
  const { items: budgetItems } = useBudgetItems(budgetId || null);
  
  return useQuery({
    queryKey: queryKeys.dashboardMetrics,
    queryFn: async () => {
      // Calcular métricas del dashboard
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const currentBudgetItems = budgetItems.filter((item: any) => {
        const itemDate = new Date(item.created_at);
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
      });
      
      const totalIncome = currentBudgetItems
        .filter((item: any) => item.type === 'income')
        .reduce((sum: number, item: any) => sum + item.amount, 0);
      
      const totalExpenses = currentBudgetItems
        .filter((item: any) => item.type === 'expense')
        .reduce((sum: number, item: any) => sum + item.amount, 0);
      
      const balance = totalIncome - totalExpenses;
      
      // Calcular datos mensuales para gráficos
      const monthlyData = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - i, 1);
        const monthItems = budgetItems.filter((item: any) => {
          const itemDate = new Date(item.created_at);
          return itemDate.getMonth() === date.getMonth() && 
                 itemDate.getFullYear() === date.getFullYear();
        });
        
        const monthIncome = monthItems
          .filter((item: any) => item.type === 'income')
          .reduce((sum: number, item: any) => sum + item.amount, 0);
        
        const monthExpenses = monthItems
          .filter((item: any) => item.type === 'expense')
          .reduce((sum: number, item: any) => sum + item.amount, 0);
        
        monthlyData.push({
          month: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
          income: monthIncome,
          expenses: monthExpenses,
          balance: monthIncome - monthExpenses,
        });
      }
      
      const totalSavings = currentBudgetItems
        .filter((item: any) => item.type === 'savings')
        .reduce((sum: number, item: any) => sum + item.amount, 0);
      
      const totalTithe = currentBudgetItems
        .filter((item: any) => item.category?.name?.toLowerCase().includes('diezmo') || item.category?.name?.toLowerCase().includes('tithe'))
        .reduce((sum: number, item: any) => sum + item.amount, 0);
      
      const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
      const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
      
      return {
        totalIncome,
        totalExpenses,
        totalSavings,
        totalTithe,
        budgetCount: budgets?.length || 0,
        averageMonthlyIncome: totalIncome,
        averageMonthlyExpenses: totalExpenses,
        savingsRate,
        expenseRatio,
        monthlyData,
        balance,
        currentBudgetItems,
      };
    },
    enabled: !!budgets && !!budgetItems,
    ...queryConfigs.realTime, // Datos que cambian frecuentemente
  });
}

// Hook optimizado para métricas de supermercado
export function useOptimizedGroceryMetrics(budgetId?: string | null) {
  const { items: budgetItems } = useBudgetItems(budgetId || null);
  
  return useQuery({
    queryKey: queryKeys.groceryMetrics,
    queryFn: async () => {
      const groceryItems = budgetItems.filter((item: any) => 
        item.category?.name?.toLowerCase().includes('supermercado') ||
        item.category?.name?.toLowerCase().includes('comida') ||
        item.category?.name?.toLowerCase().includes('alimentación')
      );
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyGroceryExpenses = groceryItems
        .filter((item: any) => {
          const itemDate = new Date(item.created_at);
          return itemDate.getMonth() === currentMonth && 
                 itemDate.getFullYear() === currentYear;
        })
        .reduce((sum: number, item: any) => sum + item.amount, 0);
      
      const averageGroceryExpenses = groceryItems.length > 0 
        ? groceryItems.reduce((sum: number, item: any) => sum + item.amount, 0) / 12
        : 0;
      
      const totalSpent = groceryItems.reduce((sum: number, item: any) => sum + item.amount, 0);
      const budgetTotal = totalSpent * 1.2; // Estimación de presupuesto recomendado
      const averageMonthly = totalSpent / 12;
      
      // Calcular porcentaje de ingresos (necesitamos obtener ingresos totales)
      const allIncomeItems = budgetItems.filter((item: any) => item.type === 'income');
      const totalIncome = allIncomeItems.reduce((sum: number, item: any) => sum + item.amount, 0);
      const percentageOfIncome = totalIncome > 0 ? (totalSpent / totalIncome) * 100 : 0;
      
      // Calcular eficiencia (ahorro vs presupuesto recomendado)
      const efficiency = budgetTotal > 0 ? ((budgetTotal - totalSpent) / budgetTotal) * 100 : 0;
      
      return {
        totalSpent,
        budgetTotal,
        averageMonthly,
        percentageOfIncome,
        efficiency,
        monthlyGroceryExpenses,
        averageGroceryExpenses,
        totalGroceryItems: groceryItems.length,
        groceryTrend: monthlyGroceryExpenses > averageGroceryExpenses ? 'up' : 'down',
      };
    },
    enabled: !!budgetItems,
    ...queryConfigs.moderate, // Datos que cambian ocasionalmente
  });
}

// Hook optimizado para contenido educativo
export function useOptimizedEducationalContent() {
  const { content: educationalContent, featuredContent } = useEducationalContent();
  
  return useQuery({
    queryKey: queryKeys.educationalContent,
    queryFn: async () => {
      // Procesar y optimizar contenido educativo
      const processedContent = educationalContent.map((content: any) => ({
        ...content,
        // Agregar metadatos útiles
        readingTime: Math.ceil(content.content.length / 200), // Estimación de tiempo de lectura
        difficulty: content.tags?.includes('básico') ? 'beginner' : 
                   content.tags?.includes('avanzado') ? 'advanced' : 'intermediate',
      }));
      
      return {
        educationalContent: processedContent,
        featuredContent,
        totalArticles: educationalContent.length,
        categories: [...new Set(educationalContent.flatMap((c: any) => c.tags || []))],
      };
    },
    enabled: !!educationalContent,
    ...queryConfigs.stable, // Datos que raramente cambian
  });
}

// Hook para invalidar cachés relacionados
export function useInvalidateQueries() {
  const queryClient = useQueryClient();
  
  return {
    invalidateDashboard: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardMetrics });
      queryClient.invalidateQueries({ queryKey: queryKeys.groceryMetrics });
    },
    invalidateBudgets: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetItems() });
    },
    invalidateAll: () => {
      queryClient.invalidateQueries();
    },
  };
}