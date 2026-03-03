import { createContext, useContext, useMemo, useState } from "react";
import api, { setAuthToken } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("smartTourismUser");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    setAuthToken(parsed?.token);
    return parsed;
  });

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("smartTourismUser", JSON.stringify(data));
    setAuthToken(data.token);
    setUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("smartTourismUser", JSON.stringify(data));
    setAuthToken(data.token);
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("smartTourismUser");
    setAuthToken("");
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, register, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
