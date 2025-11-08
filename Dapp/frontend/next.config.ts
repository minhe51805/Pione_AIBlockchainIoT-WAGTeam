import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  
  // Static export for unified gateway
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Base path (nếu cần deploy vào subfolder)
  // basePath: '',
  
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  
  // NOTE: Rewrites không hoạt động với static export
  // API calls sẽ được proxy bởi Gateway (gateway.js port 3000)
};

export default nextConfig;

