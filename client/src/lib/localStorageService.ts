// Define interfaces locally
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

interface TripWeather {
  id: number;
  tripId: number;
  date: Date;
  temperature: number;
  condition: string;
  icon: string;
}

interface Settings {
  darkMode: boolean;
  language: string;
}

class LocalStorageService {
  constructor() {
    this.initializeDefaults();
  }

  private initializeDefaults(): void {
    // Initialize trips array if it doesn't exist
    if (!localStorage.getItem('trips')) {
      localStorage.setItem('trips', JSON.stringify([]));
    }
    
    // Initialize items array if it doesn't exist
    if (!localStorage.getItem('items')) {
      localStorage.setItem('items', JSON.stringify([]));
    }
    
    // Initialize categories if they don't exist
    if (!localStorage.getItem('categories')) {
      const defaultCategories: Category[] = [
        { id: 1, name: 'Essentials' },
        { id: 2, name: 'Clothing' },
        { id: 3, name: 'Toiletries' },
        { id: 4, name: 'Electronics' },
        { id: 5, name: 'Documents' },
        { id: 6, name: 'Miscellaneous' }
      ];
      localStorage.setItem('categories', JSON.stringify(defaultCategories));
    }
    
    // Initialize weather data if it doesn't exist
    if (!localStorage.getItem('weather')) {
      localStorage.setItem('weather', JSON.stringify([]));
    }
    
    // Initialize settings if they don't exist
    if (!localStorage.getItem('settings')) {
      const defaultSettings: Settings = {
        darkMode: false,
        language: 'en'
      };
      localStorage.setItem('settings', JSON.stringify(defaultSettings));
    }
  }

  // Trips methods
  getTrips(): Trip[] {
    const tripsJson = localStorage.getItem('trips') || '[]';
    const trips = JSON.parse(tripsJson) as Trip[];
    
    // Convert date strings back to Date objects
    return trips.map(trip => ({
      ...trip,
      startDate: new Date(trip.startDate),
      endDate: new Date(trip.endDate),
      createdAt: new Date(trip.createdAt)
    }));
  }

  saveTrips(trips: Trip[]): void {
    localStorage.setItem('trips', JSON.stringify(trips));
  }

  addTrip(trip: Omit<Trip, 'id' | 'createdAt'> & { progress?: number }): Trip {
    const trips = this.getTrips();
    const id = trips.length > 0 ? Math.max(...trips.map(t => t.id)) + 1 : 1;
    
    const newTrip: Trip = {
      ...trip,
      id,
      createdAt: new Date(),
      progress: trip.progress !== undefined ? trip.progress : 0
    };
    
    trips.push(newTrip);
    this.saveTrips(trips);
    
    return newTrip;
  }

  updateTrip(tripId: number, updatedTrip: Partial<Trip>): Trip | undefined {
    const trips = this.getTrips();
    const tripIndex = trips.findIndex(trip => trip.id === tripId);
    
    if (tripIndex === -1) {
      return undefined;
    }
    
    const updatedTripObj = {
      ...trips[tripIndex],
      ...updatedTrip
    };
    
    trips[tripIndex] = updatedTripObj;
    this.saveTrips(trips);
    
    return updatedTripObj;
  }

  deleteTrip(tripId: number): boolean {
    const trips = this.getTrips();
    const filteredTrips = trips.filter(trip => trip.id !== tripId);
    
    if (filteredTrips.length === trips.length) {
      return false;
    }
    
    this.saveTrips(filteredTrips);
    
    // Also delete associated items
    const items = this.getItems();
    const filteredItems = items.filter(item => item.tripId !== tripId);
    this.saveItems(filteredItems);
    
    // Delete associated weather data
    const weather = this.getWeather();
    const filteredWeather = weather.filter(w => w.tripId !== tripId);
    this.saveWeather(filteredWeather);
    
    return true;
  }

  // Items methods
  getItems(): Item[] {
    const itemsJson = localStorage.getItem('items') || '[]';
    return JSON.parse(itemsJson) as Item[];
  }

  saveItems(items: Item[]): void {
    localStorage.setItem('items', JSON.stringify(items));
  }

  getItemsByTripId(tripId: number): Item[] {
    const items = this.getItems();
    return items.filter(item => item.tripId === tripId);
  }

  addItem(item: Omit<Item, 'id'>): Item {
    const items = this.getItems();
    const id = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    
    const newItem: Item = {
      ...item,
      id
    };
    
    items.push(newItem);
    this.saveItems(items);
    
    // Update trip progress
    this.calculateTripProgress(item.tripId);
    
    return newItem;
  }

