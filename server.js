/**
 * Custom Next.js Server with MASSIVE TIMEOUTS
 * Use this instead of 'pnpm dev' for O3 testing
 */

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// MASSIVE TIMEOUTS - 30 DAYS!
const MASSIVE_TIMEOUT = 2592000000; // 30 days in milliseconds

console.log("[CUSTOM SERVER] Starting with MASSIVE timeouts:");
console.log(`- Timeout: ${MASSIVE_TIMEOUT / 1000 / 60 / 60 / 24} DAYS`);
console.log(`- Keep-alive: ${MASSIVE_TIMEOUT / 1000 / 60 / 60 / 24} DAYS`);
console.log(`- Headers timeout: ${MASSIVE_TIMEOUT / 1000 / 60 / 60 / 24} DAYS`);

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("[CUSTOM SERVER] Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Configure ALL server timeouts to MAXIMUM
  server.timeout = MASSIVE_TIMEOUT;
  server.keepAliveTimeout = MASSIVE_TIMEOUT;
  server.headersTimeout = MASSIVE_TIMEOUT;
  server.requestTimeout = MASSIVE_TIMEOUT;

  // Set socket timeout
  server.on("connection", (socket) => {
    socket.setTimeout(MASSIVE_TIMEOUT);
    socket.setKeepAlive(true, 5000); // Keep-alive every 5 seconds
    socket.setNoDelay(true); // Disable Nagle's algorithm

    console.log(
      "[CUSTOM SERVER] New connection established with 30-day timeout",
    );
  });

  // Handle server timeout events
  server.on("timeout", (socket) => {
    console.error(
      "[CUSTOM SERVER] TIMEOUT EVENT - This should NEVER happen with 30-day timeout!",
    );
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`[CUSTOM SERVER] Ready on http://${hostname}:${port}`);
    console.log("[CUSTOM SERVER] All timeouts set to 30 DAYS - NO LIMITS!");
  });
});
