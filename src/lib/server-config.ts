/**
 * Global Server Configuration for MASSIVE TIMEOUTS
 * This file configures all server-level timeouts to maximum values
 */

import http from "http";
import https from "https";

// 30 DAYS timeout for EVERYTHING
const MASSIVE_TIMEOUT = 2592000000; // 30 days in milliseconds

// Note: Server timeouts are configured in server.js at runtime
// This file only configures global HTTP/HTTPS agents

// Override global HTTP/HTTPS agents
http.globalAgent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 5000, // 5 seconds
  timeout: MASSIVE_TIMEOUT,
  maxSockets: Infinity,
  maxFreeSockets: 256,
});

https.globalAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 5000, // 5 seconds
  timeout: MASSIVE_TIMEOUT,
  maxSockets: Infinity,
  maxFreeSockets: 256,
  rejectUnauthorized: true,
});

// Log configuration
console.log("[Server Config] MASSIVE TIMEOUTS CONFIGURED:", {
  timeout: `${MASSIVE_TIMEOUT / 1000 / 60 / 60 / 24} days`,
  keepAlive: "enabled",
  maxSockets: "unlimited",
});

// Set process max listeners to prevent warnings
if (typeof process !== "undefined") {
  process.setMaxListeners(0); // Unlimited
}

// Export for use in other modules
export const serverConfig = {
  timeout: MASSIVE_TIMEOUT,
  keepAliveTimeout: MASSIVE_TIMEOUT,
  headersTimeout: MASSIVE_TIMEOUT,
  requestTimeout: MASSIVE_TIMEOUT,
};
