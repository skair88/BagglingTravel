import type { Express } from "express";
import { createServer, type Server } from "http";
// Client-only version - no database operations needed
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple API routes for client-only mode
  app.get("/api/version", (_req, res) => {
    res.json({ 
      version: "1.0.0", 
      name: "Baggle", 
      description: "Travel packing assistant (client-only version)" 
    });
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
