// Client-side local storage implementation 

// Define our data models directly here
export interface Trip {
  id: number;
  destination: string;
  startDate: Date;
  endDate: Date;
  purpose: string;
  activities: string[];
  packedPercentage: number;
  createdAt: Date;
}

export interface Item {
  id: number;
  tripId: number;
  name: string;
  categoryId: number;
  isPacked: boolean;
  quantity: number;
  isCustom: boolean;
}

export interface Category {
  id: number;
  name: string;
}

export interface TripWeather {
  id: number;
  tripId: number;
  date: Date;
  temperature: number;
  condition: string;
  icon: string;
}

export interface Settings {
  id: number;
  darkMode: boolean;
  language: string;
}

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
  private nextTripId: number;
  private nextItemId: number;
  private nextCategoryId: number;
  private nextWeatherId: number;

  constructor() {
    // Initialize counters for IDs
    this.nextTripId = this.getHighestId(this.getTrips()) + 1;
    this.nextItemId = this.getHighestId(this.getItems()) + 1;
    this.nextCategoryId = this.getHighestId(this.getCategories()) + 1;
    this.nextWeatherId = this.getHighestId(this.getWeather()) + 1;
    
    // Initialize with default data if empty
    this.initializeDefaultData();
  }

  private getHighestId<T extends {id: number}>(items: T[]): number {
    if (items.length === 0) return 0;
    return Math.max(...items.map(item => item.id));
  }

  private initializeDefaultData(): void {
    // Initialize with default categories if none exist
    if (this.getCategories().length === 0) {
      const defaultCategories: Category[] = [
        { id: 1, name: 'Essentials' },
        { id: 2, name: 'Clothing' },
        { id: 3, name: 'Toiletries' },
        { id: 4, name: 'Electronics' },
        { id: 5, name: 'Documents' }
      ];
      this.saveCategories(defaultCategories);
      this.nextCategoryId = 6;
    }

    // Initialize with default settings if none exist
    if (!this.getSettings()) {
      const defaultSettings: Settings = {
        id: 1,
        darkMode: false,
        language: 'English'
      };
      this.saveSettings(defaultSettings);
    }
  }

  // Trips
  getTrips(): Trip[] {
    const tripsStr = window.localStorage.getItem(STORAGE_KEYS.TRIPS);
    if (!tripsStr) return [];
    
    const trips = JSON.parse(tripsStr);
    // Convert string dates back to Date objects
    return trips.map((trip: any) => ({
      ...trip,
      startDate: new Date(trip.startDate),
      endDate: new Date(trip.endDate),
      createdAt: new Date(trip.createdAt)
    }));
  }
  
  saveTrips(trips: Trip[]): void {
    window.localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
  }
  
  addTrip(trip: Omit<Trip, 'id' | 'createdAt'>): Trip {
    const id = this.nextTripId++;
    const newTrip: Trip = { 
      ...trip, 
      id, 
      createdAt: new Date(),
      packedPercentage: 0 // Initialize with 0%
    };
    
    const trips = this.getTrips();
    trips.push(newTrip);
    this.saveTrips(trips);
    return newTrip;
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
    
    // Also delete all items and weather data for this trip
    const items = this.getItems();
    const filteredItems = items.filter(i => i.tripId !== tripId);
    this.saveItems(filteredItems);
    
    const weather = this.getWeather();
    const filteredWeather = weather.filter(w => w.tripId !== tripId);
    this.saveWeather(filteredWeather);
    
    return true;
  }
  
  // Items
  getItems(): Item[] {
    const itemsStr = window.localStorage.getItem(STORAGE_KEYS.ITEMS);
    return itemsStr ? JSON.parse(itemsStr) : [];
  }
  
  saveItems(items: Item[]): void {
    window.localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  }
  
  getItemsByTripId(tripId: number): Item[] {
    return this.getItems().filter(item => item.tripId === tripId);
  }
  
  addItem(item: Omit<Item, 'id'>): Item {
    const id = this.nextItemId++;
    const newItem: Item = { ...item, id };
    
    const items = this.getItems();
    items.push(newItem);
    this.saveItems(items);
    
    // Update trip packed percentage
    this.recalculateTripPackingPercentage(item.tripId);
    
    return newItem;
  }
  
  updateItem(itemId: number, updatedItem: Partial<Item>): Item | undefined {
    const items = this.getItems();
    const index = items.findIndex(i => i.id === itemId);
    
    if (index === -1) return undefined;
    
    items[index] = { ...items[index], ...updatedItem };
    this.saveItems(items);
    
    // Update trip packed percentage if isPacked changed
    if ('isPacked' in updatedItem) {
      this.recalculateTripPackingPercentage(items[index].tripId);
    }
    
    return items[index];
  }
  
  deleteItem(itemId: number): boolean {
    const items = this.getItems();
    const index = items.findIndex(i => i.id === itemId);
    
    if (index === -1) return false;
    
    const tripId = items[index].tripId;
    const filteredItems = items.filter(i => i.id !== itemId);
    
    if (filteredItems.length === items.length) return false;
    
    this.saveItems(filteredItems);
    
    // Update trip packed percentage
    this.recalculateTripPackingPercentage(tripId);
    
    return true;
  }
  
  // Helper to recalculate packing percentage for a trip
  recalculateTripPackingPercentage(tripId: number): void {
    const tripItems = this.getItemsByTripId(tripId);
    
    if (tripItems.length === 0) {
      this.updateTrip(tripId, { packedPercentage: 0 });
      return;
    }
    
    const packedItems = tripItems.filter(item => item.isPacked);
    const percentage = Math.round((packedItems.length / tripItems.length) * 100);
    
    this.updateTrip(tripId, { packedPercentage: percentage });
  }
  
  // Categories
  getCategories(): Category[] {
    const categoriesStr = window.localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return categoriesStr ? JSON.parse(categoriesStr) : [];
  }
  
  saveCategories(categories: Category[]): void {
    window.localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }
  
  addCategory(name: string): Category {
    const id = this.nextCategoryId++;
    const newCategory: Category = { id, name };
    
    const categories = this.getCategories();
    categories.push(newCategory);
    this.saveCategories(categories);
    
    return newCategory;
  }
  
  // Weather
  getWeather(): TripWeather[] {
    const weatherStr = window.localStorage.getItem(STORAGE_KEYS.WEATHER);
    if (!weatherStr) return [];
    
    const weather = JSON.parse(weatherStr);
    // Convert string dates back to Date objects
    return weather.map((w: any) => ({
      ...w,
      date: new Date(w.date)
    }));
  }
  
  saveWeather(weather: TripWeather[]): void {
    window.localStorage.setItem(STORAGE_KEYS.WEATHER, JSON.stringify(weather));
  }
  
  getWeatherByTripId(tripId: number): TripWeather[] {
    return this.getWeather().filter(w => w.tripId === tripId);
  }
  
  addWeather(weather: Omit<TripWeather, 'id'>): TripWeather {
    const id = this.nextWeatherId++;
    const newWeather: TripWeather = { ...weather, id };
    
    const allWeather = this.getWeather();
    allWeather.push(newWeather);
    this.saveWeather(allWeather);
    
    return newWeather;
  }
  
  // Settings
  getSettings(): Settings | null {
    const settingsStr = window.localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settingsStr ? JSON.parse(settingsStr) : null;
  }
  
  saveSettings(settings: Settings): void {
    window.localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }
  
  updateSettings(updatedSettings: Partial<Settings>): Settings | null {
    const settings = this.getSettings();
    if (!settings) return null;
    
    const newSettings = { ...settings, ...updatedSettings };
    this.saveSettings(newSettings);
    return newSettings;
  }
  
  // Clear all data
  clearAll(): void {
    window.localStorage.removeItem(STORAGE_KEYS.TRIPS);
    window.localStorage.removeItem(STORAGE_KEYS.ITEMS);
    window.localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    window.localStorage.removeItem(STORAGE_KEYS.WEATHER);
    window.localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    
    // Reset counters
    this.nextTripId = 1;
    this.nextItemId = 1;
    this.nextCategoryId = 1;
    this.nextWeatherId = 1;
    
    // Reinitialize with default data
    this.initializeDefaultData();
  }
  
  // Calculate storage size
  getStorageSize(): number {
    let totalSize = 0;
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = window.localStorage.getItem(key);
      if (item) {
        totalSize += item.length * 2; // approximate size in bytes (2 bytes per character)
      }
    });
    return totalSize;
  }
  
  // Generate packing list items for a trip based on purpose and activities
  generatePackingList(tripId: number, purpose: string, activities: string[]): Item[] {
    const items: Omit<Item, 'id'>[] = [];
    const essentialsCategoryId = 1;
    const clothingCategoryId = 2;
    const toiletriesCategoryId = 3;
    const electronicsCategoryId = 4;
    const documentsCategoryId = 5;
    
    // Add essential items for all trips
    items.push(
      { tripId, name: 'Passport', categoryId: documentsCategoryId, isPacked: false, quantity: 1, isCustom: false },
      { tripId, name: 'Phone Charger', categoryId: electronicsCategoryId, isPacked: false, quantity: 1, isCustom: false },
      { tripId, name: 'Toothbrush', categoryId: toiletriesCategoryId, isPacked: false, quantity: 1, isCustom: false },
      { tripId, name: 'Toothpaste', categoryId: toiletriesCategoryId, isPacked: false, quantity: 1, isCustom: false }
    );
    
    // Add purpose-specific items
    if (purpose === 'Vacation') {
      items.push(
        { tripId, name: 'Camera', categoryId: electronicsCategoryId, isPacked: false, quantity: 1, isCustom: false },
        { tripId, name: 'Sunglasses', categoryId: clothingCategoryId, isPacked: false, quantity: 1, isCustom: false },
        { tripId, name: 'Swimwear', categoryId: clothingCategoryId, isPacked: false, quantity: 1, isCustom: false }
      );
    } else if (purpose === 'Business') {
      items.push(
        { tripId, name: 'Business Cards', categoryId: documentsCategoryId, isPacked: false, quantity: 1, isCustom: false },
        { tripId, name: 'Laptop', categoryId: electronicsCategoryId, isPacked: false, quantity: 1, isCustom: false },
        { tripId, name: 'Suit/Formal Clothes', categoryId: clothingCategoryId, isPacked: false, quantity: 1, isCustom: false }
      );
    }
    
    // Add activity-specific items
    if (activities.includes('Beach')) {
      items.push(
        { tripId, name: 'Sunscreen', categoryId: toiletriesCategoryId, isPacked: false, quantity: 1, isCustom: false },
        { tripId, name: 'Beach Towel', categoryId: essentialsCategoryId, isPacked: false, quantity: 1, isCustom: false }
      );
    }
    
    if (activities.includes('Hiking')) {
      items.push(
        { tripId, name: 'Hiking Boots', categoryId: clothingCategoryId, isPacked: false, quantity: 1, isCustom: false },
        { tripId, name: 'Water Bottle', categoryId: essentialsCategoryId, isPacked: false, quantity: 1, isCustom: false }
      );
    }
    
    // Add the items to storage and return the created items
    const createdItems: Item[] = [];
    for (const item of items) {
      createdItems.push(this.addItem(item));
    }
    
    return createdItems;
  }
}

// Create and export a singleton instance
export const storage = new LocalStorage();
