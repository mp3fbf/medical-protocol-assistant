/**
 * Server-wide timeout configurations for O3 testing
 *
 * This file configures maximum timeouts across the entire application
 * to support long-running O3 model requests.
 */

// Configure Node.js HTTP/HTTPS agents globally
if (
  typeof process !== "undefined" &&
  process.versions &&
  process.versions.node
) {
  const http = require("http");
  const https = require("https");

  // Maximum server timeouts (7 days)
  const MAX_TIMEOUT = 604800000; // 7 days in milliseconds
  const KEEP_ALIVE_TIMEOUT = 86400000; // 24 hours

  // Configure HTTP agent
  http.globalAgent.keepAlive = true;
  http.globalAgent.keepAliveMsecs = 30000; // 30 seconds
  http.globalAgent.timeout = MAX_TIMEOUT;
  http.globalAgent.maxSockets = Infinity;
  http.globalAgent.maxFreeSockets = 256;

  // Configure HTTPS agent
  https.globalAgent.keepAlive = true;
  https.globalAgent.keepAliveMsecs = 30000; // 30 seconds
  https.globalAgent.timeout = MAX_TIMEOUT;
  https.globalAgent.maxSockets = Infinity;
  https.globalAgent.maxFreeSockets = 256;

  // Set server timeouts if running in a server context
  if (global.server) {
    global.server.timeout = MAX_TIMEOUT;
    global.server.keepAliveTimeout = KEEP_ALIVE_TIMEOUT;
    global.server.headersTimeout = KEEP_ALIVE_TIMEOUT + 5000; // Slightly higher than keepAlive
    global.server.requestTimeout = MAX_TIMEOUT;
  }

  console.log("[TIMEOUT CONFIG] Maximum timeouts configured:");
  console.log(`- HTTP/HTTPS timeout: ${MAX_TIMEOUT}ms (7 days)`);
  console.log(`- Keep-alive timeout: ${KEEP_ALIVE_TIMEOUT}ms (24 hours)`);
  console.log(`- Max sockets: Infinity`);
}

// Export timeout constants for use in other modules
export const SERVER_TIMEOUTS = {
  MAX_REQUEST_TIMEOUT: 604800000, // 7 days
  KEEP_ALIVE_TIMEOUT: 86400000, // 24 hours
  HEADERS_TIMEOUT: 86405000, // 24 hours + 5 seconds
  SOCKET_TIMEOUT: 604800000, // 7 days
  DEFAULT_TIMEOUT: 86400000, // 24 hours
};

// Vercel-specific timeout (Pro plan limit)
export const VERCEL_MAX_DURATION = 300; // 5 minutes (300 seconds)

// Client-side fetch timeout recommendations
export const CLIENT_TIMEOUTS = {
  STANDARD_REQUEST: 86400000, // 24 hours
  LARGE_REQUEST: 172800000, // 48 hours
  O3_REQUEST: 604800000, // 7 days
};
