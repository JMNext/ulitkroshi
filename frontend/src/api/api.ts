import axios from "axios";

export const isMock = false;

const getBaseUrl = (): string => {
  if (typeof window === "undefined") return "";
  const { protocol, hostname } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${protocol}//${hostname}:3005`;
  }
  return `${protocol}//${hostname}:3005`;
};

const BASE_URL = getBaseUrl();

export const authApiInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" }
});

export const gameApiInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" }
});

const setupInterceptors = (instance: typeof authApiInstance) => {
  const isClient = typeof window !== "undefined";

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
