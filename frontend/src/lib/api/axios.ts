// app/lib/api/axios.ts
import axios from "axios";
import { removeToken } from "../utils/storage"; // optional if you had fallback

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // send cookies automatically
});

// Optional: global response interceptor to catch 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // optional: clear client state or redirect
      // window.location.href = "/login"; // if using client-side fallback
    }
    return Promise.reject(error);
  }
);
