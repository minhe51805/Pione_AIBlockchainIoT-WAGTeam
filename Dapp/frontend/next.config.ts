import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  
  // Proxy Flask backend và AI service để chỉ cần dùng 1 port
  async rewrites() {
    return [
      // Flask backend (port 5000) -> /api/...
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:5000/api/auth/:path*',
      },
      {
        source: '/api/analyze-date',
        destination: 'http://localhost:5000/api/analyze-date',
      },
      // AI service (port 8000) -> /api/ai/...
      {
        source: '/api/ai/:path*',
        destination: 'http://localhost:8000/api/ai/:path*',
      },
    ];
  },
};

export default nextConfig;

