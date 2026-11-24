import React from 'react';
import { Link } from 'react-router-dom';
import { CloudSun } from 'lucide-react';

const FOOTER_LINKS = [
  { label: 'Dashboard', to: '/' },
  { label: 'Forecast', to: '/forecast' },
  { label: 'Weather Analytics', to: '/analytics' },
  { label: 'About', to: '/about' },
];

export const Footer: React.FC = () => {
  return (
    <footer className="mt-14 border-t border-slate-200/80 bg-white transition-colors duration-200 dark:border-slate-800/80 dark:bg-slate-950">
      <div className="mx-auto max-w-[1380px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          {/* Brand & Short Description */}
          <div className="max-w-md">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm">
                <CloudSun className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Weatherly
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              A cloud-based smart weather monitoring interface built for clear atmospheric
              visibility—combining real-time condition cards, hourly and 7-day projections, and
              interactive meteorological trend analytics.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="font-display text-xs font-semibold tracking-wide text-slate-900 dark:text-slate-100">
              Navigation
            </h3>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 md:flex-col md:gap-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-sky-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="mt-8 flex flex-col justify-between gap-4 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center dark:border-slate-800/80 dark:text-slate-400">
          <p className="max-w-2xl leading-relaxed">
            Weather information disclaimer: Atmospheric readings and forecasts displayed in
            Weatherly use simulated meteorological datasets for frontend demonstration and are
            not intended for aviation, maritime, or emergency safety decisions.
          </p>
          <p className="shrink-0 whitespace-nowrap font-medium text-slate-600 dark:text-slate-400">
            © {new Date().getFullYear()} Weatherly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
