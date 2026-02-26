"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface LoadingContextType {
  pageLoading: boolean;
  setPageLoading: (v: boolean) => void;
  actionLoading: boolean;
  setActionLoading: (v: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [pageLoading, setPageLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  return (
    <LoadingContext.Provider
      value={{
        pageLoading,
        setPageLoading,
        actionLoading,
        setActionLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return ctx;
}
