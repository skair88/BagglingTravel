import { 
  users, type User, type InsertUser,
  trips, type Trip, type InsertTrip,
  tripWeather, type TripWeather, type InsertTripWeather,
  categories, type Category, type InsertCategory,
  items, type Item, type InsertItem,
  settings, type Settings, type InsertSettings,
  itemTemplates, type ItemTemplate, type InsertItemTemplate
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Trip methods
  getTrips(): Promise<Trip[]>;
  getTripById(id: number): Promise<Trip | undefined>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTrip(id: number, trip: Partial<Trip>): Promise<Trip | undefined>;
  deleteTrip(id: number): Promise<boolean>;
  
  // Weather methods
  getTripWeather(tripId: number): Promise<TripWeather[]>;
  createTripWeather(weather: InsertTripWeather): Promise<TripWeather>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Item methods
  getItemsByTripId(tripId: number): Promise<Item[]>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: number, item: Partial<Item>): Promise<Item | undefined>;
  deleteItem(id: number): Promise<boolean>;
  
  // Settings methods
  getSettings(userId: number): Promise<Settings | undefined>;
  createSettings(settings: InsertSettings): Promise<Settings>;
  updateSettings(id: number, settings: Partial<Settings>): Promise<Settings | undefined>;
  
  // Item template methods
  getItemTemplates(): Promise<ItemTemplate[]>;
  createItemTemplate(template: InsertItemTemplate): Promise<ItemTemplate>;
  
  // Initialize with default categories and templates
  initializeDefaults(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private trips: Map<number, Trip>;
  private tripWeather: Map<number, TripWeather>;
  private categories: Map<number, Category>;
  private items: Map<number, Item>;
  private settings: Map<number, Settings>;
  private itemTemplates: Map<number, ItemTemplate>;
  
  private userId: number;
  private tripId: number;
  private weatherId: number;
  private categoryId: number;
  private itemId: number;
  private settingsId: number;
  private templateId: number;

  constructor() {
    this.users = new Map();
    this.trips = new Map();
    this.tripWeather = new Map();
    this.categories = new Map();
    this.items = new Map();
    this.settings = new Map();
    this.itemTemplates = new Map();
    
    this.userId = 1;
    this.tripId = 1;
    this.weatherId = 1;
    this.categoryId = 1;
    this.itemId = 1;
    this.settingsId = 1;
    this.templateId = 1;
    
    // Create a default user for testing
    this.createUser({ username: 'demo', password: 'demo123' });
    this.initializeDefaults();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Trip methods
  async getTrips(): Promise<Trip[]> {
    return Array.from(this.trips.values());
  }
  
  async getTripById(id: number): Promise<Trip | undefined> {
    return this.trips.get(id);
  }
  
  async createTrip(insertTrip: InsertTrip): Promise<Trip> {
    const id = this.tripId++;
    const createdAt = new Date();
    const trip: Trip = { ...insertTrip, id, createdAt };
    this.trips.set(id, trip);
    return trip;
  }
  
  async updateTrip(id: number, tripUpdate: Partial<Trip>): Promise<Trip | undefined> {
    const trip = this.trips.get(id);
    if (!trip) return undefined;
    
    const updatedTrip = { ...trip, ...tripUpdate };
    this.trips.set(id, updatedTrip);
    return updatedTrip;
  }
  
  async deleteTrip(id: number): Promise<boolean> {
    return this.trips.delete(id);
  }
  
  // Weather methods
  async getTripWeather(tripId: number): Promise<TripWeather[]> {
    return Array.from(this.tripWeather.values())
      .filter(weather => weather.tripId === tripId);
  }
  
  async createTripWeather(insertWeather: InsertTripWeather): Promise<TripWeather> {
    const id = this.weatherId++;
    const weather: TripWeather = { ...insertWeather, id };
    this.tripWeather.set(id, weather);
    return weather;
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
  
  // Item methods
  async getItemsByTripId(tripId: number): Promise<Item[]> {
    return Array.from(this.items.values())
      .filter(item => item.tripId === tripId);
  }
  
  async createItem(insertItem: InsertItem): Promise<Item> {
    const id = this.itemId++;
    const item: Item = { ...insertItem, id };
    this.items.set(id, item);
    return item;
  }
  
  async updateItem(id: number, itemUpdate: Partial<Item>): Promise<Item | undefined> {
    const item = this.items.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...itemUpdate };
    this.items.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteItem(id: number): Promise<boolean> {
    return this.items.delete(id);
  }
  
  // Settings methods
  async getSettings(userId: number): Promise<Settings | undefined> {
    return Array.from(this.settings.values())
      .find(setting => setting.userId === userId);
  }
  
  async createSettings(insertSettings: InsertSettings): Promise<Settings> {
    const id = this.settingsId++;
    const setting: Settings = { ...insertSettings, id };
    this.settings.set(id, setting);
    return setting;
  }
  
  async updateSettings(id: number, settingsUpdate: Partial<Settings>): Promise<Settings | undefined> {
    const setting = this.settings.get(id);
    if (!setting) return undefined;
    
    const updatedSetting = { ...setting, ...settingsUpdate };
    this.settings.set(id, updatedSetting);
    return updatedSetting;
  }
  
  // Item template methods
  async getItemTemplates(): Promise<ItemTemplate[]> {
    return Array.from(this.itemTemplates.values());
  }
  
  async createItemTemplate(insertTemplate: InsertItemTemplate): Promise<ItemTemplate> {
    const id = this.templateId++;
    const template: ItemTemplate = { ...insertTemplate, id };
    this.itemTemplates.set(id, template);
    return template;
  }
  
  // Initialize with default categories and templates
  async initializeDefaults(): Promise<void> {
    // Create default categories
    const essentialsCategory = await this.createCategory({ name: 'Essentials' });
    const clothingCategory = await this.createCategory({ name: 'Clothing' });
    const toiletriesCategory = await this.createCategory({ name: 'Toiletries' });
    const electronicsCategory = await this.createCategory({ name: 'Electronics' });
    
    // Create default settings for demo user
    await this.createSettings({
      userId: 1,
      darkMode: false,
      offlineMode: true,
      language: 'English'
    });
    
    // Create default item templates
    const essentialItems = [
      { name: 'Passport', categoryId: essentialsCategory.id, forPurpose: ['Vacation', 'Business', 'Adventure'], forActivity: [], forWeather: [] },
      { name: 'Travel Insurance', categoryId: essentialsCategory.id, forPurpose: ['Vacation', 'Business', 'Adventure'], forActivity: [], forWeather: [] },
      { name: 'Credit Cards', categoryId: essentialsCategory.id, forPurpose: ['Vacation', 'Business', 'Adventure', 'Family Visit'], forActivity: [], forWeather: [] },
      { name: 'Local Currency', categoryId: essentialsCategory.id, forPurpose: ['Vacation', 'Business', 'Adventure', 'Family Visit'], forActivity: [], forWeather: [] },
    ];
    
    const clothingItems = [
      { name: 'T-shirts (5)', categoryId: clothingCategory.id, forPurpose: ['Vacation', 'Family Visit'], forActivity: [], forWeather: ['sunny', 'cloudy'] },
      { name: 'Shorts (3)', categoryId: clothingCategory.id, forPurpose: ['Vacation'], forActivity: ['Beach'], forWeather: ['sunny'] },
      { name: 'Light Jacket', categoryId: clothingCategory.id, forPurpose: ['Vacation', 'Business'], forActivity: [], forWeather: ['cloudy', 'rainy'] },
      { name: 'Swimwear', categoryId: clothingCategory.id, forPurpose: ['Vacation'], forActivity: ['Beach'], forWeather: ['sunny'] },
      { name: 'Comfortable Walking Shoes', categoryId: clothingCategory.id, forPurpose: ['Vacation', 'Adventure'], forActivity: ['Sightseeing', 'Hiking'], forWeather: [] },
    ];
    
    const toiletriesItems = [
      { name: 'Toothbrush & Toothpaste', categoryId: toiletriesCategory.id, forPurpose: ['Vacation', 'Business', 'Adventure', 'Family Visit'], forActivity: [], forWeather: [] },
      { name: 'Shampoo & Conditioner', categoryId: toiletriesCategory.id, forPurpose: ['Vacation', 'Business', 'Adventure', 'Family Visit'], forActivity: [], forWeather: [] },
      { name: 'Sunscreen', categoryId: toiletriesCategory.id, forPurpose: ['Vacation'], forActivity: ['Beach'], forWeather: ['sunny'] },
    ];
    
    const electronicsItems = [
      { name: 'Phone Charger', categoryId: electronicsCategory.id, forPurpose: ['Vacation', 'Business', 'Adventure', 'Family Visit'], forActivity: [], forWeather: [] },
      { name: 'Camera', categoryId: electronicsCategory.id, forPurpose: ['Vacation', 'Adventure'], forActivity: ['Sightseeing'], forWeather: [] },
      { name: 'Power Adapter', categoryId: electronicsCategory.id, forPurpose: ['Vacation', 'Business', 'Adventure'], forActivity: [], forWeather: [] },
    ];
    
    // Add all templates
    for (const template of [...essentialItems, ...clothingItems, ...toiletriesItems, ...electronicsItems]) {
      await this.createItemTemplate(template);
    }
    
    // Create demo trip
    const demoTrip = await this.createTrip({
      userId: 1,
      destination: 'Paris, France',
      location: { lat: 48.8566, lng: 2.3522 },
      startDate: new Date('2023-07-15'),
      endDate: new Date('2023-07-22'),
      purpose: 'Vacation',
      activities: ['Sightseeing', 'Museums', 'Restaurants']
    });
    
    // Add weather data for demo trip
    const weatherData = [
      { tripId: demoTrip.id, date: new Date('2023-07-15'), temperature: 25, condition: 'Clear', icon: 'wb_sunny' },
      { tripId: demoTrip.id, date: new Date('2023-07-16'), temperature: 22, condition: 'Cloudy', icon: 'cloud' },
      { tripId: demoTrip.id, date: new Date('2023-07-17'), temperature: 20, condition: 'Rain', icon: 'grain' },
    ];
    
    for (const weather of weatherData) {
      await this.createTripWeather(weather);
    }
    
    // Add sample items for demo trip
    const demoItems = [
      { tripId: demoTrip.id, name: 'Passport', categoryId: essentialsCategory.id, isPacked: true, quantity: 1, isCustom: false },
      { tripId: demoTrip.id, name: 'Travel Insurance', categoryId: essentialsCategory.id, isPacked: true, quantity: 1, isCustom: false },
      { tripId: demoTrip.id, name: 'Credit Cards', categoryId: essentialsCategory.id, isPacked: false, quantity: 1, isCustom: false },
      { tripId: demoTrip.id, name: 'Local Currency', categoryId: essentialsCategory.id, isPacked: false, quantity: 1, isCustom: false },
      { tripId: demoTrip.id, name: 'T-shirts (5)', categoryId: clothingCategory.id, isPacked: true, quantity: 5, isCustom: false },
      { tripId: demoTrip.id, name: 'Shorts (3)', categoryId: clothingCategory.id, isPacked: false, quantity: 3, isCustom: false },
      { tripId: demoTrip.id, name: 'Light Jacket', categoryId: clothingCategory.id, isPacked: false, quantity: 1, isCustom: false },
      { tripId: demoTrip.id, name: 'Swimwear', categoryId: clothingCategory.id, isPacked: false, quantity: 1, isCustom: false },
      { tripId: demoTrip.id, name: 'Comfortable Walking Shoes', categoryId: clothingCategory.id, isPacked: false, quantity: 1, isCustom: false },
    ];
    
    for (const item of demoItems) {
      await this.createItem(item);
    }
  }
}

export const storage = new MemStorage();
