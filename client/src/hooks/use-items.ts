import { useState, useEffect, useMemo } from 'react';
import { Item, Category } from '@shared/schema';
import { localStorageService } from '@/lib/localStorageService';

export function useItems(tripId?: number) {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Load items and categories from localStorage on mount
  useEffect(() => {
    try {
      const loadedCategories = localStorageService.getCategories();
      setCategories(loadedCategories);

      if (tripId) {
        const tripItems = localStorageService.getItemsByTripId(tripId);
        setItems(tripItems);
      } else {
        const allItems = localStorageService.getItems();
        setItems(allItems);
      }
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  // Items grouped by category
  const itemsByCategory = useMemo(() => {
    return categories.map(category => {
      const categoryItems = items.filter(item => item.categoryId === category.id);
      return {
        category,
        items: categoryItems
      };
    }).filter(group => group.items.length > 0);
  }, [items, categories]);

  // Calculate packing progress
  const packingProgress = useMemo(() => {
    if (items.length === 0) return 0;
    const packedItems = items.filter(item => item.isPacked);
    return Math.round((packedItems.length / items.length) * 100);
  }, [items]);

  // Add a new item
  const addItem = async (item: Omit<Item, 'id'>) => {
    try {
      const newItem = localStorageService.addItem(item);
      setItems(prevItems => [...prevItems, newItem]);
      
      // Update trip progress if tripId is provided
      if (tripId) {
        const progress = localStorageService.calculateTripProgress(tripId);
        const trips = localStorageService.getTrips();
        const trip = trips.find(t => t.id === tripId);
        if (trip) {
          localStorageService.updateTrip(tripId, { progress });
        }
      }
      
      return newItem;
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  };

  // Toggle item packed status
  const toggleItemPacked = async (itemId: number) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) return null;
      
      const updatedItem = localStorageService.updateItem(itemId, { 
        isPacked: !item.isPacked 
      });
      
      if (updatedItem) {
        setItems(prevItems => 
          prevItems.map(item => item.id === itemId ? updatedItem : item)
        );
        
        // Update trip progress if tripId is provided
        if (tripId) {
          const progress = localStorageService.calculateTripProgress(tripId);
          const trips = localStorageService.getTrips();
          const trip = trips.find(t => t.id === tripId);
          if (trip) {
            localStorageService.updateTrip(tripId, { progress });
          }
        }
      }
      
      return updatedItem;
    } catch (error) {
      console.error('Error toggling item:', error);
      throw error;
    }
  };

  // Update an item
  const updateItem = async (itemId: number, updatedData: Partial<Item>) => {
    try {
      const updatedItem = localStorageService.updateItem(itemId, updatedData);
      if (updatedItem) {
        setItems(prevItems => 
          prevItems.map(item => item.id === itemId ? updatedItem : item)
        );
      }
      return updatedItem;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  };

  // Delete an item
  const deleteItem = async (itemId: number) => {
    try {
      const success = localStorageService.deleteItem(itemId);
      if (success) {
        setItems(prevItems => prevItems.filter(item => item.id !== itemId));
        
        // Update trip progress if tripId is provided
        if (tripId) {
          const progress = localStorageService.calculateTripProgress(tripId);
          const trips = localStorageService.getTrips();
          const trip = trips.find(t => t.id === tripId);
          if (trip) {
            localStorageService.updateTrip(tripId, { progress });
          }
        }
      }
      return success;
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  };

  return {
    items,
    categories,
    itemsByCategory,
    packingProgress,
    loading,
    addItem,
    toggleItemPacked,
    updateItem,
    deleteItem
  };
}