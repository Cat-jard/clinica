'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  success: (msg: string) => void;
  error:   (msg: string) => void;
  warning: (msg: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS = {
  success: <CheckCircle size={16} className="text-green-500 flex-shrink-0" />,
  error:   <XCircle    size={16} className="text-red-500 flex-shrink-0"   />,
  warning: <AlertCircle size={16} className="text-yellow-500 flex-shrink-0" />,
};

const BORDER = {
  success: 'border-l-green-500',
  error:   'border-l-red-500',
  warning: 'border-l-yellow-500',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((type: ToastType, message: string) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const remove = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={{
      success: (m) => add('success', m),
      error:   (m) => add('error',   m),
      warning: (m) => add('warning', m),
    }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-80">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 bg-white border border-gray-100 border-l-4 ${BORDER[t.type]} rounded-xl shadow-lg px-4 py-3 animate-in slide-in-from-right-5 fade-in duration-200`}
          >
            {ICONS[t.type]}
            <p className="text-sm text-gray-700 flex-1 leading-snug">{t.message}</p>
            <button onClick={() => remove(t.id)} className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
