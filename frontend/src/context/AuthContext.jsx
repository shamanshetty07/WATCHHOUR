import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/users/current-user");
      setUser(response.data.data);
    } catch {
      setUser(null);
      localStorage.removeItem("accessToken");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const response = await api.post("/users/login", credentials);
    const { user: loggedInUser, accessToken } = response.data.data;
    localStorage.setItem("accessToken", accessToken);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (formData) => {
    const response = await api.post("/users/register", formData);
    return response.data.data;
  };

  const logout = async () => {
    try {
      await api.post("/users/logout");
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, fetchCurrentUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
