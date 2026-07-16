import axios, { AxiosRequestConfig } from "axios";

export interface ResponseMessage<T = any> {
  status: "success" | "error";
  message: string;
  data?: T;
}

// 1. Создаем базовый инстанс Axios
export const gatewayApi = axios.create({
  // Забираем переменную VITE_API_BASE из вашего .env файла через синтаксис Vite
  baseURL: import.meta.env.VITE_API_BASE || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});


// Переменные для предотвращения race condition (одновременного обновления токена из разных мест)
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 2. ТЗ: Добавление JWT в заголовки ко всем запросам
gatewayApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. ТЗ: Автоматический refresh при 401 и Retry-механизм при временных сбоях
gatewayApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean; _retryCount?: number };
    if (!originalRequest) return Promise.reject(error);

    // МЕХАНИЗМ RETRY: Повтор запроса до 2 раз при сбоях сети или ошибках сервера 5xx
    const MAX_RETRIES = 2;
    const isNetworkError = !error.response;
    const isServerError = error.response && error.response.status >= 500;

    if ((isNetworkError || isServerError) && !originalRequest._retry) {
      originalRequest._retryCount = originalRequest._retryCount || 0;
      if (originalRequest._retryCount < MAX_RETRIES) {
        originalRequest._retryCount += 1;
        // Небольшая пауза перед повторной попыткой (1 секунда умноженная на номер попытки)
        await new Promise((resolve) => setTimeout(resolve, originalRequest._retryCount! * 1000));
        return gatewayApi(originalRequest);
      }
    }

    // МЕХАНИЗМ REFRESH: Автоматическое обновление токена при ошибке 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Если обновление токена уже запущено другим запросом, ждем его завершения в очереди
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`;
            return gatewayApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        isRefreshing = false;
        handleForceLogout();
        return Promise.reject(error);
      }

      try {
        // Делаем изолированный запрос на обновление, используя чистый axios, чтобы не зациклить интерцептор
        const response = await axios.post(`${gatewayApi.defaults.baseURL}/auth/refresh`, { refreshToken });
        
        const { accessToken: newAccess, refreshToken: newRefresh } = response.data;
        
        localStorage.setItem("accessToken", newAccess);
        localStorage.setItem("refreshToken", newRefresh);

        processQueue(null, newAccess);
        isRefreshing = false;

        // Повторяем изначальный запрос с уже обновленным токеном
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        }
        return gatewayApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        handleForceLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

function handleForceLogout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

export default gatewayApi;
