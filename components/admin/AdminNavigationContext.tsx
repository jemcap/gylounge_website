"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";

type AdminNavigationContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const AdminNavigationContext = createContext<AdminNavigationContextValue | null>(
  null,
);

export function AdminNavigationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <AdminNavigationContext value={{ isOpen, open, close, toggle }}>
      {children}
    </AdminNavigationContext>
  );
}

export function useAdminNavigation() {
  const ctx = useContext(AdminNavigationContext);

  if (!ctx) {
    throw new Error(
      "useAdminNavigation must be used within AdminNavigationProvider",
    );
  }

  return ctx;
}
