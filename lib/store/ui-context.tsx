"use client";

import * as React from "react";

interface UIContextValue {
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

const UIContext = React.createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  return (
    <UIContext.Provider
      value={{ searchOpen, setSearchOpen, mobileNavOpen, setMobileNavOpen }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = React.useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}
