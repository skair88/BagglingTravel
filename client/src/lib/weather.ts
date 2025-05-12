// OpenMeteo weather API integration

interface WeatherForecast {
  date: Date;
  temperature: number;
  condition: string;
  icon: string;
}

// Map WMO weather codes to conditions and icons
const weatherCodeMapping: Record<number, { condition: string; icon: string }> = {
  0: { condition: 'Clear', icon: 'wb_sunny' },
  1: { condition: 'Clear', icon: 'wb_sunny' },
  2: { condition: 'Partly Cloudy', icon: 'partly_cloudy_day' },
  3: { condition: 'Cloudy', icon: 'cloud' },
  45: { condition: 'Foggy', icon: 'cloud' },
  48: { condition: 'Foggy', icon: 'cloud' },
  51: { condition: 'Drizzle', icon: 'grain' },
  53: { condition: 'Drizzle', icon: 'grain' },
  55: { condition: 'Drizzle', icon: 'grain' },
  56: { condition: 'Freezing Drizzle', icon: 'ac_unit' },
  57: { condition: 'Freezing Drizzle', icon: 'ac_unit' },
  61: { condition: 'Rain', icon: 'grain' },
  63: { condition: 'Rain', icon: 'grain' },
  65: { condition: 'Rain', icon: 'grain' },
  66: { condition: 'Freezing Rain', icon: 'ac_unit' },
  67: { condition: 'Freezing Rain', icon: 'ac_unit' },
  71: { condition: 'Snow', icon: 'ac_unit' },
  73: { condition: 'Snow', icon: 'ac_unit' },
  75: { condition: 'Snow', icon: 'ac_unit' },
  77: { condition: 'Snow', icon: 'ac_unit' },
  80: { condition: 'Rain Showers', icon: 'grain' },
  81: { condition: 'Rain Showers', icon: 'grain' },
  82: { condition: 'Rain Showers', icon: 'grain' },
  85: { condition: 'Snow Showers', icon: 'ac_unit' },
  86: { condition: 'Snow Showers', icon: 'ac_unit' },
  95: { condition: 'Thunderstorm', icon: 'thunderstorm' },
  96: { condition: 'Thunderstorm', icon: 'thunderstorm' },
  99: { condition: 'Thunderstorm', icon: 'thunderstorm' }
};

// Get weather forecast for a location and date range
export async function getWeatherForecast(
  lat: number,
  lng: number,
  startDate: Date,
  endDate: Date
): Promise<WeatherForecast[]> {
  try {
    // Format dates for API
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };
    
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    
    // Call OpenMeteo API
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${lat}&longitude=${lng}&` +
      `daily=weathercode,temperature_2m_max&` +
      `timezone=auto&` +
      `start_date=${start}&end_date=${end}`
    );
    
    if (!response.ok) {
      throw new Error(`OpenMeteo API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process response
    const forecast: WeatherForecast[] = [];
    
    if (data.daily) {
      const { time, weathercode, temperature_2m_max } = data.daily;
      
      for (let i = 0; i < time.length; i++) {
        const weatherCode = weathercode[i];
        const weatherInfo = weatherCodeMapping[weatherCode] || 
                           { condition: 'Unknown', icon: 'help_outline' };
        
        forecast.push({
          date: new Date(time[i]),
          temperature: Math.round(temperature_2m_max[i]),
          condition: weatherInfo.condition,
          icon: weatherInfo.icon
        });
      }
    }
    
    return forecast;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return [];
  }
}
