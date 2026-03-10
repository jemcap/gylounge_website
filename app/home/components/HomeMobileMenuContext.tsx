"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type HomeMobileMenuContextValue = {
  isOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
};

const HomeMobileMenuContext = createContext<HomeMobileMenuContextValue | null>(
  null,
);

type HomeMobileMenuProviderProps = {
  children: ReactNode;
};

export function HomeMobileMenuProvider({
  children,
}: HomeMobileMenuProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <HomeMobileMenuContext.Provider
      value={{
        isOpen,
        openMenu: () => setIsOpen(true),
        closeMenu: () => setIsOpen(false),
        toggleMenu: () => setIsOpen((current) => !current),
      }}
    >
      {children}
    </HomeMobileMenuContext.Provider>
  );
}

export function useHomeMobileMenu() {
  const context = useContext(HomeMobileMenuContext);

  if (!context) {
    throw new Error(
      "useHomeMobileMenu must be used within HomeMobileMenuProvider.",
    );
  }

  return context;
}
