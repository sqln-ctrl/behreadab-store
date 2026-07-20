import { createContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(() => { try { const u = localStorage.getItem("sb_user"); return u ? JSON.parse(u) : null; } catch { return null; } });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem("sb_session", JSON.stringify(data.session));
    localStorage.setItem("sb_user",    JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password });
    if (data.session) {
      localStorage.setItem("sb_session", JSON.stringify(data.session));
      localStorage.setItem("sb_user",    JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    authAPI.logout().catch(() => {});
    localStorage.removeItem("sb_session");
    localStorage.removeItem("sb_user");
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    const merged = { ...user, ...updatedUser };
    localStorage.setItem("sb_user", JSON.stringify(merged));
    setUser(merged);
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
