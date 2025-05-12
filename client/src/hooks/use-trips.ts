import { useState, useEffect, useMemo } from 'react';
import { Trip, TripCreationData } from '@shared/schema';
import { localStorageService } from '@/lib/localStorageService';

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // Load trips from localStorage on mount
  useEffect(() => {
    try {
      const loadedTrips = localStorageService.getTrips();
      setTrips(loadedTrips);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sort trips by start date
  const sortedTrips = useMemo(() => {
    return [...trips].sort((a, b) => {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
  }, [trips]);

  // Current and upcoming trips
  const upcomingTrips = useMemo(() => {
    const now = new Date();
    return sortedTrips.filter(trip => new Date(trip.endDate) >= now);
  }, [sortedTrips]);

  // Past trips
  const pastTrips = useMemo(() => {
    const now = new Date();
    return sortedTrips.filter(trip => new Date(trip.endDate) < now)
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()); // Most recent first
  }, [sortedTrips]);

  // Get days until departure for a trip
  const getDaysUntilDeparture = (startDate: Date) => {
    const now = new Date();
    const start = new Date(startDate);
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Create a new trip
  const createTrip = async (tripData: TripCreationData) => {
    try {
      const newTrip = localStorageService.addTrip(tripData);
      setTrips(prevTrips => [...prevTrips, newTrip]);
      return newTrip;
    } catch (error) {
      console.error('Error creating trip:', error);
      throw error;
    }
  };

  // Update an existing trip
  const updateTrip = async (tripId: number, tripData: Partial<Trip>) => {
    try {
      const updatedTrip = localStorageService.updateTrip(tripId, tripData);
      if (updatedTrip) {
        setTrips(prevTrips => 
          prevTrips.map(trip => trip.id === tripId ? updatedTrip : trip)
        );
      }
      return updatedTrip;
    } catch (error) {
      console.error('Error updating trip:', error);
      throw error;
    }
  };

  // Delete a trip
  const deleteTrip = async (tripId: number) => {
    try {
      const success = localStorageService.deleteTrip(tripId);
      if (success) {
        setTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripId));
      }
      return success;
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw error;
    }
  };

  // Get a specific trip by ID
  const getTripById = (tripId: number) => {
    return trips.find(trip => trip.id === tripId);
  };

  return {
    trips,
    upcomingTrips,
    pastTrips,
    loading,
    createTrip,
    updateTrip,
    deleteTrip,
    getTripById,
    getDaysUntilDeparture
  };
}