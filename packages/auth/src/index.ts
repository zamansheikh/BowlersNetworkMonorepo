"use client";

// ============================================================================
// BowlersNetwork — Auth Provider & Hook
// ============================================================================
// Shared auth context used by all 7 frontend apps.
// Stores JWT token from the external backend in localStorage.
// On mount, calls /api/auth/me to check if the token is still valid.
// ============================================================================

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { authApi, setToken, clearToken } from "@bowlersnetwork/api-client";
import type { User, LoginPayload } from "@bowlersnetwork/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const refresh = useCallback(async () => {
    try {
      const user = await authApi.me();
      setState({ user, isAuthenticated: true, isLoading: false });
    } catch {
      clearToken();
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  const login = useCallback(async (credentials: LoginPayload) => {
    const response = await authApi.login(credentials);
    // Backend returns user + token — store token for future requests
    if ("access_token" in (response as any)) {
      setToken((response as any).access_token);
    }
    setState({ user: response.user, isAuthenticated: true, isLoading: false });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // logout endpoint may fail — clear token anyway
    }
    clearToken();
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  // On mount: check if stored token is still valid
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (token) {
      refresh();
    } else {
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, [refresh]);

  // Listen for 401 events from api-client
  useEffect(() => {
    const handler = () => {
      setState({ user: null, isAuthenticated: false, isLoading: false });
    };
    window.addEventListener("auth:unauthorized", handler);
    return () => window.removeEventListener("auth:unauthorized", handler);
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
