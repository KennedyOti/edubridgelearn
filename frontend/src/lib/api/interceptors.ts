import { api } from "./axios";
import { getToken, removeToken } from "../utils/storage";

export const setupInterceptors = () => {
  api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error.response?.status === 401) {
        removeToken();
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
};
