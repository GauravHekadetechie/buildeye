import axios from "axios";

// Local: Vite proxies /api. Deployed: uses the Render URL.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "/api",
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
