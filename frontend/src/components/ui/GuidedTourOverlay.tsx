import React, { useEffect, useState } from 'react';
import { useGuidedTour, TOUR_STEPS } from '../../context/GuidedTourContext';
import { VirtualCursor } from './VirtualCursor';
import {
  Play, Pause, ChevronRight, ChevronLeft, X, Bot
} from 'lucide-react';

interface ElementRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const GuidedTourOverlay: React.FC = () => {
  const {
    isActive,
    currentStepIndex,
    currentStep,
    isAutoPlaying,
    cursorPos,
    nextStep,
    prevStep,
    toggleAutoPlay,
    exitTour,
    goToStep
  } = useGuidedTour();

  const [targetRect, setTargetRect] = useState<ElementRect | null>(null);

  // Measure target element position for non-intrusive glowing focus ring
  useEffect(() => {
    if (!isActive || !currentStep) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      const el = document.querySelector(currentStep.targetSelector);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    const interval = setInterval(updateRect, 300);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [isActive, currentStepIndex, currentStep]);

  // Keyboard Shortcuts Listener (Left Arrow = Prev, Space = Pause/Play, Right Arrow = Next)
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        toggleAutoPlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, prevStep, toggleAutoPlay, nextStep]);

  if (!isActive) return null;

  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;
  const isFirstStep = currentStepIndex === 0;

  return (
    <>
      {/* ── VIRTUAL ANIMATED MOUSE CURSOR ── */}
      <VirtualCursor
        x={cursorPos.x}
        y={cursorPos.y}
        isClicking={cursorPos.isClicking}
        label={cursorPos.label}
      />

      {/* ── NON-INTRUSIVE GLOWING TARGET FOCUS RING (ZERO BACKGROUND BLUR) ── */}
      {targetRect && (
        <div
          className="fixed z-[40] pointer-events-none rounded-xl transition-all duration-500 border-2 border-amber-400 ring-4 ring-amber-400/30 shadow-[0_0_30px_rgba(251,191,36,0.6)] animate-pulse"
          style={{
            top: `${targetRect.top - 6}px`,
            left: `${targetRect.left - 6}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`
          }}
        />
      )}

      {/* ── TOP-RIGHT COMPACT AUTOPILOT STATUS HEADER PILL ── */}
      <div className="fixed top-4 right-4 z-[90] flex items-center gap-2">
        <div className="bg-slate-900/95 border border-amber-400/80 text-white rounded-full px-4 py-2 flex items-center gap-3 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span className="text-xs font-black text-amber-300 flex items-center gap-1.5 font-mono">
              <Bot className="w-4 h-4 text-amber-400" /> AUTOPILOT LIVE
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <span className="text-xs font-semibold text-slate-200">
            Step {currentStepIndex + 1}/{TOUR_STEPS.length}: <strong className="text-white">{currentStep.title}</strong>
          </span>

          <div className="h-4 w-px bg-slate-700" />

          <button
            onClick={exitTour}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition cursor-pointer"
            title="Exit Autopilot Demo (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── BOTTOM-RIGHT COMPACT AUTOPILOT CONTROLS PILL ── */}
      <div className="fixed bottom-6 right-6 z-[90]">
        <div className="bg-slate-900/95 border border-slate-700 text-white rounded-2xl p-3 shadow-2xl backdrop-blur-md flex items-center gap-3">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5 px-1">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => goToStep(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'bg-amber-400 w-5'
                    : idx < currentStepIndex
                    ? 'bg-slate-500 w-2'
                    : 'bg-slate-800 w-2'
                }`}
                title={`Jump to step ${idx + 1}`}
              />
            ))}
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={prevStep}
              disabled={isFirstStep}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg text-xs transition cursor-pointer"
              title="Previous Step (Left Arrow ←)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={toggleAutoPlay}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
              title={isAutoPlaying ? 'Pause Autopilot (Spacebar)' : 'Resume Autopilot (Spacebar)'}
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px]">Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px]">Play</span>
                </>
              )}
            </button>

            <button
              onClick={nextStep}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs transition flex items-center gap-1 shadow-md cursor-pointer"
              title="Next Step (Right Arrow →)"
            >
              <span className="text-[11px]">{isLastStep ? 'Done' : 'Next'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
