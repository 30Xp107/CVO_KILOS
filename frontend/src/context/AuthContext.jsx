import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, clearToken, getToken, setToken } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  const logout = useCallback(() => {
    clearToken();
    setAdmin(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setAdmin(null);
      setLoading(false);
      return null;
    }
    try {
      const data = await api.get("/auth/me");
      setAdmin(data.admin);
      return data.admin;
    } catch {
      clearToken();
      setAdmin(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handler = () => {
      setAdmin(null);
    };
    window.addEventListener("kilos:unauthorized", handler);
    return () => window.removeEventListener("kilos:unauthorized", handler);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.post("/auth/login", { email, password });
    setToken(data.token);
    setAdmin(data.admin);
    return data.admin;
  }, []);

  const register = useCallback(async (name, email, password, confirmPassword) => {
    const data = await api.post("/auth/register", { name, email, password, confirmPassword });
    setToken(data.token);
    setAdmin(data.admin);
    return data.admin;
  }, []);

  const value = useMemo(
    () => ({ admin, loading, login, logout, refresh, register, setAdmin }),
    [admin, loading, login, logout, refresh, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
