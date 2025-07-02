# Configuración de Autenticación Supabase

## URLs de Configuración Requeridas

Para que la autenticación funcione correctamente tanto en desarrollo como en producción, necesitas configurar las siguientes URLs en tu panel de Supabase:

### 1. Site URL (URL del Sitio)
```
https://estebanjgg.github.io/home-budget
```

### 2. Redirect URLs (URLs de Redirección)
Agrega las siguientes URLs en la sección "Redirect URLs":

```
http://localhost:3000/auth/callback
https://estebanjgg.github.io/home-budget/auth/callback
http://localhost:3000/auth/reset-password
https://estebanjgg.github.io/home-budget/auth/reset-password
http://localhost:3000
https://estebanjgg.github.io/home-budget
```

## Pasos para Configurar en Supabase

1. **Accede a tu proyecto en Supabase Dashboard**
   - Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecciona tu proyecto

2. **Navega a Authentication > URL Configuration**
   - En el menú lateral, ve a "Authentication"
   - Luego a "URL Configuration"

3. **Configura Site URL**
   - En el campo "Site URL", ingresa: `https://estebanjgg.github.io/home-budget`
   - Haz clic en "Save changes"

4. **Agrega Redirect URLs**
   - En la sección "Redirect URLs", haz clic en "Add URL"
   - Agrega cada una de las URLs listadas arriba, una por una:
     - `http://localhost:3000/auth/callback`
     - `https://estebanjgg.github.io/home-budget/auth/callback`
     - `http://localhost:3000/auth/reset-password`
     - `https://estebanjgg.github.io/home-budget/auth/reset-password`
     - `http://localhost:3000`
     - `https://estebanjgg.github.io/home-budget`

## Cómo Funciona la Detección Automática

El sistema ahora detecta automáticamente el entorno:

### En Desarrollo (localhost:3000)
- Los emails de verificación redirigen a: `http://localhost:3000/auth/callback`
- Los emails de recuperación redirigen a: `http://localhost:3000/auth/reset-password`

### En Producción (GitHub Pages)
- Los emails de verificación redirigen a: `https://estebanjgg.github.io/home-budget/auth/callback`
- Los emails de recuperación redirigen a: `https://estebanjgg.github.io/home-budget/auth/reset-password`

## Archivos Modificados/Creados

### Nuevos Archivos:
1. **`lib/auth-config.ts`** - Configuración dinámica de URLs
2. **`app/auth/callback/page.tsx`** - Página de callback para verificación
3. **`app/auth/reset-password/page.tsx`** - Página para cambiar contraseña

### Archivos Modificados:
1. **`components/auth/Auth.tsx`** - Integración con configuración dinámica

## Funcionalidades Implementadas

### ✅ Detección Automática de Entorno
- Detecta si está en desarrollo (localhost) o producción (GitHub Pages)
- Configura automáticamente las URLs de redirección correctas

### ✅ Página de Callback Mejorada
- Maneja verificación de email
- Maneja recuperación de contraseña
- Interfaz visual atractiva con estados de carga
- Redirección automática después del procesamiento

### ✅ Página de Reset de Contraseña
- Validación de fortaleza de contraseña en tiempo real
- Confirmación de contraseña
- Verificación de sesión válida
- Interfaz intuitiva y segura

### ✅ Mejoras en Registro
- URLs de redirección dinámicas
- Compatibilidad con ambos entornos

## Verificación

Para verificar que todo funciona correctamente:

1. **En Desarrollo:**
   - Registra un usuario en `http://localhost:3000`
   - Verifica que el email de confirmación redirija a `localhost:3000/auth/callback`

2. **En Producción:**
   - Registra un usuario en `https://estebanjgg.github.io/home-budget`
   - Verifica que el email de confirmación redirija a `https://estebanjgg.github.io/home-budget/auth/callback`

## Solución de Problemas

### ⚠️ ERROR COMÚN: URL de Callback Incompleta
**PROBLEMA DETECTADO:** Tienes `http://localhost:3000/auth/callbac` en lugar de `http://localhost:3000/auth/callback`

**SOLUCIÓN:**
1. Ve a tu panel de Supabase Dashboard
2. Navega a Authentication > URL Configuration
3. En "Redirect URLs", elimina la URL incorrecta: `http://localhost:3000/auth/callbac`
4. Agrega la URL correcta: `http://localhost:3000/auth/callback` (con la 'k' al final)
5. Haz clic en "Save changes"

### Error: "Invalid redirect URL"
- Verifica que todas las URLs estén agregadas en Supabase Dashboard
- Asegúrate de que no haya espacios extra en las URLs
- **IMPORTANTE:** Verifica que las URLs sean exactamente como se muestran arriba (especialmente `callback` con 'k' al final)
- Revisa que no haya caracteres especiales o espacios ocultos

### Error: "Email not confirmed"
- Verifica que el usuario haya hecho clic en el enlace del email
- Revisa la carpeta de spam
- Verifica que la URL de callback esté funcionando correctamente
- Asegúrate de que la URL de callback esté bien escrita en Supabase

### Error en Producción
- Asegúrate de que el build y deploy se hayan completado correctamente
- Verifica que las variables de entorno estén configuradas en GitHub Pages
- Revisa los logs del navegador para errores específicos

### Verificación Rápida de URLs
Tus URLs en Supabase deben ser EXACTAMENTE:
```
✅ http://localhost:3000/auth/callback
❌ http://localhost:3000/auth/callbac (INCORRECTO - falta 'k')
✅ https://estebanjgg.github.io/home-budget/auth/callback
✅ http://localhost:3000/auth/reset-password
✅ https://estebanjgg.github.io/home-budget/auth/reset-password
✅ http://localhost:3000
✅ https://estebanjgg.github.io/home-budget
```