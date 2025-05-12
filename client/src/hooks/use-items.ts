import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Item, Category } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { localStorage } from '@/lib/storage';

// Custom hook for managing items and categories
export function useItems() {
  const queryClient = useQueryClient();
  
  // Get all categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    onError: () => {
      // Use local storage as fallback
      return localStorage.getCategories();
    }
  });
  
  // Get items for a specific trip
  const getItemsByTripId = (tripId: number) => {
    return useQuery<Item[]>({
      queryKey: [`/api/trips/${tripId}/items`],
      onError: () => {
        // Use local storage as fallback
        return localStorage.getItemsByTripId(tripId);
      }
    });
  };
  
  // Toggle item packed status
  const toggleItemPackedMutation = useMutation({
    mutationFn: async ({ itemId, isPacked }: { itemId: number; isPacked: boolean }) => {
      const response = await apiRequest('PATCH', `/api/items/${itemId}`, { isPacked });
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Find tripId to invalidate the correct query
      const items = queryClient.getQueryData<Item[]>(['/api/trips/*/items']);
      if (items) {
        const item = items.find(i => i.id === variables.itemId);
        if (item) {
          queryClient.invalidateQueries({ queryKey: [`/api/trips/${item.tripId}/items`] });
        }
      }
    },
    onError: (error) => {
      console.error('Failed to update item', error);
    }
  });
  
  // Add custom item
  const addItemMutation = useMutation({
    mutationFn: async (newItem: Omit<Item, 'id'>) => {
      const response = await apiRequest('POST', '/api/items', newItem);
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${variables.tripId}/items`] });
    },
    onError: (error) => {
      console.error('Failed to add item', error);
    }
  });
  
  // Delete item
  const deleteItemMutation = useMutation({
    mutationFn: async ({ itemId, tripId }: { itemId: number; tripId: number }) => {
      await apiRequest('DELETE', `/api/items/${itemId}`);
      return { itemId, tripId };
    },
    onSuccess: (variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${variables.tripId}/items`] });
    },
    onError: (error) => {
      console.error('Failed to delete item', error);
    }
  });
  
  return {
    categories,
    categoriesLoading,
    getItemsByTripId,
    toggleItemPacked: toggleItemPackedMutation.mutate,
    addItem: addItemMutation.mutate,
    deleteItem: deleteItemMutation.mutate
  };
}
