"use client";

import { Menu, X } from "lucide-react";
import { useAdminNavigation } from "./AdminNavigationContext";

export function AdminMenuToggle() {
  const { isOpen, toggle } = useAdminNavigation();

  return (
    <button
      type="button"
      aria-label={isOpen ? "Close admin menu" : "Open admin menu"}
      aria-expanded={isOpen}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white transition  cursor-pointer"
      onClick={toggle}
    >
      {isOpen ? (
        <X aria-hidden="true" className="h-8 w-8" />
      ) : (
        <Menu aria-hidden="true" className="h-8 w-8" />
      )}
    </button>
  );
}
