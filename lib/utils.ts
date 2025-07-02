/**
 * Utility function to get the correct asset path for static files
 * Includes basePath when in production for GitHub Pages
 */
export function getAssetPath(path: string): string {
  const basePath = process.env.NODE_ENV === 'production' ? '/home-budget' : ''
  return `${basePath}${path}`
}

/**
 * Utility function to check if we're in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}