import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string, durationMs?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((
    message: string,
    type: ToastType = 'info',
    title?: string,
    durationMs: number = 4000
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts(prev => [...prev, { id, message, type, title }]);

    if (durationMs > 0) {
      setTimeout(() => {
        hideToast(id);
      }, durationMs);
    }
  }, [hideToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        aria-live="polite"
      >
        {toasts.map(toast => {
          const typeStyles: Record<ToastType, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
            success: {
              bg: 'bg-emerald-950/95',
              border: 'border-emerald-500/40',
              text: 'text-emerald-100',
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            },
            error: {
              bg: 'bg-rose-950/95',
              border: 'border-rose-500/40',
              text: 'text-rose-100',
              icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            },
            warning: {
              bg: 'bg-amber-950/95',
              border: 'border-amber-500/40',
              text: 'text-amber-100',
              icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            },
            info: {
              bg: 'bg-slate-900/95',
              border: 'border-slate-700',
              text: 'text-slate-100',
              icon: <Info className="w-5 h-5 text-blue-400 shrink-0" />
            }
          };

          const style = typeStyles[toast.type];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-xl border ${style.border} ${style.bg} ${style.text} p-3.5 shadow-2xl backdrop-blur-md flex items-start gap-3 transition-all transform animate-in slide-in-from-bottom-3 duration-200 overflow-hidden relative`}
            >
              {/* Top Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-0.5 flex" aria-hidden="true">
                <div className="h-full w-1/3 bg-[#FF9933]" />
                <div className="h-full w-1/3 bg-[#FFFFFF]" />
                <div className="h-full w-1/3 bg-[#138808]" />
              </div>

              {style.icon}

              <div className="flex-1 min-w-0 pr-2 mt-0.5">
                {toast.title && (
                  <div className="text-xs font-bold font-mono uppercase tracking-wider mb-0.5">
                    {toast.title}
                  </div>
                )}
                <div className="text-xs font-medium leading-relaxed break-words">
                  {toast.message}
                </div>
              </div>

              <button
                type="button"
                onClick={() => hideToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition cursor-pointer"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
