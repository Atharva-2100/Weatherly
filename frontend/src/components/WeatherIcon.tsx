import React from 'react';
import { WeatherConditionType } from '../types/weather';

interface WeatherIconProps {
  condition: WeatherConditionType;
  size?: number;
  className?: string;
}

/**
 * Crisp multi-tone SVG weather illustrations designed for light, dark, and gradient surfaces.
 */
export const WeatherIcon: React.FC<WeatherIconProps> = ({
  condition,
  size = 48,
  className = '',
}) => {
  const uid = React.useId().replace(/:/g, '');

  switch (condition) {
    case 'sunny':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
          className={className}
        >
          <defs>
            <radialGradient id={`sun-${uid}`} cx="38%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="55%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" />
            </radialGradient>
          </defs>
          <g stroke="#FBBF24" strokeWidth="3.2" strokeLinecap="round" opacity="0.9">
            <line x1="32" y1="6" x2="32" y2="12" />
            <line x1="32" y1="52" x2="32" y2="58" />
            <line x1="6" y1="32" x2="12" y2="32" />
            <line x1="52" y1="32" x2="58" y2="32" />
            <line x1="13.6" y1="13.6" x2="17.8" y2="17.8" />
            <line x1="46.2" y1="46.2" x2="50.4" y2="50.4" />
            <line x1="50.4" y1="13.6" x2="46.2" y2="17.8" />
            <line x1="17.8" y1="46.2" x2="13.6" y2="50.4" />
          </g>
          <circle cx="32" cy="32" r="14.5" fill={`url(#sun-${uid})`} />
        </svg>
      );

    case 'clear-night':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
          className={className}
        >
          <defs>
            <linearGradient id={`moon-${uid}`} x1="18" y1="12" x2="48" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E0F2FE" />
              <stop offset="100%" stopColor="#93C5FD" />
            </linearGradient>
          </defs>
          <path
            d="M41.5 39.2A16.5 16.5 0 0 1 24.8 14a16.5 16.5 0 1 0 23.2 23.2 16.3 16.3 0 0 1-6.5 2Z"
            fill={`url(#moon-${uid})`}
          />
          <circle cx="46" cy="18" r="2" fill="#BAE6FD" />
          <circle cx="52" cy="26" r="1.4" fill="#E0F2FE" opacity="0.85" />
          <circle cx="39" cy="13" r="1.2" fill="#E0F2FE" opacity="0.7" />
        </svg>
      );

    case 'partly-cloudy':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
          className={className}
        >
          <defs>
            <radialGradient id={`pc-sun-${uid}`} cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </radialGradient>
            <linearGradient id={`pc-cloud-${uid}`} x1="16" y1="26" x2="48" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
          </defs>
          <g stroke="#FBBF24" strokeWidth="2.6" strokeLinecap="round">
            <line x1="40" y1="10" x2="40" y2="14" />
            <line x1="53" y1="23" x2="57" y2="23" />
            <line x1="49.5" y1="13.5" x2="52" y2="11" />
            <line x1="30.5" y1="13.5" x2="28" y2="11" />
          </g>
          <circle cx="40" cy="24" r="10" fill={`url(#pc-sun-${uid})`} />
          <path
            d="M21 48h25.5a9.5 9.5 0 0 0 1.4-18.9A13 13 0 0 0 22.8 26a11 11 0 0 0-1.8 22Z"
            fill={`url(#pc-cloud-${uid})`}
          />
        </svg>
      );

    case 'cloudy':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
          className={className}
        >
          <defs>
            <linearGradient id={`cl-back-${uid}`} x1="22" y1="14" x2="52" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
            <linearGradient id={`cl-front-${uid}`} x1="14" y1="26" x2="46" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
          </defs>
          <path
            d="M26 38h23a8 8 0 0 0 1-15.9A10.5 10.5 0 0 0 29.8 20a9 9 0 0 0-3.8 18Z"
            fill={`url(#cl-back-${uid})`}
          />
          <path
            d="M17.5 49h27a9.5 9.5 0 0 0 1.5-18.9A12.5 12.5 0 0 0 22 27.6a10.5 10.5 0 0 0-4.5 21.4Z"
            fill={`url(#cl-front-${uid})`}
          />
        </svg>
      );

    case 'rainy':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
          className={className}
        >
          <defs>
            <linearGradient id={`rn-cloud-${uid}`} x1="14" y1="14" x2="50" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
          </defs>
          <path
            d="M18 40h27a9 9 0 0 0 1.4-17.9A12.5 12.5 0 0 0 22.3 19.5 10 10 0 0 0 18 40Z"
            fill={`url(#rn-cloud-${uid})`}
          />
          <g stroke="#38BDF8" strokeWidth="3" strokeLinecap="round">
            <line x1="23" y1="45" x2="20" y2="53" />
            <line x1="33" y1="45" x2="30" y2="55" />
            <line x1="43" y1="45" x2="40" y2="53" />
          </g>
        </svg>
      );

    case 'heavy-rain':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
          className={className}
        >
          <defs>
            <linearGradient id={`hr-cloud-${uid}`} x1="14" y1="12" x2="50" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
          </defs>
          <path
            d="M18 38h27a9 9 0 0 0 1.4-17.9A12.5 12.5 0 0 0 22.3 17.5 10 10 0 0 0 18 38Z"
            fill={`url(#hr-cloud-${uid})`}
          />
          <g stroke="#0EA5E9" strokeWidth="3" strokeLinecap="round">
            <line x1="20" y1="43" x2="16" y2="54" />
            <line x1="29" y1="43" x2="25" y2="56" />
            <line x1="38" y1="43" x2="34" y2="54" />
            <line x1="47" y1="43" x2="43" y2="56" />
          </g>
        </svg>
      );

    case 'thunderstorm':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
          className={className}
        >
          <defs>
            <linearGradient id={`ts-cloud-${uid}`} x1="14" y1="12" x2="50" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>
          <path
            d="M18 38h27a9 9 0 0 0 1.4-17.9A12.5 12.5 0 0 0 22.3 17.5 10 10 0 0 0 18 38Z"
            fill={`url(#ts-cloud-${uid})`}
          />
          <polygon points="34,37 25,49 31.5,49 28.5,58 40,44.5 33.5,44.5" fill="#FBBF24" />
          <line x1="20" y1="44" x2="17" y2="52" stroke="#38BDF8" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="45" y1="44" x2="42" y2="52" stroke="#38BDF8" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      );

    case 'breezy':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
          className={className}
        >
          <defs>
            <linearGradient id={`br-cloud-${uid}`} x1="16" y1="14" x2="46" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
          </defs>
          <path
            d="M18 35h24a7.5 7.5 0 0 0 1.2-14.9A10.5 10.5 0 0 0 22.5 18a8.5 8.5 0 0 0-4.5 17Z"
            fill={`url(#br-cloud-${uid})`}
          />
          <path
            d="M12 42h31a5 5 0 1 0-4.5-7.2"
            stroke="#38BDF8"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M18 49h24a4 4 0 1 1-3.5 6"
            stroke="#7DD3FC"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'mist':
    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
          className={className}
        >
          <path
            d="M18 34h27a8 8 0 0 0 1.3-15.9A11 11 0 0 0 24 16a9 9 0 0 0-6 18Z"
            fill="#CBD5E1"
          />
          <g stroke="#94A3B8" strokeWidth="3.2" strokeLinecap="round">
            <line x1="14" y1="41" x2="50" y2="41" />
            <line x1="18" y1="48" x2="46" y2="48" opacity="0.8" />
            <line x1="22" y1="55" x2="42" y2="55" opacity="0.6" />
          </g>
        </svg>
      );
  }
};
