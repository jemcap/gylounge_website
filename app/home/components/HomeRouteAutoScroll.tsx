"use client";

import { useEffect } from "react";

export function HomeRouteAutoScroll() {
  useEffect(() => {
    const targetId = window.location.hash
      ? decodeURIComponent(window.location.hash.slice(1))
      : "home-root";

    window.requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      target?.scrollIntoView({ behavior: "auto" });
    });
  }, []);

  return null;
}
