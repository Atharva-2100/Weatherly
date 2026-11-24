/**
 * Weather Recommendation Engine Service
 * Implements configurable thresholds and clear contextual logic:
 * - Rain probability high: recommend umbrella and travel precautions
 * - High heat: hydration and shade advice
 * - High UV: sunscreen SPF 30+ recommendation
 * - High wind: wind warning for outdoors & flyovers
 * - Pleasant weather: outdoor activities
 */

function generateRecommendations(currentWeather, hourlyForecast = []) {
  const recommendations = [];
  const {
    temperature = 25,
    feelsLike = 25,
    humidity = 50,
    windSpeed = 10,
    rainfall = 0,
    uvIndex = 3,
    visibility = 10,
    condition = 'Clear',
    sunset = '18:15'
  } = currentWeather || {};

  // Check upcoming rainfall from next 6 hourly items if available
  const nextHoursRain = hourlyForecast && hourlyForecast.length > 0
    ? Math.max(...hourlyForecast.slice(0, 6).map(h => h.rainProbability || 0))
    : 0;

  const effectiveRainProbability = Math.max(currentWeather.rainProbability || 0, nextHoursRain);

  // 1. Storm & Heavy Rain
  const isStorm = /thunderstorm|squall|tornado/i.test(condition);
  if (isStorm || rainfall >= 15) {
    recommendations.push({
      id: 'rec-storm-rain',
      category: 'Rain',
      severity: 'caution',
      title: 'Heavy rain & storm activity',
      advice: 'Carry a sturdy umbrella and waterproof footwear. Avoid waterlogged roads and open areas during peak squalls.',
      metricContext: `${rainfall.toFixed(1)} mm rainfall · ${effectiveRainProbability}% chance`
    });
  } else if (effectiveRainProbability >= 45 || rainfall >= 2) {
    recommendations.push({
      id: 'rec-rain-expected',
      category: 'Rain',
      severity: 'advisory',
      title: 'Rain expected today',
      advice: 'Pack a compact umbrella before heading out. Allow extra buffer time for evening commutes on wet roads.',
      metricContext: `${effectiveRainProbability}% rain probability · ${rainfall.toFixed(1)} mm`
    });
  }

  // 2. High Temperature / Cold Temperature
  if (temperature >= 33 || feelsLike >= 35) {
    recommendations.push({
      id: 'rec-high-temp',
      category: 'Heat',
      severity: 'caution',
      title: 'High afternoon heat — stay hydrated',
      advice: 'Drink water frequently, wear breathable cotton layers, and schedule strenuous outdoor tasks before 10:30 AM or after 5:00 PM.',
      metricContext: `Feels like ${Math.round(feelsLike)}°C`
    });
  } else if (temperature <= 14) {
    recommendations.push({
      id: 'rec-chilly-temp',
      category: 'Outdoor',
      severity: 'advisory',
      title: 'Cool mountain or crisp air',
      advice: 'Layer with a light jacket or windbreaker, especially during early morning and post-sunset hours.',
      metricContext: `Current temperature ${Math.round(temperature)}°C`
    });
  }

  // 3. UV Index
  if (uvIndex !== null && uvIndex >= 6) {
    recommendations.push({
      id: 'rec-high-uv',
      category: 'UV',
      severity: uvIndex >= 8 ? 'caution' : 'advisory',
      title: `${uvIndex >= 8 ? 'Very High' : 'High'} UV index — use sunscreen`,
      advice: 'Apply broad-spectrum SPF 30+ sunscreen, wear UV-protective sunglasses, and seek shade between 11:00 AM and 3:00 PM.',
      metricContext: `UV Index ${uvIndex}`
    });
  }

  // 4. Wind Warning
  if (windSpeed >= 24) {
    recommendations.push({
      id: 'rec-strong-wind',
      category: 'Wind',
      severity: 'caution',
      title: 'Strong breezes — take care outdoors',
      advice: 'Secure lightweight balcony items and exercise caution when cycling or riding two-wheelers across exposed flyovers.',
      metricContext: `${Math.round(windSpeed)} km/h wind velocity`
    });
  }

  // 5. Humidity or Low Visibility
  if (humidity >= 78 && recommendations.length < 4) {
    recommendations.push({
      id: 'rec-high-humidity',
      category: 'Humidity',
      severity: 'advisory',
      title: 'Elevated atmospheric humidity',
      advice: 'Keep indoor spaces well-ventilated and opt for moisture-wicking fabrics to stay comfortable during midday errands.',
      metricContext: `${humidity}% relative humidity`
    });
  } else if (visibility !== null && visibility <= 5 && recommendations.length < 4) {
    recommendations.push({
      id: 'rec-low-visibility',
      category: 'Visibility',
      severity: 'advisory',
      title: 'Hazy atmospheric visibility',
      advice: 'Use low-beam headlights during dawn or dusk driving and keep a comfortable following distance on highways.',
      metricContext: `${visibility} km visibility`
    });
  }

  // 6. Pleasant weather
  if (
    temperature >= 18 &&
    temperature <= 30 &&
    effectiveRainProbability < 40 &&
    windSpeed < 24
  ) {
    recommendations.push({
      id: 'rec-pleasant-outdoor',
      category: 'Outdoor',
      severity: 'favorable',
      title: 'Pleasant weather for outdoor plans',
      advice: 'Balanced temperatures and calm airflow make this an ideal window for morning walks, cycling, or open-air dining.',
      metricContext: `${Math.round(temperature)}°C · ${humidity}% humidity`
    });
  }

  // Ensure baseline recommendation if none triggered
  if (recommendations.length < 3) {
    recommendations.push({
      id: 'rec-evening-comfort',
      category: 'Outdoor',
      severity: 'favorable',
      title: 'Comfortable evening outlook',
      advice: `Weather conditions remain stable into the evening. Sunset is expected at ${sunset || '18:15'}.`,
      metricContext: `Sunset at ${sunset || '18:15'}`
    });
  }

  return recommendations.slice(0, 4);
}

module.exports = {
  generateRecommendations
};
