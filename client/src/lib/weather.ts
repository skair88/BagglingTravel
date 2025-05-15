interface WeatherForecast {
  date: Date;
  temperature: number;
  condition: string;
  icon: string;
}

// Function to get weather forecast for a date range and location
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
    
    // Calculate the number of days to fetch
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    // In a real app, we would call a weather API like OpenMeteo, OpenWeatherMap, etc.
    // This is a placeholder that generates sample data based on the date range
    
    // Create a placeholder forecast for demonstration
    const forecast: WeatherForecast[] = [];
    const tempBase = 20 + Math.random() * 10; // Base temperature between 20-30°C
    
    for (let i = 0; i < diffDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      
      // Generate semi-random weather data
      const dayVariation = Math.sin(i * 0.5) * 5; // Temperature varies in a sine wave pattern
      const temperature = tempBase + dayVariation;
      
      // Determine condition and icon based on temperature
      let condition = 'Clear';
      let icon = '01d'; // Clear sky icon from OpenWeatherMap
      
      if (temperature < 20) {
        condition = 'Cloudiness';
        icon = '03d'; // Scattered clouds
      } else if (temperature > 28) {
        condition = 'Sunny';
        icon = '01d'; // Clear sky
      } else {
        condition = 'Partly cloudy';
        icon = '02d'; // Few clouds
      }
      
      forecast.push({
        date: currentDate,
        temperature,
        condition,
        icon
      });
    }
    
    return forecast;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    return [];
  }
}