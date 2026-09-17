"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { setAccessToken as setApiAccessToken } from "@/lib/axios";
import api from "@/lib/axios";

interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  profileImage?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  setAuth: (accessToken: string, user: AuthUser) => void;
  clearAuth: () => void;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setApiAccessToken(null);
  }, []);

  const refreshSession = useCallback(async () => {
    try { 
      const response = await api.post("/auth/refresh");

      setApiAccessToken(response.data.accessToken);
      setAccessToken(response.data.accessToken);
      setUser(response.data.data.user);

      return true;
    } catch {
      clearAuth();
      return false;
    }
  }, [clearAuth]);

  const setAuth = useCallback((token: string, authUser: AuthUser) => {
    setAccessToken(token);
    setApiAccessToken(token);
    setUser(authUser);
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      await refreshSession();
      setLoading(false);
    };

    restoreSession();
  }, [refreshSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        setAuth,
        clearAuth,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
