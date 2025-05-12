import { z } from "zod";

// Trip interface
export interface Trip {
  id: number;
  destination: string;
  location: { lat: number; lng: number };
  startDate: Date;
  endDate: Date;
  purpose: string;
  activities: string[];
  createdAt: Date;
  progress: number;
}

// Weather data for trips
export interface TripWeather {
  id: number;
  tripId: number;
  date: Date;
  temperature: number;
  condition: string;
  icon: string;
}

// Categories for packing items
export interface Category {
  id: number;
  name: string;
}

// Items for packing lists
export interface Item {
  id: number;
  tripId: number;
  name: string;
  categoryId: number;
  isPacked: boolean;
  quantity: number;
  isCustom: boolean;
}

// Settings interface
export interface Settings {
  darkMode: boolean;
  language: string;
}

// Trip creation data
export interface TripCreationData {
  destination: string;
  location: { lat: number; lng: number };
  startDate: Date;
  endDate: Date;
  purpose: string;
  activities: string[];
}

// Validation schemas
export const tripSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  startDate: z.date(),
  endDate: z.date(),
  purpose: z.string().optional(),
  activities: z.array(z.string()).optional(),
});

export const itemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  categoryId: z.number(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  isPacked: z.boolean().default(false),
  isCustom: z.boolean().default(false),
});
