/**
 * Функции для работы с Mapbox API
 */

// Базовый URL для Mapbox API
const MAPBOX_API_URL = "https://api.mapbox.com";

// API ключ Mapbox берем из переменных окружения
// В Vite нужно использовать import.meta.env вместо process.env
const MAPBOX_API_KEY = import.meta.env.VITE_MAPBOX_API_KEY;

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
 * Получение координат для заданного места
 * @param placeName Название места (город, страна и т.д.)
 * @param language Язык запроса (поддерживаются 'ru' и 'en')
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