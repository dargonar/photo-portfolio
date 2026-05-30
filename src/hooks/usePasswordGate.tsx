"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

interface PasswordGateContextType {
  /** Whether the user passed the gate for all protected paths */
  isUnlocked: boolean;
  /** Show errors */
  error: string | null;
  /** Attempt login with user:password */
  attemptLogin: (user: string, password: string) => boolean;
  /** Lock again (logout) */
  lock: () => void;
}

const PasswordGateContext = createContext<PasswordGateContextType>({
  isUnlocked: false,
  error: null,
  attemptLogin: () => false,
  lock: () => {},
});

// ── Config from env ──────────────────────────────────────────
// Set these in Netlify env vars (or .env.local for dev):
//   NEXT_PUBLIC_GATE_USER    (optional — if empty, only password is asked)
//   NEXT_PUBLIC_GATE_PASS    (required)
//   NEXT_PUBLIC_GATE_PATHS   (required — comma-separated, e.g. "/projects,/projects/adhd")
const ENV_USER = process.env.NEXT_PUBLIC_GATE_USER ?? "";
const ENV_PASS = process.env.NEXT_PUBLIC_GATE_PASS ?? "";
const ENV_PATHS = (process.env.NEXT_PUBLIC_GATE_PATHS ?? "")
  .split(",")
  .map((p) => p.trim().replace(/\/+$/, ""))
  .filter(Boolean);

/** Check if a pathname should be protected (exact match, no trailing slash) */
export function isPathProtected(pathname: string): boolean {
  const p = pathname.replace(/\/+$/, "") || "/";
  return ENV_PATHS.includes(p);
}

// Simple hash to avoid storing raw password in localStorage
function simpleHash(s: string): string {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return "h" + Math.abs(hash).toString(36);
}

export function PasswordGateProvider({ children }: { children: ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("passwordGate");
    if (stored === simpleHash(ENV_USER + ":" + ENV_PASS)) {
      setIsUnlocked(true);
    }
  }, []);

  const attemptLogin = useCallback((user: string, password: string): boolean => {
    const userOk = !ENV_USER || user === ENV_USER;
    const passOk = password === ENV_PASS;

    if (userOk && passOk) {
      setIsUnlocked(true);
      setError(null);
      localStorage.setItem("passwordGate", simpleHash(ENV_USER + ":" + ENV_PASS));
      return true;
    }

    setError("Usuario o contraseña incorrectos");
    return false;
  }, []);

  const lock = useCallback(() => {
    setIsUnlocked(false);
    setError(null);
    localStorage.removeItem("passwordGate");
  }, []);

  return (
    <PasswordGateContext.Provider value={{ isUnlocked, error, attemptLogin, lock }}>
      {children}
    </PasswordGateContext.Provider>
  );
}

export const usePasswordGate = () => useContext(PasswordGateContext);
