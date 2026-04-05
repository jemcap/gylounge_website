"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { adminSignOutAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { useAdminNavigation } from "./AdminNavigationContext";
import {
  type AdminNavigationItem,
  isAdminNavigationItemActive,
} from "./admin-navigation";

type AdminSidebarProps = {
  currentPath: string;
  items: AdminNavigationItem[];
};

export function AdminSidebar({ currentPath, items }: AdminSidebarProps) {
  const { isOpen, close } = useAdminNavigation();
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  // Trap focus inside sidebar on mobile when open
  useEffect(() => {
    if (!isOpen || !sidebarRef.current) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !sidebarRef.current) return;

      const focusable = sidebarRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    window.addEventListener("keydown", handleTab);
    return () => window.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  const sidebarContent = (
    <>
      <nav className="flex flex-col gap-2">
        {items.map((item) => {
          const isActive = isAdminNavigationItemActive(currentPath, item.href);
          const linkClassName = [
            "rounded-2xl px-4 py-3 text-xl font-bold transition",
            isActive
              ? "bg-[#f1d39b] text-[#261B07]"
              : "text-[#261B07] hover:bg-[#efe7d9]",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={linkClassName}
              onClick={close}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <form action={adminSignOutAction} className="mt-auto pt-6">
        <Button
          type="submit"
          className="min-h-11 w-full bg-[#f1d39b] px-4 py-3 font-semibold text-[#261B07] hover:opacity-90"
        >
          Logout
        </Button>
      </form>
    </>
  );

  return (
    <>
      {/* Desktop: inline sidebar that pushes content */}
      <aside
        aria-label="Admin navigation"
        aria-hidden={!isOpen}
        className="hidden overflow-hidden border-r-2 border-[#8F887D] bg-[#F8F6F2] pb-6 pt-10 text-[#261B07] transition-all duration-300 ease-in-out md:flex md:flex-col"
        style={{
          width: isOpen ? "18rem" : "0",
          minWidth: isOpen ? "18rem" : "0",
          paddingLeft: isOpen ? "1.25rem" : "0",
          paddingRight: isOpen ? "1.25rem" : "0",
        }}
      >
        <div className="flex min-w-[16rem] flex-1 flex-col">{sidebarContent}</div>
      </aside>

      {/* Mobile: fixed overlay */}
      <aside
        ref={sidebarRef}
        role="dialog"
        aria-modal="true"
        aria-label="Admin navigation"
        className="fixed left-0 top-0 z-100 flex h-screen w-[18rem] flex-col border-r-2 border-[#8F887D] bg-[#F8F6F2] px-5 pb-6 pt-24 text-[#261B07] shadow-2xl transition-transform duration-300 ease-in-out md:hidden"
        style={{ transform: isOpen ? "translateX(0)" : "translateX(-100%)" }}
      >
        {sidebarContent}
        <button
          type="button"
          aria-label="Close admin menu"
          className="absolute right-4 top-6 inline-flex h-9 w-9 items-center justify-center rounded-full text-[#261B07] transition hover:bg-[#efe7d9] md:hidden"
          onClick={close}
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
      </aside>

      {/* Mobile overlay backdrop */}
      {isOpen ? (
        <button
          type="button"
          aria-label="Close admin menu"
          className="fixed inset-0 z-99 border-none bg-[#14110b]/30 md:hidden"
          onClick={close}
        />
      ) : null}
    </>
  );
}
