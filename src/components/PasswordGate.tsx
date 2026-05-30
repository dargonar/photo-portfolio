"use client";

import { useState, FormEvent } from "react";
import { usePathname } from "next/navigation";
import { usePasswordGate, isPathProtected } from "@/hooks/usePasswordGate";

/**
 * Fullscreen password gate for specific paths.
 * Only shows the gate on routes listed in NEXT_PUBLIC_GATE_PATHS.
 */
export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isUnlocked } = usePasswordGate();
  const needsProtection = isPathProtected(pathname);

  // Not a protected route → pass through
  if (!needsProtection) return <>{children}</>;

  // Protected but unlocked → show content
  if (isUnlocked) return <>{children}</>;

  // Protected and locked → show gate
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      <GateForm />
    </div>
  );
}

function GateForm() {
  const { attemptLogin, error } = usePasswordGate();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const hasUserField = !!process.env.NEXT_PUBLIC_GATE_USER;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Small delay so the UI feels intentional
    setTimeout(() => {
      attemptLogin(user, password);
      setLoading(false);
    }, 300);
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm px-6">
      {/* ——— Logo / title ——— */}
      <div className="text-center">
        <h1 className="text-headline-lg text-on-background font-pt-mono">
          Acceso restringido
        </h1>
        <p className="text-label-sm text-outline mt-2">
          Este sitio requiere autenticación
        </p>
      </div>

      {/* ——— Form ——— */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        {hasUserField && (
          <input
            type="text"
            placeholder="Usuario"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="w-full bg-surface-container-high text-on-background text-body-md
                       px-4 py-3 rounded-none border border-border-muted
                       placeholder:text-outline-variant
                       focus:outline-none focus:border-on-surface
                       transition-colors font-pt-mono"
            autoFocus
          />
        )}

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-surface-container-high text-on-background text-body-md
                     px-4 py-3 rounded-none border border-border-muted
                     placeholder:text-outline-variant
                     focus:outline-none focus:border-on-surface
                     transition-colors font-pt-mono"
          autoFocus={!hasUserField}
        />

        {error && (
          <p className="text-label-sm text-red-400 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-on-surface text-background text-body-md
                     py-3 px-4 rounded-none
                     hover:opacity-90 disabled:opacity-50
                     transition-opacity font-pt-mono cursor-pointer mt-2"
        >
          {loading ? "Verificando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
