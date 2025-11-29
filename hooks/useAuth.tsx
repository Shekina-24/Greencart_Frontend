'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { useRouter } from "next/navigation";
import { clearStoredTokens, getStoredTokens, type StoredTokens } from "@/lib/auth/tokens";
import {
  getCurrentUser,
  login as loginService,
  register as registerService,
  refreshTokens,
  type LoginInput,
  type RegisterInput
} from "@/lib/services/auth";
import type { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  isAuthenticating: boolean;
  login: (input: LoginInput) => Promise<AuthActionResult>;
  register: (input: RegisterInput) => Promise<AuthActionResult>;
  logout: () => void;
  reloadUser: () => Promise<void>;
}

interface AuthActionResult {
  success: boolean;
  error?: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const initialise = async () => {
      const storedTokens = getStoredTokens();
      if (!storedTokens) {
        if (mounted) {
          setIsAuthenticating(false);
        }
        return;
      }

      try {
        const fetchedUser = await tryFetchUserWithTokens(storedTokens);
        if (mounted) {
          setUser(fetchedUser);
        }
      } catch {
        clearStoredTokens();
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsAuthenticating(false);
        }
      }
    };

    void initialise();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (input: LoginInput): Promise<AuthActionResult> => {
    try {
      const result = await loginService(input);
      setUser(result.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: resolveErrorMessage(error) };
    }
  }, []);

  const register = useCallback(
    async (input: RegisterInput): Promise<AuthActionResult> => {
      try {
        await registerService(input);
        const autoLogin = await login({ email: input.email, password: input.password });
        if (!autoLogin.success) {
          return autoLogin;
        }
        return { success: true };
      } catch (error) {
        return { success: false, error: resolveErrorMessage(error) };
      }
    },
    [login]
  );

  const logout = useCallback(() => {
    clearStoredTokens();
    setUser(null);
    try {
      router.push("/landing");
    } catch {
      // ignore navigation errors
    }
  }, [router]);

  const reloadUser = useCallback(async () => {
    const stored = getStoredTokens();
    if (!stored) return;
    try {
      const refreshed = await tryFetchUserWithTokens(stored);
      setUser(refreshed);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticating,
      login,
      register,
      logout,
      reloadUser
    }),
    [user, isAuthenticating, login, register, logout, reloadUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

async function tryFetchUserWithTokens(tokens: StoredTokens): Promise<User> {
  try {
    return await getCurrentUser(tokens.accessToken);
  } catch (error) {
    const refreshed = await refreshTokens(tokens.refreshToken);
    return getCurrentUser(refreshed.accessToken);
  }
}

function resolveErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "payload" in error) {
    const payload = (error as { payload?: unknown }).payload;
    if (typeof payload === "string") {
      return payload;
    }
    if (payload && typeof payload === "object" && "detail" in payload) {
      const detail = (payload as { detail?: unknown }).detail;
      if (typeof detail === "string") {
        return detail;
      }
      if (Array.isArray(detail) && detail.length > 0) {
        return String(detail[0]);
      }
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Une erreur est survenue. Merci de reessayer.";
}
