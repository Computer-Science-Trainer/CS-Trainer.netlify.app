import React, { createContext, useContext, useState, useEffect } from "react";

import { makeApiRequest } from "@/config/api";

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

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token =
      localStorage.getItem("token") ?? sessionStorage.getItem("token");

    if (token) {
      makeApiRequest(`api/me`, "GET")
        .then((data) =>
          setUser({
            id: data.id,
            username: data.username,
            email: data.email,
            avatar: data.avatar,
            telegram: data.telegram,
            github: data.github,
            website: data.website,
            bio: data.bio,
          }),
        )
        .catch((err: any) => {
          if (err.status !== 404) {
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
          }
        });
    }
  }, []);

  const login = (token: string, remember = false) => {
    if (remember) {
      localStorage.setItem("token", token);
      sessionStorage.removeItem("token");
    } else {
      sessionStorage.setItem("token", token);
      localStorage.removeItem("token");
    }

    makeApiRequest(`api/me`, "GET")
      .then((data) =>
        setUser({
          id: data.id,
          username: data.username,
          email: data.email,
          avatar: data.avatar,
          telegram: data.telegram,
          github: data.github,
          website: data.website,
          bio: data.bio,
        }),
      )
      .catch((_error) => {
        setUser(null);
      });
  };

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  return ctx;
};
