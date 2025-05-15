// Packing list template system for Baggle app
import { Item, Category } from './localStorageService';

// Template interface
interface PackingTemplate {
  id: string;
  name: string;
  description: string;
  items: TemplateItem[];
}

// Template item interface
interface TemplateItem {
  name: string;
  categoryId: number;
  quantity: number;
  conditions?: {
    weather?: string[];
    activities?: string[];
    purpose?: string[];
    duration?: {
      min?: number;
      max?: number;
    };
  };
}

// Essential items for all trips
export const essentialItems: TemplateItem[] = [
  { name: 'Passport/ID', categoryId: 1, quantity: 1 },
  { name: 'Phone Charger', categoryId: 3, quantity: 1 },
  { name: 'Wallet', categoryId: 1, quantity: 1 },
  { name: 'Phone', categoryId: 3, quantity: 1 },
  { name: 'Toothbrush', categoryId: 2, quantity: 1 },
  { name: 'Toothpaste', categoryId: 2, quantity: 1 },
];

// Clothing items based on duration
export const getClothingByDuration = (days: number): TemplateItem[] => {
  return [
    { name: 'T-shirts', categoryId: 4, quantity: Math.min(days, 7) },
    { name: 'Underwear', categoryId: 4, quantity: Math.min(days + 1, 8) },
    { name: 'Socks', categoryId: 4, quantity: Math.min(days + 1, 8) },
    { name: 'Pants/Shorts', categoryId: 4, quantity: Math.ceil(days / 2) },
  ];
};

// Weather-specific items
export const weatherItems: Record<string, TemplateItem[]> = {
  cold: [
    { name: 'Sweater', categoryId: 4, quantity: 2 },
    { name: 'Winter Jacket', categoryId: 4, quantity: 1 },
    { name: 'Thermal Underwear', categoryId: 4, quantity: 1 },
    { name: 'Gloves', categoryId: 4, quantity: 1 },
    { name: 'Scarf', categoryId: 4, quantity: 1 },
    { name: 'Hat', categoryId: 4, quantity: 1 },
  ],
  warm: [
    { name: 'Shorts', categoryId: 4, quantity: 2 },
    { name: 'Sunglasses', categoryId: 1, quantity: 1 },
    { name: 'Sunscreen', categoryId: 2, quantity: 1 },
    { name: 'Light Jacket', categoryId: 4, quantity: 1 },
  ],
  hot: [
    { name: 'Shorts', categoryId: 4, quantity: 3 },
    { name: 'Sunglasses', categoryId: 1, quantity: 1 },
    { name: 'Sunscreen', categoryId: 2, quantity: 1 },
    { name: 'Hat', categoryId: 4, quantity: 1 },
    { name: 'Sandals', categoryId: 4, quantity: 1 },
  ],
  rainy: [
    { name: 'Rain Jacket', categoryId: 4, quantity: 1 },
    { name: 'Umbrella', categoryId: 1, quantity: 1 },
    { name: 'Waterproof Shoes', categoryId: 4, quantity: 1 },
  ],
};

// Activity-specific items
export const activityItems: Record<string, TemplateItem[]> = {
  beach: [
    { name: 'Swimwear', categoryId: 4, quantity: 2 },
    { name: 'Beach Towel', categoryId: 2, quantity: 1 },
    { name: 'Flip-flops', categoryId: 4, quantity: 1 },
    { name: 'Beach Bag', categoryId: 1, quantity: 1 },
  ],
  hiking: [
    { name: 'Hiking Boots', categoryId: 4, quantity: 1 },
    { name: 'Water Bottle', categoryId: 1, quantity: 1 },
    { name: 'Backpack', categoryId: 1, quantity: 1 },
    { name: 'Energy Bars', categoryId: 5, quantity: 4 },
    { name: 'First Aid Kit', categoryId: 2, quantity: 1 },
  ],
  swimming: [
    { name: 'Swimwear', categoryId: 4, quantity: 2 },
    { name: 'Goggles', categoryId: 1, quantity: 1 },
    { name: 'Swim Cap', categoryId: 4, quantity: 1 },
  ],
  camping: [
    { name: 'Tent', categoryId: 6, quantity: 1 },
    { name: 'Sleeping Bag', categoryId: 6, quantity: 1 },
    { name: 'Flashlight', categoryId: 6, quantity: 1 },
    { name: 'Multi-tool', categoryId: 6, quantity: 1 },
    { name: 'Insect Repellent', categoryId: 2, quantity: 1 },
  ],
  sightseeing: [
    { name: 'Camera', categoryId: 3, quantity: 1 },
    { name: 'Extra Battery', categoryId: 3, quantity: 1 },
    { name: 'Memory Card', categoryId: 3, quantity: 1 },
    { name: 'Day Bag', categoryId: 1, quantity: 1 },
    { name: 'Comfortable Shoes', categoryId: 4, quantity: 1 },
  ],
  museums: [
    { name: 'Camera', categoryId: 3, quantity: 1 },
    { name: 'Notebook', categoryId: 1, quantity: 1 },
    { name: 'Comfortable Shoes', categoryId: 4, quantity: 1 },
  ],
  dining: [
    { name: 'Nice Outfit', categoryId: 4, quantity: 1 },
    { name: 'Dress Shoes', categoryId: 4, quantity: 1 },
  ],
  adventure: [
    { name: 'Backpack', categoryId: 1, quantity: 1 },
    { name: 'Water Bottle', categoryId: 1, quantity: 1 },
    { name: 'First Aid Kit', categoryId: 2, quantity: 1 },
    { name: 'Multi-tool', categoryId: 6, quantity: 1 },
  ],
};

