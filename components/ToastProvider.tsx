'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type ToastType = 'success' | 'warning' | 'info' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  timeoutMs: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, timeoutMs?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', timeoutMs = 3000) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((cur) => [...cur, { id, message, type, timeoutMs }]);
    window.setTimeout(() => {
      setToasts((cur) => cur.filter((t) => t.id !== id));
    }, timeoutMs);
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{ position: 'fixed', right: 16, bottom: 16, display: 'grid', gap: '8px', zIndex: 1000 }} aria-live="polite" aria-atomic>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`alert ${toast.type === 'success' ? 'alert--success' : toast.type === 'warning' ? 'alert--warning' : toast.type === 'error' ? 'alert--warning' : ''}`}
            role="status"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

