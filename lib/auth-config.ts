// Configuración de autenticación con URLs dinámicas

/**
 * Obtiene la URL base actual del sitio
 * @returns URL base (localhost en desarrollo, GitHub Pages en producción)
 */
export function getBaseUrl(): string {
  // En el cliente (browser)
  if (typeof window !== 'undefined') {
    // En el cliente, usar la URL completa incluyendo el basePath
    return window.location.origin + (window.location.pathname.startsWith('/home-budget') ? '/home-budget' : '')
  }
  
  // En el servidor (durante build)
  // Verificar si estamos en GitHub Pages
  if (process.env.GITHUB_ACTIONS === 'true' || process.env.NODE_ENV === 'production') {
    return 'https://estebanjgg.github.io/home-budget'
  }
  
  // Desarrollo local
  return 'http://localhost:3000'
}

/**
 * Obtiene las opciones de configuración para autenticación de Supabase
 * @returns Opciones con redirectTo configurado dinámicamente
 */
export function getAuthOptions() {
  const baseUrl = getBaseUrl()
  
  return {
    emailRedirectTo: `${baseUrl}/auth/callback`,
    redirectTo: baseUrl
  }
}

/**
 * Configuración de URLs de redirect para diferentes acciones de auth
 */
export const AUTH_REDIRECTS = {
  signUp: () => `${getBaseUrl()}/auth/callback`,
  resetPassword: () => `${getBaseUrl()}/auth/reset-password`,
  emailConfirmation: () => `${getBaseUrl()}/auth/callback`,
  magicLink: () => `${getBaseUrl()}/auth/callback`
}

/**
 * Detecta si estamos en desarrollo o producción
 */
export function isDevelopment(): boolean {
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  }
  return process.env.NODE_ENV === 'development'
}

/**
 * Detecta si estamos en GitHub Pages
 */
export function isGitHubPages(): boolean {
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'estebanjgg.github.io'
  }
  return process.env.GITHUB_ACTIONS === 'true' || process.env.NODE_ENV === 'production'
}