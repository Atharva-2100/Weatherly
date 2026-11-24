import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CurrentWeatherCard } from '../components/CurrentWeatherCard';
import { FavoritesBar } from '../components/FavoritesBar';
import { HourlyForecast } from '../components/HourlyForecast';
import { DashboardSkeleton, WeatherErrorState } from '../components/LoadingSkeleton';
import { WeatherAnalyticsCharts } from '../components/WeatherAnalyticsCharts';
import { WeatherMetricsGrid } from '../components/WeatherMetricsGrid';
import { WeatherRecommendations } from '../components/WeatherRecommendations';
import { WeeklyForecast } from '../components/WeeklyForecast';
import { useWeather } from '../context/WeatherContext';

export const DashboardPage: React.FC = () => {
  const { weatherData, isLoading, error, retryFetch } = useWeather();

  return (
    <div className="mx-auto max-w-[1380px] px-4 py-6 sm:px-6 lg:px-8">
      <FavoritesBar />

      {isLoading ? (
        <DashboardSkeleton />
      ) : error || !weatherData ? (
        <WeatherErrorState
          message={error ?? 'No weather station selected.'}
          onRetry={retryFetch}
        />
      ) : (
        <div className="space-y-6">
          {/* Hero Row: Current Weather (8 cols) + Weather Recommendations (4 cols) */}
          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <CurrentWeatherCard data={weatherData} />
            </div>
            <div className="lg:col-span-4">
              <WeatherRecommendations data={weatherData} />
            </div>
          </div>

          {/* 6 Atmospheric Metric Cards */}
          <WeatherMetricsGrid current={weatherData.current} />

          {/* 24-Hour Horizontally Scrollable Hourly Forecast */}
          <HourlyForecast hourly={weatherData.hourly} />

          {/* 7-Day Weather Forecast */}
          <div className="space-y-2">
            <WeeklyForecast daily={weatherData.daily} expandable={true} />
            <div className="flex justify-end">
              <Link
                to="/forecast"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-sky-400 dark:hover:text-sky-300"
              >
                Open detailed forecast view
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Interactive Recharts Analytics Suite */}
          <div className="space-y-3 pt-2">
            <WeatherAnalyticsCharts data={weatherData} compact={true} />
            <div className="flex justify-end">
              <Link
                to="/analytics"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-sky-400 dark:hover:text-sky-300"
              >
                Explore full weather analytics
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
