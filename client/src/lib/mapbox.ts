/**
 * Functions for working with Mapbox API
 */

// Base URL for Mapbox API
const MAPBOX_API_URL = "https://api.mapbox.com";

// API key from environment variables
const MAPBOX_API_KEY = import.meta.env.VITE_MAPBOX_API_KEY;

// Check if Mapbox API is available
export function isMapboxAvailable() {
  return !!MAPBOX_API_KEY;
}

/**
 * Интерфейс для результатов геокодирования
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
 * Интерфейс для результатов поиска локаций по запросу
 */
export interface LocationSuggestion {
  id: string;
  name: string;
  fullName: string;
}

/**
 * Поиск локаций по запросу пользователя
 * @param query Текст запроса для поиска локаций
 * @param limit Максимальное количество результатов (по умолчанию 5)
 * @param language Язык результатов (поддерживаются 'ru' и 'en')
 */
export async function searchLocations(
  query: string,
  limit: number = 5,
  language: string = "en"
): Promise<LocationSuggestion[]> {
  try {
    // Используем geocoding API для поиска мест по запросу
    const response = await fetch(
      `${MAPBOX_API_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?access_token=${MAPBOX_API_KEY}&limit=${limit}&language=${language}`
    );

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Преобразуем результаты в формат LocationSuggestion
    return data.features.map((feature: any) => ({
      id: feature.id,
      name: feature.text,
      fullName: feature.place_name,
    }));
  } catch (error) {
    console.error("Error searching locations:", error);
    throw new Error(
      `Failed to search locations: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Получение информации о локации по координатам
 * @param longitude Долгота
 * @param latitude Широта
 * @param language Язык результатов (поддерживаются 'ru' и 'en')
 */
export async function reverseGeocode(
  longitude: number,
  latitude: number,
  language: string = "en"
): Promise<GeocodeResult> {
  try {
    const response = await fetch(
      `${MAPBOX_API_URL}/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_API_KEY}&language=${language}`
    );

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.statusText}`);
    }

    const data = await response.json();
    const feature = data.features[0]; // Берем первый (самый точный) результат

    // Извлекаем информацию о стране, регионе и городе
    let country = "";
    let region = "";
    let city = "";

    for (const context of feature.context || []) {
      if (context.id.startsWith("country")) {
        country = context.text;
      } else if (context.id.startsWith("region")) {
        region = context.text;
      } else if (context.id.startsWith("place")) {
        city = context.text;
      }
    }

    return {
      id: feature.id,
      name: feature.text,
      placeName: feature.place_name,
      center: feature.center,
      country,
      region,
      city,
    };
  } catch (error) {
    console.error("Error in reverse geocoding:", error);
    throw new Error(
      `Failed to reverse geocode: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
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
): Promise<[number, number]> {
  try {
    const response = await fetch(
      `${MAPBOX_API_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(
        placeName
      )}.json?access_token=${MAPBOX_API_KEY}&limit=1&language=${language}`
    );

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      throw new Error(`No results found for location: ${placeName}`);
    }

    return data.features[0].center;
  } catch (error) {
    console.error("Error getting coordinates:", error);
    throw new Error(
      `Failed to get coordinates: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
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
    return [];
  }
  
  try {
    const response = await fetch(
      `${MAPBOX_API_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?access_token=${MAPBOX_API_KEY}&limit=${limit}&language=${language}`
    );
    
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return [];
    }
    
    return data.features.map((feature: any) => ({
      placeName: feature.place_name,
      lat: feature.center[1], // Mapbox returns [longitude, latitude]
      lng: feature.center[0]
    }));
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
}