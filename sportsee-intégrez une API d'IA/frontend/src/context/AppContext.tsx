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

  const [, setAuthTick] = useState(0);
  const isAuthenticated = Boolean(getAuthToken());
  const [dataSource, setDataSource] = useState<DataSource>("api");


  function login(token: string) {
    setAuthToken(token); 
    setAuthTick((t) => t + 1); 
  }

  function logout() {
    clearAuthToken();
    setAuthTick((t) => t + 1); 
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

