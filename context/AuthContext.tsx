import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  ApiError,
  clearSession,
  currentSessionGeneration,
  hydrateSession,
  persistProfile,
  persistSession,
  readerApi,
  readStoredProfile,
  type Profile,
} from "@/lib/api";

type AuthContextValue = {
  user: Profile | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogleIdToken: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const started = currentSessionGeneration();
    hydrateSession()
      .then(async (tokens) => {
        if (!active || started !== currentSessionGeneration()) return;
        if (!tokens) return;
        const cached = await readStoredProfile();
        if (!active || started !== currentSessionGeneration()) return;
        if (cached) setUser(cached);
        try {
          const profile = await readerApi.me();
          if (!active || started !== currentSessionGeneration()) return;
          await persistProfile(profile);
          if (active && started === currentSessionGeneration()) setUser(profile);
        } catch (error) {
          if (error instanceof ApiError && error.status === 401 && started === currentSessionGeneration()) {
            await clearSession();
            if (active) setUser(null);
          }
        }
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const adopt = useCallback(async (response: { access: string; refresh: string; user: Profile }) => {
    await persistSession({ access: response.access, refresh: response.refresh });
    await persistProfile(response.user);
    setUser(response.user);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      await adopt(await readerApi.login({ email, password }));
    },
    [adopt],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await adopt(await readerApi.register({ name, email, password }));
    },
    [adopt],
  );

  const signInWithGoogleIdToken = useCallback(
    async (idToken: string) => {
      await adopt(await readerApi.google(idToken));
    },
    [adopt],
  );

  const signOut = useCallback(async () => {
    try {
      await readerApi.logout();
    } catch {
      // The local session still ends if the server is unreachable.
    }
    await clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, signIn, register, signInWithGoogleIdToken, signOut }),
    [user, ready, signIn, register, signInWithGoogleIdToken, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
