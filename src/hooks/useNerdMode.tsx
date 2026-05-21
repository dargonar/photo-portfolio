"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface NerdModeContextType {
  nerdMode: boolean;
  toggleNerdMode: () => void;
}

const NerdModeContext = createContext<NerdModeContextType>({
  nerdMode: false,
  toggleNerdMode: () => {},
});

export function NerdModeProvider({ children }: { children: ReactNode }) {
  const [nerdMode, setNerdMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("nerdMode");
    setNerdMode(stored === "true");
  }, []);

  const toggleNerdMode = () => {
    setNerdMode((prev) => {
      localStorage.setItem("nerdMode", String(!prev));
      return !prev;
    });
  };

  return (
    <NerdModeContext.Provider value={{ nerdMode, toggleNerdMode }}>
      {children}
    </NerdModeContext.Provider>
  );
}

export const useNerdMode = () => useContext(NerdModeContext);
