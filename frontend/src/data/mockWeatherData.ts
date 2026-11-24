import {
  CityWeatherData,
  DailyForecastItem,
  HourlyForecastItem,
  WeatherConditionType,
} from '../types/weather';

interface CitySeed {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
  utcOffsetHours: number;
  stationCode: string;
  elevationM: number;
  tempC: number;
  feelsLikeC: number;
  minTempC: number;
  maxTempC: number;
  condition: string;
  description: string;
  icon: WeatherConditionType;
  humidity: number;
  dewPointC: number;
  windSpeedKmh: number;
  windGustKmh: number;
  windDirection: string;
  rainfallMm: number;
  rainProbability: number;
  pressureHpa: number;
  pressureTrend: 'Rising' | 'Steady' | 'Falling';
  visibilityKm: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  daylightProgress: number;
  hourlyPattern: {
    tempOffsets: number[];
    rainProbs: number[];
    icons: WeatherConditionType[];
    conditions: string[];
  };
  dailyData: Array<{
    condition: string;
    icon: WeatherConditionType;
    maxOffset: number;
    minOffset: number;
    rainProb: number;
    rainfallMm: number;
    humidity: number;
    windKmh: number;
    uv: number;
  }>;
}

const WEEKDAYS = ['Today', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'];
const DATES = ['Nov 24', 'Nov 25', 'Nov 26', 'Nov 27', 'Nov 28', 'Nov 29', 'Nov 30'];

function buildHourly(seed: CitySeed): HourlyForecastItem[] {
  const startHour = 13; // 1:00 PM local reference for realistic diurnal curve
  const items: HourlyForecastItem[] = [];

  for (let i = 0; i < 24; i++) {
    const hour24 = (startHour + i) % 24;
    const isNight = hour24 >= 19 || hour24 < 6;
    const patternIdx = i % seed.hourlyPattern.tempOffsets.length;
    const diurnalAdjustment =
      Math.sin(((hour24 - 9) / 24) * Math.PI * 2) *
      ((seed.maxTempC - seed.minTempC) / 2.2);

    const rawTemp =
      seed.tempC +
      diurnalAdjustment * 0.55 +
      seed.hourlyPattern.tempOffsets[patternIdx] * 0.45;
    const tempC = Math.round(rawTemp);
    const feelsLikeC = Math.round(
      tempC + (seed.humidity > 72 ? 2 : seed.windSpeedKmh > 22 ? -1 : 0)
    );

    const rainProbability = Math.max(
      0,
      Math.min(100, Math.round(seed.hourlyPattern.rainProbs[patternIdx]))
    );
    const rainfallMm =
      rainProbability >= 55
        ? Number(((rainProbability / 100) * (seed.rainfallMm / 5 + 0.6)).toFixed(1))
        : rainProbability >= 35
          ? Number(((rainProbability / 100) * 0.4).toFixed(1))
          : 0;

    let icon = seed.hourlyPattern.icons[patternIdx];
    let condition = seed.hourlyPattern.conditions[patternIdx];
    if (isNight && icon === 'sunny') {
      icon = 'clear-night';
      condition = 'Clear Night';
    }

    const humidity = Math.max(
      18,
      Math.min(98, Math.round(seed.humidity + (isNight ? 8 : -4) + (rainProbability > 50 ? 6 : 0)))
    );

    const windSpeedKmh = Math.max(
      4,
      Math.round(seed.windSpeedKmh + Math.sin(i * 0.7) * 4)
    );

    const label12h =
      hour24 === 0
        ? '12 AM'
        : hour24 < 12
          ? `${hour24} AM`
          : hour24 === 12
            ? '12 PM'
            : `${hour24 - 12} PM`;

    items.push({
      hourLabel: i === 0 ? 'Now' : label12h,
      fullTime: `${hour24.toString().padStart(2, '0')}:00`,
      tempC: i === 0 ? seed.tempC : tempC,
      feelsLikeC: i === 0 ? seed.feelsLikeC : feelsLikeC,
      condition: i === 0 ? seed.condition : condition,
      icon: i === 0 ? seed.icon : icon,
      rainProbability: i === 0 ? seed.rainProbability : rainProbability,
      rainfallMm,
      humidity: i === 0 ? seed.humidity : humidity,
      windSpeedKmh: i === 0 ? seed.windSpeedKmh : windSpeedKmh,
    });
  }

  return items;
}

function buildDaily(seed: CitySeed): DailyForecastItem[] {
  return seed.dailyData.map((d, idx) => ({
    dayName: WEEKDAYS[idx],
    dateLabel: DATES[idx],
    condition: d.condition,
    icon: d.icon,
    maxTempC: Math.round(seed.maxTempC + d.maxOffset),
    minTempC: Math.round(seed.minTempC + d.minOffset),
    rainProbability: d.rainProb,
    rainfallMm: d.rainfallMm,
    humidity: d.humidity,
    windSpeedKmh: d.windKmh,
    uvIndex: d.uv,
    sunrise: seed.sunrise,
    sunset: seed.sunset,
  }));
}

const CITY_SEEDS: CitySeed[] = [
  {
    id: 'pune',
    name: 'Pune',
    region: 'Maharashtra',
    country: 'India',
    lat: 18.5204,
    lon: 73.8567,
    timezone: 'Asia/Kolkata',
    utcOffsetHours: 5.5,
    stationCode: 'VAPO',
    elevationM: 560,
    tempC: 27,
    feelsLikeC: 28,
    minTempC: 18,
    maxTempC: 30,
    condition: 'Partly Cloudy',
    description: 'Mild plateau breeze with scattered high clouds and pleasant afternoon sunshine.',
    icon: 'partly-cloudy',
    humidity: 54,
    dewPointC: 17,
    windSpeedKmh: 13,
    windGustKmh: 21,
    windDirection: 'WNW',
    rainfallMm: 0.4,
    rainProbability: 15,
    pressureHpa: 1014,
    pressureTrend: 'Steady',
    visibilityKm: 10,
    uvIndex: 6,
    sunrise: '06:46 AM',
    sunset: '05:57 PM',
    daylightProgress: 64,
    hourlyPattern: {
      tempOffsets: [0, 2, 3, 2, 1, -1, -3, -5, -6, -7, -7, -6],
      rainProbs: [15, 15, 20, 20, 15, 10, 10, 5, 5, 5, 10, 10],
      icons: [
        'partly-cloudy', 'sunny', 'sunny', 'partly-cloudy', 'partly-cloudy', 'cloudy',
        'clear-night', 'clear-night', 'clear-night', 'clear-night', 'partly-cloudy', 'sunny',
      ],
      conditions: [
        'Partly Cloudy', 'Sunny', 'Mostly Sunny', 'Partly Cloudy', 'Mild Clouds', 'Cloudy',
        'Clear Night', 'Clear Night', 'Cool Night', 'Clear Night', 'Light Clouds', 'Bright Sun',
      ],
    },
    dailyData: [
      { condition: 'Partly Cloudy', icon: 'partly-cloudy', maxOffset: 0, minOffset: 0, rainProb: 15, rainfallMm: 0.4, humidity: 54, windKmh: 13, uv: 6 },
      { condition: 'Mostly Sunny', icon: 'sunny', maxOffset: 1, minOffset: -1, rainProb: 10, rainfallMm: 0, humidity: 48, windKmh: 12, uv: 7 },
      { condition: 'Sunny', icon: 'sunny', maxOffset: 2, minOffset: 0, rainProb: 5, rainfallMm: 0, humidity: 45, windKmh: 11, uv: 7 },
      { condition: 'Partly Cloudy', icon: 'partly-cloudy', maxOffset: 0, minOffset: 1, rainProb: 25, rainfallMm: 1.2, humidity: 58, windKmh: 15, uv: 6 },
      { condition: 'Light Showers', icon: 'rainy', maxOffset: -2, minOffset: 1, rainProb: 60, rainfallMm: 6.4, humidity: 70, windKmh: 18, uv: 4 },
      { condition: 'Partly Cloudy', icon: 'partly-cloudy', maxOffset: -1, minOffset: -1, rainProb: 20, rainfallMm: 0.8, humidity: 56, windKmh: 14, uv: 6 },
      { condition: 'Clear & Pleasant', icon: 'sunny', maxOffset: 0, minOffset: -2, rainProb: 10, rainfallMm: 0, humidity: 50, windKmh: 11, uv: 7 },
    ],
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    region: 'Maharashtra',
    country: 'India',
    lat: 19.076,
    lon: 72.8777,
    timezone: 'Asia/Kolkata',
    utcOffsetHours: 5.5,
    stationCode: 'VABB',
    elevationM: 14,
    tempC: 29,
    feelsLikeC: 34,
    minTempC: 24,
    maxTempC: 31,
    condition: 'Rain Showers',
    description: 'Passing Arabian Sea rain bands with elevated coastal humidity and brisk gusts.',
    icon: 'rainy',
    humidity: 84,
    dewPointC: 25,
    windSpeedKmh: 26,
    windGustKmh: 38,
    windDirection: 'SW',
    rainfallMm: 18.6,
    rainProbability: 78,
    pressureHpa: 1007,
    pressureTrend: 'Falling',
    visibilityKm: 5.5,
    uvIndex: 4,
    sunrise: '06:51 AM',
    sunset: '06:01 PM',
    daylightProgress: 62,
    hourlyPattern: {
      tempOffsets: [0, 1, 1, 0, -1, -2, -3, -3, -4, -4, -3, -2],
      rainProbs: [78, 82, 75, 65, 60, 70, 80, 65, 50, 45, 55, 68],
      icons: [
        'rainy', 'heavy-rain', 'rainy', 'rainy', 'cloudy', 'rainy',
        'heavy-rain', 'rainy', 'cloudy', 'cloudy', 'rainy', 'rainy',
      ],
      conditions: [
        'Rain Showers', 'Heavy Rain', 'Moderate Rain', 'Passing Showers', 'Overcast', 'Rain Showers',
        'Heavy Rain', 'Light Rain', 'Humid Clouds', 'Overcast', 'Coastal Rain', 'Showers',
      ],
    },
    dailyData: [
      { condition: 'Rain Showers', icon: 'rainy', maxOffset: 0, minOffset: 0, rainProb: 78, rainfallMm: 18.6, humidity: 84, windKmh: 26, uv: 4 },
      { condition: 'Heavy Rain', icon: 'heavy-rain', maxOffset: -1, minOffset: 0, rainProb: 88, rainfallMm: 32.4, humidity: 88, windKmh: 29, uv: 3 },
      { condition: 'Thunderstorm', icon: 'thunderstorm', maxOffset: -2, minOffset: -1, rainProb: 82, rainfallMm: 27.0, humidity: 86, windKmh: 31, uv: 3 },
      { condition: 'Scattered Rain', icon: 'rainy', maxOffset: 0, minOffset: 0, rainProb: 60, rainfallMm: 11.2, humidity: 80, windKmh: 22, uv: 5 },
      { condition: 'Cloudy & Humid', icon: 'cloudy', maxOffset: 1, minOffset: 1, rainProb: 35, rainfallMm: 3.1, humidity: 76, windKmh: 19, uv: 6 },
      { condition: 'Partly Cloudy', icon: 'partly-cloudy', maxOffset: 1, minOffset: 0, rainProb: 25, rainfallMm: 1.5, humidity: 73, windKmh: 17, uv: 7 },
      { condition: 'Humid & Breezy', icon: 'breezy', maxOffset: 2, minOffset: 1, rainProb: 20, rainfallMm: 0.5, humidity: 72, windKmh: 21, uv: 7 },
    ],
  },
  {
    id: 'delhi',
    name: 'Delhi',
    region: 'NCR',
    country: 'India',
    lat: 28.6139,
    lon: 77.209,
    timezone: 'Asia/Kolkata',
    utcOffsetHours: 5.5,
    stationCode: 'VIDP',
    elevationM: 216,
    tempC: 35,
    feelsLikeC: 37,
    minTempC: 21,
    maxTempC: 37,
    condition: 'Sunny & Hot',
    description: 'Bright high-altitude sun across the plains with dry air and intense afternoon UV.',
    icon: 'sunny',
    humidity: 32,
    dewPointC: 15,
    windSpeedKmh: 14,
    windGustKmh: 22,
    windDirection: 'NW',
    rainfallMm: 0,
    rainProbability: 5,
    pressureHpa: 1012,
    pressureTrend: 'Steady',
    visibilityKm: 4.8,
    uvIndex: 9,
    sunrise: '06:52 AM',
    sunset: '05:25 PM',
    daylightProgress: 68,
    hourlyPattern: {
      tempOffsets: [0, 2, 2, 1, -2, -5, -8, -10, -11, -12, -10, -6],
      rainProbs: [5, 5, 5, 5, 0, 0, 0, 0, 0, 5, 5, 5],
      icons: [
        'sunny', 'sunny', 'sunny', 'sunny', 'sunny', 'mist',
        'clear-night', 'clear-night', 'clear-night', 'mist', 'sunny', 'sunny',
      ],
      conditions: [
        'Sunny & Hot', 'Hot Sun', 'Sunny', 'Warm Sun', 'Clear', 'Light Haze',
        'Clear Night', 'Clear Night', 'Cool Haze', 'Morning Mist', 'Bright Sun', 'Sunny',
      ],
    },
    dailyData: [
      { condition: 'Sunny & Hot', icon: 'sunny', maxOffset: 0, minOffset: 0, rainProb: 5, rainfallMm: 0, humidity: 32, windKmh: 14, uv: 9 },
      { condition: 'Clear Skies', icon: 'sunny', maxOffset: 1, minOffset: 0, rainProb: 5, rainfallMm: 0, humidity: 30, windKmh: 12, uv: 9 },
      { condition: 'Hazy Sunshine', icon: 'mist', maxOffset: -1, minOffset: -1, rainProb: 10, rainfallMm: 0, humidity: 38, windKmh: 10, uv: 7 },
      { condition: 'Sunny', icon: 'sunny', maxOffset: 0, minOffset: -1, rainProb: 5, rainfallMm: 0, humidity: 34, windKmh: 15, uv: 8 },
      { condition: 'Partly Cloudy', icon: 'partly-cloudy', maxOffset: -2, minOffset: -2, rainProb: 15, rainfallMm: 0.4, humidity: 42, windKmh: 18, uv: 7 },
      { condition: 'Breezy & Clear', icon: 'breezy', maxOffset: -3, minOffset: -2, rainProb: 10, rainfallMm: 0, humidity: 36, windKmh: 22, uv: 8 },
      { condition: 'Sunny', icon: 'sunny', maxOffset: -2, minOffset: -1, rainProb: 5, rainfallMm: 0, humidity: 35, windKmh: 13, uv: 8 },
    ],
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    region: 'Karnataka',
    country: 'India',
    lat: 12.9716,
    lon: 77.5946,
    timezone: 'Asia/Kolkata',
    utcOffsetHours: 5.5,
    stationCode: 'VOBL',
    elevationM: 920,
    tempC: 23,
    feelsLikeC: 23,
    minTempC: 17,
    maxTempC: 26,
    condition: 'Cool & Breezy',
    description: 'High-elevation Deccan comfort with cool easterly winds and brief evening drizzle.',
    icon: 'partly-cloudy',
    humidity: 66,
    dewPointC: 16,
    windSpeedKmh: 16,
    windGustKmh: 24,
    windDirection: 'ENE',
    rainfallMm: 3.2,
    rainProbability: 48,
    pressureHpa: 1016,
    pressureTrend: 'Rising',
    visibilityKm: 9.5,
    uvIndex: 5,
    sunrise: '06:23 AM',
    sunset: '05:51 PM',
    daylightProgress: 65,
    hourlyPattern: {
      tempOffsets: [0, 2, 2, 1, -1, -2, -4, -5, -5, -6, -5, -2],
      rainProbs: [48, 40, 35, 50, 62, 55, 35, 25, 20, 20, 25, 30],
      icons: [
        'partly-cloudy', 'partly-cloudy', 'cloudy', 'rainy', 'rainy', 'rainy',
        'cloudy', 'clear-night', 'clear-night', 'mist', 'partly-cloudy', 'partly-cloudy',
      ],
      conditions: [
        'Cool & Breezy', 'Partly Cloudy', 'Cloudy', 'Light Drizzle', 'Evening Rain', 'Light Rain',
        'Cool Clouds', 'Clear Night', 'Crisp Night', 'Morning Mist', 'Partly Cloudy', 'Pleasant',
      ],
    },
    dailyData: [
      { condition: 'Cool & Breezy', icon: 'partly-cloudy', maxOffset: 0, minOffset: 0, rainProb: 48, rainfallMm: 3.2, humidity: 66, windKmh: 16, uv: 5 },
      { condition: 'Evening Showers', icon: 'rainy', maxOffset: -1, minOffset: 0, rainProb: 65, rainfallMm: 8.5, humidity: 74, windKmh: 18, uv: 4 },
      { condition: 'Partly Cloudy', icon: 'partly-cloudy', maxOffset: 0, minOffset: -1, rainProb: 30, rainfallMm: 1.4, humidity: 64, windKmh: 15, uv: 6 },
      { condition: 'Pleasant Sun', icon: 'sunny', maxOffset: 1, minOffset: -1, rainProb: 15, rainfallMm: 0, humidity: 58, windKmh: 13, uv: 7 },
      { condition: 'Partly Cloudy', icon: 'partly-cloudy', maxOffset: 0, minOffset: 0, rainProb: 25, rainfallMm: 0.8, humidity: 62, windKmh: 14, uv: 6 },
      { condition: 'Light Rain', icon: 'rainy', maxOffset: -2, minOffset: 0, rainProb: 55, rainfallMm: 5.0, humidity: 72, windKmh: 17, uv: 5 },
      { condition: 'Crisp & Clear', icon: 'sunny', maxOffset: 0, minOffset: -2, rainProb: 10, rainfallMm: 0, humidity: 55, windKmh: 12, uv: 7 },
    ],
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    region: 'Telangana',
    country: 'India',
    lat: 17.385,
    lon: 78.4867,
    timezone: 'Asia/Kolkata',
    utcOffsetHours: 5.5,
    stationCode: 'VOHS',
    elevationM: 542,
    tempC: 30,
    feelsLikeC: 31,
    minTempC: 20,
    maxTempC: 32,
    condition: 'Mostly Sunny',
    description: 'Warm Deccan sunshine with light afternoon clouds and steady barometric pressure.',
    icon: 'sunny',
    humidity: 47,
    dewPointC: 18,
    windSpeedKmh: 12,
    windGustKmh: 19,
    windDirection: 'E',
    rainfallMm: 0,
    rainProbability: 12,
    pressureHpa: 1015,
    pressureTrend: 'Steady',
    visibilityKm: 10,
    uvIndex: 8,
    sunrise: '06:26 AM',
    sunset: '05:40 PM',
    daylightProgress: 66,
    hourlyPattern: {
      tempOffsets: [0, 2, 2, 1, -1, -3, -6, -8, -9, -9, -7, -3],
      rainProbs: [12, 10, 15, 15, 10, 10, 5, 5, 5, 5, 10, 10],
      icons: [
        'sunny', 'sunny', 'partly-cloudy', 'partly-cloudy', 'sunny', 'partly-cloudy',
        'clear-night', 'clear-night', 'clear-night', 'clear-night', 'sunny', 'sunny',
      ],
      conditions: [
        'Mostly Sunny', 'Sunny', 'Partly Cloudy', 'Warm Breeze', 'Clear Sky', 'Partly Cloudy',
        'Clear Night', 'Clear Night', 'Mild Night', 'Clear Night', 'Bright Sun', 'Sunny',
      ],
    },
    dailyData: [
      { condition: 'Mostly Sunny', icon: 'sunny', maxOffset: 0, minOffset: 0, rainProb: 12, rainfallMm: 0, humidity: 47, windKmh: 12, uv: 8 },
      { condition: 'Sunny', icon: 'sunny', maxOffset: 1, minOffset: 0, rainProb: 10, rainfallMm: 0, humidity: 45, windKmh: 11, uv: 8 },
      { condition: 'Partly Cloudy', icon: 'partly-cloudy', maxOffset: 0, minOffset: 1, rainProb: 20, rainfallMm: 0.5, humidity: 52, windKmh: 14, uv: 7 },
      { condition: 'Partly Cloudy', icon: 'partly-cloudy', maxOffset: -1, minOffset: 0, rainProb: 25, rainfallMm: 1.0, humidity: 55, windKmh: 15, uv: 7 },
      { condition: 'Sunny & Warm', icon: 'sunny', maxOffset: 1, minOffset: -1, rainProb: 10, rainfallMm: 0, humidity: 46, windKmh: 12, uv: 8 },
      { condition: 'Clear Skies', icon: 'sunny', maxOffset: 0, minOffset: -1, rainProb: 5, rainfallMm: 0, humidity: 44, windKmh: 10, uv: 8 },
      { condition: 'Partly Cloudy', icon: 'partly-cloudy', maxOffset: -1, minOffset: 0, rainProb: 15, rainfallMm: 0.2, humidity: 50, windKmh: 13, uv: 7 },
    ],
  },
  {
    id: 'chennai',
    name: 'Chennai',
    region: 'Tamil Nadu',
    country: 'India',
    lat: 13.0827,
    lon: 80.2707,
    timezone: 'Asia/Kolkata',
    utcOffsetHours: 5.5,
    stationCode: 'VOMM',
    elevationM: 6,
    tempC: 31,
    feelsLikeC: 36,
    minTempC: 25,
    maxTempC: 33,
    condition: 'Breezy & Humid',
    description: 'Northeast coastal winds off the Bay of Bengal bringing warm moisture and passing showers.',
    icon: 'breezy',
    humidity: 79,
    dewPointC: 26,
    windSpeedKmh: 25,
    windGustKmh: 36,
    windDirection: 'NE',
    rainfallMm: 9.4,
    rainProbability: 62,
    pressureHpa: 1009,
    pressureTrend: 'Falling',
    visibilityKm: 7.5,
    uvIndex: 7,
    sunrise: '06:12 AM',
    sunset: '05:40 PM',
    daylightProgress: 66,
    hourlyPattern: {
      tempOffsets: [0, 1, 2, 1, 0, -2, -3, -4, -5, -5, -4, -1],
      rainProbs: [62, 55, 45, 50, 68, 74, 65, 50, 40, 35, 45, 55],
      icons: [
        'breezy', 'partly-cloudy', 'partly-cloudy', 'rainy', 'rainy', 'rainy',
        'cloudy', 'rainy', 'cloudy', 'cloudy', 'partly-cloudy', 'breezy',
      ],
      conditions: [
        'Breezy & Humid', 'Partly Cloudy', 'Coastal Breeze', 'Passing Rain', 'Showers', 'Coastal Rain',
        'Humid Clouds', 'Light Rain', 'Overcast', 'Warm Clouds', 'Partly Cloudy', 'Breezy',
      ],
    },
    dailyData: [
      { condition: 'Breezy & Humid', icon: 'breezy', maxOffset: 0, minOffset: 0, rainProb: 62, rainfallMm: 9.4, humidity: 79, windKmh: 25, uv: 7 },
      { condition: 'Rain Showers', icon: 'rainy', maxOffset: -1, minOffset: 0, rainProb: 75, rainfallMm: 16.2, humidity: 83, windKmh: 27, uv: 5 },
      { condition: 'Heavy Showers', icon: 'heavy-rain', maxOffset: -2, minOffset: -1, rainProb: 84, rainfallMm: 28.5, humidity: 86, windKmh: 30, uv: 4 },
      { condition: 'Scattered Rain', icon: 'rainy', maxOffset: -1, minOffset: 0, rainProb: 58, rainfallMm: 10.0, humidity: 80, windKmh: 22, uv: 6 },
      { condition: 'Partly Cloudy', icon: 'partly-cloudy', maxOffset: 0, minOffset: 0, rainProb: 35, rainfallMm: 2.4, humidity: 75, windKmh: 19, uv: 7 },
      { condition: 'Breezy', icon: 'breezy', maxOffset: 1, minOffset: 1, rainProb: 30, rainfallMm: 1.8, humidity: 74, windKmh: 23, uv: 7 },
      { condition: 'Partly Cloudy', icon: 'partly-cloudy', maxOffset: 0, minOffset: 0, rainProb: 25, rainfallMm: 1.0, humidity: 73, windKmh: 20, uv: 8 },
    ],
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    region: 'West Bengal',
    country: 'India',
    lat: 22.5726,
    lon: 88.3639,
    timezone: 'Asia/Kolkata',
    utcOffsetHours: 5.5,
    stationCode: 'VECC',
    elevationM: 9,
    tempC: 28,
    feelsLikeC: 33,
    minTempC: 22,
    maxTempC: 30,
    condition: 'Thunderstorm',
    description: 'Active convective storm cells moving inland with heavy downpours and gusty winds.',
    icon: 'thunderstorm',
    humidity: 86,
    dewPointC: 25,
    windSpeedKmh: 28,
    windGustKmh: 44,
    windDirection: 'SSE',
    rainfallMm: 24.5,
    rainProbability: 85,
    pressureHpa: 1004,
    pressureTrend: 'Falling',
    visibilityKm: 4.2,
    uvIndex: 3,
    sunrise: '05:56 AM',
    sunset: '04:53 PM',
    daylightProgress: 74,
    hourlyPattern: {
      tempOffsets: [0, 0, -1, -2, -2, -3, -4, -5, -5, -5, -4, -2],
      rainProbs: [85, 90, 82, 75, 65, 55, 45, 35, 30, 35, 45, 55],
      icons: [
        'thunderstorm', 'thunderstorm', 'heavy-rain', 'rainy', 'rainy', 'cloudy',
        'cloudy', 'mist', 'mist', 'cloudy', 'rainy', 'rainy',
      ],
      conditions: [
        'Thunderstorm', 'Storm Squalls', 'Heavy Rain', 'Steady Rain', 'Light Rain', 'Overcast',
        'Humid Clouds', 'Mist', 'Hazy Night', 'Cloudy', 'Passing Showers', 'Rain Showers',
      ],
    },
    dailyData: [
      { condition: 'Thunderstorm', icon: 'thunderstorm', maxOffset: 0, minOffset: 0, rainProb: 85, rainfallMm: 24.5, humidity: 86, windKmh: 28, uv: 3 },
      { condition: 'Rain Showers', icon: 'rainy', maxOffset: 0, minOffset: -1, rainProb: 70, rainfallMm: 14.0, humidity: 82, windKmh: 21, uv: 5 },
      { condition: 'Cloudy', icon: 'cloudy', maxOffset: 1, minOffset: -1, rainProb: 40, rainfallMm: 3.5, humidity: 76, windKmh: 16, uv: 6 },
      { condition: 'Partly Cloudy', icon: 'partly-cloudy', maxOffset: 2, minOffset: 0, rainProb: 20, rainfallMm: 0.6, humidity: 70, windKmh: 13, uv: 7 },
      { condition: 'Mostly Sunny', icon: 'sunny', maxOffset: 2, minOffset: -1, rainProb: 10, rainfallMm: 0, humidity: 65, windKmh: 12, uv: 7 },
      { condition: 'Partly Cloudy', icon: 'partly-cloudy', maxOffset: 1, minOffset: -1, rainProb: 25, rainfallMm: 1.2, humidity: 68, windKmh: 14, uv: 6 },
      { condition: 'Light Rain', icon: 'rainy', maxOffset: 0, minOffset: 0, rainProb: 50, rainfallMm: 6.8, humidity: 78, windKmh: 17, uv: 5 },
    ],
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    region: 'Rajasthan',
    country: 'India',
    lat: 26.9124,
    lon: 75.7873,
    timezone: 'Asia/Kolkata',
    utcOffsetHours: 5.5,
    stationCode: 'VIJP',
    elevationM: 431,
    tempC: 34,
    feelsLikeC: 35,
    minTempC: 19,
    maxTempC: 36,
    condition: 'Clear & Arid',
    description: 'Abundant desert sunshine with crystal clarity, low humidity, and cool nights.',
    icon: 'sunny',
    humidity: 26,
    dewPointC: 11,
    windSpeedKmh: 11,
    windGustKmh: 18,
    windDirection: 'W',
    rainfallMm: 0,
    rainProbability: 0,
    pressureHpa: 1014,
    pressureTrend: 'Steady',
    visibilityKm: 12,
    uvIndex: 9,
    sunrise: '06:54 AM',
    sunset: '05:35 PM',
    daylightProgress: 67,
    hourlyPattern: {
      tempOffsets: [0, 2, 2, 0, -3, -6, -9, -11, -13, -14, -11, -5],
      rainProbs: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      icons: [
        'sunny', 'sunny', 'sunny', 'sunny', 'sunny', 'sunny',
        'clear-night', 'clear-night', 'clear-night', 'clear-night', 'sunny', 'sunny',
      ],
      conditions: [
        'Clear & Arid', 'Hot Sun', 'Sunny', 'Clear Sky', 'Warm Sun', 'Golden Hour',
        'Clear Night', 'Starry Night', 'Cool Night', 'Crisp Dawn', 'Sunny', 'Clear Sky',
      ],
    },
    dailyData: [
      { condition: 'Clear & Arid', icon: 'sunny', maxOffset: 0, minOffset: 0, rainProb: 0, rainfallMm: 0, humidity: 26, windKmh: 11, uv: 9 },
      { condition: 'Sunny', icon: 'sunny', maxOffset: 1, minOffset: -1, rainProb: 0, rainfallMm: 0, humidity: 24, windKmh: 10, uv: 9 },
      { condition: 'Sunny', icon: 'sunny', maxOffset: 0, minOffset: -1, rainProb: 5, rainfallMm: 0, humidity: 28, windKmh: 12, uv: 8 },
      { condition: 'Partly Cloudy', icon: 'partly-cloudy', maxOffset: -2, minOffset: 0, rainProb: 10, rainfallMm: 0, humidity: 32, windKmh: 14, uv: 7 },
      { condition: 'Clear Skies', icon: 'sunny', maxOffset: -1, minOffset: -2, rainProb: 0, rainfallMm: 0, humidity: 27, windKmh: 11, uv: 8 },
      { condition: 'Sunny', icon: 'sunny', maxOffset: 0, minOffset: -1, rainProb: 0, rainfallMm: 0, humidity: 25, windKmh: 9, uv: 9 },
      { condition: 'Clear Skies', icon: 'sunny', maxOffset: -1, minOffset: -1, rainProb: 5, rainfallMm: 0, humidity: 29, windKmh: 10, uv: 8 },
    ],
  },
  {
    id: 'shimla',
    name: 'Shimla',
    region: 'Himachal Pradesh',
    country: 'India',
    lat: 31.1048,
    lon: 77.1734,
    timezone: 'Asia/Kolkata',
    utcOffsetHours: 5.5,
    stationCode: 'VISM',
    elevationM: 2276,
    tempC: 12,
    feelsLikeC: 10,
    minTempC: 5,
    maxTempC: 15,
    condition: 'Mountain Mist',
    description: 'Crisp Himalayan ridge air with drifting valley mist and chilly twilight drops.',
    icon: 'mist',
    humidity: 68,
    dewPointC: 6,
    windSpeedKmh: 15,
    windGustKmh: 24,
    windDirection: 'NNE',
    rainfallMm: 1.2,
    rainProbability: 30,
    pressureHpa: 1021,
    pressureTrend: 'Rising',
    visibilityKm: 4.5,
    uvIndex: 4,
    sunrise: '06:58 AM',
    sunset: '05:20 PM',
    daylightProgress: 69,
    hourlyPattern: {
      tempOffsets: [0, 2, 2, 0, -2, -4, -5, -6, -7, -7, -5, -2],
      rainProbs: [30, 25, 20, 25, 35, 30, 20, 15, 15, 20, 25, 20],
      icons: [
        'mist', 'partly-cloudy', 'partly-cloudy', 'cloudy', 'mist', 'cloudy',
        'clear-night', 'clear-night', 'clear-night', 'mist', 'partly-cloudy', 'sunny',
      ],
      conditions: [
        'Mountain Mist', 'Partly Cloudy', 'Crisp Sun', 'Ridge Clouds', 'Valley Mist', 'Cool Clouds',
        'Chilly Night', 'Starry Night', 'Frosty Air', 'Morning Mist', 'Partly Cloudy', 'Clear Sun',
      ],
    },
    dailyData: [
      { condition: 'Mountain Mist', icon: 'mist', maxOffset: 0, minOffset: 0, rainProb: 30, rainfallMm: 1.2, humidity: 68, windKmh: 15, uv: 4 },
      { condition: 'Crisp & Sunny', icon: 'sunny', maxOffset: 1, minOffset: -1, rainProb: 10, rainfallMm: 0, humidity: 58, windKmh: 12, uv: 5 },
      { condition: 'Partly Cloudy', icon: 'partly-cloudy', maxOffset: 0, minOffset: -1, rainProb: 20, rainfallMm: 0.4, humidity: 62, windKmh: 14, uv: 5 },
      { condition: 'Light Rain', icon: 'rainy', maxOffset: -3, minOffset: -2, rainProb: 65, rainfallMm: 7.4, humidity: 78, windKmh: 19, uv: 3 },
      { condition: 'Cloudy & Cold', icon: 'cloudy', maxOffset: -2, minOffset: -2, rainProb: 40, rainfallMm: 2.0, humidity: 72, windKmh: 16, uv: 3 },
      { condition: 'Crisp & Clear', icon: 'sunny', maxOffset: 1, minOffset: -1, rainProb: 10, rainfallMm: 0, humidity: 54, windKmh: 11, uv: 5 },
      { condition: 'Partly Cloudy', icon: 'partly-cloudy', maxOffset: 0, minOffset: 0, rainProb: 15, rainfallMm: 0, humidity: 60, windKmh: 13, uv: 5 },
    ],
  },
  {
    id: 'london',
    name: 'London',
    region: 'Greater London',
    country: 'United Kingdom',
    lat: 51.5072,
    lon: -0.1276,
    timezone: 'Europe/London',
    utcOffsetHours: 0,
    stationCode: 'EGLL',
    elevationM: 25,
    tempC: 11,
    feelsLikeC: 9,
    minTempC: 7,
    maxTempC: 13,
    condition: 'Overcast & Drizzle',
    description: 'Cool Atlantic cloud cover over the Thames with light intermittent afternoon drizzle.',
    icon: 'cloudy',
    humidity: 81,
    dewPointC: 8,
    windSpeedKmh: 21,
    windGustKmh: 31,
    windDirection: 'WSW',
    rainfallMm: 4.8,
    rainProbability: 64,
    pressureHpa: 1008,
    pressureTrend: 'Falling',
    visibilityKm: 6.8,
    uvIndex: 1,
    sunrise: '07:34 AM',
    sunset: '03:59 PM',
    daylightProgress: 52,
    hourlyPattern: {
      tempOffsets: [0, 1, 1, 0, -1, -2, -3, -3, -4, -4, -3, -1],
      rainProbs: [64, 70, 60, 50, 45, 55, 65, 50, 40, 35, 45, 55],
      icons: [
        'cloudy', 'rainy', 'rainy', 'cloudy', 'cloudy', 'rainy',
        'rainy', 'cloudy', 'cloudy', 'mist', 'cloudy', 'partly-cloudy',
      ],
      conditions: [
        'Overcast', 'Light Drizzle', 'Light Rain', 'Grey Skies', 'Overcast', 'Drizzle',
        'Light Rain', 'Cloudy', 'Cool Clouds', 'Thames Mist', 'Overcast', 'Bright Spells',
      ],
    },
    dailyData: [
      { condition: 'Overcast & Drizzle', icon: 'cloudy', maxOffset: 0, minOffset: 0, rainProb: 64, rainfallMm: 4.8, humidity: 81, windKmh: 21, uv: 1 },
      { condition: 'Light Rain', icon: 'rainy', maxOffset: -1, minOffset: -1, rainProb: 75, rainfallMm: 9.2, humidity: 85, windKmh: 25, uv: 1 },
      { condition: 'Partly Cloudy', icon: 'partly-cloudy', maxOffset: 1, minOffset: -1, rainProb: 30, rainfallMm: 1.0, humidity: 74, windKmh: 18, uv: 2 },
      { condition: 'Breezy & Cool', icon: 'breezy', maxOffset: 0, minOffset: -2, rainProb: 40, rainfallMm: 2.2, humidity: 76, windKmh: 27, uv: 2 },
      { condition: 'Rain Showers', icon: 'rainy', maxOffset: -1, minOffset: -1, rainProb: 70, rainfallMm: 7.5, humidity: 83, windKmh: 23, uv: 1 },
      { condition: 'Cloudy', icon: 'cloudy', maxOffset: 0, minOffset: 0, rainProb: 35, rainfallMm: 1.5, humidity: 78, windKmh: 16, uv: 1 },
      { condition: 'Bright Intervals', icon: 'partly-cloudy', maxOffset: 1, minOffset: -1, rainProb: 20, rainfallMm: 0.4, humidity: 72, windKmh: 15, uv: 2 },
    ],
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    region: 'Kanto',
    country: 'Japan',
    lat: 35.6762,
    lon: 139.6503,
    timezone: 'Asia/Tokyo',
    utcOffsetHours: 9,
    stationCode: 'RJTT',
    elevationM: 40,
    tempC: 16,
    feelsLikeC: 15,
    minTempC: 10,
    maxTempC: 18,
    condition: 'Crisp & Clear',
    description: 'Clean autumn Pacific high-pressure air with brilliant visibility across Tokyo Bay.',
    icon: 'sunny',
    humidity: 49,
    dewPointC: 6,
    windSpeedKmh: 14,
    windGustKmh: 20,
    windDirection: 'NNW',
    rainfallMm: 0,
    rainProbability: 10,
    pressureHpa: 1022,
    pressureTrend: 'Rising',
    visibilityKm: 14,
    uvIndex: 3,
    sunrise: '06:26 AM',
    sunset: '04:30 PM',
    daylightProgress: 80,
    hourlyPattern: {
      tempOffsets: [0, 1, 1, 0, -2, -4, -5, -6, -6, -6, -4, -1],
      rainProbs: [10, 10, 5, 5, 5, 10, 10, 10, 5, 5, 10, 10],
      icons: [
        'sunny', 'sunny', 'sunny', 'partly-cloudy', 'partly-cloudy', 'clear-night',
        'clear-night', 'clear-night', 'clear-night', 'clear-night', 'sunny', 'sunny',
      ],
      conditions: [
        'Crisp & Clear', 'Sunny', 'Clear Sky', 'Light Clouds', 'Crisp Dusk', 'Clear Night',
        'Starry Night', 'Cool Night', 'Clear Night', 'Crisp Dawn', 'Sunny', 'Bright Sun',
      ],
    },
    dailyData: [
      { condition: 'Crisp & Clear', icon: 'sunny', maxOffset: 0, minOffset: 0, rainProb: 10, rainfallMm: 0, humidity: 49, windKmh: 14, uv: 3 },
      { condition: 'Partly Cloudy', icon: 'partly-cloudy', maxOffset: -1, minOffset: 0, rainProb: 20, rainfallMm: 0.3, humidity: 54, windKmh: 15, uv: 3 },
      { condition: 'Light Rain', icon: 'rainy', maxOffset: -3, minOffset: -1, rainProb: 65, rainfallMm: 8.6, humidity: 76, windKmh: 20, uv: 2 },
      { condition: 'Clear & Sunny', icon: 'sunny', maxOffset: 0, minOffset: -2, rainProb: 10, rainfallMm: 0, humidity: 46, windKmh: 13, uv: 3 },
      { condition: 'Sunny', icon: 'sunny', maxOffset: 1, minOffset: -1, rainProb: 5, rainfallMm: 0, humidity: 48, windKmh: 11, uv: 4 },
      { condition: 'Partly Cloudy', icon: 'partly-cloudy', maxOffset: 0, minOffset: 0, rainProb: 25, rainfallMm: 0.8, humidity: 56, windKmh: 14, uv: 3 },
      { condition: 'Crisp & Clear', icon: 'sunny', maxOffset: 1, minOffset: -1, rainProb: 10, rainfallMm: 0, humidity: 50, windKmh: 12, uv: 3 },
    ],
  },
  {
    id: 'new-york',
    name: 'New York',
    region: 'New York',
    country: 'United States',
    lat: 40.7128,
    lon: -74.006,
    timezone: 'America/New_York',
    utcOffsetHours: -5,
    stationCode: 'KJFK',
    elevationM: 10,
    tempC: 10,
    feelsLikeC: 7,
    minTempC: 5,
    maxTempC: 12,
    condition: 'Breezy & Crisp',
    description: 'Brisk northwest winds sweeping across Manhattan under bright, broken autumn clouds.',
    icon: 'breezy',
    humidity: 52,
    dewPointC: 1,
    windSpeedKmh: 27,
    windGustKmh: 39,
    windDirection: 'NW',
    rainfallMm: 0.6,
    rainProbability: 20,
    pressureHpa: 1019,
    pressureTrend: 'Rising',
    visibilityKm: 16,
    uvIndex: 2,
    sunrise: '06:54 AM',
    sunset: '04:31 PM',
    daylightProgress: 42,
    hourlyPattern: {
      tempOffsets: [0, 1, 2, 1, -1, -2, -4, -4, -5, -5, -4, -2],
      rainProbs: [20, 15, 15, 20, 25, 20, 15, 10, 10, 15, 15, 20],
      icons: [
        'breezy', 'partly-cloudy', 'partly-cloudy', 'breezy', 'cloudy', 'clear-night',
        'clear-night', 'clear-night', 'clear-night', 'partly-cloudy', 'sunny', 'breezy',
      ],
      conditions: [
        'Breezy & Crisp', 'Partly Cloudy', 'Broken Clouds', 'Gusty Breeze', 'Cool Clouds', 'Clear Night',
        'Chilly Night', 'Clear Night', 'Cold Breeze', 'Partly Cloudy', 'Bright Sun', 'Breezy',
      ],
    },
    dailyData: [
      { condition: 'Breezy & Crisp', icon: 'breezy', maxOffset: 0, minOffset: 0, rainProb: 20, rainfallMm: 0.6, humidity: 52, windKmh: 27, uv: 2 },
      { condition: 'Mostly Sunny', icon: 'sunny', maxOffset: 1, minOffset: -1, rainProb: 10, rainfallMm: 0, humidity: 48, windKmh: 18, uv: 2 },
      { condition: 'Partly Cloudy', icon: 'partly-cloudy', maxOffset: 2, minOffset: 0, rainProb: 25, rainfallMm: 1.0, humidity: 56, windKmh: 16, uv: 2 },
      { condition: 'Rain Showers', icon: 'rainy', maxOffset: 0, minOffset: 1, rainProb: 75, rainfallMm: 12.4, humidity: 80, windKmh: 24, uv: 1 },
      { condition: 'Cloudy & Brisk', icon: 'cloudy', maxOffset: -2, minOffset: -2, rainProb: 35, rainfallMm: 2.1, humidity: 65, windKmh: 22, uv: 1 },
      { condition: 'Crisp Sun', icon: 'sunny', maxOffset: -1, minOffset: -2, rainProb: 10, rainfallMm: 0, humidity: 50, windKmh: 15, uv: 2 },
      { condition: 'Partly Cloudy', icon: 'partly-cloudy', maxOffset: 0, minOffset: -1, rainProb: 15, rainfallMm: 0, humidity: 54, windKmh: 14, uv: 2 },
    ],
  },
];

export const MOCK_WEATHER_DATABASE: CityWeatherData[] = CITY_SEEDS.map((seed) => ({
  id: seed.id,
  name: seed.name,
  region: seed.region,
  country: seed.country,
  lat: seed.lat,
  lon: seed.lon,
  timezone: seed.timezone,
  utcOffsetHours: seed.utcOffsetHours,
  stationCode: seed.stationCode,
  elevationM: seed.elevationM,
  current: {
    tempC: seed.tempC,
    feelsLikeC: seed.feelsLikeC,
    minTempC: seed.minTempC,
    maxTempC: seed.maxTempC,
    condition: seed.condition,
    description: seed.description,
    icon: seed.icon,
    humidity: seed.humidity,
    dewPointC: seed.dewPointC,
    windSpeedKmh: seed.windSpeedKmh,
    windGustKmh: seed.windGustKmh,
    windDirection: seed.windDirection,
    rainfallMm: seed.rainfallMm,
    rainProbability: seed.rainProbability,
    pressureHpa: seed.pressureHpa,
    pressureTrend: seed.pressureTrend,
    visibilityKm: seed.visibilityKm,
    uvIndex: seed.uvIndex,
    sunrise: seed.sunrise,
    sunset: seed.sunset,
    daylightProgress: seed.daylightProgress,
  },
  hourly: buildHourly(seed),
  daily: buildDaily(seed),
  lastUpdated: 'Just now',
}));

export const POPULAR_CITY_IDS = [
  'pune',
  'mumbai',
  'delhi',
  'bengaluru',
  'hyderabad',
  'chennai',
];
