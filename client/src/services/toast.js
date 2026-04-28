const subscribers = new Set();

function buildToast(payload) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: payload?.type || 'info',
    message: payload?.message || 'Notification',
    durationMs: payload?.durationMs || 2800,
  };
}

export function pushToast(payload) {
  const toast = buildToast(payload);
  subscribers.forEach((subscriber) => subscriber(toast));
  return toast.id;
}

export function subscribeToasts(callback) {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}
