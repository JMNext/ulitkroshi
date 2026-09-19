import axios from "axios";

export const isMock = true;

export const authApiInstance = axios.create({
  baseURL: "http://localhost:3001",
  headers: { "Content-Type": "application/json" }
});

export const gameApiInstance = axios.create({
  baseURL: "http://localhost:3002",
  headers: { "Content-Type": "application/json" }
});

const addAuthInterceptor = (instance: typeof authApiInstance) => {
  instance.interceptors.request.use((config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

const addResponseInterceptor = (instance: typeof authApiInstance) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const newestToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

        if (newestToken) {
          originalRequest.headers.Authorization = `Bearer ${newestToken}`;
          return instance(originalRequest);
        }
      }

      console.error(`🚨 [NETWORK ERROR] URL: ${error.config?.url} | Error:`, error.response?.data || error.message);
      const message = error.response?.data?.error || "Произошла сетевая ошибка";
      return Promise.reject(new Error(message));
    }
  );
};

addAuthInterceptor(authApiInstance);
addAuthInterceptor(gameApiInstance);
addResponseInterceptor(authApiInstance);
addResponseInterceptor(gameApiInstance);
