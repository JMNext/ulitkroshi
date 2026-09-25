import axios from "axios";

export const isMock = false;

const isClient = typeof window !== "undefined";
const isLocalhost = isClient && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

// На локалке бьем на порт 3005, на сервере продакшена оставляем относительный путь "",
// чтобы трафик шел строго через шлюз Nginx по безопасному HTTPS-каналу
const BASE_URL = isLocalhost ? "http://localhost:3005" : "";

export const authApiInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" }
});

export const gameApiInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" }
});

const setupInterceptors = (instance: typeof authApiInstance) => {
  instance.interceptors.request.use((config) => {
    const token = isClient ? localStorage.getItem("accessToken") : null;

    if (token && config.headers) {
      config.headers.Authorization = "Bearer " + token;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = isClient ? localStorage.getItem("refreshToken") : null;

        if (refreshToken) {
          try {
            const refreshResponse = await authApiInstance.post("/auth/refresh", { refreshToken });
            const data = refreshResponse.data;

            if (data?.accessToken) {
              if (isClient) {
                localStorage.setItem("accessToken", data.accessToken);
                localStorage.setItem("refreshToken", data.refreshToken);
              }
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = "Bearer " + data.accessToken;
              }
              return instance(originalRequest);
            }
          } catch {
            if (isClient) {
              const keysToRemove = ["accessToken", "refreshToken", "is_login_flow"];
              for (let i = 0; i < keysToRemove.length; i++) {
                localStorage.removeItem(keysToRemove[i]);
              }
              window.location.reload();
            }
          }
        }
      }
      return Promise.reject(new Error(error.response?.data?.error || "Произошла сетевая ошибка"));
    }
  );
};

setupInterceptors(authApiInstance);
setupInterceptors(gameApiInstance);
