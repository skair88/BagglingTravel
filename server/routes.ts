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
        console.log("Fallback to static locations data for query:", query);
        
        // Static locations with language support
        const getStaticLocations = (lang: string) => {
          const locations = {
            'en': [
              { placeName: 'Moscow, Russia', lat: 55.7558, lng: 37.6173 },
              { placeName: 'New York, NY, USA', lat: 40.7128, lng: -74.0060 },
              { placeName: 'Paris, France', lat: 48.8566, lng: 2.3522 },
              { placeName: 'London, UK', lat: 51.5074, lng: -0.1278 },
              { placeName: 'Berlin, Germany', lat: 52.5200, lng: 13.4050 },
              { placeName: 'Rome, Italy', lat: 41.9028, lng: 12.4964 },
              { placeName: 'Madrid, Spain', lat: 40.4168, lng: -3.7038 },
          { placeName: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
              { placeName: 'Beijing, China', lat: 39.9042, lng: 116.4074 },
              { placeName: 'Sydney, Australia', lat: -33.8688, lng: 151.2093 }
            ],
            'ru': [
              { placeName: 'Москва, Россия', lat: 55.7558, lng: 37.6173 },
              { placeName: 'Нью-Йорк, США', lat: 40.7128, lng: -74.0060 },
              { placeName: 'Париж, Франция', lat: 48.8566, lng: 2.3522 },
              { placeName: 'Лондон, Великобритания', lat: 51.5074, lng: -0.1278 },
              { placeName: 'Берлин, Германия', lat: 52.5200, lng: 13.4050 },
              { placeName: 'Рим, Италия', lat: 41.9028, lng: 12.4964 },
              { placeName: 'Мадрид, Испания', lat: 40.4168, lng: -3.7038 },
              { placeName: 'Токио, Япония', lat: 35.6762, lng: 139.6503 },
              { placeName: 'Пекин, Китай', lat: 39.9042, lng: 116.4074 },
              { placeName: 'Сидней, Австралия', lat: -33.8688, lng: 151.2093 }
            ]
          };
          return locations[lang as keyof typeof locations] || locations['en'];
        };
        
        const staticLocations = getStaticLocations(language as string);
        
        // Filter locations by query term (case insensitive)
        const queryLower = (query as string).toLowerCase();
        locations = staticLocations.filter(loc => 
          loc.placeName.toLowerCase().includes(queryLower)
        );
        
        // If no matches found, return top 5 locations
        if (locations.length === 0) {
          locations = staticLocations.slice(0, 5);
        }
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
          // Fallback to static data in case of error
          locations = [
            { placeName: 'Moscow, Russia', lat: 55.7558, lng: 37.6173 },
            { placeName: 'New York, NY, USA', lat: 40.7128, lng: -74.0060 },
            { placeName: 'London, UK', lat: 51.5074, lng: -0.1278 }
          ];
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
