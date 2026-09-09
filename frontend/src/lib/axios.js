/**
 * Axios client cho SPA.
 *
 * withCredentials: true → trình duyệt đính cookie httpOnly vào mọi request /api.
 * Không còn localStorage.token.
 *
 * Interceptor response:
 *   - success: trả luôn response.data ({ success, message, data }) nên UI viết res.data.user
 *   - 401: thử POST /auth/refresh-token (cookie refresh), rồi gọi lại request cũ
 *   - không refresh các URL auth (login, register...) để tránh vòng lặp
 */
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/v1`
  : '/api/v1'; // Vite proxy /api → backend :5050

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const activeWsId = localStorage.getItem('activeWorkspaceId');
    if (activeWsId) {
      config.headers['X-Workspace-Id'] = activeWsId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const AUTH_SKIP_REFRESH = /\/auth\/(login|register|google|refresh-token|logout|verify-email|forgot-password|reset-password|resend-verification)/;

const toAppError = (error) => {
  const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra, vui lòng thử lại';
  const customError = new Error(message);
  customError.response = error.response;
  customError.data = error.response?.data;
  customError.statusCode = error.response?.status;
  customError.code = error.response?.data?.code;
  return customError;
};

let refreshPromise = null; // nhiều request 401 cùng lúc chỉ refresh 1 lần

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;
    const url = original.url || '';

    if (status === 401 && !original._retry && !AUTH_SKIP_REFRESH.test(url)) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${baseURL}/auth/refresh-token`, {}, { withCredentials: true })
            .finally(() => {
              refreshPromise = null;
            });
        }
        await refreshPromise;
        return api(original);
      } catch {
        return Promise.reject(toAppError(error));
      }
    }

    return Promise.reject(toAppError(error));
  }
);

export default api;
