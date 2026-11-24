import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useWeather } from '../context/WeatherContext';
import { AnalyticsTimeframe, CityWeatherData } from '../types/weather';
import { convertTemp } from '../utils/weatherUtils';

interface WeatherAnalyticsChartsProps {
  data: CityWeatherData;
  compact?: boolean;
}

interface CustomTooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  unit?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  label?: string;
  payload?: CustomTooltipPayloadItem[];
  valueSuffix?: string;
}

const ChartTooltip: React.FC<CustomTooltipProps> = ({
  active,
  label,
  payload,
  valueSuffix = '',
}) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3.5 py-2.5 text-xs shadow-lg backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95">
      <p className="mb-1.5 font-semibold text-slate-900 dark:text-white">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
              {entry.value}
              {entry.unit ?? valueSuffix}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const WeatherAnalyticsCharts: React.FC<WeatherAnalyticsChartsProps> = ({
  data,
  compact = false,
}) => {
  const { unit, theme } = useWeather();
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>('daily');

  const isDark = theme === 'dark';
  const axisTickColor = isDark ? '#94A3B8' : '#64748B';
  const gridColor = isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(148, 163, 184, 0.25)';

  interface ChartPoint {
    label: string;
    temp: number;
    secondaryTemp: number;
    humidity: number;
    rainfall: number;
    rainProb: number;
    wind: number;
  }

  const chartData = useMemo<ChartPoint[]>(() => {
    if (timeframe === 'daily') {
      // Sample every 2 hours across the 24-hour forecast for clean readability (12 points)
      return data.hourly
        .filter((_, idx) => idx % 2 === 0)
        .map((h) => ({
          label: h.hourLabel,
          temp: convertTemp(h.tempC, unit),
          secondaryTemp: convertTemp(h.feelsLikeC, unit),
          humidity: h.humidity,
          rainfall: h.rainfallMm,
          rainProb: h.rainProbability,
          wind: h.windSpeedKmh,
        }));
    }

    return data.daily.map((d) => ({
      label: d.dayName,
      temp: convertTemp(d.maxTempC, unit),
      secondaryTemp: convertTemp(d.minTempC, unit),
      humidity: d.humidity,
      rainfall: d.rainfallMm,
      rainProb: d.rainProbability,
      wind: d.windSpeedKmh,
    }));
  }, [data, timeframe, unit]);

  const chartHeight = compact ? 220 : 265;
  const tempUnitLabel = `°${unit}`;

  return (
    <section aria-label="Weather analytics charts" className="space-y-5">
      {/* Header + Daily / Weekly Segmented Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold tracking-tight text-slate-900 sm:text-xl dark:text-white">
            Weather Analytics
          </h2>
          <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            {timeframe === 'daily'
              ? `24-hour atmospheric trends for ${data.name}`
              : `7-day atmospheric outlook for ${data.name}`}
          </p>
        </div>

        <div
          role="group"
          aria-label="Analytics timeframe"
          className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-800 dark:bg-slate-900"
        >
          <button
            type="button"
            onClick={() => setTimeframe('daily')}
            aria-pressed={timeframe === 'daily'}
            className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              timeframe === 'daily'
                ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-800 dark:text-sky-300'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Daily (24h)
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('weekly')}
            aria-pressed={timeframe === 'weekly'}
            className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              timeframe === 'weekly'
                ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-800 dark:text-sky-300'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Weekly (7-Day)
          </button>
        </div>
      </div>

      {/* 2x2 Responsive Grid of Recharts Visualizations */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* 1. Temperature Trend Chart */}
        <article className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Temperature Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {timeframe === 'daily'
                  ? `Actual vs. feels-like temperature (${tempUnitLabel})`
                  : `Daily high vs. low temperature (${tempUnitLabel})`}
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                {timeframe === 'daily' ? 'Temp' : 'High'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                {timeframe === 'daily' ? 'Feels Like' : 'Low'}
              </span>
            </div>
          </div>

          <div style={{ width: '100%', height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: axisTickColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: axisTickColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  unit="°"
                />
                <Tooltip content={<ChartTooltip valueSuffix={tempUnitLabel} />} />
                <Area
                  type="monotone"
                  dataKey="temp"
                  name={timeframe === 'daily' ? 'Temperature' : 'Max Temp'}
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fill="url(#tempFill)"
                  activeDot={{ r: 5, fill: '#2563EB', strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="secondaryTemp"
                  name={timeframe === 'daily' ? 'Feels Like' : 'Min Temp'}
                  stroke="#38BDF8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="none"
                  activeDot={{ r: 4, fill: '#38BDF8', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* 2. Humidity Trend Chart */}
        <article className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Humidity Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Relative atmospheric moisture percentage (%)
              </p>
            </div>
            <span className="font-mono text-xs tabular-nums text-cyan-600 dark:text-cyan-400">
              0 – 100%
            </span>
          </div>

          <div style={{ width: '100%', height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="humidityFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: axisTickColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: axisTickColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  unit="%"
                />
                <Tooltip content={<ChartTooltip valueSuffix="%" />} />
                <Area
                  type="monotone"
                  dataKey="humidity"
                  name="Humidity"
                  stroke="#0EA5E9"
                  strokeWidth={2.5}
                  fill="url(#humidityFill)"
                  activeDot={{ r: 5, fill: '#0EA5E9', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* 3. Rainfall Chart */}
        <article className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Rainfall &amp; Precipitation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Accumulated volume (mm) across {timeframe === 'daily' ? '24 hours' : '7 days'}
              </p>
            </div>
            <span className="font-mono text-xs tabular-nums text-indigo-600 dark:text-indigo-400">
              mm
            </span>
          </div>

          <div style={{ width: '100%', height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: axisTickColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: axisTickColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip valueSuffix=" mm" />} />
                <Bar
                  dataKey="rainfall"
                  name="Rainfall"
                  fill="#4F46E5"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* 4. Wind Speed Chart */}
        <article className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Wind Speed
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sustained surface wind velocity (km/h)
              </p>
            </div>
            <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
              km/h
            </span>
          </div>

          <div style={{ width: '100%', height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: axisTickColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: axisTickColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip valueSuffix=" km/h" />} />
                <Line
                  type="monotone"
                  dataKey="wind"
                  name="Wind Speed"
                  stroke="#0284C7"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#0284C7', strokeWidth: 0 }}
                  activeDot={{ r: 5.5, fill: '#0284C7', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>
    </section>
  );
};
