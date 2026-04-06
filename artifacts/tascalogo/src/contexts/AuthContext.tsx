import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export interface AuthUser {
  id: number;
  email: string;
  name?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/api/auth/me`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Erro ao iniciar sessão");
    setUser(data);
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const r = await fetch(`${BASE}/api/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Erro ao criar conta");
    setUser(data);
  }, []);

  const logout = useCallback(async () => {
    await fetch(`${BASE}/api/auth/logout`, { method: "POST", credentials: "include" });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
