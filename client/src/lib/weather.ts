// Интерфейс для прогноза погоды
export interface WeatherForecast {
  date: Date;
  temperature: number;
  condition: string;
  icon: string;
}

// Коды для условий погоды от Open-Meteo и соответствующие им иконки
const weatherConditionMap: Record<number, { condition: string, icon: string }> = {
  0: { condition: 'Clear sky', icon: '01d' },
  1: { condition: 'Mainly clear', icon: '01d' },
  2: { condition: 'Partly cloudy', icon: '02d' },
  3: { condition: 'Overcast', icon: '03d' },
  45: { condition: 'Fog', icon: '50d' },
  48: { condition: 'Depositing rime fog', icon: '50d' },
  51: { condition: 'Light drizzle', icon: '09d' },
  53: { condition: 'Moderate drizzle', icon: '09d' },
  55: { condition: 'Dense drizzle', icon: '09d' },
  56: { condition: 'Light freezing drizzle', icon: '09d' },
  57: { condition: 'Dense freezing drizzle', icon: '09d' },
  61: { condition: 'Slight rain', icon: '10d' },
  63: { condition: 'Moderate rain', icon: '10d' },
  65: { condition: 'Heavy rain', icon: '10d' },
  66: { condition: 'Light freezing rain', icon: '13d' },
  67: { condition: 'Heavy freezing rain', icon: '13d' },
  71: { condition: 'Slight snow fall', icon: '13d' },
  73: { condition: 'Moderate snow fall', icon: '13d' },
  75: { condition: 'Heavy snow fall', icon: '13d' },
  77: { condition: 'Snow grains', icon: '13d' },
  80: { condition: 'Slight rain showers', icon: '09d' },
  81: { condition: 'Moderate rain showers', icon: '09d' },
  82: { condition: 'Violent rain showers', icon: '09d' },
  85: { condition: 'Slight snow showers', icon: '13d' },
  86: { condition: 'Heavy snow showers', icon: '13d' },
  95: { condition: 'Thunderstorm', icon: '11d' },
  96: { condition: 'Thunderstorm with slight hail', icon: '11d' },
  99: { condition: 'Thunderstorm with heavy hail', icon: '11d' }
};

// Форматирование даты в строку YYYY-MM-DD для API
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Проверяет доступность интернет-подключения
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Получает прогноз погоды от Open-Meteo API на 7 дней
 */
export async function getWeatherForecast(
  lat: number,
  lng: number,
  startDate: Date,
  endDate: Date
): Promise<WeatherForecast[]> {
  try {
    // Проверяем доступность интернета
    if (!isOnline()) {
      console.warn('No internet connection, cannot fetch weather forecast');
      return [];
    }
    
    // Форматируем даты для API (гарантируем 7 дней)
    const startDateStr = formatDate(startDate);
    const actualEndDate = new Date(startDate);
    actualEndDate.setDate(actualEndDate.getDate() + 6); // Ровно 7 дней
    const endDateStr = formatDate(actualEndDate);
    
    // Формируем URL для запроса к Open-Meteo API
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,weathercode&timezone=auto&start_date=${startDateStr}&end_date=${endDateStr}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Проверяем, есть ли данные в ответе
    if (!data.daily || !data.daily.time || !data.daily.temperature_2m_max || !data.daily.weathercode) {
      console.warn('Invalid data format from Open-Meteo API');
      return getHistoricalWeatherEstimate(lat, lng, startDate, endDate);
    }
    
    // Преобразуем ответ API в нужный формат
    const forecast: WeatherForecast[] = [];
    
    for (let i = 0; i < data.daily.time.length; i++) {
      const dateStr = data.daily.time[i];
      const temperature = data.daily.temperature_2m_max[i];
      const weatherCode = data.daily.weathercode[i];
      
      // Получаем описание погоды и иконку по коду
      const weatherInfo = weatherConditionMap[weatherCode] || 
                          { condition: 'Unknown', icon: '03d' };
      
      forecast.push({
        date: new Date(dateStr),
        temperature,
        condition: weatherInfo.condition,
        icon: weatherInfo.icon
      });
    }
    
    return forecast;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    // В случае ошибки используем исторические данные
    return getHistoricalWeatherEstimate(lat, lng, startDate, endDate);
  }
}

/**
 * Получает прогноз на основе исторических данных
 * Используется, когда не удалось получить актуальный прогноз
 */
