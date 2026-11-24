import React from 'react';
import {
  Compass,
  Droplets,
  Eye,
  Sun,
  ThermometerSun,
  Umbrella,
  Wind,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { CityWeatherData, WeatherRecommendation } from '../types/weather';
import { generateWeatherRecommendations } from '../utils/weatherUtils';

interface WeatherRecommendationsProps {
  data: CityWeatherData;
}

function getCategoryIcon(category: WeatherRecommendation['category']) {
  switch (category) {
    case 'Rain':
      return Umbrella;
    case 'Heat':
      return ThermometerSun;
    case 'UV':
      return Sun;
    case 'Wind':
      return Wind;
    case 'Humidity':
      return Droplets;
    case 'Visibility':
      return Eye;
    case 'Outdoor':
    default:
      return Compass;
  }
}

function getSeverityStyles(severity: WeatherRecommendation['severity']) {
  switch (severity) {
    case 'caution':
      return {
        iconBox: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
        labelText: 'text-amber-700 dark:text-amber-400',
        label: 'Caution',
      };
    case 'favorable':
      return {
        iconBox: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
        labelText: 'text-emerald-700 dark:text-emerald-400',
        label: 'Favorable',
      };
    case 'advisory':
    default:
      return {
        iconBox: 'bg-sky-50 text-blue-700 dark:bg-sky-950/60 dark:text-sky-300',
        labelText: 'text-blue-700 dark:text-sky-400',
        label: 'Advisory',
      };
  }
}

export const WeatherRecommendations: React.FC<WeatherRecommendationsProps> = ({ data }) => {
  const { unit } = useWeather();
  const recommendations = generateWeatherRecommendations(data, unit);

  return (
    <section
      aria-label="Weather recommendations"
      className="flex h-full flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <div>
        <div className="mb-4 flex items-baseline justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Weather Guidance
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tailored advice for current conditions in {data.name}
            </p>
          </div>
        </div>

        <ul className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {recommendations.map((rec) => {
            const Icon = getCategoryIcon(rec.category);
            const styles = getSeverityStyles(rec.severity);
            return (
              <li key={rec.id} className="flex items-start gap-3.5 py-3.5 first:pt-1 last:pb-1">
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${styles.iconBox}`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                    <span className={`font-semibold ${styles.labelText}`}>{styles.label}</span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                      ·
                    </span>
                    <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {rec.metricContext}
                    </span>
                  </div>
                  <h3 className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                    {rec.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {rec.advice}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};
