import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
  id?: string;
  email: string;
  role: string; // "admin" | "user" | "pending"
  name?: string;
  phone?: string;
  profilePicture?: string;
  addresses?: any[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BACKEND_URL = "http://localhost:5001/api";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (emailOrPhone: string, password: string): Promise<boolean> => {
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/login`, {
        emailOrPhone,
        password
      });

      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Login error:", err);
      const errMsg = err.response?.data?.error || "Invalid credentials. Only admin and registered customers can login.";
      alert(errMsg);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string): Promise<boolean> => {
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/register`, {
        name,
        email,
        phone: phone || "",
        password
      });

      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        alert("Registration successful! Welcome to Ghar Sansar.");
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Registration error:", err);
      const errMsg = err.response?.data?.error || "Registration failed. Try a different email.";
      alert(errMsg);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/google`, {
        email: "googleuser@example.com",
        name: "Google User"
      });

      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Google login error:", err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, loading, login, register, loginWithGoogle, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
