
/**
 * Функции для предсказания активностей на основе местоположения и погоды
 */

import { searchLocations } from './mapbox';

// Интерфейс для результатов предсказания активностей
export interface ActivityPrediction {
  activityId: string;
  confidence: number; // 0-1, где 1 - максимальная уверенность
  reason: string;
}

// Функция для проверки наличия водоемов в радиусе 10 км
async function hasWaterBodies(lat: number, lng: number): Promise<boolean> {
  try {
    // Поиск водоемов рядом с местом назначения
    const waterSearchQueries = [
      'beach', 'lake', 'river', 'sea', 'ocean', 'swimming pool', 'water park'
    ];
    
    for (const query of waterSearchQueries) {
      const searchQuery = `${query} near ${lat},${lng}`;
      const results = await searchLocations(searchQuery, 3);
      
      if (results.length > 0) {
        // Проверяем, есть ли результаты с упоминанием воды
        const hasWater = results.some(result => 
          result.fullName.toLowerCase().includes('beach') ||
          result.fullName.toLowerCase().includes('lake') ||
          result.fullName.toLowerCase().includes('river') ||
          result.fullName.toLowerCase().includes('sea') ||
          result.fullName.toLowerCase().includes('ocean') ||
          result.fullName.toLowerCase().includes('pool')
        );
        
        if (hasWater) return true;
      }
    }
    
    return false;
  } catch (error) {
    console.warn('Error checking for water bodies:', error);
    return false;
  }
}

// Функция для проверки наличия гор в радиусе 10 км
async function hasMountains(lat: number, lng: number): Promise<boolean> {
  try {
    const mountainSearchQueries = [
      'mountain', 'hill', 'hiking trail', 'national park', 'forest'
    ];
    
    for (const query of mountainSearchQueries) {
      const searchQuery = `${query} near ${lat},${lng}`;
      const results = await searchLocations(searchQuery, 3);
      
      if (results.length > 0) {
        const hasMountainTerrain = results.some(result => 
          result.fullName.toLowerCase().includes('mountain') ||
          result.fullName.toLowerCase().includes('hill') ||
          result.fullName.toLowerCase().includes('park') ||
          result.fullName.toLowerCase().includes('trail') ||
          result.fullName.toLowerCase().includes('forest')
        );
        
        if (hasMountainTerrain) return true;
      }
    }
    
    return false;
  } catch (error) {
    console.warn('Error checking for mountains:', error);
    return false;
  }
}

// Функция для проверки наличия крупных городов с торговыми центрами
async function hasShoppingCenters(lat: number, lng: number): Promise<boolean> {
  try {
    const shoppingSearchQueries = [
      'shopping mall', 'shopping center', 'market', 'downtown', 'city center'
    ];
    
    for (const query of shoppingSearchQueries) {
      const searchQuery = `${query} near ${lat},${lng}`;
      const results = await searchLocations(searchQuery, 3);
      
      if (results.length > 0) {
        const hasShopping = results.some(result => 
          result.fullName.toLowerCase().includes('mall') ||
          result.fullName.toLowerCase().includes('shopping') ||
          result.fullName.toLowerCase().includes('market') ||
          result.fullName.toLowerCase().includes('center') ||
          result.fullName.toLowerCase().includes('downtown')
        );
        
        if (hasShopping) return true;
      }
    }
    
    return false;
  } catch (error) {
    console.warn('Error checking for shopping centers:', error);
    return false;
  }
}

// Функция для проверки наличия достопримечательностей
async function hasAttractions(lat: number, lng: number): Promise<boolean> {
  try {
    const attractionSearchQueries = [
      'tourist attraction', 'museum', 'monument', 'cathedral', 'castle', 'historic site'
    ];
    
    for (const query of attractionSearchQueries) {
      const searchQuery = `${query} near ${lat},${lng}`;
      const results = await searchLocations(searchQuery, 3);
      
      if (results.length > 0) {
        const hasAttraction = results.some(result => 
          result.fullName.toLowerCase().includes('museum') ||
          result.fullName.toLowerCase().includes('monument') ||
          result.fullName.toLowerCase().includes('cathedral') ||
          result.fullName.toLowerCase().includes('castle') ||
          result.fullName.toLowerCase().includes('historic') ||
          result.fullName.toLowerCase().includes('tourist')
        );
        
        if (hasAttraction) return true;
      }
    }
    
    return false;
  } catch (error) {
    console.warn('Error checking for attractions:', error);
    return false;
  }
}

// Функция для проверки погодных условий для купания
function isSuitableForSwimming(temperatures: number[]): boolean {
  if (temperatures.length === 0) return false;
  
  // Средняя температура должна быть выше 20°C
  const avgTemp = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
  return avgTemp > 20;
}

/**
 * Основная функция для предсказания активностей
 */
export async function predictActivities(
  lat: number,
  lng: number,
  temperatures: number[] = []
): Promise<ActivityPrediction[]> {
  const predictions: ActivityPrediction[] = [];
  
  try {
    // Проверяем swimming
    const [hasWater, suitableWeather] = await Promise.all([
      hasWaterBodies(lat, lng),
      Promise.resolve(isSuitableForSwimming(temperatures))
    ]);
    
    if (hasWater && suitableWeather) {
      predictions.push({
        activityId: 'swimming',
        confidence: 0.8,
        reason: 'Water bodies found nearby and weather is suitable for swimming'
      });
    } else if (hasWater) {
      predictions.push({
        activityId: 'swimming',
        confidence: 0.4,
        reason: 'Water bodies found nearby'
      });
    }
    
    // Проверяем hiking
    const mountainsNearby = await hasMountains(lat, lng);
    if (mountainsNearby) {
      predictions.push({
        activityId: 'hiking',
        confidence: 0.7,
        reason: 'Mountains or hiking trails found nearby'
      });
    }
    
    // Проверяем shopping (business)
    const shoppingNearby = await hasShoppingCenters(lat, lng);
    if (shoppingNearby) {
      predictions.push({
        activityId: 'business',
        confidence: 0.6,
        reason: 'Shopping centers or city center found nearby'
      });
    }
    
    // Проверяем sightseeing
    const attractionsNearby = await hasAttractions(lat, lng);
    if (attractionsNearby) {
      predictions.push({
        activityId: 'sightseeing',
        confidence: 0.8,
        reason: 'Tourist attractions found nearby'
      });
    }
    
  } catch (error) {
    console.error('Error predicting activities:', error);
  }
  
  // Сортируем по уверенности
  return predictions.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Функция для получения рекомендуемых активностей с высокой уверенностью
 */
export function getRecommendedActivities(predictions: ActivityPrediction[]): string[] {
  return predictions
    .filter(prediction => prediction.confidence >= 0.6)
    .map(prediction => prediction.activityId);
}
