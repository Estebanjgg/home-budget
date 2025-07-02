# Home Budget - Presupuesto Familiar 💰

Una aplicación web moderna para gestionar el presupuesto familiar de manera inteligente, construida con Next.js 15, TypeScript, Tailwind CSS y Supabase.

## 🚀 Características

### ✅ Implementadas
- **Autenticación completa** con Supabase
  - Registro de usuarios
  - Inicio de sesión
  - Recuperación de contraseña
  - Gestión de sesiones
- **Perfil de usuario**
  - Cambio de contraseña
  - Subida de avatar
  - Menú desplegable elegante
- **Dashboard inicial** con tarjetas de resumen
- **Diseño responsive** con Tailwind CSS

### 🔄 Próximas funcionalidades
- Gestión de ingresos y gastos
- Categorización de transacciones
- Reportes y gráficos
- Metas de ahorro
- Recordatorios de pagos

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 19, TypeScript
- **Estilos**: Tailwind CSS 4
- **Base de datos**: Supabase
- **Autenticación**: Supabase Auth
- **Storage**: Supabase Storage (para avatars)

## 📋 Requisitos previos

- Node.js 18+ 
- npm o yarn
- Cuenta en [Supabase](https://supabase.com)

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd home-budget
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Copia el archivo de ejemplo y configura tus credenciales:
   ```bash
   cp .env.example .env.local
   ```
   
   Edita `.env.local` con tus credenciales de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
   SUPABASE_SERVICE_ROLE_KEY=tu-clave-de-servicio
   ```

4. **Configurar Supabase**
   
   Ejecuta el contenido del archivo `supabase-setup.sql` en el SQL Editor de tu panel de Supabase para:
   - Crear el bucket de avatars
   - Configurar las políticas de seguridad

5. **Ejecutar la aplicación**
   ```bash
   npm run dev
   ```

6. **Abrir en el navegador**
   
   Visita [http://localhost:3000](http://localhost:3000)

## 🌐 Despliegue en GitHub Pages

Esta aplicación está configurada para desplegarse automáticamente en GitHub Pages usando GitHub Actions.

### Configuración para Despliegue

1. **Configura las variables de ambiente** en GitHub Secrets (Settings > Secrets and variables > Actions):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXTAUTH_SECRET` (opcional)
   - `NEXTAUTH_URL` (opcional)

2. **Habilita GitHub Pages**:
   - Ve a Settings > Pages
   - En Source, selecciona "GitHub Actions"

3. **Despliegue automático**:
   - Cada push a la rama `main` activará el workflow
   - Tu aplicación estará disponible en: `https://tu-usuario.github.io/home-budget`

### Scripts de Despliegue

- `npm run export` - Genera una exportación estática
- `npm run deploy:test` - Prueba el build estático localmente

Para instrucciones detalladas, consulta [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📁 Estructura del proyecto

```
home-budget/
├── app/                    # App Router de Next.js
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── Auth.tsx          # Componente de autenticación
│   ├── UserMenu.tsx      # Menú desplegable del usuario
│   └── UserProfile.tsx   # Modal de perfil de usuario
├── hooks/                 # Hooks personalizados
│   └── useAuth.ts        # Hook para manejo de autenticación
├── lib/                   # Utilidades y configuraciones
│   └── supabase.ts       # Cliente de Supabase
├── .env.local            # Variables de entorno
└── supabase-setup.sql    # Script de configuración de Supabase
```

## 🔧 Configuración de Supabase

### 1. Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea una nueva cuenta o inicia sesión
3. Crea un nuevo proyecto

### 2. Configurar Storage
Ejecuta el siguiente SQL en el SQL Editor de Supabase:

```sql
-- Crear bucket para avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Políticas de seguridad (ver supabase-setup.sql para el código completo)
```

## 🎯 Uso de la aplicación

### Para nuevos usuarios:
1. Haz clic en "¿No tienes cuenta? Regístrate"
2. Ingresa tu email y contraseña
3. Confirma tu cuenta desde el email recibido
4. Inicia sesión

### Para usuarios existentes:
1. Ingresa tu email y contraseña
2. Haz clic en "Iniciar Sesión"

### Gestión de perfil:
1. Haz clic en tu avatar/email en la esquina superior derecha
2. Selecciona "Mi Perfil"
3. Cambia tu contraseña, sube un avatar o cierra sesión

## 🔒 Seguridad

- Las contraseñas se manejan de forma segura con Supabase Auth
- Los avatars se almacenan en Supabase Storage con políticas de seguridad
- Las sesiones se gestionan automáticamente
- Variables de entorno para credenciales sensibles

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

Si tienes alguna pregunta o problema, por favor abre un issue en el repositorio.

---

**¡Gracias por usar Home Budget! 🏠💰**
