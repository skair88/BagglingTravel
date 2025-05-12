import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trip, TripWeather, Item } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { localStorage } from '@/lib/storage';

// Custom hook for managing trips
export function useTrips() {
  const queryClient = useQueryClient();
  
  // Get all trips
  const { data: trips = [], isLoading, error } = useQuery<Trip[]>({
    queryKey: ['/api/trips'],
    onError: () => {
      // Use local storage as fallback if network request fails
      return localStorage.getTrips();
    }
  });
  
  // Sort trips by start date (upcoming first)
  const sortedTrips = [...trips].sort((a, b) => {
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });
  
  // Split into upcoming and past trips
  const today = new Date();
  const upcomingTrips = sortedTrips.filter(trip => new Date(trip.endDate) >= today);
  const pastTrips = sortedTrips.filter(trip => new Date(trip.endDate) < today);
  
  // Create trip mutation
  const createTripMutation = useMutation({
    mutationFn: async (newTrip: Omit<Trip, 'id' | 'createdAt'>) => {
      const response = await apiRequest('POST', '/api/trips', newTrip);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
    },
    onError: (error) => {
      console.error('Failed to create trip', error);
    }
  });
  
  // Delete trip mutation
  const deleteTripMutation = useMutation({
    mutationFn: async (tripId: number) => {
      await apiRequest('DELETE', `/api/trips/${tripId}`);
      return tripId;
    },
    onSuccess: (tripId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/trips'] });
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${tripId}/items`] });
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${tripId}/weather`] });
    },
    onError: (error) => {
      console.error('Failed to delete trip', error);
    }
  });
  
  // Get trip weather
  const getWeatherForTrip = (tripId: number) => {
    return useQuery<TripWeather[]>({
      queryKey: [`/api/trips/${tripId}/weather`],
      onError: () => {
        // Use local storage as fallback
        return localStorage.getWeatherByTripId(tripId);
      }
    });
  };
  
  // Generate packing list
  const generatePackingListMutation = useMutation({
    mutationFn: async (tripId: number) => {
      const response = await apiRequest('POST', `/api/trips/${tripId}/generate-packing-list`);
      return response.json();
    },
    onSuccess: (_, tripId) => {
      queryClient.invalidateQueries({ queryKey: [`/api/trips/${tripId}/items`] });
    },
    onError: (error) => {
      console.error('Failed to generate packing list', error);
    }
  });
  
  // Calculate trip packing progress
  const getTripProgress = (tripId: number, items: Item[]) => {
    if (!items || items.length === 0) return 0;
    
    const packedItems = items.filter(item => item.isPacked);
    return Math.round((packedItems.length / items.length) * 100);
  };
  
  // Calculate days until departure
  const getDaysUntilDeparture = (startDate: Date) => {
    const start = new Date(startDate);
    const today = new Date();
    
    // Reset time to midnight for accurate day calculation
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    
    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };
  
  return {
    trips,
    upcomingTrips,
    pastTrips,
    isLoading,
    error,
    createTrip: createTripMutation.mutate,
    deleteTrip: deleteTripMutation.mutate,
    getWeatherForTrip,
    generatePackingList: generatePackingListMutation.mutate,
    getTripProgress,
    getDaysUntilDeparture
  };
}
