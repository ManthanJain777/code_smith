import React from 'react';

export interface GemStarLogoProps {
  className?: string;
  size?: number;
  variant?: 'color' | 'navy' | 'white';
}

/**
 * GemStarLogo — Sovereign Star of Integrity
 * Composed of two intersecting geometric equilateral triangles forming a hexagram.
 * Color Scheme:
 * - Upward Triangle: Radiant Ruby / Crimson Red (#DC2626 -> #EF4444)
 * - Inverted Triangle: Royal Sapphire / Deep Navy Blue (#1D4ED8 -> #3B82F6)
 * - Intersecting Core: Luminous Emerald Green (#059669 -> #10B981) with Golden Accent
 * Pure SVG vector format, 100% scalable with precision 3D beveled light facets.
 */
export const GemStarLogo: React.FC<GemStarLogoProps> = ({
  className = '',
  size = 42,
  variant = 'color',
}) => {
  const uniqueId = React.useId().replace(/:/g, '');

  if (variant === 'white') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`select-none shrink-0 ${className}`}
        aria-label="GeM Star Logo (White)"
        role="img"
      >
        <polygon points="32,6 54.52,45 9.48,45" stroke="#FFFFFF" strokeWidth="2.5" fill="rgba(255,255,255,0.15)" strokeLinejoin="round" />
        <polygon points="32,58 54.52,19 9.48,19" stroke="#FFFFFF" strokeWidth="2.5" fill="rgba(255,255,255,0.15)" strokeLinejoin="round" />
        <circle cx="32" cy="32" r="4.5" fill="#FFFFFF" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none shrink-0 drop-shadow-sm hover:scale-105 transition-transform duration-200 ${className}`}
      aria-label="GeM Star Logo"
      role="img"
    >
      <defs>
        {/* Red Triangle Gradients (Upward) */}
        <linearGradient id={`redTopLeft-${uniqueId}`} x1="9.48" y1="45" x2="32" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#DC2626" />
          <stop offset="50%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#F87171" />
        </linearGradient>
        <linearGradient id={`redTopRight-${uniqueId}`} x1="54.52" y1="45" x2="32" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#991B1B" />
          <stop offset="50%" stopColor="#B91C1C" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>

        {/* Blue Triangle Gradients (Downward) */}
        <linearGradient id={`blueBotLeft-${uniqueId}`} x1="9.48" y1="19" x2="32" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id={`blueBotRight-${uniqueId}`} x1="54.52" y1="19" x2="32" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="50%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>

        {/* Green Core Gradient */}
        <radialGradient id={`greenCore-${uniqueId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="60%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </radialGradient>

        {/* Gold Trim Gradient */}
        <linearGradient id={`goldTrim-${uniqueId}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>

        {/* Crisp Shadow */}
        <filter id={`starShadow-${uniqueId}`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.8" floodColor="#0F172A" floodOpacity="0.28" />
        </filter>
      </defs>

      {/* Decorative Sovereign Ring */}
      <circle cx="32" cy="32" r="30" stroke="url(#goldTrim-${uniqueId})" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.45" />

      <g filter={`url(#starShadow-${uniqueId})`}>
        {/* 1. Downward Triangle (Blue Scheme) */}
        {/* Full base polygon */}
        <polygon
          points="32,58 54.52,19 9.48,19"
          fill={`url(#blueBotLeft-${uniqueId})`}
          stroke="#1E3A8A"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* Blue shaded right facet for 3D depth */}
        <polygon
          points="32,58 54.52,19 32,32"
          fill={`url(#blueBotRight-${uniqueId})`}
          opacity="0.85"
        />

        {/* 2. Upward Triangle (Red Scheme) */}
        {/* Full base polygon */}
        <polygon
          points="32,6 54.52,45 9.48,45"
          fill={`url(#redTopLeft-${uniqueId})`}
          stroke="#991B1B"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* Red shaded right facet for 3D depth */}
        <polygon
          points="32,6 54.52,45 32,32"
          fill={`url(#redTopRight-${uniqueId})`}
          opacity="0.85"
        />

        {/* 3. Central Hexagon Core (Green Scheme - Intersection of Both Triangles) */}
        {/* Exact intersection vertices: (32,19) -> (43.26,25.5) -> (43.26,38.5) -> (32,45) -> (20.74,38.5) -> (20.74,25.5) */}
        <polygon
          points="32,19 43.26,25.5 43.26,38.5 32,45 20.74,38.5 20.74,25.5"
          fill={`url(#greenCore-${uniqueId})`}
          stroke="#064E3B"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Internal Facet Highlights in the Green Core */}
        <polygon
          points="32,19 43.26,25.5 32,32"
          fill="#6EE7B7"
          opacity="0.3"
        />
        <polygon
          points="20.74,25.5 32,19 32,32"
          fill="#FFFFFF"
          opacity="0.25"
        />
        <polygon
          points="32,45 43.26,38.5 32,32"
          fill="#065F46"
          opacity="0.4"
        />

        {/* Sovereign Central Node */}
        <circle cx="32" cy="32" r="5" fill="#FFFFFF" stroke={`url(#goldTrim-${uniqueId})`} strokeWidth="1" />
        <circle cx="32" cy="32" r="2.8" fill="#10B981" />
      </g>
    </svg>
  );
};

export default GemStarLogo;
