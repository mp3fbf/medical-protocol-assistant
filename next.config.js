/** @type {import('next').NextConfig} */
const https = require("https");
const http = require("http");

// Create global HTTP agents with MASSIVE timeouts
const httpAgent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000, // 30 seconds keep-alive
  timeout: 604800000, // 7 DAYS timeout
  maxSockets: Infinity,
  maxFreeSockets: 256,
});

const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000, // 30 seconds keep-alive
  timeout: 604800000, // 7 DAYS timeout
  maxSockets: Infinity,
  maxFreeSockets: 256,
});

// Set as global agents
http.globalAgent = httpAgent;
https.globalAgent = httpsAgent;

const nextConfig = {
  reactStrictMode: true,
  // Disable x-powered-by header for security
  poweredByHeader: false,

  // MAXIMUM TIMEOUTS FOR EVERYTHING
  staticPageGenerationTimeout: 86400, // 24 HOURS

  // Fix CSS loading issues in Next.js 15
  webpack: (config, { isServer }) => {
    // Ensure CSS is properly handled
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // Increase Node.js timeouts
    if (isServer) {
      config.externals = [...(config.externals || []), "openai"];
    }

    return config;
  },

  // Next.js 15 performance optimizations
  experimental: {
    optimizeCss: false,
    // Increase worker timeout
    workerThreads: false,
    cpus: 1,
  },

  // Server external packages (moved from experimental)
  serverExternalPackages: ["openai"],

  // MAXIMUM SERVER TIMEOUTS
  httpAgentOptions: {
    keepAlive: true,
  },

  // Development server configuration
  devIndicators: {
    position: "bottom-right",
  },

  // Increase all possible timeouts
  onDemandEntries: {
    maxInactiveAge: 604800000, // 7 days
    pagesBufferLength: 100,
  },
};

module.exports = nextConfig;
