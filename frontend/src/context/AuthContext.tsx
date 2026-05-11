"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface AuthUser {
  ID: string;
  username: string;
  email: string;
  role: "sensei" | "student";
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
    role: "sensei" | "student"
  ) => Promise<void>;
  logout: () => void;
}

export class AuthError extends Error {
  constructor(
    public readonly httpStatus: number,
    message: string
  ) {
    super(message);
    this.name = "AuthError";
  }
}

interface ApiEnvelope<T = unknown> {
  status: "success" | "error";
  data: T | null;
  error: string | null;
  message?: string;
}

interface AuthResponseData {
  token: string;
  user: AuthUser;
}

const LS_TOKEN = "app_token";
const LS_USER = "app_token_user";
const COOKIE_SESSION = "app_session";
const COOKIE_ROLE = "app_role";

function setCookie(name: string, value: string, days: number) {
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json: ApiEnvelope<T> = await response.json();

  if (!response.ok) {
    const message =
      json.message ?? json.error ?? `Request failed (${response.status})`;
    throw new AuthError(response.status, message);
  }

  return json.data as T;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(LS_TOKEN);
      const storedUser = localStorage.getItem(LS_USER);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as AuthUser);
      }
    } catch {
      localStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LS_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persistSession = useCallback((newToken: string, newUser: AuthUser) => {
    localStorage.setItem(LS_TOKEN, newToken);
    localStorage.setItem(LS_USER, JSON.stringify(newUser));

    setCookie(COOKIE_SESSION, newToken, 1);
    setCookie(COOKIE_ROLE, newUser.role, 1);

    setToken(newToken);
    setUser(newUser);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_USER);
    deleteCookie(COOKIE_SESSION);
    deleteCookie(COOKIE_ROLE);
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const data = await postJson<AuthResponseData>("/api/auth/login", {
        username,
        password,
      });
      persistSession(data.token, data.user);
    },
    [persistSession]
  );

  const register = useCallback(
    async (
      username: string,
      email: string,
      password: string,
      role: "sensei" | "student"
    ) => {
      const data = await postJson<AuthResponseData>("/api/auth/register", {
        username,
        email,
        password,
        role,
      });
      persistSession(data.token, data.user);
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    clearSession();
    window.location.href = "/login";
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isLoading, login, register, logout }),
    [user, token, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
