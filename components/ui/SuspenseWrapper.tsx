'use client';

import { Suspense, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

// Componente de loading por defecto
const DefaultLoadingFallback = () => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
      <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
    <div className="text-center">
      <p className="text-gray-600 font-medium">Cargando componente...</p>
      <p className="text-sm text-gray-400 mt-1">Optimizando experiencia</p>
    </div>
  </div>
);

// Componente de error por defecto
const DefaultErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-red-50 border border-red-200 rounded-lg">
    <div className="text-red-600">
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    </div>
    <div className="text-center">
      <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar componente</h3>
      <p className="text-red-600 text-sm mb-4">Ha ocurrido un error inesperado</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Intentar de nuevo
      </button>
    </div>
    {process.env.NODE_ENV === 'development' && (
      <details className="mt-4 w-full">
        <summary className="cursor-pointer text-sm text-red-700 font-medium">Detalles del error (desarrollo)</summary>
        <pre className="mt-2 p-3 bg-red-100 text-red-800 text-xs rounded overflow-auto max-h-40">
          {error.message}\n{error.stack}
        </pre>
      </details>
    )}
  </div>
);

// Componente principal SuspenseWrapper
export default function SuspenseWrapper({
  children,
  fallback,
  errorFallback,
  onError,
}: SuspenseWrapperProps) {
  const handleError = (error: Error, errorInfo: { componentStack: string }) => {
    // Log del error para debugging
    console.error('SuspenseWrapper Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    
    // Callback personalizado si se proporciona
    onError?.(error, errorInfo);
  };

  return (
    <ErrorBoundary
      FallbackComponent={errorFallback ? () => <>{errorFallback}</> : DefaultErrorFallback}
      onError={handleError}
      onReset={() => {
        // Limpiar cualquier estado de error
        window.location.reload();
      }}
    >
      <Suspense fallback={fallback || <DefaultLoadingFallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// Variantes especializadas del SuspenseWrapper

// Para componentes de dashboard
export function DashboardSuspense({ children }: { children: ReactNode }) {
  return (
    <SuspenseWrapper
      fallback={
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      }
    >
      {children}
    </SuspenseWrapper>
  );
}

// Para componentes de gráficos
export function ChartSuspense({ children }: { children: ReactNode }) {
  return (
    <SuspenseWrapper
      fallback={
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded flex items-center justify-center">
              <div className="text-gray-400">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </SuspenseWrapper>
  );
}

// Para componentes de formularios
export function FormSuspense({ children }: { children: ReactNode }) {
  return (
    <SuspenseWrapper
      fallback={
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
            <div className="h-10 bg-blue-200 rounded w-1/3"></div>
          </div>
        </div>
      }
    >
      {children}
    </SuspenseWrapper>
  );
}