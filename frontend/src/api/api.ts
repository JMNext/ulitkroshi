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

    // ХИТРЫЙ ПЕРЕХВАТЧИК: Уничтожаем ошибку 405 из кэша прямо «на лету»!
    if (config.url === "/game/pharmacy/action" && config.method === "post" && config.data) {
      const { actionType, total } = config.data;
      config.method = "get";
      config.url = `/game/pharmacy/action?actionType=${actionType}&total=${total}`;
      config.data = undefined;
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
              localStorage.clear();
              window.location.reload();
            }
          }
        } else {
          if (isClient) {
            localStorage.clear();
            window.location.reload();
          }
        }
      }
      return Promise.reject(new Error(error.response?.data?.error || "Произошла сетевая ошибка"));
    }
  );
};

setupInterceptors(authApiInstance);
setupInterceptors(gameApiInstance);
