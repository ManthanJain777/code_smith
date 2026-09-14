import React from 'react';
import { GemStarLogo } from './GemStarLogo';

interface GovBrandLogoProps {
  /** Size of the RGB Star Logo in pixels */
  logoSize?: number;
  emblemSize?: number;
  /** Show "GeM Compliance" wordmark below logo */
  showWordmark?: boolean;
  /** Color variant for the logo */
  variant?: 'navy' | 'gold' | 'white';
  /** Optional extra CSS classes */
  className?: string;
  /** Show the ministry subtitle line */
  showSubtitle?: boolean;
}

/**
 * GovBrandLogo — Official combined government logo component.
 * Combines the GeM RGB Hexagram Star Logo (pure SVG) with GeM wordmark and ministry subtitle.
 */
export const GovBrandLogo: React.FC<GovBrandLogoProps> = ({
  logoSize,
  emblemSize = 64,
  showWordmark = true,
  variant = 'navy',
  className = '',
  showSubtitle = false,
}) => {
  const effectiveSize = logoSize || emblemSize;
  const textColor = variant === 'white' ? 'text-white' : variant === 'gold' ? 'text-amber-800' : 'text-slate-900';
  const subTextColor = variant === 'white' ? 'text-slate-300' : 'text-slate-500';
  const tagBg = variant === 'white'
    ? 'bg-white/10 text-white border-white/20'
    : 'bg-amber-50 text-amber-800 border-amber-200';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <GemStarLogo size={effectiveSize} variant={variant === 'gold' ? 'color' : variant} />
      {showWordmark && (
        <div className="flex flex-col justify-center gap-0.5">
          <div className="flex items-center gap-2">
            <span className={`font-black text-xl tracking-tight leading-none ${textColor}`}>
              GeM <span className="text-amber-600">Compliance</span>
            </span>
            <span className={`hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border ${tagBg}`}>
              GFR 2017
            </span>
          </div>
          <span className={`text-[11px] font-semibold leading-tight ${subTextColor}`}>
            National Bid Compliance Verification Platform
          </span>
          {showSubtitle && (
            <span className={`text-[10px] leading-tight ${subTextColor} opacity-75`}>
              भारत सरकार | Ministry of Petroleum & Natural Gas
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default GovBrandLogo;
