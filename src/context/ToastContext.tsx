import React, { createContext, useContext, useState, useCallback } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  title?: string;
  message: string;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (msg: { message: string; title?: string; type?: 'success' | 'info' | 'error' }) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ message, title, type = 'info' }: { message: string; title?: string; type?: 'success' | 'info' | 'error' }) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts(prev => [...prev, { id, message, title, type }]);
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast Overlay */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-lg border shadow-xl transition-all duration-300 transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-stone-900 text-stone-100 border-stone-800'
                : toast.type === 'error'
                ? 'bg-rose-950 text-rose-100 border-rose-800'
                : 'bg-stone-900 text-stone-100 border-stone-800'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                {toast.title && <div className="text-xs uppercase tracking-wider font-semibold text-amber-300 mb-0.5">{toast.title}</div>}
                <div className="text-sm font-medium leading-relaxed">{toast.message}</div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-stone-400 hover:text-stone-200 transition-colors text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
