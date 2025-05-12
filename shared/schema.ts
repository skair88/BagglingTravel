import { pgTable, text, serial, integer, boolean, date, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Trip table
export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  destination: text("destination").notNull(),
  location: json("location").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  purpose: text("purpose"),
  activities: text("activities").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTripSchema = createInsertSchema(trips).omit({
  id: true,
  createdAt: true,
});

export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;

// Weather data for trips
export const tripWeather = pgTable("trip_weather", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").references(() => trips.id),
  date: date("date").notNull(),
  temperature: integer("temperature").notNull(),
  condition: text("condition").notNull(),
  icon: text("icon").notNull(),
});

export const insertTripWeatherSchema = createInsertSchema(tripWeather).omit({
  id: true,
});

export type InsertTripWeather = z.infer<typeof insertTripWeatherSchema>;
export type TripWeather = typeof tripWeather.$inferSelect;

// Categories for packing items
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Items for packing lists
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").references(() => trips.id),
  name: text("name").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  isPacked: boolean("is_packed").default(false),
  quantity: integer("quantity").default(1),
  isCustom: boolean("is_custom").default(false),
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
});

export type InsertItem = z.infer<typeof insertItemSchema>;
export type Item = typeof items.$inferSelect;

// Settings table for user preferences
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  darkMode: boolean("dark_mode").default(false),
  offlineMode: boolean("offline_mode").default(true),
  language: text("language").default("English"),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

// Common item templates for generating packing lists
export const itemTemplates = pgTable("item_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  forPurpose: text("for_purpose").array(),
  forActivity: text("for_activity").array(),
  forWeather: text("for_weather").array(),
});

export const insertItemTemplateSchema = createInsertSchema(itemTemplates).omit({
  id: true,
});

export type InsertItemTemplate = z.infer<typeof insertItemTemplateSchema>;
export type ItemTemplate = typeof itemTemplates.$inferSelect;
