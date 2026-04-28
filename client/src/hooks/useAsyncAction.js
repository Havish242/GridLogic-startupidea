import { useCallback, useState } from 'react';

import { pushToast } from '../services/toast';

export default function useAsyncAction() {
  const [pendingByKey, setPendingByKey] = useState({});

  const runAction = useCallback(async (key, action, options = {}) => {
    if (pendingByKey[key]) return null;

    const {
      successMessage,
      errorMessage,
      onSuccess,
      onError,
    } = options;

    setPendingByKey((prev) => ({ ...prev, [key]: true }));

    try {
      const result = await action();
      if (successMessage) {
        pushToast({ type: 'success', message: successMessage });
      }
      if (onSuccess) {
        onSuccess(result);
      }
      return result;
    } catch (error) {
      const message = errorMessage || error?.message || 'Request failed';
      pushToast({ type: 'error', message });
      if (onError) {
        onError(error);
      }
      throw error;
    } finally {
      setPendingByKey((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }, [pendingByKey]);

  const isLoading = useCallback((key) => Boolean(pendingByKey[key]), [pendingByKey]);

  return {
    runAction,
    isLoading,
    hasPending: Object.keys(pendingByKey).length > 0,
  };
}
