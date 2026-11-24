import {
  CityWeatherData,
  TemperatureUnit,
  WeatherConditionType,
  WeatherRecommendation,
} from '../types/weather';

/**
 * Converts Celsius to the requested unit and rounds cleanly.
 */
export function convertTemp(tempC: number, unit: TemperatureUnit): number {
  if (unit === 'F') {
    return Math.round((tempC * 9) / 5 + 32);
  }
  return Math.round(tempC);
}

/**
 * Formats temperature with degree symbol (e.g., "27°" or "27°C").
 */
export function formatTemp(
  tempC: number,
  unit: TemperatureUnit,
  includeUnit = false
): string {
  const val = convertTemp(tempC, unit);
  return includeUnit ? `${val}°${unit}` : `${val}°`;
}

/**
 * Formats current local date and time for a city's IANA timezone.
 */
export function formatCityDateTime(timezone: string, now: Date = new Date()): {
  dateStr: string;
  timeStr: string;
} {
  try {
    const dateStr = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: timezone,
    }).format(now);

    const timeStr = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone,
    }).format(now);

    return { dateStr, timeStr };
  } catch {
    return {
      dateStr: now.toDateString(),
      timeStr: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }
}

/**
 * Returns UV Index risk label and accessible color token.
 */
export function getUvRisk(uv: number): {
  label: string;
  description: string;
  barColor: string;
  textColor: string;
} {
  if (uv <= 2) {
    return {
      label: 'Low',
      description: 'Minimal protection required',
      barColor: 'bg-emerald-500',
      textColor: 'text-emerald-700 dark:text-emerald-400',
    };
  }
  if (uv <= 5) {
    return {
      label: 'Moderate',
      description: 'Shade advised near midday',
      barColor: 'bg-amber-500',
      textColor: 'text-amber-700 dark:text-amber-400',
    };
  }
  if (uv <= 7) {
    return {
      label: 'High',
      description: 'SPF 30+ sunscreen recommended',
      barColor: 'bg-orange-500',
      textColor: 'text-orange-700 dark:text-orange-400',
    };
  }
  if (uv <= 10) {
    return {
      label: 'Very High',
      description: 'Extra sun protection needed',
      barColor: 'bg-rose-500',
      textColor: 'text-rose-700 dark:text-rose-400',
    };
  }
  return {
    label: 'Extreme',
    description: 'Avoid direct midday exposure',
    barColor: 'bg-red-600',
    textColor: 'text-red-700 dark:text-red-400',
  };
}

/**
 * Returns Humidity comfort descriptor.
 */
export function getHumidityComfort(humidity: number): string {
  if (humidity < 35) return 'Dry air';
  if (humidity <= 60) return 'Comfortable';
  if (humidity <= 75) return 'Moderately humid';
  return 'High moisture';
}

/**
 * Returns Visibility clarity descriptor.
 */
export function getVisibilityStatus(km: number): string {
  if (km >= 10) return 'Crystal clear view';
  if (km >= 6) return 'Good visibility';
  if (km >= 3) return 'Light haze';
  return 'Reduced visibility';
}

/**
 * Returns Wind speed Beaufort-style descriptor.
 */
export function getWindStatus(kmh: number): string {
  if (kmh < 10) return 'Calm breeze';
  if (kmh < 20) return 'Gentle breeze';
  if (kmh < 32) return 'Moderate wind';
  return 'Strong gusts';
}

/**
 * Returns atmospheric gradient classes for the primary Current Weather hero card.
 * Stays strictly within a refined blue / slate-blue SaaS atmospheric palette.
 */
export function getHeroGradient(icon: WeatherConditionType): string {
  switch (icon) {
    case 'sunny':
      return 'from-sky-500 via-blue-600 to-blue-700 dark:from-sky-600 dark:via-blue-700 dark:to-slate-900';
    case 'partly-cloudy':
      return 'from-blue-500 via-blue-600 to-indigo-700 dark:from-blue-700 dark:via-slate-800 dark:to-slate-900';
    case 'rainy':
    case 'heavy-rain':
      return 'from-slate-600 via-blue-800 to-slate-900 dark:from-slate-800 dark:via-blue-950 dark:to-slate-950';
    case 'thunderstorm':
      return 'from-slate-700 via-indigo-900 to-slate-950 dark:from-slate-800 dark:via-indigo-950 dark:to-slate-950';
    case 'cloudy':
    case 'mist':
      return 'from-sky-600 via-slate-600 to-slate-800 dark:from-slate-700 dark:via-slate-800 dark:to-slate-950';
    case 'breezy':
      return 'from-cyan-600 via-blue-600 to-blue-800 dark:from-cyan-800 dark:via-blue-900 dark:to-slate-950';
    case 'clear-night':
    default:
      return 'from-blue-700 via-indigo-800 to-slate-900 dark:from-blue-900 dark:via-slate-900 dark:to-slate-950';
  }
}

/**
 * Haversine distance in km between two lat/lon coordinates.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Dynamic frontend recommendation engine based on current & upcoming city conditions.
 */
