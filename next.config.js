/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de imágenes optimizadas
  images: {
    // Dominios permitidos para imágenes externas
    domains: [
      'localhost',
      'images.unsplash.com',
      'via.placeholder.com',
      'picsum.photos',
    ],
    // Formatos de imagen optimizados
    formats: ['image/webp', 'image/avif'],
    // Tamaños de imagen predefinidos
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Habilitar placeholder blur automático
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Configuración experimental para optimizaciones
  experimental: {
    // Optimización de CSS
    optimizeCss: true,
    // Lazy loading mejorado
    scrollRestoration: true,
    // Preload de módulos críticos
    optimizePackageImports: [
      '@tanstack/react-query',
      'recharts',
      'lucide-react',
    ],
  },

  // Configuración de webpack para bundle splitting
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimizaciones solo en producción
    if (!dev && !isServer) {
      // Bundle splitting personalizado
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Vendor chunk para librerías principales
          vendor: {
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            name: 'vendor',
            chunks: 'all',
            priority: 10,
          },
          // Chunk para React Query
          reactQuery: {
            test: /[\\/]node_modules[\\/]@tanstack[\\/]react-query[\\/]/,
            name: 'react-query',
            chunks: 'all',
            priority: 9,
          },
          // Chunk para gráficos (Recharts)
          charts: {
            test: /[\\/]node_modules[\\/](recharts|d3-)[\\/]/,
            name: 'charts',
            chunks: 'all',
            priority: 8,
          },
          // Chunk para iconos
          icons: {
            test: /[\\/]node_modules[\\/](lucide-react|react-icons)[\\/]/,
            name: 'icons',
            chunks: 'all',
            priority: 7,
          },
          // Chunk para utilidades
          utils: {
            test: /[\\/]node_modules[\\/](clsx|class-variance-authority|tailwind-merge)[\\/]/,
            name: 'utils',
            chunks: 'all',
            priority: 6,
          },
          // Chunk común para otras librerías
          common: {
            test: /[\\/]node_modules[\\/]/,
            name: 'common',
            chunks: 'all',
            priority: 5,
            minChunks: 2,
          },
        },
      };

      // Optimización de módulos
      config.optimization.moduleIds = 'deterministic';
      config.optimization.chunkIds = 'deterministic';
    }

    // Alias para imports más limpios
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    };

    return config;
  },

  // Configuración de compilación
  compiler: {
    // Remover console.log en producción
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Headers de seguridad y performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Configuración de PWA (opcional)
  // Descomenta si quieres habilitar PWA
  /*
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/_next/static/sw.js',
      },
    ];
  },
  */
};

module.exports = nextConfig;