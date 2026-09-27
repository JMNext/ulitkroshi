import axios from "axios";

export const isMock = false;

const BASE_URL = "";

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
            const refreshResponse = await axios.post("/auth/refresh", { refreshToken });
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
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("is_login_flow");
              localStorage.removeItem("local_user_coins");
            }
          }
        } else {
          if (isClient) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("is_login_flow");
            localStorage.removeItem("local_user_coins");
          }
        }
      }
      return Promise.reject(new Error(error.response?.data?.error || "Произошла сетевая ошибка"));
    }
  );
};

setupInterceptors(authApiInstance);
setupInterceptors(gameApiInstance);
