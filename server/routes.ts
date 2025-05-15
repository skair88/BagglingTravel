import type { Express } from "express";
import { createServer, type Server } from "http";
// Client-only version - no database operations needed
import { z } from "zod";
import fetch from "node-fetch";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple API routes for client-only mode
  app.get("/api/version", (_req, res) => {
    res.json({ 
      version: "1.0.0", 
      name: "Baggle", 
      description: "Travel packing assistant (client-only version)" 
    });
  });

  // Proxy API for Mapbox geocoding
  app.get("/api/mapbox/geocoding", async (req, res) => {
    const query = req.query.query;
    const limit = req.query.limit || 5;
    const language = req.query.language || 'en';
    
    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter' });
    }
    
    try {
      const mapboxApiKey = process.env.MAPBOX_API_KEY;
      
      if (!mapboxApiKey) {
        return res.status(500).json({ error: 'Mapbox API key not configured' });
      }
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query as string
        )}.json?access_token=${mapboxApiKey}&limit=${limit}&language=${language}`
      );
      
      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.statusText}`);
      }
      
      // Parse response and cast to any to avoid TypeScript issues
      const rawData = await response.json();
      const data = rawData as { features?: any[] };
      
      // Transform the response to match our expected format
      const locations = (data.features || []).map(feature => ({
        placeName: feature.place_name,
        lat: feature.center[1], // Mapbox returns [longitude, latitude]
        lng: feature.center[0]
      }));
      
      res.json(locations);
    } catch (error) {
      console.error('Error proxying Mapbox request:', error);
      res.status(500).json({ error: 'Failed to fetch locations from Mapbox' });
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
