import { useState, useEffect, useCallback } from 'react';
import { IconCheck, IconX, IconWifi } from './Icons';

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

let addToastFn: ((msg: string, type: ToastItem['type']) => void) | null = null;

export const toast = {
  success: (msg: string) => addToastFn?.(msg, 'success'),
  error:   (msg: string) => addToastFn?.(msg, 'error'),
  info:    (msg: string) => addToastFn?.(msg, 'info'),
};

let counter = 0;

const TOAST_STYLES = {
  success: {
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-950/80',
    bar: 'bg-emerald-400',
    Icon: IconCheck,
    iconClass: 'text-emerald-400',
  },
  error: {
    border: 'border-red-500/40',
    bg: 'bg-red-950/80',
    bar: 'bg-red-400',
    Icon: IconX,
    iconClass: 'text-red-400',
  },
  info: {
    border: 'border-cyan-500/40',
    bg: 'bg-cyan-950/80',
    bar: 'bg-cyan-400',
    Icon: IconWifi,
    iconClass: 'text-cyan-400',
  },
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastItem['type']) => {
    const id = ++counter;
    setToasts(prev => [...prev.slice(-4), { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  return (
    <div className="fixed top-5 right-4 z-[100] flex flex-col gap-2.5 w-72 pointer-events-none">
      {toasts.map(t => {
        const s = TOAST_STYLES[t.type];
        const { Icon } = s;
        return (
          <div
            key={t.id}
            className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-2xl text-sm font-medium text-white shadow-2xl animate-slide-in overflow-hidden pointer-events-auto ${s.border} ${s.bg}`}
          >
            {/* Bottom progress bar */}
            <div className={`absolute bottom-0 left-0 h-0.5 w-full ${s.bar} opacity-40`}
              style={{ animation: 'progress-shrink 3.8s linear forwards' }} />
            <div className={`flex-shrink-0 ${s.iconClass}`}>
              <Icon size={16} />
            </div>
            <span className="leading-snug">{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
