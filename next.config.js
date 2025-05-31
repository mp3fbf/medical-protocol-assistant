/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable x-powered-by header for security
  poweredByHeader: false,
  // Fix CSS loading issues in Next.js 15
  webpack: (config, { isServer }) => {
    // Ensure CSS is properly handled
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  // Next.js 15 performance optimizations
  experimental: {
    optimizeCss: false,
  },
};

module.exports = nextConfig;
