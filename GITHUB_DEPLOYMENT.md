# Configuración de Deployment en GitHub Pages

## Problema Resuelto

Este documento explica cómo resolver los errores de deployment relacionados con:
1. Variables de entorno de Supabase no disponibles durante el build
2. Assets estáticos (imágenes, videos) que no se cargan correctamente en GitHub Pages

## Soluciones Implementadas

### 1. Configuración de Variables de Entorno

Se actualizó el workflow de GitHub Actions (`.github/workflows/nextjs.yml`) para incluir las variables de entorno de Supabase durante el build:

```yaml
- name: Build with Next.js
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
  run: ${{ steps.detect-package-manager.outputs.runner }} next build
```

### 2. Cliente Supabase con Fallback

Se modificó `lib/config/supabase.ts` para manejar casos donde las variables de entorno no están disponibles durante el build estático:

- Valores por defecto para evitar errores durante el build
- Cliente mock para SSR/build time
- Verificación de disponibilidad en el lado del cliente

### 3. Gestión de Assets Estáticos

Se creó una función utilitaria `lib/utils.ts` para manejar correctamente las rutas de assets estáticos:

```typescript
export function getAssetPath(path: string): string {
  const basePath = process.env.NODE_ENV === 'production' ? '/home-budget' : ''
  return `${basePath}${path}`
}
```

Esta función se implementó en todos los componentes que usan assets estáticos:
- `app/page.tsx`
- `components/layout/Navbar.tsx`
- `components/layout/Footer.tsx`

## Configuración Requerida en GitHub

### Paso 1: Configurar Secrets

En tu repositorio de GitHub, ve a **Settings > Secrets and variables > Actions** y agrega los siguientes secrets:

1. `NEXT_PUBLIC_SUPABASE_URL`
   - Valor: Tu URL de Supabase (ej: `https://tu-proyecto.supabase.co`)

2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Valor: Tu clave anónima de Supabase

### Paso 2: Habilitar GitHub Pages

1. Ve a **Settings > Pages**
2. En **Source**, selecciona "GitHub Actions"
3. El workflow se ejecutará automáticamente en cada push a la rama `main`

## Verificación del Deployment

Después de configurar los secrets y hacer push de los cambios:

1. Ve a la pestaña **Actions** en tu repositorio
2. Verifica que el workflow se ejecute sin errores
3. Una vez completado, tu sitio estará disponible en: `https://tu-usuario.github.io/home-budget`

## Archivos Modificados

- ✅ `.github/workflows/nextjs.yml` - Agregadas variables de entorno
- ✅ `lib/config/supabase.ts` - Cliente con fallback para build estático
- ✅ `hooks/useAuth.ts` - Manejo mejorado de errores
- ✅ `lib/utils.ts` - Función utilitaria para assets (NUEVO)
- ✅ `app/page.tsx` - Uso de getAssetPath
- ✅ `components/layout/Navbar.tsx` - Uso de getAssetPath
- ✅ `components/layout/Footer.tsx` - Uso de getAssetPath

## Notas Importantes

- Los assets estáticos ahora incluyen automáticamente el `basePath` en producción
- La aplicación funciona tanto en desarrollo local como en GitHub Pages
- Supabase se inicializa correctamente solo cuando las variables están disponibles
- El build estático ya no falla por variables de entorno faltantes