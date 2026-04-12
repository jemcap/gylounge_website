"use client";

import { useEffect, useRef, useState } from "react";
import { HomeHeader } from "./HomeHeader";
import {
  HomeSideNavLayout,
  type NavEntry,
} from "./HomeAccordionSection";

type HomeSectionShellProps = {
  entries: NavEntry[];
  initialActiveId?: string | null;
  sectionId?: string;
};

export function HomeSectionShell({
  entries,
  initialActiveId = null,
  sectionId = "home-root",
}: HomeSectionShellProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isDesktopNavVisible, setIsDesktopNavVisible] = useState(false);

  useEffect(() => {
    const updateDesktopNavVisibility = () => {
      const section = sectionRef.current;
      if (!section) {
        return;
      }

      setIsDesktopNavVisible(section.getBoundingClientRect().top <= 15);
    };

    updateDesktopNavVisibility();
    window.addEventListener("scroll", updateDesktopNavVisibility, {
      passive: true,
    });
    window.addEventListener("resize", updateDesktopNavVisibility);

    return () => {
      window.removeEventListener("scroll", updateDesktopNavVisibility);
      window.removeEventListener("resize", updateDesktopNavVisibility);
    };
  }, []);

  const headerEntries = entries.map(({ id, title, bg, text }) => ({
    id,
    title,
    bg,
    text,
  }));

  return (
    <section id={sectionId} ref={sectionRef} className="flex min-h-screen flex-col">
      <HomeHeader entries={headerEntries} />
      <HomeSideNavLayout
        entries={entries}
        initialActiveId={initialActiveId}
        navVisible={isDesktopNavVisible}
      />
    </section>
  );
}
