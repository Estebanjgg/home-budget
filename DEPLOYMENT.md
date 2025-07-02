# 🚀 Guía de Despliegue en GitHub Pages

Esta guía te ayudará a desplegar tu aplicación de presupuesto doméstico en GitHub Pages.

## 📋 Prerrequisitos

1. **Repositorio en GitHub**: Tu código debe estar en un repositorio de GitHub
2. **Cuenta de Supabase**: Necesitas un proyecto configurado en Supabase
3. **GitHub Pages habilitado**: En la configuración del repositorio

## 🔧 Configuración de Variables de Ambiente

Para que tu aplicación funcione correctamente en producción, necesitas configurar las siguientes variables de ambiente como **GitHub Secrets**:

### Paso 1: Ir a la configuración del repositorio
1. Ve a tu repositorio en GitHub
2. Haz clic en **Settings** (Configuración)
3. En el menú lateral, selecciona **Secrets and variables** > **Actions**
4. Haz clic en **New repository secret**

### Paso 2: Agregar las siguientes variables

#### Variables de Supabase (Obligatorias)
```
NEXT_PUBLIC_SUPABASE_URL
```
- **Valor**: La URL de tu proyecto Supabase
- **Ejemplo**: `https://tu-proyecto.supabase.co`
- **Dónde encontrarla**: Dashboard de Supabase > Settings > API

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
- **Valor**: La clave anónima pública de Supabase
- **Ejemplo**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Dónde encontrarla**: Dashboard de Supabase > Settings > API

```
SUPABASE_SERVICE_ROLE_KEY
```
- **Valor**: La clave de rol de servicio de Supabase (para operaciones del servidor)
- **Ejemplo**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Dónde encontrarla**: Dashboard de Supabase > Settings > API
- **⚠️ IMPORTANTE**: Esta clave es secreta, nunca la expongas públicamente

#### Variables de Autenticación (Opcionales)
```
NEXTAUTH_SECRET
```
- **Valor**: Una cadena secreta aleatoria para NextAuth
- **Ejemplo**: `tu-cadena-secreta-muy-larga-y-aleatoria`
- **Generar**: Puedes usar `openssl rand -base64 32`

```
NEXTAUTH_URL
```
- **Valor**: La URL donde se desplegará tu aplicación
- **Ejemplo**: `https://tu-usuario.github.io/home-budget`

## 🛠️ Configuración del Repositorio

### Habilitar GitHub Pages
1. Ve a **Settings** > **Pages**
2. En **Source**, selecciona **GitHub Actions**
3. Guarda los cambios

### Configurar el nombre del repositorio
Asegúrate de que el nombre de tu repositorio sea `home-budget` o actualiza el `basePath` en `next.config.ts`:

```typescript
basePath: process.env.NODE_ENV === 'production' ? '/tu-nombre-de-repo' : '',
assetPrefix: process.env.NODE_ENV === 'production' ? '/tu-nombre-de-repo/' : '',
```

## 🚀 Proceso de Despliegue

1. **Push a main**: Cada vez que hagas push a la rama `main`, se ejecutará automáticamente el workflow
2. **Monitoreo**: Ve a la pestaña **Actions** para ver el progreso del despliegue
3. **Acceso**: Una vez completado, tu aplicación estará disponible en:
   ```
   https://tu-usuario.github.io/home-budget
   ```

## 🔍 Solución de Problemas

### Error de build
- Verifica que todas las variables de ambiente estén configuradas correctamente
- Revisa los logs en la pestaña **Actions**

### Error 404 al acceder
- Asegúrate de que GitHub Pages esté habilitado
- Verifica que el `basePath` en `next.config.ts` coincida con el nombre del repositorio

### Problemas de conexión con Supabase
- Verifica que las URLs y claves de Supabase sean correctas
- Asegúrate de que tu proyecto de Supabase esté activo

## 📝 Notas Importantes

1. **Primer despliegue**: Puede tomar unos minutos en aparecer
2. **Actualizaciones**: Los cambios se reflejan automáticamente después de cada push
3. **Dominio personalizado**: Puedes configurar un dominio personalizado en Settings > Pages
4. **HTTPS**: GitHub Pages proporciona HTTPS automáticamente

## 🔒 Seguridad

- ✅ Las variables marcadas como `NEXT_PUBLIC_` son seguras para el cliente
- ❌ NUNCA expongas `SUPABASE_SERVICE_ROLE_KEY` en el código del cliente
- 🔐 Usa GitHub Secrets para todas las variables sensibles

---

¡Tu aplicación de presupuesto doméstico estará lista para usar en GitHub Pages! 🎉