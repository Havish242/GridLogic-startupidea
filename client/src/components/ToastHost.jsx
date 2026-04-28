import { useEffect, useState } from 'react';

import { subscribeToasts } from '../services/toast';

function tone(type) {
  if (type === 'success') return 'border-mission-accent/60 bg-mission-accent/10 text-mission-accent';
  if (type === 'error') return 'border-mission-danger/70 bg-mission-danger/10 text-mission-danger';
  return 'border-mission-cyan/60 bg-mission-cyan/10 text-mission-cyan';
}

export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return subscribeToasts((toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== toast.id));
      }, toast.durationMs);
    });
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex w-[92vw] max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div key={toast.id} className={`rounded-xl border px-3 py-2 shadow-panel ${tone(toast.type)}`}>
          <p className="mono-data text-xs uppercase">{toast.type}</p>
          <p className="mt-1 text-sm">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
