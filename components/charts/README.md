# 📊 Interactive Charts - Gráficos Interactivos

Un sistema completo de gráficos interactivos construido con **Recharts** para visualizar datos financieros de manera elegante y funcional.

## 🚀 Características Principales

- **5 tipos de gráficos especializados** para diferentes análisis
- **Predicciones inteligentes** basadas en tendencias históricas
- **Tooltips personalizados** con información detallada
- **Responsive design** que se adapta a cualquier pantalla
- **TypeScript completo** para máxima seguridad de tipos
- **Hooks personalizados** para lógica reutilizable
- **Arquitectura modular** fácil de mantener y extender
- **Integración Perfecta**: Compatible con datos existentes del dashboard
- **Insights Automáticos**: Análisis y recomendaciones basadas en los datos

## Beneficios de la Integración

### 🚀 Mejoras en la Experiencia de Usuario
- **Visualización Avanzada**: Reemplaza gráficos estáticos con interactividad completa
- **Predicciones Financieras**: Ayuda a los usuarios a planificar mejor su futuro financiero
- **Análisis Profundo**: Múltiples perspectivas de los mismos datos
- **Navegación Intuitiva**: Fácil cambio entre diferentes tipos de análisis

### 📊 Capacidades Analíticas
- **Tendencias Históricas**: Visualización clara de patrones financieros
- **Comparaciones Temporales**: Análisis año a año y mes a mes
- **Breakdown por Categorías**: Desglose detallado de gastos
- **Métricas Clave**: Ratios de ahorro, control de gastos, y más

### 🔧 Ventajas Técnicas
- **Reutilización de Datos**: Aprovecha la infraestructura existente
- **Mantenibilidad**: Código modular y bien documentado
- **Escalabilidad**: Fácil agregar nuevos tipos de gráficos
- **Performance**: Optimizado para grandes volúmenes de datos

## 📈 Tipos de Gráficos

### 1. Overview Chart (Resumen General)
- Combina área y línea para mostrar ingresos, gastos y balance
- Incluye indicadores de predicción
- Ideal para vista general rápida

### 2. Trends Chart (Tendencias)
- Muestra la evolución temporal de métricas financieras
- Calcula porcentajes de cambio
- Perfecto para análisis de tendencias

### 3. Predictions Chart (Predicciones)
- Proyecciones basadas en datos históricos
- Algoritmo de tendencia lineal
- Útil para planificación financiera

### 4. Breakdown Chart (Desglose)
- Gráfico de pastel para distribución de gastos
- Insights automáticos sobre patrones de gasto
- Excelente para análisis de categorías

### 5. Comparison Chart (Comparación)
- Comparativa año a año
- Análisis de mejores y peores meses
- Ideal para evaluación de progreso

## 🛠️ Instalación y Uso

### Importación Básica

```tsx
import { InteractiveCharts } from '@/components/charts'

// Datos de ejemplo
const financialData = [
  {
    month: 'Enero',
    income: 5000000,
    expenses: 3500000,
    balance: 1500000,
    category: 'Alimentación',
    isPrediction: false
  },
  // ... más datos
]

// Uso del componente
function Dashboard() {
  return (
    <div className="p-6">
      <InteractiveCharts 
        data={financialData}
        className="max-w-7xl mx-auto"
      />
    </div>
  )
}
```

### Integración con Dashboard Real

```tsx
import { DashboardIntegration } from '@/components/charts'

function Dashboard() {
  const { dashboardMetrics, formatCurrency } = useDashboardData()
  
  return (
    <DashboardIntegration 
      dashboardMetrics={dashboardMetrics}
      formatCurrency={formatCurrency}
    />
  )
}
```

### Transformación de Datos del Dashboard

```tsx
// Ejemplo de cómo transformar datos existentes del dashboard
const chartData = useMemo(() => {
  if (!dashboardMetrics?.monthlyData) return []
  
  return dashboardMetrics.monthlyData.map((item, index) => ({
    month: item.month,
    income: item.income || 0,
    expenses: item.expenses || 0,
    balance: item.balance || 0,
    savings: (item.income || 0) * 0.2, // 20% objetivo
    category: 'general',
    isPrediction: false,
    date: new Date(new Date().getFullYear(), 
      new Date().getMonth() - (dashboardMetrics.monthlyData.length - 1 - index), 
      1).toISOString()
  }))
}, [dashboardMetrics?.monthlyData])
```