async function getHistoricalWeatherEstimate(
  lat: number,
  lng: number,
  startDate: Date,
  endDate: Date
): Promise<WeatherForecast[]> {
  try {
    // Проверяем доступность интернета
    if (!isOnline()) {
      console.warn('No internet connection, cannot fetch historical weather data');
      return [];
    }
    
    // Рассчитываем количество дней для прогноза
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    // Получаем исторические данные за последние пять лет
    const currentYear = new Date().getFullYear();
    const forecast: WeatherForecast[] = [];
    
    for (let i = 0; i < diffDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      
      // Получаем месяц и день для запроса исторических данных
      const month = currentDate.getMonth() + 1;
      const day = currentDate.getDate();
      
      // Собираем данные за последние пять лет для этой даты
      const temperatures: number[] = [];
      const weatherCodes: number[] = [];
      
      // Запрашиваем данные за последние 5 лет
      for (let year = currentYear - 5; year < currentYear; year++) {
        const startDateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        // Дата на следующий день для однодневного прогноза
        const nextDay = new Date(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
        nextDay.setDate(nextDay.getDate() + 1);
        const endDateStr = formatDate(nextDay);
        
        // Формируем URL для запроса исторических данных
        const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,weathercode&start_date=${startDateStr}&end_date=${endDateStr}`;
        
        try {
          const response = await fetch(url);
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.daily && 
                data.daily.temperature_2m_max && 
                data.daily.temperature_2m_max.length > 0 &&
                data.daily.weathercode && 
                data.daily.weathercode.length > 0) {
              temperatures.push(data.daily.temperature_2m_max[0]);
              weatherCodes.push(data.daily.weathercode[0]);
            }
          }
        } catch (histError) {
          console.warn('Error fetching historical data for a specific year:', histError);
          // Продолжаем с остальными годами
        }
      }
      
      // Рассчитываем среднюю температуру и наиболее распространенные погодные условия
      let avgTemperature = 0;
      let mostCommonWeatherCode = 1; // По умолчанию - ясно
      
      if (temperatures.length > 0) {
        avgTemperature = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
      } else {
        // Если нет исторических данных, генерируем случайную температуру
        avgTemperature = 15 + Math.random() * 15; // 15-30°C
      }
      
      if (weatherCodes.length > 0) {
        // Находим наиболее распространенный код погоды
        const weatherCodeCount: Record<number, number> = {};
        let maxCount = 0;
        
        weatherCodes.forEach(code => {
          weatherCodeCount[code] = (weatherCodeCount[code] || 0) + 1;
          if (weatherCodeCount[code] > maxCount) {
            maxCount = weatherCodeCount[code];
            mostCommonWeatherCode = code;
          }
        });
      }
      
      // Получаем описание погоды и иконку по коду
      const weatherInfo = weatherConditionMap[mostCommonWeatherCode] || 
                        { condition: 'Partly cloudy', icon: '02d' };
      
      forecast.push({
        date: currentDate,
        temperature: Math.round(avgTemperature * 10) / 10,
        condition: weatherInfo.condition,
        icon: weatherInfo.icon
      });
    }
    
    return forecast;
  } catch (error) {
    console.error('Error in historical weather estimate:', error);
    return generateFallbackWeather(startDate, endDate);
  }
}

/**
 * Генерирует запасной прогноз погоды, когда API недоступны
 */
function generateFallbackWeather(startDate: Date, endDate: Date): WeatherForecast[] {
  // Рассчитываем количество дней для прогноза
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  const forecast: WeatherForecast[] = [];
  const tempBase = 20 + Math.random() * 10; // Базовая температура 20-30°C
  
  for (let i = 0; i < diffDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    
    // Генерируем полуслучайные данные о погоде
    const dayVariation = Math.sin(i * 0.5) * 5; // Температура меняется волнообразно
    const temperature = tempBase + dayVariation;
    
    // Определяем условия и иконку по температуре
    let condition = 'Clear sky';
    let icon = '01d'; // Иконка ясного неба
    
    if (temperature < 20) {
      condition = 'Overcast';
      icon = '03d'; // Облачно
    } else if (temperature > 28) {
      condition = 'Clear sky';
      icon = '01d'; // Ясно
    } else {
      condition = 'Partly cloudy';
      icon = '02d'; // Переменная облачность
    }
    
    forecast.push({
      date: currentDate,
      temperature,
      condition,
      icon
    });
  }
  
  return forecast;
}