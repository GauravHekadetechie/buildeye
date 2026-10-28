import axios from "axios";

// In dev, Vite proxies /api -> http://localhost:5000 (see vite.config.js)
const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  // Token may live in localStorage ("remember me") or sessionStorage
  // (session-only login) - see context/AuthContext.jsx.
  const token = localStorage.getItem("buildeye_token") || sessionStorage.getItem("buildeye_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
