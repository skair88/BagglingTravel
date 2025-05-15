/**
 * Functions for working with Mapbox API via server proxy
 */

// Base URL for our server API proxy
const API_URL = "/api";

// Check if network is available
export function isMapboxAvailable() {
  return navigator.onLine;
}

/**
 * Interface for geocoding results
 */
export interface GeocodeResult {
  id: string;
  name: string;
  placeName: string;
  center: [number, number]; // [longitude, latitude]
  country: string;
  region?: string;
  city?: string;
}

/**
 * Interface for location search results
 */
export interface LocationSuggestion {
  id: string;
  name: string;
  fullName: string;
}

/**
 * Search for locations by user query
 * @param query Search query text
 * @param limit Maximum number of results (default 5)
 * @param language Result language (supports 'ru' and 'en')
 */
export async function searchLocations(
  query: string,
  limit: number = 5,
  language: string = "en"
): Promise<LocationSuggestion[]> {
  try {
    // Use our proxy API
    const response = await fetch(
      `${API_URL}/mapbox/geocoding?query=${encodeURIComponent(query)}&limit=${limit}&language=${language}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data)) {
      return [];
    }

    // Transform the results into LocationSuggestion format
    return data.map((location: any) => ({
      id: location.id || String(Math.random()),
      name: location.placeName.split(',')[0],
      fullName: location.placeName,
    }));
  } catch (error) {
    console.error("Error searching locations:", error);
    return [];
  }
}

/**
 * Get information about a location by coordinates
 * @param longitude Longitude
 * @param latitude Latitude
 * @param language Result language (supports 'ru' and 'en')
 */
export async function reverseGeocode(
  longitude: number,
  latitude: number,
  language: string = "en"
): Promise<GeocodeResult | null> {
  try {
    // Use our proxy API
    const query = `${longitude},${latitude}`;
    const response = await fetch(
      `${API_URL}/mapbox/geocoding?query=${query}&limit=1&language=${language}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }
    
    const location = data[0];
    
    return {
      id: String(Math.random()),
      name: location.placeName.split(',')[0],
      placeName: location.placeName,
      center: [location.lng, location.lat],
      country: location.placeName.split(',').pop()?.trim() || "",
      region: "",
      city: location.placeName.split(',')[0],
    };
  } catch (error) {
    console.error("Error in reverse geocoding:", error);
    return null;
  }
}

/**
 * Get coordinates for a given place name
 * @param placeName Place name (city, country, etc.)
 * @param language Language for results (supports 'ru' and 'en')
 */
export async function getCoordinates(
  placeName: string,
  language: string = "en"
): Promise<[number, number] | null> {
  try {
    // Use our proxy API
    const response = await fetch(
      `${API_URL}/mapbox/geocoding?query=${encodeURIComponent(placeName)}&limit=1&language=${language}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    const location = data[0];
    return [location.lng, location.lat];
  } catch (error) {
    console.error("Error getting coordinates:", error);
    return null;
  }
}

/**
 * Get location suggestions based on user input
 * @param query Location search query
 * @param limit Maximum number of results (default 5)
 * @param language Result language (supports 'en' and 'ru')
 */
export async function getLocation(
  query: string,
  limit: number = 5,
  language: string = "en"
): Promise<{ placeName: string; lat: number; lng: number }[]> {
  if (!query || !isMapboxAvailable()) {
    console.log("Geocoding not available, network status:", navigator.onLine);
    return [];
  }
  
  try {
    console.log("Fetching locations via proxy with query:", query);
    
    const url = `${API_URL}/mapbox/geocoding?query=${encodeURIComponent(query)}&limit=${limit}&language=${language}`;
    console.log("Request URL:", url);
    
    const response = await fetch(url);
    console.log("Response status:", response.status, response.statusText);
    
    const responseText = await response.text();
    console.log("Raw response:", responseText);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText} - ${responseText}`);
    }
    
    const locations = JSON.parse(responseText) as { placeName: string; lat: number; lng: number }[];
    console.log("Parsed locations:", locations);
    
    if (!locations || locations.length === 0) {
      console.log("No locations found in response");
      return [];
    }
    
    return locations;
  } catch (error) {
    console.error("Error fetching locations:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    return [];
  }
}