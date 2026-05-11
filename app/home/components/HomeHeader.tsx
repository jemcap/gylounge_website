"use client";

import Image from "next/image";
import { GhanaTimePill } from "@/components/hero/TimePill";
import { HomeMobileMenu } from "./HomeMobileMenu";

type HomeHeaderEntry = {
  id: string;
  title: string;
  bg?: string;
  text?: string;
};

type HomeHeaderProps = {
  entries: HomeHeaderEntry[];
  backgroundColor?: string;
  mobileMenuButtonBackgroundColor?: string;
  mobileMenuButtonTextColor?: string;
  mobileMenuOverlayBackgroundColor?: string;
};

export function HomeHeader({
  entries,
  backgroundColor = "#F1EDE5",
  mobileMenuButtonBackgroundColor = backgroundColor,
  mobileMenuButtonTextColor = "#261B07",
  mobileMenuOverlayBackgroundColor = "#DBD1B9",
}: HomeHeaderProps) {
  return (
    <header
      className="sticky top-0 z-30 w-full backdrop-blur-sm"
      style={{ backgroundColor }}
    >
      <div className="mx-auto flex w-full items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <button
          type="button"
          aria-label="Go to landing page"
          className="inline-flex cursor-pointer items-center"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <Image
            src="/gylounge_logo.svg"
            alt="GYLounge"
            width={132}
            height={50}
            priority
          />
        </button>
        <GhanaTimePill isHeader={true} className="hidden h-10 w-auto px-4 py-2 text-sm md:inline-flex" />
        <HomeMobileMenu
          entries={entries}
          buttonBackgroundColor={mobileMenuButtonBackgroundColor}
          buttonTextColor={mobileMenuButtonTextColor}
          overlayBackgroundColor={mobileMenuOverlayBackgroundColor}
        />
      </div>
    </header>
  );
}
