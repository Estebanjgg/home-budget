# Integración de ExchangeRate-API

## 📋 Resumen

Este documento describe la integración completa de la API ExchangeRate-API en el proyecto Home Budget, permitiendo conversiones de moneda en tiempo real para presupuestos y gastos.

## 🔑 Configuración de API

### Credenciales
- **API Key**: `cf1287c1ebc8b4c0e3b5e24e`
- **URL Base**: `https://v6.exchangerate-api.com/v6`
- **Plan**: Gratuito (1,500 solicitudes/mes)

### Variables de Entorno
En el archivo `.env.local`:
```env
NEXT_PUBLIC_EXCHANGE_RATE_API_KEY=cf1287c1ebc8b4c0e3b5e24e
```

## 🛠️ Componentes Implementados

### 1. Hook `useExchangeRate`
**Ubicación**: `/hooks/useExchangeRate.ts`

**Funcionalidades**:
- ✅ Obtención de tasas de cambio en tiempo real
- ✅ Conversión entre monedas
- ✅ Cache local con localStorage
- ✅ Manejo de errores y estados de carga
- ✅ Soporte offline con datos en cache

**Uso**:
```typescript
const { rates, loading, error, convertAmount, updateRates } = useExchangeRate('USD')
```

### 2. Hook `useCurrencyBudget`
**Ubicación**: `/hooks/useCurrencyBudget.ts`

**Funcionalidades**:
- ✅ Conversión automática de presupuestos
- ✅ Gestión de moneda de visualización
- ✅ Formateo de monedas
- ✅ Cálculos de totales en diferentes monedas
- ✅ Persistencia de preferencias

**Uso**:
```typescript
const {
  convertedBudgets,
  displayCurrency,
  setDisplayCurrency,
  getTotalInCurrency
} = useCurrencyBudget(budgets, items)
```

### 3. Componente `CurrencyConverter`
**Ubicación**: `/components/currency/CurrencyConverter.tsx`

**Funcionalidades**:
- ✅ Interfaz completa de conversión
- ✅ Selección de monedas origen y destino
- ✅ Conversión en tiempo real
- ✅ Historial de conversiones
- ✅ Widget compacto para dashboard

### 4. Componente `CurrencyWidget`
**Ubicación**: `/components/currency/CurrencyConverter.tsx`

**Funcionalidades**:
- ✅ Vista compacta para el dashboard
- ✅ Conversión rápida a monedas populares
- ✅ Integración seamless con métricas

### 5. Página Dedicada `/currency`
**Ubicación**: `/app/currency/page.tsx`

**Funcionalidades**:
- ✅ Centro completo de conversión de monedas
- ✅ Visualización de presupuestos convertidos
- ✅ Selector de moneda de visualización
- ✅ Resumen financiero en múltiples monedas
- ✅ Información educativa sobre conversiones

## 🌍 Monedas Soportadas

### Monedas Principales
- **USD** - Dólar Estadounidense
- **EUR** - Euro
- **BRL** - Real Brasileño
- **MXN** - Peso Mexicano
- **ARS** - Peso Argentino
- **COP** - Peso Colombiano
- **CLP** - Peso Chileno
- **PEN** - Sol Peruano
- **CAD** - Dólar Canadiense
- **GBP** - Libra Esterlina
- **JPY** - Yen Japonés
- **CNY** - Yuan Chino

## 📱 Integración en el Dashboard

### Widget en Dashboard Principal
- ✅ Integrado en la sección de métricas
- ✅ Muestra conversiones del ingreso promedio
- ✅ Disponible en versión móvil y escritorio

### Navegación
- ✅ Enlace en navbar principal
- ✅ Acceso desde menú móvil
- ✅ Icono distintivo 🌍

## 🔄 Funcionalidades Avanzadas

### Cache y Persistencia
- **Cache de tasas**: 1 hora de duración
- **Preferencias**: Guardadas en localStorage
- **Modo offline**: Usa últimas tasas disponibles

### Manejo de Errores
- Fallback a datos en cache
- Mensajes de error informativos
- Retry automático en fallos de red

### Performance
- Debounce en conversiones en tiempo real
- Lazy loading de componentes
- Optimización de re-renders

## 📊 Casos de Uso

### 1. Conversión Rápida
```typescript
// Convertir 1000 USD a EUR
const eurAmount = convertAmount(1000, 'USD', 'EUR')
```

### 2. Visualizar Presupuesto en Otra Moneda
```typescript
// Cambiar visualización a EUR
setDisplayCurrency('EUR')
// Todos los presupuestos se muestran convertidos
```

### 3. Calcular Total en Moneda Específica
```typescript
// Obtener total de todos los presupuestos en BRL
const totalBRL = getTotalInCurrency('BRL')
```

## 🚀 Próximas Mejoras

### Funcionalidades Planificadas
- [ ] Gráficos de tendencias de tasas de cambio
- [ ] Alertas de cambios significativos en tasas
- [ ] Conversión automática basada en ubicación
- [ ] Soporte para criptomonedas
- [ ] Exportación de reportes en múltiples monedas

### Optimizaciones
- [ ] Implementar WebSockets para actualizaciones en tiempo real
- [ ] Cache más inteligente con invalidación selectiva
- [ ] Compresión de datos de tasas de cambio

## 🔧 Mantenimiento

### Monitoreo de API
- Verificar límites de uso mensual
- Monitorear errores de API
- Actualizar claves si es necesario

### Actualizaciones
- Las tasas se actualizan automáticamente cada hora
- Cache se limpia automáticamente cuando expira
- Preferencias del usuario se mantienen entre sesiones

## 📞 Soporte

Para problemas relacionados con la API de conversión de monedas:
1. Verificar conectividad a internet
2. Comprobar límites de API en ExchangeRate-API
3. Revisar logs de consola para errores específicos
4. Limpiar cache local si hay datos corruptos

---

**Última actualización**: Diciembre 2024
**Versión de API**: v6
**Estado**: ✅ Completamente funcional