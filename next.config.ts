import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  images: {
    unoptimized: true
  },
  // Configuración para GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? '/home-budget' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/home-budget/' : '',
};

export default nextConfig;
