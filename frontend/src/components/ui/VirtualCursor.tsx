import React from 'react';

interface VirtualCursorProps {
  x: number;
  y: number;
  isClicking: boolean;
  label?: string;
}

export const VirtualCursor: React.FC<VirtualCursorProps> = ({ x, y, isClicking, label }) => {
  return (
    <div
      className="fixed top-0 left-0 z-[9999] pointer-events-none transition-all duration-700 ease-out"
      style={{
        transform: `translate3d(${x}px, ${y}px, 0)`
      }}
    >
      {/* Click Ripple Effect */}
      {isClicking && (
        <span className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-amber-400/60 animate-ping border-2 border-amber-300" />
      )}

      {/* Animated SVG Mouse Pointer */}
      <div className="relative">
        <svg
          className="w-7 h-7 text-amber-400 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] filter fill-amber-400 stroke-slate-950 stroke-[1.5]"
          viewBox="0 0 24 24"
        >
          <path d="M3 3l7 18 3-7 7-3L3 3z" />
        </svg>

        {/* Action Label Tooltip attached to cursor */}
        {label && (
          <div className="absolute left-6 top-4 bg-slate-900/95 border border-amber-400/90 text-amber-300 text-[11px] font-mono font-bold px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap backdrop-blur-sm animate-in fade-in zoom-in-95">
            {label}
          </div>
        )}
      </div>
    </div>
  );
};
