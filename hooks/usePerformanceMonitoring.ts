import { useEffect, useRef, useState, useCallback } from 'react'
import { PERFORMANCE_CONFIG } from '../lib/performance/PerformanceConfig'

// Performance metrics interface
interface PerformanceMetrics {
  componentLoadTime: number
  renderTime: number
  memoryUsage?: number
  bundleSize?: number
  cacheHitRate?: number
}

// Component performance tracking
export function useComponentPerformance(componentName: string) {
  const startTimeRef = useRef<number | undefined>(undefined)
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)

  useEffect(() => {
    startTimeRef.current = performance.now()
    
    return () => {
      if (startTimeRef.current) {
        const loadTime = performance.now() - startTimeRef.current
        
        setMetrics({
          componentLoadTime: loadTime,
          renderTime: loadTime,
        })

        // Log performance warning if threshold exceeded
        if (loadTime > PERFORMANCE_CONFIG.PERFORMANCE_MONITORING.COMPONENT_LOAD_TIME_THRESHOLD) {
          console.warn(`Component ${componentName} took ${loadTime.toFixed(2)}ms to load (threshold: ${PERFORMANCE_CONFIG.PERFORMANCE_MONITORING.COMPONENT_LOAD_TIME_THRESHOLD}ms)`)
        }
      }
    }
  }, [])

  return metrics
}

// Lazy loading performance tracking
export function useLazyLoadingMetrics() {
  const [lazyComponents, setLazyComponents] = useState<Map<string, PerformanceMetrics>>(new Map())
  
  const trackLazyComponent = useCallback((componentName: string, loadTime: number) => {
    setLazyComponents(prev => {
      const newMap = new Map(prev)
      newMap.set(componentName, {
        componentLoadTime: loadTime,
        renderTime: loadTime,
      })
      return newMap
    })
  }, [])

  const getLazyComponentMetrics = useCallback((componentName: string) => {
    return lazyComponents.get(componentName)
  }, [lazyComponents])

  const getAllLazyMetrics = useCallback(() => {
    return Array.from(lazyComponents.entries()).map(([name, metrics]) => ({
      componentName: name,
      ...metrics,
    }))
  }, [lazyComponents])

  return {
    trackLazyComponent,
    getLazyComponentMetrics,
    getAllLazyMetrics,
    lazyComponentsCount: lazyComponents.size,
  }
}

// Memory usage monitoring
export function useMemoryMonitoring() {
  const [memoryInfo, setMemoryInfo] = useState<any>(null)

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        setMemoryInfo((performance as any).memory)
      }
    }

    updateMemoryInfo()
    const interval = setInterval(updateMemoryInfo, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return memoryInfo
}

// Bundle size tracking
export function useBundleAnalysis() {
  const [bundleInfo, setBundleInfo] = useState<{
    totalSize: number
    chunkSizes: Record<string, number>
    warnings: string[]
  } | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && PERFORMANCE_CONFIG.BUNDLE_ANALYSIS.ENABLE_ANALYZER) {
      // This would typically be populated by a webpack plugin or build tool
      const bundleData = (window as any).__BUNDLE_ANALYSIS__
      
      if (bundleData) {
        const warnings: string[] = []
        
        // Check for oversized chunks
        Object.entries(bundleData.chunkSizes || {}).forEach(([chunkName, size]) => {
          if (typeof size === 'number') {
            if (size > PERFORMANCE_CONFIG.LAZY_LOADING_CONFIG.CHUNK_SIZE_ERROR * 1024) {
              warnings.push(`Chunk ${chunkName} exceeds error threshold: ${(size / 1024).toFixed(2)}KB`)
            } else if (size > PERFORMANCE_CONFIG.LAZY_LOADING_CONFIG.CHUNK_SIZE_WARNING * 1024) {
              warnings.push(`Chunk ${chunkName} exceeds warning threshold: ${(size / 1024).toFixed(2)}KB`)
            }
          }
        })

        setBundleInfo({
          totalSize: bundleData.totalSize || 0,
          chunkSizes: bundleData.chunkSizes || {},
          warnings,
        })
      }
    }
  }, [])

  return bundleInfo
}

// Core Web Vitals monitoring
export function useWebVitals() {
  const [vitals, setVitals] = useState<{
    LCP?: number
    FID?: number
    CLS?: number
    TTFB?: number
  }>({})

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // LCP (Largest Contentful Paint)
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        setVitals(prev => ({ ...prev, LCP: lastEntry.startTime }))
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })

      // FID (First Input Delay)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          setVitals(prev => ({ ...prev, FID: entry.processingStart - entry.startTime }))
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // CLS (Cumulative Layout Shift)
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            setVitals(prev => ({ ...prev, CLS: clsValue }))
          }
        })
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })

      return () => {
        observer.disconnect()
        fidObserver.disconnect()
        clsObserver.disconnect()
      }
    }
  }, [])

  return vitals
}

// Comprehensive performance monitoring hook
export function usePerformanceMonitoring(componentName?: string) {
  const componentMetrics = useComponentPerformance(componentName || 'Unknown')
  const lazyMetrics = useLazyLoadingMetrics()
  const memoryInfo = useMemoryMonitoring()
  const bundleInfo = useBundleAnalysis()
  const webVitals = useWebVitals()

  const getPerformanceReport = useCallback(() => {
    return {
      component: componentMetrics,
      lazyLoading: lazyMetrics.getAllLazyMetrics(),
      memory: memoryInfo,
      bundle: bundleInfo,
      webVitals,
      timestamp: new Date().toISOString(),
    }
  }, [componentMetrics, lazyMetrics, memoryInfo, bundleInfo, webVitals])

  const logPerformanceReport = useCallback(() => {
    if (PERFORMANCE_CONFIG.PERFORMANCE_MONITORING.ENABLE_MONITORING) {
      console.group('🚀 Performance Report')
      console.table(getPerformanceReport())
      console.groupEnd()
    }
  }, [getPerformanceReport])

  return {
    componentMetrics,
    lazyMetrics,
    memoryInfo,
    bundleInfo,
    webVitals,
    getPerformanceReport,
    logPerformanceReport,
  }
}