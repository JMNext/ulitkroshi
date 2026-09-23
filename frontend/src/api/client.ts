import axios from "axios";

export const isMock = true;

export const authApiInstance = axios.create({ baseURL: "http://localhost:3001", headers: { "Content-Type": "application/json" } });
export const gameApiInstance = axios.create({ baseURL: "http://localhost:3002", headers: { "Content-Type": "application/json" } });

const setup = (ins: typeof authApiInstance) => {
  ins.interceptors.request.use((c) => {
    const t = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (t && c.headers) c.headers.Authorization = `Bearer ${t}`;
    return c;
  });

  ins.interceptors.response.use(
    (r) => r,
    async (err) => {
      const orig = err.config;
      if (err.response?.status === 401 && !orig._retry) {
        orig._retry = true;
        const t = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        if (t) { orig.headers.Authorization = `Bearer ${t}`; return ins(orig); }
      }
      return Promise.reject(new Error(err.response?.data?.error || "Произошла сетевая ошибка"));
    }
  );
};

setup(authApiInstance);
setup(gameApiInstance);
