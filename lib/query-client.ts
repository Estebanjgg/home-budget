import { QueryClient } from '@tanstack/react-query';

// Configuración del cliente de React Query con optimizaciones
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 5 minutos por defecto
      staleTime: 5 * 60 * 1000,
      // Mantener datos en cache por 10 minutos
      gcTime: 10 * 60 * 1000,
      // Reintentar 3 veces en caso de error
      retry: 3,
      // Reintento con backoff exponencial
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch cuando la ventana vuelve a tener foco
      refetchOnWindowFocus: false,
      // Refetch cuando se reconecta a internet
      refetchOnReconnect: true,
    },
    mutations: {
      // Reintentar mutaciones fallidas
      retry: 1,
    },
  },
});

// Configuración específica para diferentes tipos de datos
export const queryKeys = {
  budgets: ['budgets'] as const,
  budgetItems: (budgetId?: string) => ['budgetItems', budgetId] as const,
  dashboardMetrics: ['dashboardMetrics'] as const,
  groceryMetrics: ['groceryMetrics'] as const,
  educationalContent: ['educationalContent'] as const,
  categories: ['categories'] as const,
  user: ['user'] as const,
} as const;

// Configuraciones específicas por tipo de query
export const queryConfigs = {
  // Datos que cambian frecuentemente
  realTime: {
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 2 * 60 * 1000, // 2 minutos
  },
  // Datos que cambian ocasionalmente
  moderate: {
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
  },
  // Datos que raramente cambian
  stable: {
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
  },
};