/**
 * Global HTTP/HTTPS Agent Configuration for Maximum Timeouts
 *
 * This module configures global HTTP agents with maximum timeouts
 * to support long-running O3 model requests throughout the application.
 */

import http from "http";
import https from "https";

// ABSOLUTELY MASSIVE TIMEOUT VALUES - NO LIMITS!
export const HTTP_TIMEOUTS = {
  SOCKET_TIMEOUT: 2592000000, // 30 DAYS!
  KEEP_ALIVE_TIMEOUT: 2592000000, // 30 DAYS!
  REQUEST_TIMEOUT: 2592000000, // 30 DAYS!
  IDLE_TIMEOUT: 2592000000, // 30 DAYS!
  HEADERS_TIMEOUT: 2592000000, // 30 DAYS!
};

console.log("[HTTP CONFIG] MASSIVE TIMEOUTS ENABLED:", {
  days: HTTP_TIMEOUTS.SOCKET_TIMEOUT / 1000 / 60 / 60 / 24,
  hours: HTTP_TIMEOUTS.SOCKET_TIMEOUT / 1000 / 60 / 60,
  minutes: HTTP_TIMEOUTS.SOCKET_TIMEOUT / 1000 / 60,
  seconds: HTTP_TIMEOUTS.SOCKET_TIMEOUT / 1000,
});

// Create custom HTTP agent with maximum timeouts
export const httpAgent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 5000, // Send keep-alive every 5 seconds - ULTRA AGGRESSIVE!
  timeout: HTTP_TIMEOUTS.SOCKET_TIMEOUT,
  maxSockets: Infinity,
  maxFreeSockets: 256,
  scheduling: "fifo",
});

// Create custom HTTPS agent with maximum timeouts
export const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 5000, // Send keep-alive every 5 seconds - ULTRA AGGRESSIVE!
  timeout: HTTP_TIMEOUTS.SOCKET_TIMEOUT,
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
    "[HTTP CONFIG] Global HTTP/HTTPS agents configured with MASSIVE timeouts:",
  );
  console.log(`- Socket timeout: ${HTTP_TIMEOUTS.SOCKET_TIMEOUT}ms (30 DAYS!)`);
  console.log(
    `- Keep-alive timeout: ${HTTP_TIMEOUTS.KEEP_ALIVE_TIMEOUT}ms (30 DAYS!)`,
  );
  console.log(`- Max sockets: Infinity (NO LIMITS!)`);
  console.log(`- Keep-alive interval: 5 seconds (ULTRA AGGRESSIVE!)`);

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
