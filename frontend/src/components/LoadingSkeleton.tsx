import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div aria-busy="true" aria-label="Loading weather conditions" className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="h-[340px] rounded-3xl bg-slate-200/80 dark:bg-slate-800/70 lg:col-span-8" />
        <div className="h-[340px] rounded-3xl bg-slate-200/80 dark:bg-slate-800/70 lg:col-span-4" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-36 rounded-2xl bg-slate-200/80 dark:bg-slate-800/70"
          />
        ))}
      </div>

      <div className="h-52 rounded-3xl bg-slate-200/80 dark:bg-slate-800/70" />

      <div className="h-96 rounded-3xl bg-slate-200/80 dark:bg-slate-800/70" />
    </div>
  );
};

interface WeatherErrorStateProps {
  message: string;
  onRetry: () => void;
}

export const WeatherErrorState: React.FC<WeatherErrorStateProps> = ({
  message,
  onRetry,
}) => {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
        <AlertCircle className="h-6 w-6" />
      </span>
      <h2 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">
        Unable to Load Weather Data
      </h2>
      <p className="mt-1.5 max-w-md text-sm text-slate-500 dark:text-slate-400">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-sky-600 dark:hover:bg-sky-500"
      >
        <RefreshCw className="h-4 w-4" />
        Retry Station Fetch
      </button>
    </div>
  );
};
