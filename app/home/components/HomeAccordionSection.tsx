"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { HomeDefaultContent } from "./HomeDefaultContent";

export type NavEntry = {
  id: string;
  title: string;
  content: ReactNode;
  bg?: string;
  text?: string;
};

type HomeSideNavLayoutProps = {
  entries: NavEntry[];
  initialActiveId?: string | null;
};

/* ── Constants ────────────────────────────────────────────────────
   BASE_BG / BASE_TEXT: the constant dark warm brown backdrop.
   Nav items sit on this until their stacking colour activates.    */
const BASE_BG = "#1A120A";
const BASE_TEXT = "#DBD1B9";

export function HomeSideNavLayout({
  entries,
  initialActiveId = null,
}: HomeSideNavLayoutProps) {
  const [activeId, setActiveId] = useState<string | null>(initialActiveId);
  const panelElements = useRef(new Map<string, HTMLDivElement>());
  const navElements = useRef(new Map<string, HTMLButtonElement>());
  const stripElements = useRef(new Map<string, HTMLSpanElement>());
  const labelElements = useRef(new Map<string, HTMLSpanElement>());

  /* ── Intersection Observer ──────────────────────────────────────
     Watches each content panel and tracks intersection ratios.
     The panel with the highest ratio becomes the active section
     (drives bold/dim on nav items).                               */
  useEffect(() => {
    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (observed) => {
        for (const entry of observed) {
          const id = entry.target.getAttribute("data-section") ?? "";
          ratios.set(id, entry.intersectionRatio);
        }

        let best = "";
        let bestRatio = 0;
        for (const [id, ratio] of ratios) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        }

        setActiveId(best || null);
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );

    for (const el of panelElements.current.values()) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  /* ── Scroll-driven strip stacking (direct DOM) ─────────────────
     Bypasses React re-renders entirely for zero-lag strip updates.
     On each scroll tick we directly toggle `display` on the strip
     <span> and `color` + `opacity` on the label <span>.
     The strip appears the instant the content panel's top edge
     reaches the top edge of its corresponding nav button.         */
  useEffect(() => {
    const onScroll = () => {
      for (const entry of entries) {
        const panel = panelElements.current.get(entry.id);
        const navBtn = navElements.current.get(entry.id);
        const strip = stripElements.current.get(entry.id);
        const label = labelElements.current.get(entry.id);
        if (!panel || !navBtn || !strip || !label) continue;

        const panelTop = panel.getBoundingClientRect().top;
        const navBottom = navBtn.getBoundingClientRect().bottom;

        if (panelTop <= navBottom) {
          strip.style.display = "block";
          label.style.opacity = "1";
          label.style.color = entry.text ?? BASE_TEXT;
        } else {
          strip.style.display = "none";
          label.style.opacity = "0.6";
          label.style.color = "";
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [entries]);

  /* Auto-scroll to a section on mount (e.g. returning from form submission) */
  useEffect(() => {
    if (initialActiveId) {
      const el = panelElements.current.get(initialActiveId);
      setTimeout(() => el?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [initialActiveId]);

  const scrollTo = useCallback((id: string) => {
    const el = panelElements.current.get(id);
    el?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div
      className="relative flex-1"
      style={{ backgroundColor: BASE_BG, color: BASE_TEXT }}
    >
      {/* ── Fixed sidebar nav (desktop) / sticky top bar (mobile) ─
           Nav buttons are transparent. Behind each button, a
           full-viewport-width colour strip appears when that
           section's content panel top touches the nav button's
           bottom edge. Strips stack as the user scrolls down
           and un-stack when scrolling back up.                    */}
      <nav className="sticky top-0 z-20 flex flex-row overflow-x-auto md:fixed md:left-0 md:top-20 md:h-screen md:w-2/5 md:flex-col md:overflow-x-visible lg:w-1/3">
        {entries.map((entry) => {
          const isCurrent = activeId === entry.id;

          return (
            <button
              key={entry.id}
              ref={(el) => {
                if (el) navElements.current.set(entry.id, el);
              }}
              type="button"
              onClick={() => scrollTo(entry.id)}
              className={`
                group relative shrink-0 cursor-pointer overflow-visible px-5 py-4
                text-left text-lg
                md:w-full md:px-8 md:py-5 md:text-2xl lg:text-3xl
                ${isCurrent ? "font-bold" : "font-medium"}
              `}
            >
              {/* Colour strip — always rendered but hidden by default.
                  Becomes visible via direct style.display toggling
                  in the scroll handler (pure DOM, no React re-render). */}
              <span
                ref={(el) => {
                  if (el) stripElements.current.set(entry.id, el);
                }}
                className="absolute inset-y-0 left-0 -z-10 w-screen"
                style={{ backgroundColor: entry.bg, display: "none" }}
                aria-hidden="true"
              />
              <span
                ref={(el) => {
                  if (el) labelElements.current.set(entry.id, el);
                }}
                className="relative"
                style={{ opacity: 0.6 }}
              >
                {entry.title}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── Full-width content panels ─────────────────────────────
           Each panel spans the entire viewport width so its
           background colour extends behind the nav.

           Every panel always shows its own constant bg/text colour.
           The visual stacking effect is inherent in the layout —
           as you scroll down, more coloured sections enter the
           viewport; scroll up and they leave.                     */}

      {/* Default promo — visible before any section is scrolled to */}
      <div
        ref={(el) => {
          if (el) panelElements.current.set("", el);
        }}
        data-section=""
        className="flex min-h-screen items-center md:pl-[40%] lg:pl-[33.333%]"
      >
        <HomeDefaultContent onRegisterClick={() => scrollTo("register")} />
      </div>

      {entries.map((entry) => (
        <div
          key={entry.id}
          ref={(el) => {
            if (el) panelElements.current.set(entry.id, el);
          }}
          data-section={entry.id}
          className="flex min-h-screen items-start py-10"
          style={{ backgroundColor: entry.bg, color: entry.text }}
        >
          <div className="w-full px-5 md:pl-[40%] md:pr-8 lg:pl-[33.333%]">
            {entry.content}
          </div>
        </div>
      ))}
    </div>
  );
}
