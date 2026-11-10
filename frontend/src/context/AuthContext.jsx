import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  api,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(Boolean(getAccessToken()));

  const logout = useCallback(() => {
    clearTokens();
    setAdmin(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!getAccessToken()) {
      setAdmin(null);
      setLoading(false);
      return null;
    }
    try {
      const data = await api.get("/auth/me");
      setAdmin(data.admin);
      return data.admin;
    } catch {
      clearTokens();
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
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setAdmin(data.admin);
    return data.admin;
  }, []);

  const register = useCallback(
    async (idNumber, firstName, middleInitial, lastName, email, position, password, confirmPassword) => {
      const data = await api.post("/auth/register", {
        idNumber,
        firstName,
        middleInitial,
        lastName,
        email,
        position,
        password,
        confirmPassword,
      });
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setAdmin(data.admin);
      return data.admin;
    },
    []
  );

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
