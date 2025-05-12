// Client-side local storage implementation for offline functionality

import { Trip, Item, Category, TripWeather, Settings } from '@shared/schema';

// Storage keys
const STORAGE_KEYS = {
  TRIPS: 'baggle_trips',
  ITEMS: 'baggle_items',
  CATEGORIES: 'baggle_categories',
  WEATHER: 'baggle_weather',
  SETTINGS: 'baggle_settings'
};

// LocalStorage wrapper with type safety
class LocalStorage {
  // Trips
  getTrips(): Trip[] {
    const trips = localStorage.getItem(STORAGE_KEYS.TRIPS);
    return trips ? JSON.parse(trips) : [];
  }
  
  saveTrips(trips: Trip[]): void {
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
  }
  
  addTrip(trip: Trip): Trip {
    const trips = this.getTrips();
    trips.push(trip);
    this.saveTrips(trips);
    return trip;
  }
  
  updateTrip(tripId: number, updatedTrip: Partial<Trip>): Trip | undefined {
    const trips = this.getTrips();
    const index = trips.findIndex(t => t.id === tripId);
    
    if (index === -1) return undefined;
    
    trips[index] = { ...trips[index], ...updatedTrip };
    this.saveTrips(trips);
    return trips[index];
  }
  
  deleteTrip(tripId: number): boolean {
    const trips = this.getTrips();
    const filteredTrips = trips.filter(t => t.id !== tripId);
    
    if (filteredTrips.length === trips.length) return false;
    
    this.saveTrips(filteredTrips);
    return true;
  }
  
  // Items
  getItems(): Item[] {
    const items = localStorage.getItem(STORAGE_KEYS.ITEMS);
    return items ? JSON.parse(items) : [];
  }
  
  saveItems(items: Item[]): void {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  }
  
  getItemsByTripId(tripId: number): Item[] {
    return this.getItems().filter(item => item.tripId === tripId);
  }
  
  addItem(item: Item): Item {
    const items = this.getItems();
    items.push(item);
    this.saveItems(items);
    return item;
  }
  
  updateItem(itemId: number, updatedItem: Partial<Item>): Item | undefined {
    const items = this.getItems();
    const index = items.findIndex(i => i.id === itemId);
    
    if (index === -1) return undefined;
    
    items[index] = { ...items[index], ...updatedItem };
    this.saveItems(items);
    return items[index];
  }
  
  deleteItem(itemId: number): boolean {
    const items = this.getItems();
    const filteredItems = items.filter(i => i.id !== itemId);
    
    if (filteredItems.length === items.length) return false;
    
    this.saveItems(filteredItems);
    return true;
  }
  
  // Categories
  getCategories(): Category[] {
    const categories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return categories ? JSON.parse(categories) : [];
  }
  
  saveCategories(categories: Category[]): void {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }
  
  // Weather
  getWeather(): TripWeather[] {
    const weather = localStorage.getItem(STORAGE_KEYS.WEATHER);
    return weather ? JSON.parse(weather) : [];
  }
  
  saveWeather(weather: TripWeather[]): void {
    localStorage.setItem(STORAGE_KEYS.WEATHER, JSON.stringify(weather));
  }
  
  getWeatherByTripId(tripId: number): TripWeather[] {
    return this.getWeather().filter(w => w.tripId === tripId);
  }
  
  addWeather(weather: TripWeather): TripWeather {
    const allWeather = this.getWeather();
    allWeather.push(weather);
    this.saveWeather(allWeather);
    return weather;
  }
  
  // Settings
  getSettings(): Settings | null {
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : null;
  }
  
  saveSettings(settings: Settings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }
  
  // Clear all data
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEYS.TRIPS);
    localStorage.removeItem(STORAGE_KEYS.ITEMS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.WEATHER);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  }
  
  // Calculate storage size
  getStorageSize(): number {
    let totalSize = 0;
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += item.length * 2; // approximate size in bytes (2 bytes per character)
      }
    });
    return totalSize;
  }
}

// Create and export a singleton instance
export const localStorage = new LocalStorage();
