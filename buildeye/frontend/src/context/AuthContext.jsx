import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

const TOKEN_KEY = "buildeye_token";
const REMEMBERED_IDENTIFIER_KEY = "buildeye_remembered_identifier";

// Reads the auth token from whichever storage holds it. "Remember me"
// logins are kept in localStorage (survive closing the browser); logins
// without it are kept in sessionStorage (cleared when the tab/browser closes).
export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

function storeToken(token, remember) {
  // Always clear both first so switching "remember me" on/off is respected
  // instead of leaving a stale copy behind in the other storage.
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

export function getRememberedIdentifier() {
  return localStorage.getItem(REMEMBERED_IDENTIFIER_KEY) || "";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = async (identifier, password, remember = true) => {
    const res = await api.post("/auth/login", { identifier, password });
    storeToken(res.data.token, remember);

    if (remember) {
      localStorage.setItem(REMEMBERED_IDENTIFIER_KEY, identifier);
    } else {
      localStorage.removeItem(REMEMBERED_IDENTIFIER_KEY);
    }

    setUser(res.data.user);
    return res.data.user;
  };

  const signup = async (payload, remember = true) => {
    const res = await api.post("/auth/signup", payload);
    storeToken(res.data.token, remember);
    if (remember) {
      localStorage.setItem(REMEMBERED_IDENTIFIER_KEY, payload.identifier);
    }
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const changePassword = async (currentPassword, newPassword) => {
    await api.put("/auth/change-password", { currentPassword, newPassword });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
