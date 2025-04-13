import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  telegram?: string;
  github?: string;
  website?: string;
  bio?: string;
}
interface AuthContextValue {
  user: User | null;
  login: (token: string, remember?: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({} as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token") ?? sessionStorage.getItem("token");
    if (token) {
      fetch(`${API_BASE_URL}/api/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => setUser({
          id: data.id,
          username: data.username,
          email: data.email,
          avatar: data.avatar,
          telegram: data.telegram,
          github: data.github,
          website: data.website,
          bio: data.bio,
        }))
        .catch(() => {
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
        });
    }
  }, []);

  const login = (token: string, remember = false) => {
    console.log("remember", remember);
    console.log("token", token);
    if (remember) {
      localStorage.setItem("token", token);
      sessionStorage.removeItem("token");
    } else {
      sessionStorage.setItem("token", token);
      localStorage.removeItem("token");
    }

    fetch(`${API_BASE_URL}/api/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setUser({
        id: data.id,
        username: data.username,
        email: data.email,
        avatar: data.avatar,
        telegram: data.telegram,
        github: data.github,
        website: data.website,
        bio: data.bio,
      }))
      .catch(error => {
        console.error("Login failed:", error);
        setUser(null);
      });
  };

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
