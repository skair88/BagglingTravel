import { Trip, Item, Category, TripWeather, Settings } from '@shared/schema';

// Storage keys
const STORAGE_KEYS = {
  TRIPS: 'baggle_trips',
  ITEMS: 'baggle_items',
  CATEGORIES: 'baggle_categories',
  WEATHER: 'baggle_weather',
  SETTINGS: 'baggle_settings'
};

// Default categories
const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: 'Essentials' },
  { id: 2, name: 'Clothing' },
  { id: 3, name: 'Toiletries' },
  { id: 4, name: 'Electronics' },
  { id: 5, name: 'Documents' },
];

// LocalStorage wrapper with type safety
class LocalStorageService {
  constructor() {
    this.initializeDefaults();
  }

  // Initialize defaults if storage is empty
  private initializeDefaults(): void {
    if (!this.getCategories().length) {
      this.saveCategories(DEFAULT_CATEGORIES);
    }

    if (!this.getSettings()) {
      this.saveSettings({
        darkMode: false,
        language: 'English'
      });
    }
  }

  // Trips
  getTrips(): Trip[] {
    try {
      const trips = localStorage.getItem(STORAGE_KEYS.TRIPS);
      return trips ? JSON.parse(trips) : [];
    } catch (error) {
      console.error('Error retrieving trips from localStorage:', error);
      return [];
    }
  }
  
  saveTrips(trips: Trip[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    } catch (error) {
      console.error('Error saving trips to localStorage:', error);
    }
  }
  
  addTrip(trip: Omit<Trip, 'id' | 'createdAt' | 'progress'>): Trip {
    const trips = this.getTrips();
    const newTrip: Trip = {
      ...trip,
      id: Date.now(),
      createdAt: new Date(),
      progress: 0
    };
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
    return true;
  }
  
  // Items
  getItems(): Item[] {
    try {
      const items = localStorage.getItem(STORAGE_KEYS.ITEMS);
      return items ? JSON.parse(items) : [];
    } catch (error) {
      console.error('Error retrieving items from localStorage:', error);
      return [];
    }
  }
  
  saveItems(items: Item[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving items to localStorage:', error);
    }
  }
  
  getItemsByTripId(tripId: number): Item[] {
    return this.getItems().filter(item => item.tripId === tripId);
  }
  
  addItem(item: Omit<Item, 'id'>): Item {
    const items = this.getItems();
    const newItem: Item = {
      ...item,
      id: Date.now()
    };
    items.push(newItem);
    this.saveItems(items);
    return newItem;
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
    try {
      const categories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return categories ? JSON.parse(categories) : [];
    } catch (error) {
      console.error('Error retrieving categories from localStorage:', error);
      return [];
    }
  }
  
  saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories to localStorage:', error);
    }
  }
  
  // Weather
  getWeather(): TripWeather[] {
    try {
      const weather = localStorage.getItem(STORAGE_KEYS.WEATHER);
      return weather ? JSON.parse(weather) : [];
    } catch (error) {
      console.error('Error retrieving weather from localStorage:', error);
      return [];
    }
  }
  
  saveWeather(weather: TripWeather[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WEATHER, JSON.stringify(weather));
    } catch (error) {
      console.error('Error saving weather to localStorage:', error);
    }
  }
  
  getWeatherByTripId(tripId: number): TripWeather[] {
    return this.getWeather().filter(w => w.tripId === tripId);
  }
  
  addWeather(weather: Omit<TripWeather, 'id'>): TripWeather {
    const allWeather = this.getWeather();
    const newWeather: TripWeather = {
      ...weather,
      id: Date.now()
    };
    allWeather.push(newWeather);
    this.saveWeather(allWeather);
    return newWeather;
  }
  
  // Settings
  getSettings(): Settings | null {
    try {
      const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Error retrieving settings from localStorage:', error);
      return null;
    }
  }
  
  saveSettings(settings: Settings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }
  
  // Calculate trip progress
  calculateTripProgress(tripId: number): number {
    const items = this.getItemsByTripId(tripId);
    if (!items.length) return 0;
    
    const packedItems = items.filter(item => item.isPacked);
    return Math.round((packedItems.length / items.length) * 100);
  }
  
  // Clear all data
  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.TRIPS);
      localStorage.removeItem(STORAGE_KEYS.ITEMS);
      localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
      localStorage.removeItem(STORAGE_KEYS.WEATHER);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
  
  // Calculate storage size
  getStorageSize(): number {
    let totalSize = 0;
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length * 2; // approximate size in bytes (2 bytes per character)
        }
      });
    } catch (error) {
      console.error('Error calculating storage size:', error);
    }
    return totalSize;
  }
  
  // Generate demo trip for testing
  generateDemoTrip(): Trip {
    const demoTrip = this.addTrip({
      destination: 'London',
      location: { lat: 51.5074, lng: 0.1278 },
      startDate: new Date('2025-04-12'),
      endDate: new Date('2025-04-25'),
      purpose: 'Vacation',
      activities: ['Sightseeing', 'Museums']
    });
    
    // Add some items to the trip
    const essentialCategory = this.getCategories().find(c => c.name === 'Essentials')?.id ?? 1;
    const clothingCategory = this.getCategories().find(c => c.name === 'Clothing')?.id ?? 2;
    const electronicsCategory = this.getCategories().find(c => c.name === 'Electronics')?.id ?? 4;
    
    this.addItem({
      tripId: demoTrip.id,
      name: 'Passport',
      categoryId: essentialCategory,
      isPacked: false,
      quantity: 1,
      isCustom: false
    });
    
    this.addItem({
      tripId: demoTrip.id,
      name: 'T-shirts',
      categoryId: clothingCategory,
      isPacked: false,
      quantity: 5,
      isCustom: false
    });
    
    this.addItem({
      tripId: demoTrip.id,
      name: 'Phone charger',
      categoryId: electronicsCategory,
      isPacked: false,
      quantity: 1,
      isCustom: false
    });
    
    return demoTrip;
  }
}

// Export a singleton instance
export const localStorageService = new LocalStorageService();