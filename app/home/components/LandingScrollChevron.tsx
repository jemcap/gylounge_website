"use client";

import { useRef } from "react";
import { ChevronDown } from "lucide-react";

export function LandingScrollChevron() {
  const targetRef = useRef<HTMLElement | null>(null);

  const handleClick = () => {
    if (!targetRef.current) {
      targetRef.current = document.getElementById("register");
    }
    targetRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Scroll to content"
      className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer text-white"
    >
      <ChevronDown className="h-8 w-8" strokeWidth={1.5} />
    </button>
  );
}
