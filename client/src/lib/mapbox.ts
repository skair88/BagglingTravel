// Mapbox API integration

interface LocationResponse {
  placeName: string;
  lat: number;
  lng: number;
}

// Получение API ключа из переменных окружения
const MAPBOX_API_KEY = import.meta.env.MAPBOX_API_KEY;

/**
 * Получает местоположение по поисковому запросу, используя Mapbox Geocoding API
 */
export async function getLocation(query: string): Promise<LocationResponse[]> {
  try {
    // Проверка наличия API ключа
    if (!MAPBOX_API_KEY) {
      console.error('Mapbox API key is not provided');
      return [];
    }

    // Проверка на подключение к интернету
    if (!navigator.onLine) {
      console.warn('No internet connection available');
      return [];
    }

    // Формирование URL для запроса к Mapbox Geocoding API
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${MAPBOX_API_KEY}&limit=5`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Преобразование ответа API в нужный формат
    if (data.features && data.features.length > 0) {
      return data.features.map((feature: any) => ({
        placeName: feature.place_name,
        lng: feature.center[0], // Longitude
        lat: feature.center[1], // Latitude
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching location from Mapbox:', error);
    return [];
  }
}

/**
 * Получает URL для статической карты местоположения
 */
export function getStaticMapUrl(lng: number, lat: number, zoom = 12, width = 600, height = 400): string {
  if (!MAPBOX_API_KEY) {
    console.error('Mapbox API key is not provided');
    return '';
  }
  
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+555555(${lng},${lat})/${lng},${lat},${zoom},0/${width}x${height}?access_token=${MAPBOX_API_KEY}`;
}

/**
 * Проверяет, доступен ли Mapbox API (есть ли подключение к интернету и API ключ)
 */
export function isMapboxAvailable(): boolean {
  return navigator.onLine && !!MAPBOX_API_KEY;
}
