import axios from "axios";
import useAuthStore from "../store/useAuthStore";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:3000/api",
  withCredentials: true, // gửi cookie refreshToken
});

// 🔥 REQUEST interceptor: gắn accessToken
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🔥 RESPONSE interceptor: xử lý 401 → refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 🔥 gọi refresh (cookie tự gửi)
        const res = await axios.post(
          "/auth/refresh",
          {},
          { withCredentials: true }
        );

        const newToken = res.data.accessToken;

        // 🔥 cập nhật lại store
        useAuthStore.getState().setAuth(newToken, null);

        // 🔥 gắn lại token mới
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest); // gọi lại request cũ
      } catch (err) {
        // refresh fail → logout
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;