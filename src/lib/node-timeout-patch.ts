/**
 * Node.js Core Timeout Patch
 * This patches the Node.js core to use MASSIVE timeouts
 */

import http from "http";
import https from "https";
import net from "net";

const MASSIVE_TIMEOUT = 2592000000; // 30 DAYS!

console.log("[NODE PATCH] Patching Node.js core with MASSIVE timeouts...");

// Patch http.request
const originalHttpRequest = http.request;
// @ts-ignore
http.request = function (...args: any[]) {
  // @ts-ignore - applying args array to original function
  const req = originalHttpRequest.apply(this, args as any);
  req.setTimeout(MASSIVE_TIMEOUT);
  req.socket?.setTimeout(MASSIVE_TIMEOUT);
  return req;
};

// Patch https.request
const originalHttpsRequest = https.request;
// @ts-ignore
https.request = function (...args: any[]) {
  // @ts-ignore - applying args array to original function
  const req = originalHttpsRequest.apply(this, args as any);
  req.setTimeout(MASSIVE_TIMEOUT);
  req.socket?.setTimeout(MASSIVE_TIMEOUT);
  return req;
};

// Patch net.Socket
const originalSocketSetTimeout = net.Socket.prototype.setTimeout;
net.Socket.prototype.setTimeout = function (
  timeout: number,
  callback?: () => void,
) {
  // Force MASSIVE timeout
  console.log(
    `[NODE PATCH] Socket.setTimeout called with ${timeout}ms, forcing ${MASSIVE_TIMEOUT}ms`,
  );
  return originalSocketSetTimeout.call(this, MASSIVE_TIMEOUT, callback);
};

// Patch server default timeout
const originalCreateServer = http.createServer;
// @ts-ignore
http.createServer = function (...args: any[]) {
  // @ts-ignore - applying args array to original function
  const server = originalCreateServer.apply(this, args as any);
  server.timeout = MASSIVE_TIMEOUT;
  server.keepAliveTimeout = MASSIVE_TIMEOUT;
  server.headersTimeout = MASSIVE_TIMEOUT;
  server.requestTimeout = MASSIVE_TIMEOUT;
  return server;
};

// Same for HTTPS
const originalCreateHttpsServer = https.createServer;
// @ts-ignore
https.createServer = function (...args: any[]) {
  // @ts-ignore - applying args array to original function
  const server = originalCreateHttpsServer.apply(this, args as any);
  server.timeout = MASSIVE_TIMEOUT;
  server.keepAliveTimeout = MASSIVE_TIMEOUT;
  server.headersTimeout = MASSIVE_TIMEOUT;
  server.requestTimeout = MASSIVE_TIMEOUT;
  return server;
};

console.log("[NODE PATCH] Node.js core patched successfully!");

export const nodePatch = {
  timeout: MASSIVE_TIMEOUT,
  applied: true,
};
