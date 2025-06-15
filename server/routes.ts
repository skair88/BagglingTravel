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
  app.get("/api/geocode", async (req, res) => {
    console.log("Received geocoding request:", {
      query: req.query.query,
      limit: req.query.limit,
      language: req.query.language
    });
    
    const query = req.query.query;
    const limit = req.query.limit || 5;
    const language = req.query.language || 'en';
    
    if (!query) {
      console.log("Request rejected: missing query parameter");
      return res.status(400).json({ error: 'Missing query parameter' });
    }
    
    try {
      const mapboxApiKey = process.env.MAPBOX_API_KEY;
      console.log("Server side API key availability:", {
        keyExists: !!mapboxApiKey,
        keyPrefix: mapboxApiKey ? mapboxApiKey.substring(0, 4) + "..." : "N/A"
      });
      
      let locations = [];
      
      if (!mapboxApiKey) {
        console.log("No Mapbox API key available");
        console.log("Environment check:", {
          NODE_ENV: process.env.NODE_ENV,
          hasMapboxKey: !!process.env.MAPBOX_API_KEY
        });
        return res.status(500).json({ error: 'Mapbox API key not configured' });
      } else {
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
              query as string
            )}.json?access_token=${mapboxApiKey}&limit=${limit}&language=${language}`
          );
          
          const responseText = await response.text();
          
          if (!response.ok) {
            console.error("Mapbox API error response:", responseText);
            return res.status(response.status).json({ 
              error: `Mapbox API error: ${response.statusText}`,
              details: responseText
            });
          }
          
          // Parse response and cast to any to avoid TypeScript issues
          const rawData = JSON.parse(responseText);
          const data = rawData as { features?: any[] };
          
          // Transform the response to match our expected format
          locations = (data.features || []).map(feature => ({
            placeName: feature.place_name,
            lat: feature.center[1], // Mapbox returns [longitude, latitude]
            lng: feature.center[0]
          }));
        } catch (error) {
          console.error("Mapbox API error:", error);
          return res.status(500).json({ error: 'Failed to fetch locations from Mapbox API' });
        }
      }
      
      res.json(locations);
    } catch (error) {
      console.error('Error proxying Mapbox request:', error);
      res.status(500).json({ error: 'Failed to fetch locations from Mapbox' });
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
