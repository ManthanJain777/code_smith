import React from 'react';

export interface GemStarLogoProps {
  className?: string;
  size?: number;
  variant?: 'color' | 'navy' | 'white';
}

/**
 * GemStarLogo — Star made up of two overlapping equilateral triangles.
 * Color Scheme: Red (top triangle), Blue (inverted triangle), Green (central intersecting hexagram).
 * Pure SVG vector format, fully responsive and scalable.
 */
export const GemStarLogo: React.FC<GemStarLogoProps> = ({
  className = '',
  size = 42,
  variant = 'color',
}) => {
  const uniqueId = React.useId().replace(/:/g, '');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none shrink-0 ${className}`}
      aria-label="GeM Star Logo"
      role="img"
    >
      <defs>
        {/* Upward Triangle Red Gradient */}
        <linearGradient id={`redGrad-${uniqueId}`} x1="32" y1="4" x2="32" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF334B" />
          <stop offset="100%" stopColor="#C81E32" />
        </linearGradient>

        {/* Downward Triangle Blue Gradient */}
        <linearGradient id={`blueGrad-${uniqueId}`} x1="32" y1="16" x2="32" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Central Hexagon Green Gradient */}
        <linearGradient id={`greenGrad-${uniqueId}`} x1="32" y1="18" x2="32" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Soft Drop Shadow for depth */}
        <filter id={`shadow-${uniqueId}`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Outer Glow Ring / Shield Accents */}
      <circle cx="32" cy="32" r="30" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

      <g filter={`url(#shadow-${uniqueId})`}>
        {/* 1. Downward Equilateral Triangle — Blue */}
        {/* Vertices: (7.8, 18.5) -> (56.2, 18.5) -> (32, 60.5) */}
        <polygon
          points="7.8,18.5 56.2,18.5 32,60.5"
          fill={`url(#blueGrad-${uniqueId})`}
          stroke="#1E40AF"
          strokeWidth="1.5"
          strokeLinejoin="round"
          opacity="0.95"
        />

        {/* 2. Upward Equilateral Triangle — Red */}
        {/* Vertices: (32, 3.5) -> (56.2, 45.5) -> (7.8, 45.5) */}
        <polygon
          points="32,3.5 56.2,45.5 7.8,45.5"
          fill={`url(#redGrad-${uniqueId})`}
          stroke="#991B1B"
          strokeWidth="1.5"
          strokeLinejoin="round"
          opacity="0.95"
        />

        {/* 3. Central Overlapping Hexagon — Green (Where Both Triangles Intersect) */}
        {/* Intersect points: (20,18.5) -> (44,18.5) -> (50.1,29) -> (44,45.5) -> (20,45.5) -> (13.9,29) */}
        <polygon
          points="24,18.5 40,18.5 48.1,32 40,45.5 24,45.5 15.9,32"
          fill={`url(#greenGrad-${uniqueId})`}
          stroke="#047857"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Central Core Accents */}
        <circle cx="32" cy="32" r="5" fill="#FFFFFF" opacity="0.9" />
        <circle cx="32" cy="32" r="2.8" fill="#10B981" />
      </g>
    </svg>
  );
};

export default GemStarLogo;
