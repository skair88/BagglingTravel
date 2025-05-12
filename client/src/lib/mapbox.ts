// Mapbox integration

interface LocationResponse {
  placeName: string;
  lat: number;
  lng: number;
}

// Get location information from a search query
export async function getLocation(query: string): Promise<LocationResponse | null> {
  try {
    const accessToken = process.env.MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${accessToken}&limit=1&types=place`
    );
    
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      return {
        placeName: feature.place_name,
        lng: feature.center[0],
        lat: feature.center[1]
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error in getLocation:', error);
    return null;
  }
}

// Generate a static map URL for a location
export function getStaticMapUrl(lng: number, lat: number, zoom = 12, width = 600, height = 400): string {
  const accessToken = process.env.MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
  
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+3B82F6(${lng},${lat})/${lng},${lat},${zoom},0/${width}x${height}?access_token=${accessToken}`;
}
