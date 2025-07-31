/**
 * Global HTTP/HTTPS Agent Configuration for Maximum Timeouts
 *
 * This module configures global HTTP agents with maximum timeouts
 * to support long-running O3 model requests throughout the application.
 */

import http from "http";
import https from "https";

// Maximum safe timeout for Node.js (24.8 days to avoid int32 overflow)
const MAX_SAFE_TIMEOUT = 2147483647; // Max int32 value in ms

export const HTTP_TIMEOUTS = {
  SOCKET_TIMEOUT: MAX_SAFE_TIMEOUT, // ~24.8 days
  KEEP_ALIVE_TIMEOUT: MAX_SAFE_TIMEOUT, // ~24.8 days
  REQUEST_TIMEOUT: MAX_SAFE_TIMEOUT, // ~24.8 days
  IDLE_TIMEOUT: MAX_SAFE_TIMEOUT, // ~24.8 days
  HEADERS_TIMEOUT: MAX_SAFE_TIMEOUT, // ~24.8 days
};

console.log("[HTTP CONFIG] Maximum safe timeouts configured:", {
  days: (HTTP_TIMEOUTS.SOCKET_TIMEOUT / 1000 / 60 / 60 / 24).toFixed(1),
  hours: Math.floor(HTTP_TIMEOUTS.SOCKET_TIMEOUT / 1000 / 60 / 60),
});

// Create custom HTTP agent with maximum timeouts
export const httpAgent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 5000, // Send keep-alive every 5 seconds - ULTRA AGGRESSIVE!
  timeout: MAX_SAFE_TIMEOUT,
  maxSockets: Infinity,
  maxFreeSockets: 256,
  scheduling: "fifo",
});

// Create custom HTTPS agent with maximum timeouts
export const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 5000, // Send keep-alive every 5 seconds - ULTRA AGGRESSIVE!
  timeout: MAX_SAFE_TIMEOUT,
  maxSockets: Infinity,
  maxFreeSockets: 256,
  scheduling: "fifo",
  rejectUnauthorized: process.env.NODE_ENV === "production",
});

// Set global agents as defaults
http.globalAgent = httpAgent;
https.globalAgent = httpsAgent;

// Configure Node.js server timeouts if available
if (
  typeof process !== "undefined" &&
  process.versions &&
  process.versions.node
) {
  // Log configuration
  console.log(
    "[HTTP CONFIG] Global HTTP/HTTPS agents configured",
  );
  console.log(`- Socket timeout: ${(HTTP_TIMEOUTS.SOCKET_TIMEOUT / 1000 / 60).toFixed(0)} minutes`);
  console.log(`- Keep-alive interval: 5 seconds`);

  // Additional server configuration if running in server context
  if ((global as any).server) {
    const server = (global as any).server;
    server.timeout = HTTP_TIMEOUTS.REQUEST_TIMEOUT;
    server.keepAliveTimeout = HTTP_TIMEOUTS.KEEP_ALIVE_TIMEOUT;
    server.headersTimeout = HTTP_TIMEOUTS.HEADERS_TIMEOUT;
    server.requestTimeout = HTTP_TIMEOUTS.REQUEST_TIMEOUT;
    console.log("[HTTP CONFIG] Server timeouts configured");
  }
}

// Export configured agents for use in other modules
const httpConfigExport = {
  httpAgent,
  httpsAgent,
  timeouts: HTTP_TIMEOUTS,
};

export default httpConfigExport;
