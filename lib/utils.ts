import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to combine class names with tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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