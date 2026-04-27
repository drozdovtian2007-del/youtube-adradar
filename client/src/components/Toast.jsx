import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

const icons = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

const colors = {
  success: {
    border: 'rgba(74,222,128,0.4)',
    glow: 'rgba(74,222,128,0.15)',
    icon: '#4ade80',
    text: '#86efac',
  },
  error: {
    border: 'rgba(248,113,113,0.4)',
    glow: 'rgba(248,113,113,0.15)',
    icon: '#f87171',
    text: '#fca5a5',
  },
  info: {
    border: 'rgba(167,139,250,0.4)',
    glow: 'rgba(167,139,250,0.15)',
    icon: '#a78bfa',
    text: '#c4b5fd',
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, visible: true }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 400);
    }, duration);
  }, []);

  const remove = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 400);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div style={{
        position: 'fixed', bottom: 24, right: 24,
        display: 'flex', flexDirection: 'column', gap: 10,
        zIndex: 999999, pointerEvents: 'none',
      }}>
        {toasts.map(({ id, message, type, visible }) => {
          const c = colors[type] || colors.info;
          return (
            <div
              key={id}
              onClick={() => remove(id)}
              style={{
                pointerEvents: 'auto',
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 18px',
                borderRadius: 14,
                background: `linear-gradient(135deg, rgba(15,10,30,0.92), rgba(25,15,45,0.88))`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${c.border}`,
                boxShadow: `0 0 24px ${c.glow}, 0 8px 32px rgba(0,0,0,0.4)`,
                minWidth: 260, maxWidth: 360,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateX(0) scale(1)' : 'translateX(30px) scale(0.95)',
                transition: 'opacity 0.35s cubic-bezier(.2,.8,.2,1), transform 0.35s cubic-bezier(.2,.8,.2,1)',
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: `radial-gradient(circle, ${c.glow} 0%, transparent 70%)`,
                border: `1px solid ${c.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: c.icon, fontWeight: 700, fontSize: 13,
              }}>
                {icons[type]}
              </div>
              <span style={{ color: '#e2e8f0', fontSize: 14, fontFamily: 'Syne, sans-serif', lineHeight: 1.4, flex: 1 }}>
                {message}
              </span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
