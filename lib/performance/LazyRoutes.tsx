import { lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// Loading component for route-level lazy loading
const RouteLoadingSpinner = ({ message = 'Cargando página...' }: { message?: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <div className="text-center">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{message}</h2>
      <p className="text-gray-600">Por favor espera un momento...</p>
    </div>
  </div>
)

// Higher-order component for route-level lazy loading
export function withRouteLazyLoading(
  routeFactory: () => Promise<{ default: React.ComponentType<any> }>,
  loadingMessage?: string
) {
  const LazyRoute = lazy(routeFactory)
  
  return function WrappedRoute(props: any) {
    return (
      <Suspense fallback={<RouteLoadingSpinner message={loadingMessage} />}>
        <LazyRoute {...props} />
      </Suspense>
    )
  }
}

// Lazy-loaded route components
export const LazyDashboardPage = withRouteLazyLoading(
  () => import('../../components/Dashboard').then(module => ({ default: module.Dashboard })),
  'Cargando Dashboard...'
)

export const LazyBudgetPage = withRouteLazyLoading(
  () => import('../../components/budget/BudgetManager').then(module => ({ default: module.BudgetManager })),
  'Cargando Gestor de Presupuestos...'
)

// --- CORRECCIÓN AQUÍ ---
export const LazyGroceryPage = withRouteLazyLoading(
  () => import('../../components/grocery/GroceryManager').then(module => ({ default: module.default })),
  'Cargando Gestor de Compras...'
)

export const LazyEducationPage = withRouteLazyLoading(
  () => import('../../components/education/EducationAdmin').then(module => ({ default: module.EducationAdmin })),
  'Cargando Centro Educativo...'
)

// --- CORRECCIÓN AQUÍ ---
export const LazyProfilePage = withRouteLazyLoading(
  () => import('../../components/user/UserProfile').then(module => ({ default: module.default })),
  'Cargando Perfil de Usuario...'
)

// Preload functions for better UX
export const preloadRoutes = {
  dashboard: () => import('../../components/Dashboard').then(module => ({ default: module.Dashboard })),
  budget: () => import('../../components/budget/BudgetManager').then(module => ({ default: module.BudgetManager })),
  // --- CORRECCIÓN AQUÍ ---
  grocery: () => import('../../components/grocery/GroceryManager').then(module => ({ default: module.default })),
  education: () => import('../../components/education/EducationAdmin').then(module => ({ default: module.EducationAdmin })),
  // --- CORRECCIÓN AQUÍ ---
  profile: () => import('../../components/user/UserProfile').then(module => ({ default: module.default })),
}

// Utility function to preload a route
export function preloadRoute(routeName: keyof typeof preloadRoutes) {
  return preloadRoutes[routeName]()
}

// Preload multiple routes
export function preloadMultipleRoutes(routeNames: (keyof typeof preloadRoutes)[]) {
  return Promise.all(routeNames.map(preloadRoute))
}

// Hook for preloading routes on user interaction
export function useRoutePreloader() {
  const preloadOnHover = (routeName: keyof typeof preloadRoutes) => {
    return {
      onMouseEnter: () => preloadRoute(routeName),
      onFocus: () => preloadRoute(routeName),
    }
  }

  const preloadOnClick = (routeName: keyof typeof preloadRoutes) => {
    return {
      onClick: () => preloadRoute(routeName),
    }
  }

  return {
    preloadOnHover,
    preloadOnClick,
    preloadRoute,
    preloadMultipleRoutes,
  }
}