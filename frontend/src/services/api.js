import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('airindex_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Avoid infinite redirect loop if already on login
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('airindex_token');
        localStorage.removeItem('airindex_user');
      }
    }
    return Promise.reject(error);
  }
);

// Authentication Endpoints
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  sendOtp: (data) => api.post('/auth/send-otp', data),
  googleAuth: (credential) => api.post('/auth/google', { credential }),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  verifyResetOtp: (data) => api.post('/auth/verify-reset-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  getDevEmails: () => api.get('/auth/dev-emails'),
};

// Airfare Index Endpoints
export const indexApi = {
  getCurrent: () => api.get('/index/current'),
  getDaily: (limit = 45) => api.get(`/index/daily?limit=${limit}`),
  getWeekly: (limit = 20) => api.get(`/index/weekly?limit=${limit}`),
  getMonthly: (limit = 12) => api.get(`/index/monthly?limit=${limit}`),
  recalculate: (days_back = 35) => api.post(`/index/recalculate?days_back=${days_back}`),
};

// Route & Flight Analytics Endpoints
export const routeApi = {
  getRoutes: (active_only = true) => api.get(`/routes?active_only=${active_only}`),
  updateRoute: (id, data) => api.put(`/routes/${id}`, data),
  getPrices: (route_code) => api.get(`/routes/${route_code}/prices`),
  getTrend: (route_code, days = 30) => api.get(`/routes/${route_code}/trend?days=${days}`),
};

// Airline Analytics
export const airlineApi = {
  getAirlines: () => api.get('/airlines'),
};

// Advance Booking Windows
export const bookingWindowApi = {
  getBookingWindows: (route_code) => {
    const q = route_code ? `?route_code=${encodeURIComponent(route_code)}` : '';
    return api.get(`/booking-windows${q}`);
  },
};

// Heatmap Matrix
export const heatmapApi = {
  getHeatmap: (booking_window, airline) => {
    const params = new URLSearchParams();
    if (booking_window) params.append('booking_window', booking_window);
    if (airline) params.append('airline', airline);
    const qs = params.toString();
    return api.get(`/heatmap${qs ? `?${qs}` : ''}`);
  },
};

// Historical Observations
export const historicalApi = {
  getObservations: (params) => api.get('/historical', { params }),
  exportCsvUrl: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return `${API_BASE_URL}/historical/export/csv${qs ? `?${qs}` : ''}`;
  },
  exportJsonUrl: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return `${API_BASE_URL}/historical/export/json${qs ? `?${qs}` : ''}`;
  },
};

// Backtesting
export const backtestingApi = {
  getBacktesting: (days = 30) => api.get(`/backtesting?days=${days}`),
};

// Data Quality
export const dataQualityApi = {
  getDataQuality: () => api.get('/data-quality'),
};

// Scraper Status & Pipeline
export const sourceApi = {
  getSourcesStatus: () => api.get('/sources/status'),
  triggerScrape: (source_id) => api.post(`/sources/${source_id}/trigger`),
  generateDemo: (days = 14) => api.post(`/demo/generate?days=${days}`),
};

export default api;
