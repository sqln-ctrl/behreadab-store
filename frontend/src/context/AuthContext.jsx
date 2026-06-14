import { createContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser    = localStorage.getItem("sb_user");
    const storedSession = localStorage.getItem("sb_session");
    if (storedUser && storedSession) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem("sb_session", JSON.stringify(data.session));
    localStorage.setItem("sb_user",    JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password });
    // Supabase requires email verification before session is active
    // so we don't auto-login here
    return data;
  };

  const logout = async () => {
    await authAPI.logout().catch(() => {});
    localStorage.removeItem("sb_session");
    localStorage.removeItem("sb_user");
    setUser(null);
  };

  const updateUser = (updated) => {
    const merged = { ...user, ...updated };
    localStorage.setItem("sb_user", JSON.stringify(merged));
    setUser(merged);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateUser,
      isAdmin: user?.role === "admin",
    }}>
      {children}
    </AuthContext.Provider>
  );
};