### Uso de Gráficos Individuales

```tsx
import { 
  OverviewChart, 
  TrendsChart, 
  useChartData 
} from '@/components/charts'

function CustomDashboard() {
  const { predictions, financialMetrics } = useChartData(data, true)
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <OverviewChart 
        data={data}
        showPredictions={true}
        formatCurrency={formatCurrency}
      />
      
      <TrendsChart 
        data={data}
        formatCurrency={formatCurrency}
      />
    </div>
  )
}
```

## 🎨 Personalización

### Colores y Temas

```tsx
import { CHART_COLORS, CATEGORY_COLORS } from '@/components/charts'

// Personalizar colores
const customColors = {
  ...CHART_COLORS,
  income: '#10B981',    // Verde personalizado
  expenses: '#EF4444',  // Rojo personalizado
  balance: '#3B82F6'    // Azul personalizado
}
```

### Configuración de Gráficos

```tsx
import { DEFAULT_CHART_CONFIG } from '@/components/charts'

// Configuración personalizada
const customConfig = {
  ...DEFAULT_CHART_CONFIG,
  height: 500,
  margin: { top: 20, right: 30, left: 20, bottom: 20 }
}
```

## 🔧 Hooks Personalizados

### useChartData

Procesa datos financieros y genera métricas útiles:

```tsx
const {
  predictions,        // Datos de predicción
  categoryBreakdown, // Desglose por categorías
  yearComparison,    // Comparación año a año
  financialMetrics   // Métricas calculadas
} = useChartData(data, showPredictions)
```

## 📊 Estructura de Datos

### ChartData Interface

```tsx
interface ChartData {
  month: string          // Nombre del mes
  income: number         // Ingresos del mes
  expenses: number       // Gastos del mes
  balance: number        // Balance (income - expenses)
  category?: string      // Categoría principal de gasto
  isPrediction?: boolean // Si es dato predicho
}
```

### Ejemplo de Datos

```tsx
const sampleData: ChartData[] = [
  {
    month: 'Enero 2024',
    income: 5000000,
    expenses: 3500000,
    balance: 1500000,
    category: 'Alimentación',
    isPrediction: false
  },
  {
    month: 'Febrero 2024',
    income: 5200000,
    expenses: 3600000,
    balance: 1600000,
    category: 'Transporte',
    isPrediction: false
  }
  // ... más datos
]
```

## 🎯 Mejores Prácticas

### 1. Rendimiento
- Usa `useMemo` para cálculos pesados
- Implementa lazy loading para gráficos complejos
- Limita la cantidad de datos mostrados simultáneamente

### 2. Accesibilidad
- Todos los gráficos incluyen descripciones alt
- Colores con suficiente contraste
- Navegación por teclado habilitada

### 3. Responsive Design
- Usa `ResponsiveContainer` de Recharts
- Adapta márgenes según el tamaño de pantalla
- Oculta elementos no esenciales en móviles

## 🔄 Actualizaciones y Mantenimiento

### Agregar Nuevo Tipo de Gráfico

1. Crear componente en `components/`
2. Agregar tipo en `types.ts`
3. Actualizar configuración en `constants.ts`
4. Exportar en `index.ts`
5. Integrar en `InteractiveCharts.tsx`

### Ejemplo de Nuevo Gráfico

```tsx
// components/NewChart.tsx
export function NewChart({ data, formatCurrency }: NewChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      {/* Implementación del gráfico */}
    </ResponsiveContainer>
  )
}
```

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Gráfico no se renderiza**
   - Verificar que los datos tengan la estructura correcta
   - Asegurar que Recharts esté instalado
   - Revisar la consola por errores de TypeScript

2. **Predicciones incorrectas**
   - Verificar que haya suficientes datos históricos (mínimo 3 meses)
   - Revisar la lógica en `useChartData`

3. **Problemas de rendimiento**
   - Reducir la cantidad de datos
   - Implementar paginación
   - Usar `React.memo` en componentes pesados

## 📚 Recursos Adicionales

- [Documentación de Recharts](https://recharts.org/)
- [Guía de TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Implementa los cambios
4. Agrega tests si es necesario
5. Crea un Pull Request

---

**¡Disfruta creando visualizaciones financieras increíbles! 🚀📊**