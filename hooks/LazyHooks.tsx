import React, {
  lazy,
  Suspense,
  ComponentType,
  LazyExoticComponent,
  ReactNode,
} from 'react'
import { Loader2 } from 'lucide-react'

// Spinner para mostrar mientras carga el hook
const HookLoadingSpinner: React.FC<{ message?: string }> = ({
  message = 'Cargando datos...',
}) => (
  <div className="flex items-center justify-center py-4">
    <div className="text-center">
      <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  </div>
)

/**
 * HOC genérico para lazy loading de un componente (hook provider) con Suspense.
 * @param factory - función que importa dinámicamente el módulo con export default = ComponentType<P>
 * @param fallback - nodo a mostrar mientras carga
 */
export function withLazyHook<P extends object>(
  factory: () => Promise<{ default: ComponentType<P> }>,
  fallback: ReactNode = <HookLoadingSpinner />
): ComponentType<P> {
  const LazyComponent = lazy(factory)
  return (props: P) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

/**
 * Generador de proveedores lazy para hooks.
 * Los componentes resultantes reciben:
 *   - children: función que recibe el resultado del hook
 *   - ...props: las props que acepta el hook original
 */
export function createLazyHookProvider<Props extends object, Result>(
  hookImport: () => Promise<any>,
  hookName: string
): LazyExoticComponent<
  ComponentType<{ children: (result: Result) => ReactNode } & Props>
> {
  type ProviderProps = { children: (result: Result) => ReactNode } & Props

  return lazy<ComponentType<ProviderProps>>(() =>
    hookImport().then((module: any) => ({
      default: ({ children, ...props }: ProviderProps) => {
        // Forzamos props como Props para evitar error de omisión de children
        const hookResult: Result = module[hookName](props as Props)
        return children(hookResult)
      },
    }))
  )
}

// ————————————————————————————————————————
// Proveedores configurados
// ————————————————————————————————————————

export const LazyBudgetsProvider = createLazyHookProvider<{}, any>(
  () => import('./useBudgets'),
  'useBudgets'
)

export const LazyBudgetItemsProvider = createLazyHookProvider<{}, any>(
  () => import('./useBudgetItems'),
  'useBudgetItems'
)

export const LazyEducationalContentProvider = createLazyHookProvider<{}, any>(
  () => import('./useEducationalContent'),
  'useEducationalContent'
)

export const LazyGroceryStoresProvider = createLazyHookProvider<{}, any>(
  () => import('./useGroceryStores'),
  'useGroceryStores'
)

export const LazyFinancialAIProvider = createLazyHookProvider<{}, any>(
  () => import('./useFinancialAI'),
  'useFinancialAI'
)

export const LazyProductSuggestionsProvider = createLazyHookProvider<{}, any>(
  () => import('./useProductSuggestions'),
  'useProductSuggestions'
)

// ————————————————————————————————————————
// HOCs con Suspense y spinner personalizado
// ————————————————————————————————————————

interface FinancialAIProviderProps {
  children: (result: any) => ReactNode
}

export const FinancialAIWithSuspense = withLazyHook<FinancialAIProviderProps>(
  () =>
    import('./useFinancialAI').then((module: any) => ({
      default: ({ children, ...props }: FinancialAIProviderProps) => {
        const result = module.useFinancialAI(props)
        return children(result)
      },
    })),
  <HookLoadingSpinner message="Analizando datos financieros..." />
)

interface ProductSuggestionsProviderProps {
  children: (result: any) => ReactNode
}

export const ProductSuggestionsWithSuspense = withLazyHook<ProductSuggestionsProviderProps>(
  () =>
    import('./useProductSuggestions').then((module: any) => ({
      default: ({ children, ...props }: ProductSuggestionsProviderProps) => {
        const result = module.useProductSuggestions(props)
        return children(result)
      },
    })),
  <HookLoadingSpinner message="Cargando sugerencias de productos..." />
)
