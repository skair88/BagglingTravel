import { useState, useEffect } from 'react';
import { Item, Category } from '@/lib/localStorageService';
import { localStorageService } from '@/lib/localStorageService';
import { generatePackingList, getDefaultCategories } from '@/lib/packing-templates';

export function useItems(tripId?: number) {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load items and categories
  useEffect(() => {
    if (!tripId) {
      setLoading(false);
      return;
    }

    try {
      // Load categories
      let cats = localStorageService.getCategories();
      if (cats.length === 0) {
        // Initialize default categories if none exist
        cats = getDefaultCategories();
        cats.forEach(cat => localStorageService.addCategory(cat.name));
        cats = localStorageService.getCategories();
      }
      setCategories(cats);
      
      // Load items for this trip
      let tripItems = localStorageService.getItemsByTripId(tripId);
      
      // If no items exist, generate a packing list based on trip data
      if (tripItems.length === 0) {
        const trip = localStorageService.getTrips().find(t => t.id === tripId);
        
        if (trip) {
          // Get temperature data from trip weather if available
          const tripWeather = localStorageService.getWeatherByTripId(tripId);
          const temperatures = tripWeather.map(w => w.temperature);
          
          const generatedItems = generatePackingList(
            tripId,
            trip.purpose,
            trip.activities,
            trip.startDate,
            trip.endDate,
            temperatures
          );
          
          // Save generated items
          generatedItems.forEach(item => {
            localStorageService.addItem(item);
          });
          
          // Get the saved items with proper IDs
          tripItems = localStorageService.getItemsByTripId(tripId);
        }
      }
      
      setItems(tripItems);
    } catch (err) {
      console.error('Error loading packing list data:', err);
      setError('Failed to load packing items');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  // Toggle item packed status
  const toggleItem = (item: Item) => {
    const updatedItem = { ...item, isPacked: !item.isPacked };
    const result = localStorageService.updateItem(item.id, updatedItem);
    
    if (result) {
      setItems(prevItems => 
        prevItems.map(i => i.id === item.id ? updatedItem : i)
      );
    }
    
    return result;
  };

  // Update item quantity
  const updateQuantity = (item: Item, newQuantity: number) => {
    if (newQuantity < 1) return false;
    
    const updatedItem = { ...item, quantity: newQuantity };
    const result = localStorageService.updateItem(item.id, updatedItem);
    
    if (result) {
      setItems(prevItems => 
        prevItems.map(i => i.id === item.id ? updatedItem : i)
      );
    }
    
    return result;
  };

  // Add a new item
  const addItem = (newItem: Omit<Item, 'id'>) => {
    const savedItem = localStorageService.addItem(newItem);
    
    if (savedItem) {
      setItems(prevItems => [...prevItems, savedItem]);
    }
    
    return savedItem;
  };

  // Remove an item
  const removeItem = (itemId: number) => {
    const result = localStorageService.deleteItem(itemId);
    
    if (result) {
      setItems(prevItems => prevItems.filter(i => i.id !== itemId));
    }
    
    return result;
  };

  // Calculate packing progress
  const progress = items.length > 0
    ? Math.round((items.filter(i => i.isPacked).length / items.length) * 100)
    : 0;

  return {
    items,
    categories,
    loading,
    error,
    progress,
    toggleItem,
    updateQuantity,
    addItem,
    removeItem
  };
}