// src/context/AppContext.tsx
"use client";

import { createContext, useContext, useState } from "react";
import {
  getAuthToken,
  clearAuthToken,
  setAuthToken,
} from "@/services/authToken";

type DataSource = "mock" | "api";

type AppContextType = {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  dataSource: DataSource;
  setDataSource: (source: DataSource) => void;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  /**
   * ⚠️ IMPORTANT
   * authTick ne sert QU'À forcer un re-render
   * La vérité vient TOUJOURS du cookie
   */
  const [, setAuthTick] = useState(0);

  // ✅ SOURCE UNIQUE DE VÉRITÉ
  const isAuthenticated = Boolean(getAuthToken());

  const [dataSource, setDataSource] = useState<DataSource>("api");


  function login(token: string) {
    setAuthToken(token); // écrit le cookie
    setAuthTick((t) => t + 1); // force re-render
  }

  function logout() {
    clearAuthToken(); // supprime le cookie
    setAuthTick((t) => t + 1); // force re-render
  }

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        dataSource,
        setDataSource,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }
  return context;
}
