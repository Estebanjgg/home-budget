# Configuración de Supabase Storage para Imágenes

## 📋 Pasos para configurar el almacenamiento de imágenes

### 1. Ejecutar el script de configuración

#### Opción A: Script Completo (Requiere permisos de administrador)
1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Copia y pega el contenido de `supabase/storage-setup.sql`
4. Ejecuta el script

#### Opción B: Script Simplificado (Recomendado si tienes errores de permisos)
**Si obtienes el error: "ERROR: 42501: must be owner of table objects"**

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Copia y pega el contenido de `supabase/storage-setup-simple.sql`
4. Ejecuta el script

> **Nota**: El script simplificado permite que cualquier usuario autenticado suba imágenes. Si necesitas restricciones de administrador, puedes modificar las políticas después.

### 2. Verificar la configuración

En el panel de Supabase:

1. Ve a **Storage**
2. Deberías ver un bucket llamado `education-content`
3. Verifica que esté marcado como **público**

### 3. Configurar políticas de seguridad

El script automáticamente configura:

- ✅ **Lectura pública**: Cualquiera puede ver las imágenes
- ✅ **Escritura admin**: Solo administradores pueden subir/editar/eliminar
- ✅ **RLS habilitado**: Seguridad a nivel de fila activada

### 4. Estructura de archivos

Las imágenes se guardarán con esta estructura:
```
education-content/
└── education-images/
    ├── 1703123456789-abc123.jpg
    ├── 1703123456790-def456.png
    └── ...
```

### 5. Funcionalidades implementadas

#### ✅ Subida de imágenes
- Validación de tipo (solo imágenes)
- Validación de tamaño (máximo 5MB)
- Nombres únicos automáticos
- Preview en tiempo real

#### ✅ Gestión automática
- URL pública automática
- Eliminación al borrar contenido
- Manejo de errores

#### ✅ Seguridad
- Solo administradores pueden subir
- Acceso público para lectura
- Validaciones del lado cliente y servidor

### 6. Verificar funcionamiento

1. Inicia la aplicación: `npm run dev`
2. Ve al Panel de Administración
3. Crea un nuevo artículo
4. Sube una imagen
5. Verifica que aparezca en Supabase Storage

### 🔧 Solución de problemas

#### Error: "ERROR: 42501: must be owner of table objects"
**Solución**: Usa el script simplificado `storage-setup-simple.sql` en lugar del script completo.

Este error ocurre porque no tienes permisos de superusuario para modificar la tabla `storage.objects`. El script simplificado evita este problema.

#### Error: "Could not find the 'image_url' column of 'educational_content'"
**Solución**: La columna `image_url` no existe en tu base de datos.

1. Ve a tu panel de Supabase → SQL Editor
2. Ejecuta el script `supabase/migration-add-image-url.sql`
3. Verifica que la columna se haya creado correctamente
4. Intenta subir el contenido nuevamente

Este error indica que el esquema de la base de datos no está actualizado.

#### Error: "Bucket does not exist"
- Ejecuta el script `storage-setup.sql`
- Verifica que el bucket `education-content` existe

#### Error: "Insufficient permissions"
- Verifica que tu usuario tenga `is_admin = true`
- Revisa las políticas de seguridad
- Si usas el script simplificado, cualquier usuario autenticado puede subir imágenes

#### Error: "File too large"
- Las imágenes deben ser menores a 5MB
- Comprime la imagen antes de subirla

#### Diferencias entre Scripts

**Script Completo (`storage-setup.sql`)**:
- Requiere permisos de administrador
- Solo administradores pueden subir/editar/eliminar imágenes
- Más seguro para producción

**Script Simplificado (`storage-setup-simple.sql`)**:
- No requiere permisos especiales
- Cualquier usuario autenticado puede gestionar imágenes
- Ideal para desarrollo y pruebas

### 📊 Monitoreo

Puedes monitorear el uso del storage en:
- **Supabase Dashboard** → **Storage** → **Usage**
- Ver archivos subidos
- Estadísticas de almacenamiento

---

¡Tu sistema de almacenamiento de imágenes está listo! 🎉