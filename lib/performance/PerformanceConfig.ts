// Performance optimization configuration

// Lazy loading thresholds
export const LAZY_LOADING_CONFIG = {
  // Component size thresholds (in KB)
  COMPONENT_SIZE_THRESHOLD: 50,
  
  // Bundle size thresholds
  CHUNK_SIZE_WARNING: 244, // KB
  CHUNK_SIZE_ERROR: 500, // KB
  
  // Intersection Observer options for lazy loading
  INTERSECTION_OPTIONS: {
    rootMargin: '50px',
    threshold: 0.1,
  },
  
  // Preload timing
  PRELOAD_DELAY: 100, // ms
  HOVER_PRELOAD_DELAY: 200, // ms
}

// Code splitting strategies
export const CODE_SPLITTING_STRATEGIES = {
  // Route-based splitting
  ROUTE_BASED: true,
  
  // Component-based splitting
  COMPONENT_BASED: true,
  
  // Feature-based splitting
  FEATURE_BASED: true,
  
  // Vendor splitting
  VENDOR_SPLITTING: true,
}

// Performance monitoring
export const PERFORMANCE_MONITORING = {
  // Core Web Vitals thresholds
  LCP_THRESHOLD: 2500, // ms
  FID_THRESHOLD: 100, // ms
  CLS_THRESHOLD: 0.1,
  
  // Custom metrics
  COMPONENT_LOAD_TIME_THRESHOLD: 1000, // ms
  API_RESPONSE_TIME_THRESHOLD: 2000, // ms
  
  // Enable monitoring
  ENABLE_MONITORING: process.env.NODE_ENV === 'production',
}

// Caching strategies
export const CACHING_CONFIG = {
  // Service Worker caching
  ENABLE_SW_CACHING: true,
  
  // Browser caching
  STATIC_CACHE_DURATION: 31536000, // 1 year in seconds
  API_CACHE_DURATION: 300, // 5 minutes in seconds
  
  // Memory caching
  COMPONENT_CACHE_SIZE: 50, // number of components
  DATA_CACHE_SIZE: 100, // number of data entries
}

// Resource optimization
export const RESOURCE_OPTIMIZATION = {
  // Image optimization
  IMAGE_FORMATS: ['webp', 'avif', 'jpg'],
  IMAGE_QUALITY: 85,
  IMAGE_SIZES: [640, 768, 1024, 1280, 1920],
  
  // Font optimization
  FONT_DISPLAY: 'swap',
  PRELOAD_FONTS: ['Inter-Regular.woff2', 'Inter-Medium.woff2'],
  
  // CSS optimization
  CRITICAL_CSS_INLINE: true,
  CSS_MINIFICATION: true,
  
  // JavaScript optimization
  JS_MINIFICATION: true,
  TREE_SHAKING: true,
  DEAD_CODE_ELIMINATION: true,
}

// Bundle analysis
export const BUNDLE_ANALYSIS = {
  // Enable bundle analyzer
  ENABLE_ANALYZER: process.env.ANALYZE === 'true',
  
  // Chunk analysis
  ANALYZE_CHUNKS: true,
  
  // Dependency analysis
  ANALYZE_DEPENDENCIES: true,
  
  // Size tracking
  TRACK_SIZE_CHANGES: true,
}

// Progressive loading strategies
export const PROGRESSIVE_LOADING = {
  // Above-the-fold priority
  ABOVE_FOLD_PRIORITY: 'high',
  
  // Below-the-fold priority
  BELOW_FOLD_PRIORITY: 'low',
  
  // Intersection observer for progressive loading
  USE_INTERSECTION_OBSERVER: true,
  
  // Skeleton loading
  ENABLE_SKELETON_LOADING: true,
}

// Network optimization
export const NETWORK_OPTIMIZATION = {
  // HTTP/2 Server Push
  ENABLE_SERVER_PUSH: false,
  
  // Resource hints
  ENABLE_PRELOAD: true,
  ENABLE_PREFETCH: true,
  ENABLE_PRECONNECT: true,
  
  // Compression
  ENABLE_GZIP: true,
  ENABLE_BROTLI: true,
  
  // CDN configuration
  USE_CDN: process.env.NODE_ENV === 'production',
}

// Development optimizations
export const DEVELOPMENT_CONFIG = {
  // Hot module replacement
  ENABLE_HMR: process.env.NODE_ENV === 'development',
  
  // Fast refresh
  ENABLE_FAST_REFRESH: true,
  
  // Source maps
  ENABLE_SOURCE_MAPS: process.env.NODE_ENV === 'development',
  
  // Bundle analysis in dev
  DEV_BUNDLE_ANALYSIS: false,
}

// Export all configurations
export const PERFORMANCE_CONFIG = {
  LAZY_LOADING_CONFIG,
  CODE_SPLITTING_STRATEGIES,
  PERFORMANCE_MONITORING,
  CACHING_CONFIG,
  RESOURCE_OPTIMIZATION,
  BUNDLE_ANALYSIS,
  PROGRESSIVE_LOADING,
  NETWORK_OPTIMIZATION,
  DEVELOPMENT_CONFIG,
} as const

// Type definitions for configuration
export type PerformanceConfig = typeof PERFORMANCE_CONFIG
export type LazyLoadingConfig = typeof LAZY_LOADING_CONFIG
export type CodeSplittingStrategies = typeof CODE_SPLITTING_STRATEGIES