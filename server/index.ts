import express from "express";
import { createServer } from "http";
import { setupVite, serveStatic, log } from "./vite";

// Client-only version - Simplified server just for development
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
  });
  next();
});

(async () => {
  // Create HTTP server
  const server = createServer(app);
  
  // Simple API response for healthcheck
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", version: "1.0.0", mode: "client-only" });
  });

  // Setup Vite for development
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Start the server
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