// Purpose-specific items
export const purposeItems: Record<string, TemplateItem[]> = {
  vacation: [
    { name: 'Book/E-reader', categoryId: 5, quantity: 1 },
    { name: 'Camera', categoryId: 3, quantity: 1 },
    { name: 'Travel Pillow', categoryId: 1, quantity: 1 },
    { name: 'Portable Charger', categoryId: 3, quantity: 1 },
  ],
  business: [
    { name: 'Laptop', categoryId: 3, quantity: 1 },
    { name: 'Laptop Charger', categoryId: 3, quantity: 1 },
    { name: 'Business Cards', categoryId: 1, quantity: 1 },
    { name: 'Formal Clothes', categoryId: 4, quantity: 2 },
    { name: 'Notebook', categoryId: 1, quantity: 1 },
    { name: 'Pen', categoryId: 1, quantity: 2 },
    { name: 'Documents Folder', categoryId: 1, quantity: 1 },
  ],
  family: [
    { name: 'Gifts', categoryId: 5, quantity: 1 },
    { name: 'Casual Clothes', categoryId: 4, quantity: 3 },
    { name: 'Photos', categoryId: 5, quantity: 1 },
  ],
};

/**
 * Get default categories for packing items
 */
export const getDefaultCategories = (): Category[] => {
  return [
    { id: 1, name: 'Essentials' },
    { id: 2, name: 'Toiletries' },
    { id: 3, name: 'Electronics' },
    { id: 4, name: 'Clothing' },
    { id: 5, name: 'Entertainment' },
    { id: 6, name: 'Outdoor' },
  ];
};

/**
 * Determine weather conditions based on forecast
 */
export const getWeatherCondition = (temperatures: number[]): string[] => {
  const conditions: string[] = [];
  const avgTemp = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
  
  if (avgTemp < 10) conditions.push('cold');
  else if (avgTemp < 22) conditions.push('warm');
  else conditions.push('hot');
  
  // For simplicity, we're not checking for rain in this version
  // In a real app, we would check the weather condition strings
  
  return conditions;
};

/**
 * Generate a packing list based on trip details
 */
export const generatePackingList = (
  tripId: number,
  purpose: string,
  activities: string[],
  startDate: Date,
  endDate: Date,
  temperatures: number[] = []
): Item[] => {
  // Calculate trip duration in days
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
  
  // Get weather conditions
  const weatherConditions = getWeatherCondition(temperatures);
  
  // Create a set to avoid duplicates (by name)
  const itemsMap = new Map<string, Item>();
  
  // Add essential items
  essentialItems.forEach(template => {
    const newItem: Item = {
      id: 0, // Will be assigned by storage service
      tripId,
      name: template.name,
      categoryId: template.categoryId,
      isPacked: false,
      quantity: template.quantity,
      isCustom: false
    };
    
    itemsMap.set(template.name, newItem);
  });
  
  // Add clothing based on duration
  getClothingByDuration(durationDays).forEach(template => {
    const newItem: Item = {
      id: 0,
      tripId,
      name: template.name,
      categoryId: template.categoryId,
      isPacked: false,
      quantity: template.quantity,
      isCustom: false
    };
    
    itemsMap.set(template.name, newItem);
  });
  
  // Add weather-specific items
  weatherConditions.forEach(condition => {
    const items = weatherItems[condition] || [];
    items.forEach(template => {
      const newItem: Item = {
        id: 0,
        tripId,
        name: template.name,
        categoryId: template.categoryId,
        isPacked: false,
        quantity: template.quantity,
        isCustom: false
      };
      
      itemsMap.set(template.name, newItem);
    });
  });
  
  // Add purpose-specific items
  const purposeList = purposeItems[purpose] || [];
  purposeList.forEach(template => {
    const newItem: Item = {
      id: 0,
      tripId,
      name: template.name,
      categoryId: template.categoryId,
      isPacked: false,
      quantity: template.quantity,
      isCustom: false
    };
    
    itemsMap.set(template.name, newItem);
  });
  
  // Add activity-specific items
  activities.forEach(activity => {
    const items = activityItems[activity] || [];
    items.forEach(template => {
      const newItem: Item = {
        id: 0,
        tripId,
        name: template.name,
        categoryId: template.categoryId,
        isPacked: false,
        quantity: template.quantity,
        isCustom: false
      };
      
      itemsMap.set(template.name, newItem);
    });
  });
  
  // Convert map to array
  return Array.from(itemsMap.values());
};