  updateItem(itemId: number, updatedItem: Partial<Item>): Item | undefined {
    const items = this.getItems();
    const itemIndex = items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return undefined;
    }
    
    const updatedItemObj = {
      ...items[itemIndex],
      ...updatedItem
    };
    
    items[itemIndex] = updatedItemObj;
    this.saveItems(items);
    
    // Update trip progress
    this.calculateTripProgress(items[itemIndex].tripId);
    
    return updatedItemObj;
  }

  deleteItem(itemId: number): boolean {
    const items = this.getItems();
    const itemToDelete = items.find(item => item.id === itemId);
    
    if (!itemToDelete) {
      return false;
    }
    
    const tripId = itemToDelete.tripId;
    const filteredItems = items.filter(item => item.id !== itemId);
    
    if (filteredItems.length === items.length) {
      return false;
    }
    
    this.saveItems(filteredItems);
    
    // Update trip progress
    this.calculateTripProgress(tripId);
    
    return true;
  }

  // Categories methods
  getCategories(): Category[] {
    const categoriesJson = localStorage.getItem('categories') || '[]';
    return JSON.parse(categoriesJson) as Category[];
  }

  saveCategories(categories: Category[]): void {
    localStorage.setItem('categories', JSON.stringify(categories));
  }
  
  /**
   * Add a new category
   */
  addCategory(name: string): Category {
    const categories = this.getCategories();
    const id = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
    
    const newCategory: Category = { id, name };
    
    categories.push(newCategory);
    this.saveCategories(categories);
    
    return newCategory;
  }
  
  // Weather methods
  getWeather(): TripWeather[] {
    const weatherJson = localStorage.getItem('weather') || '[]';
    const weather = JSON.parse(weatherJson) as TripWeather[];
    
    // Convert date strings back to Date objects
    return weather.map(w => ({
      ...w,
      date: new Date(w.date)
    }));
  }

  saveWeather(weather: TripWeather[]): void {
    localStorage.setItem('weather', JSON.stringify(weather));
  }

  getWeatherByTripId(tripId: number): TripWeather[] {
    const weather = this.getWeather();
    return weather.filter(w => w.tripId === tripId);
  }

  addWeather(weather: Omit<TripWeather, 'id'>): TripWeather {
    const weatherData = this.getWeather();
    const id = weatherData.length > 0 ? Math.max(...weatherData.map(w => w.id)) + 1 : 1;
    
    const newWeather: TripWeather = {
      ...weather,
      id
    };
    
    weatherData.push(newWeather);
    this.saveWeather(weatherData);
    
    return newWeather;
  }

  // Settings methods
  getSettings(): Settings | null {
    const settingsJson = localStorage.getItem('settings');
    return settingsJson ? JSON.parse(settingsJson) as Settings : null;
  }

  saveSettings(settings: Settings): void {
    localStorage.setItem('settings', JSON.stringify(settings));
  }

  // Utility methods
  calculateTripProgress(tripId: number): number {
    const items = this.getItemsByTripId(tripId);
    
    if (items.length === 0) {
      return 0;
    }
    
    const packedItems = items.filter(item => item.isPacked);
    const progress = Math.round((packedItems.length / items.length) * 100);
    
    // Update trip with new progress
    const trips = this.getTrips();
    const tripIndex = trips.findIndex(trip => trip.id === tripId);
    
    if (tripIndex !== -1) {
      trips[tripIndex].progress = progress;
      this.saveTrips(trips);
    }
    
    return progress;
  }

  clearAll(): void {
    localStorage.removeItem('trips');
    localStorage.removeItem('items');
    localStorage.removeItem('categories');
    localStorage.removeItem('weather');
    localStorage.removeItem('settings');
    this.initializeDefaults();
  }

  getStorageSize(): number {
    let totalSize = 0;
    
    // Calculate size of each item in localStorage
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += (localStorage[key].length * 2) / 1024; // Size in KB
      }
    }
    
    return totalSize;
  }

  // Method to generate a demo trip for testing
  generateDemoTrip(): Trip {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 5);
    
    const trip = this.addTrip({
      destination: 'London, UK',
      location: { lat: 51.5074, lng: -0.1278 },
      startDate,
      endDate,
      purpose: 'vacation',
      activities: ['sightseeing', 'shopping'],
      progress: 0
    });
    
    return trip;
  }
}

export const localStorageService = new LocalStorageService();