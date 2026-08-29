import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { signInWithGoogle, fetchMe, signOutServer } from "@/lib/api/client";
import { tokenStore } from "@/lib/secureStore";
import { API_BASE_URL } from "@/lib/config";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const refreshToken = await tokenStore.getRefreshToken();
      if (!refreshToken) {
        setIsLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        await tokenStore.clearAll();
        setIsLoading(false);
        return;
      }

      const tokens = await res.json();
      await tokenStore.setAccessToken(tokens.accessToken);
      await tokenStore.setRefreshToken(tokens.refreshToken);

      const profile = await fetchMe();
      setUser(profile);
    } catch {
      await tokenStore.clearAll();
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(idToken: string) {
    const data = await signInWithGoogle(idToken);
    await tokenStore.setAccessToken(data.accessToken);
    await tokenStore.setRefreshToken(data.refreshToken);
    setUser(data.user);
  }

  async function signOut() {
    try {
      const refreshToken = await tokenStore.getRefreshToken();
      if (refreshToken) await signOutServer(refreshToken);
    } catch {
      // ignore server errors on logout
    }

    await tokenStore.clearAll();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
