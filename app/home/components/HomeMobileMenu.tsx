"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect } from "react";
import { useHomeMobileMenu } from "./HomeMobileMenuContext";

type HomeMobileMenuEntry = {
  id: string;
  title: string;
  bg?: string;
  text?: string;
};

type HomeMobileMenuProps = {
  entries: HomeMobileMenuEntry[];
};

export function HomeMobileMenu({ entries }: HomeMobileMenuProps) {
  const { closeMenu, isOpen, toggleMenu } = useHomeMobileMenu();
  const contactEntry = entries.find((entry) => entry.id === "contact-us");
  const primaryEntries = entries.filter((entry) => entry.id !== "contact-us");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const handleViewportChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        closeMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    mediaQuery.addEventListener("change", handleViewportChange);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      mediaQuery.removeEventListener("change", handleViewportChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, isOpen]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-controls="home-mobile-navigation"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        onClick={toggleMenu}
        className="inline-flex h-11 w-11 items-center justify-center bg-[#F1EDE5] text-[#261B07]"
      >
        {isOpen ? (
          <X aria-hidden="true" className="h-5 w-5" />
        ) : (
          <Menu aria-hidden="true" className="h-5 w-5" />
        )}
      </button>

      {isOpen ? (
        <div
          className="fixed inset-x-0 bottom-0 top-17.5 z-20 bg-[#DBD1B9]"
          onClick={closeMenu}
        >
          <nav
            id="home-mobile-navigation"
            className="flex h-screen flex-col"
            aria-label="Section navigation"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="shrink-0">
              {primaryEntries.map((entry) => (
                <Link
                  key={entry.id}
                  href={`#${entry.id}`}
                  onClick={closeMenu}
                  className="flex items-center px-5 py-4 text-left text-[1.75rem] font-medium leading-none"
                  style={{
                    backgroundColor: entry.bg,
                    color: entry.text ?? "#261B07",
                  }}
                >
                  {entry.title}
                </Link>
              ))}
            </div>

            {contactEntry ? (
              <Link
                href={`#${contactEntry.id}`}
                onClick={closeMenu}
                className="flex flex-1 items-start px-5 py-4 text-left text-[1.75rem] font-medium leading-none"
                style={{
                  backgroundColor: contactEntry.bg,
                  color: contactEntry.text ?? "#261B07",
                }}
              >
                {contactEntry.title}
              </Link>
            ) : null}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
