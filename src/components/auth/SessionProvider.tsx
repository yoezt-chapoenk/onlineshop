"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface SessionUser {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  role: "customer" | "reseller" | "wholesale" | "admin";
  resellerStatus: "none" | "pending" | "approved" | "rejected";
}

interface SessionContextValue {
  user: SessionUser | null;
  isLoading: boolean;
  isReseller: boolean;
}

const SessionContext = createContext<SessionContextValue>({
  user: null,
  isLoading: true,
  isReseller: false,
});

export function SessionProvider({
  initialUser,
  children,
}: {
  initialUser: SessionUser | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<SessionUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(true);

  // Refresh once on mount in case the SSR cache is stale.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { user: SessionUser | null }) => {
        if (!cancelled) setUser(j.user ?? null);
      })
      .catch(() => {
        // Ignore network errors; keep last known user
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isReseller =
    user?.role === "reseller" || user?.role === "wholesale";

  return (
    <SessionContext.Provider value={{ user, isLoading, isReseller }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
