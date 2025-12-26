"use client";

/**
 * AccessGate — Phase 0 Password Gate
 *
 * Simple access control for Phase 0 testing.
 * Validates against NEXT_PUBLIC_ACCESS_CODE environment variable.
 * Persists access in sessionStorage (cleared on browser close).
 *
 * TODO: Remove this component in Phase 1 when proper auth is implemented.
 */

import { useState, useCallback, useSyncExternalStore, type ReactNode } from "react";

const STORAGE_KEY = "hasAccess";

function getAccessSnapshot(): boolean {
  return sessionStorage.getItem(STORAGE_KEY) === "true";
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribeToAccess(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

interface AccessGateProps {
  children: ReactNode;
}

export function AccessGate({ children }: AccessGateProps) {
  const storedAccess = useSyncExternalStore(
    subscribeToAccess,
    getAccessSnapshot,
    getServerSnapshot
  );

  // Local state for immediate UI update after successful login
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError(false);

      const accessCode = process.env.NEXT_PUBLIC_ACCESS_CODE;

      if (inputValue === accessCode) {
        sessionStorage.setItem(STORAGE_KEY, "true");
        setJustUnlocked(true);
      } else {
        setError(true);
        setInputValue("");
      }
    },
    [inputValue]
  );

  // Access granted — render app
  if (storedAccess || justUnlocked) {
    return <>{children}</>;
  }

  // Access gate screen
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-xs flex-col items-center gap-8"
      >
        {/* Title */}
        <h1 className="text-2xl tracking-wider text-white">
          Enter access code
        </h1>

        {/* Password Input */}
        <input
          type="password"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoFocus
          autoComplete="off"
          className="w-full border-b border-[#444444] bg-transparent py-2 text-center text-xl tracking-widest text-white outline-none transition-colors focus:border-white"
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="text-xl tracking-widest text-white transition-opacity hover:opacity-70"
        >
          Enter
        </button>

        {/* Error Message */}
        {error && (
          <p className="text-base tracking-wide text-[#666666]">
            This world is currently closed.
          </p>
        )}
      </form>
    </div>
  );
}
