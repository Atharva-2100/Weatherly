import React, { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { WeatherProvider, useWeather } from './context/WeatherContext';
import { AboutPage } from './pages/AboutPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DashboardPage } from './pages/DashboardPage';
import { ForecastPage } from './pages/ForecastPage';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

const ToastNotification: React.FC = () => {
  const { toast, dismissToast } = useWeather();
  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-2xl border border-slate-200 bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
    >
      <span>{toast.text}</span>
      <button
        type="button"
        onClick={dismissToast}
        aria-label="Dismiss notification"
        className="rounded-md p-0.5 text-slate-400 transition-colors hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default function App() {
  return (
    <WeatherProvider>
      <HashRouter>
        <ScrollToTop />
        <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/forecast" element={<ForecastPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <ToastNotification />
        </div>
      </HashRouter>
    </WeatherProvider>
  );
}
