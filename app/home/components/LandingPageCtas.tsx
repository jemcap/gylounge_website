"use client";

import { ChevronDown } from "lucide-react";

const scrollToSection = (sectionId: string) => {
  const target = document.getElementById(sectionId);
  target?.scrollIntoView({ behavior: "auto" });
};

export function LandingPageCtas() {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      <button
        type="button"
        onClick={() => scrollToSection("home-root")}
        className="inline-flex h-14 w-[341px] items-center justify-center gap-2 rounded-full border-2 border-[#3F2D17] bg-[#f5f1ea] text-sm font-semibold uppercase tracking-wide text-[#14110b] cursor-pointer"
      >
        <span>Discover The Lounge</span>
        <ChevronDown
          aria-hidden="true"
          className="h-4 w-4 shrink-0"
          strokeWidth={2.25}
        />
      </button>
      <button
        type="button"
        onClick={() => scrollToSection("register")}
        className="inline-flex h-14 w-[341px] items-center justify-center gap-2 rounded-full border-2 border-[#3F2D17] bg-[#EBBF6C] text-sm font-semibold uppercase tracking-wide text-[#3F2D17] cursor-pointer"
      >
        <span>Become A Member</span>
        <ChevronDown
          aria-hidden="true"
          className="h-4 w-4 shrink-0"
          strokeWidth={2.25}
        />
      </button>
    </div>
  );
}
