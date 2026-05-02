import axios from 'axios';

const api = axios.create({
  baseURL: '/',
});

const authApi = axios.create({
  baseURL: '/',
});

const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 350;

let tokenCache = '';
let refreshPromise = null;
let backendReachable = true;
const connectionSubscribers = new Set();

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getErrorMessage(error) {
  const data = error?.response?.data;
  if (typeof data?.detail === 'string') return data.detail;
  if (typeof data?.message === 'string') return data.message;
  return error?.message || 'Request failed';
}

function notifyConnectionStatus(value) {
  if (backendReachable === value) return;
  backendReachable = value;
  connectionSubscribers.forEach((subscriber) => subscriber(backendReachable));
}

export function subscribeConnectionStatus(callback) {
  connectionSubscribers.add(callback);
  callback(backendReachable);
  return () => {
    connectionSubscribers.delete(callback);
  };
}

function isNetworkFailure(error) {
  if (!error) return false;
  if (!error.response) return true;
  return error.code === 'ECONNABORTED' || error.message === 'Network Error';
}

function shouldRetry(error) {
  const status = error?.response?.status;
  return isNetworkFailure(error) || (status >= 500 && status < 600);
}

async function refreshToken() {
  if (!tokenCache) {
    throw new Error('Missing session token');
  }
  if (!refreshPromise) {
    refreshPromise = authApi
      .post('/api/auth/refresh', null, {
        headers: {
          Authorization: `Bearer ${tokenCache}`,
        },
      })
      .then((response) => {
        const nextToken = response.data?.token;
        if (!nextToken) {
          throw new Error('Token refresh failed');
        }
        setToken(nextToken);
        return nextToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  if (tokenCache) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${tokenCache}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    notifyConnectionStatus(true);
    return response;
  },
  async (error) => {
    const requestConfig = error.config || {};

    if (error?.response?.status === 401 && !requestConfig.__isRefreshRequest && !requestConfig.__didRefresh) {
      try {
        await refreshToken();
        requestConfig.__didRefresh = true;
        return api(requestConfig);
      } catch (refreshError) {
        setToken('');
        notifyConnectionStatus(false);
        const normalizedRefreshError = new Error(getErrorMessage(refreshError));
        throw normalizedRefreshError;
      }
    }

    if (shouldRetry(error)) {
      requestConfig.__retryCount = requestConfig.__retryCount || 0;
      if (requestConfig.__retryCount < MAX_RETRIES) {
        requestConfig.__retryCount += 1;
        const waitMs = BASE_RETRY_DELAY_MS * (2 ** (requestConfig.__retryCount - 1));
        await sleep(waitMs);
        return api(requestConfig);
      }
    }

    if (isNetworkFailure(error)) {
      notifyConnectionStatus(false);
    } else if (error?.response && error?.response?.status >= 500 && error?.response?.status < 600) {
      // Treat server-side errors as "reachable" when they come from the
      // /health endpoint (the backend is responding but degraded). Only mark
      // the backend unreachable for network failures or 5xx errors from
      // non-health endpoints.
      const requestUrl = requestConfig.url || '';
      try {
        const normalizedUrl = String(requestUrl || '').toLowerCase();
        if (normalizedUrl.endsWith('/health') || normalizedUrl.endsWith('/health/')) {
          notifyConnectionStatus(true);
        } else {
          notifyConnectionStatus(false);
        }
      } catch (e) {
        notifyConnectionStatus(false);
      }
    }

    const normalizedError = new Error(getErrorMessage(error));
    normalizedError.status = error?.response?.status;
    throw normalizedError;
  }
);

const persistedToken = window.localStorage.getItem('gridpulse.token');
if (persistedToken) {
  tokenCache = persistedToken;
  api.defaults.headers.common.Authorization = `Bearer ${persistedToken}`;
}

export function setToken(token) {
  tokenCache = token || '';
  if (tokenCache) {
    api.defaults.headers.common.Authorization = `Bearer ${tokenCache}`;
    window.localStorage.setItem('gridpulse.token', tokenCache);
  } else {
    delete api.defaults.headers.common.Authorization;
    window.localStorage.removeItem('gridpulse.token');
  }
}

export async function login(payload) {
  const { data } = await api.post('/api/auth/login', payload);
  if (data?.token) {
    setToken(data.token);
  }
  return data;
}

export async function getIncidents(params = {}) {
  const { data } = await api.get('/api/incidents', { params });
  return data.items || [];
}

export async function getEngineers(params = {}) {
  const { data } = await api.get('/api/engineers', { params });
  return data.items || [];
}

export async function updateEngineerStatus(engineerId, status) {
  const { data } = await api.patch(`/api/engineers/${engineerId}/status`, { status });
  return data;
}

export async function createDispatch(incidentId, engineerId) {
  const { data } = await api.post('/api/dispatch', {
    incident_id: incidentId,
    engineer_id: engineerId,
  });
  return data;
}

export async function getDispatches(params = {}) {
  const { data } = await api.get('/api/dispatch', { params });
  return data.items || [];
}

export async function markDispatchArrived(dispatchId) {
  const { data } = await api.patch(`/api/dispatch/${dispatchId}/arrived`);
  return data;
}

export async function completeDispatch(dispatchId, notes) {
  const { data } = await api.patch(`/api/dispatch/${dispatchId}/complete`, {
    notes,
  });
  return data;
}

export async function getMatches(incident) {
  const { data } = await api.post('/ai/match', {
    incident_id: incident.id,
    fault_type: incident.fault_type,
    site_location: incident.location,
  });
  return data.matches || [];
}
