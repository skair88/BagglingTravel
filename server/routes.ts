import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertTripSchema, 
  insertItemSchema, 
  insertSettingsSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Trips API
  app.get("/api/trips", async (req, res) => {
    try {
      const trips = await storage.getTrips();
      res.json(trips);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trips" });
    }
  });
  
  app.get("/api/trips/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const trip = await storage.getTripById(id);
      
      if (!trip) {
        return res.status(404).json({ error: "Trip not found" });
      }
      
      res.json(trip);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trip" });
    }
  });
  
  app.post("/api/trips", async (req, res) => {
    try {
      const parseResult = insertTripSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.format() });
      }
      
      const newTrip = await storage.createTrip(parseResult.data);
      res.status(201).json(newTrip);
    } catch (error) {
      res.status(500).json({ error: "Failed to create trip" });
    }
  });
  
  app.patch("/api/trips/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const trip = await storage.getTripById(id);
      
      if (!trip) {
        return res.status(404).json({ error: "Trip not found" });
      }
      
      const updatedTrip = await storage.updateTrip(id, req.body);
      res.json(updatedTrip);
    } catch (error) {
      res.status(500).json({ error: "Failed to update trip" });
    }
  });
  
  app.delete("/api/trips/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTrip(id);
      
      if (!success) {
        return res.status(404).json({ error: "Trip not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete trip" });
    }
  });
  
  // Trip weather API
  app.get("/api/trips/:id/weather", async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const weather = await storage.getTripWeather(tripId);
      res.json(weather);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weather" });
    }
  });
  
  // Items API
  app.get("/api/trips/:id/items", async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const items = await storage.getItemsByTripId(tripId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch items" });
    }
  });
  
  app.post("/api/items", async (req, res) => {
    try {
      const parseResult = insertItemSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.format() });
      }
      
      const newItem = await storage.createItem(parseResult.data);
      res.status(201).json(newItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to create item" });
    }
  });
  
  app.patch("/api/items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedItem = await storage.updateItem(id, req.body);
      
      if (!updatedItem) {
        return res.status(404).json({ error: "Item not found" });
      }
      
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to update item" });
    }
  });
  
  app.delete("/api/items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteItem(id);
      
      if (!success) {
        return res.status(404).json({ error: "Item not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete item" });
    }
  });
  
  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });
  
  // Settings API
  app.get("/api/settings/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const settings = await storage.getSettings(userId);
      
      if (!settings) {
        return res.status(404).json({ error: "Settings not found" });
      }
      
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });
  
  app.post("/api/settings", async (req, res) => {
    try {
      const parseResult = insertSettingsSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.format() });
      }
      
      const newSettings = await storage.createSettings(parseResult.data);
      res.status(201).json(newSettings);
    } catch (error) {
      res.status(500).json({ error: "Failed to create settings" });
    }
  });
  
  app.patch("/api/settings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedSettings = await storage.updateSettings(id, req.body);
      
      if (!updatedSettings) {
        return res.status(404).json({ error: "Settings not found" });
      }
      
      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });
  
  // Item Templates API
  app.get("/api/item-templates", async (req, res) => {
    try {
      const templates = await storage.getItemTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch item templates" });
    }
  });
  
  // Generate packing list based on trip data
  app.post("/api/trips/:id/generate-packing-list", async (req, res) => {
    try {
      const tripId = parseInt(req.params.id);
      const trip = await storage.getTripById(tripId);
      
      if (!trip) {
        return res.status(404).json({ error: "Trip not found" });
      }
      
      // Get all item templates
      const templates = await storage.getItemTemplates();
      
      // Filter templates based on trip purpose, activities, and weather
      const filteredTemplates = templates.filter(template => {
        // Match by purpose
        const purposeMatch = !template.forPurpose.length || 
                             template.forPurpose.includes(trip.purpose || '');
                             
        // Match by activities
        const activityMatch = !template.forActivity.length || 
                              template.forActivity.some(activity => 
                                trip.activities?.includes(activity));
                                
        // For weather, we would normally check the actual weather data
        // but for simplicity, we'll match all for now
        const weatherMatch = true;
        
        return purposeMatch && activityMatch && weatherMatch;
      });
      
      // Create items based on filtered templates
      const createdItems = [];
      for (const template of filteredTemplates) {
        const item = await storage.createItem({
          tripId,
          name: template.name,
          categoryId: template.categoryId,
          isPacked: false,
          quantity: 1,
          isCustom: false
        });
        createdItems.push(item);
      }
      
      res.status(201).json(createdItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate packing list" });
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