export function generateWeatherRecommendations(
  city: CityWeatherData,
  unit: TemperatureUnit
): WeatherRecommendation[] {
  const { current, hourly } = city;
  const recommendations: WeatherRecommendation[] = [];

  const next6HoursRainPeak = Math.max(
    current.rainProbability,
    ...hourly.slice(0, 6).map((h) => h.rainProbability)
  );

  // 1. Rain / Storm recommendation
  if (current.icon === 'thunderstorm' || current.rainfallMm >= 15) {
    recommendations.push({
      id: 'storm-rain',
      category: 'Rain',
      severity: 'caution',
      title: 'Heavy rain & storm activity',
      advice:
        'Carry a sturdy umbrella and waterproof footwear. Avoid waterlogged roads and open areas during peak squalls.',
      metricContext: `${current.rainfallMm.toFixed(1)} mm rainfall · ${next6HoursRainPeak}% chance`,
    });
  } else if (next6HoursRainPeak >= 45 || current.rainfallMm >= 2) {
    recommendations.push({
      id: 'rain-expected',
      category: 'Rain',
      severity: 'advisory',
      title: 'Rain expected today',
      advice:
        'Pack a compact umbrella before heading out. Allow extra buffer time for evening commutes on wet roads.',
      metricContext: `${next6HoursRainPeak}% rain probability · ${current.rainfallMm.toFixed(1)} mm`,
    });
  }

  // 2. Heat / Cool temperature recommendation
  if (current.tempC >= 33 || current.feelsLikeC >= 35) {
    recommendations.push({
      id: 'high-temp',
      category: 'Heat',
      severity: 'caution',
      title: 'High afternoon heat — stay hydrated',
      advice:
        'Drink water frequently, wear breathable cotton layers, and schedule strenuous outdoor tasks before 10:30 AM or after 5:00 PM.',
      metricContext: `Feels like ${formatTemp(current.feelsLikeC, unit, true)}`,
    });
  } else if (current.tempC <= 14) {
    recommendations.push({
      id: 'chilly-temp',
      category: 'Outdoor',
      severity: 'advisory',
      title: 'Cool mountain or crisp air',
      advice:
        'Layer with a light jacket or windbreaker, especially during early morning and post-sunset hours.',
      metricContext: `Low of ${formatTemp(current.minTempC, unit, true)} tonight`,
    });
  }

  // 3. UV Index recommendation
  if (current.uvIndex >= 6) {
    const uvInfo = getUvRisk(current.uvIndex);
    recommendations.push({
      id: 'high-uv',
      category: 'UV',
      severity: current.uvIndex >= 8 ? 'caution' : 'advisory',
      title: `${uvInfo.label} UV index — use sunscreen`,
      advice:
        'Apply broad-spectrum SPF 30+ sunscreen, wear UV-protective sunglasses, and seek shade between 11:00 AM and 3:00 PM.',
      metricContext: `UV Index ${current.uvIndex} (${uvInfo.label})`,
    });
  }

  // 4. Wind recommendation
  if (current.windSpeedKmh >= 24 || current.windGustKmh >= 35) {
    recommendations.push({
      id: 'strong-wind',
      category: 'Wind',
      severity: 'caution',
      title: 'Strong breezes — take care outdoors',
      advice:
        'Secure lightweight balcony items and exercise caution when cycling or riding two-wheelers across exposed flyovers.',
      metricContext: `${current.windSpeedKmh} km/h ${current.windDirection} · Gusts ${current.windGustKmh} km/h`,
    });
  }

  // 5. Humidity or Visibility recommendation
  if (current.humidity >= 78 && recommendations.length < 4) {
    recommendations.push({
      id: 'high-humidity',
      category: 'Humidity',
      severity: 'advisory',
      title: 'Elevated coastal humidity',
      advice:
        'Keep indoor spaces well-ventilated and opt for moisture-wicking fabrics to stay comfortable during midday errands.',
      metricContext: `${current.humidity}% relative humidity`,
    });
  } else if (current.visibilityKm <= 5 && recommendations.length < 4) {
    recommendations.push({
      id: 'low-visibility',
      category: 'Visibility',
      severity: 'advisory',
      title: 'Hazy atmospheric visibility',
      advice:
        'Use low-beam headlights during dawn or dusk driving and keep a comfortable following distance on highways.',
      metricContext: `${current.visibilityKm} km visibility`,
    });
  }

  // 6. Pleasant outdoor weather recommendation
  if (
    current.tempC >= 18 &&
    current.tempC <= 30 &&
    next6HoursRainPeak < 40 &&
    current.windSpeedKmh < 24
  ) {
    recommendations.push({
      id: 'pleasant-outdoor',
      category: 'Outdoor',
      severity: 'favorable',
      title: 'Pleasant weather for outdoor plans',
      advice:
        'Balanced temperatures and calm airflow make this an ideal window for morning walks, cycling, or open-air dining.',
      metricContext: `${formatTemp(current.tempC, unit, true)} · ${current.humidity}% humidity`,
    });
  }

  // Ensure at least 3 balanced recommendations for every city
  if (recommendations.length < 3) {
    recommendations.push({
      id: 'evening-comfort',
      category: 'Outdoor',
      severity: 'favorable',
      title: 'Comfortable evening outlook',
      advice:
        `Temperatures ease toward ${formatTemp(current.minTempC, unit, true)} after sunset at ${current.sunset}, great for a relaxed evening stroll.`,
      metricContext: `Sunset at ${current.sunset}`,
    });
  }

  return recommendations.slice(0, 4);
}
