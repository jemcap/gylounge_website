"use client";

import { useEffect, useMemo, useState } from "react";

const ghanaTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Africa/Accra",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function formatGhanaTime(date: Date): string {
  return ghanaTimeFormatter.format(date);
}

type GhanaTimePillProps = {
  className?: string;
};

export function GhanaTimePill({ className }: GhanaTimePillProps) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const timeLabel = useMemo(() => formatGhanaTime(now), [now]);

  return (
    <div
      className={`flex h-12.25 w-67 items-center justify-center gap-2 rounded-4xl bg-[#f5f1ea]/95 px-8 py-4 text-[#1c1b18] shadow-[0_8px_20px_rgba(0,0,0,0.22)] backdrop-blur-sm${className ? ` ${className}` : ""}`}
    >
      <span aria-hidden="true">🇬🇭</span>
      <span className="font-bold" style={{ fontFamily: "Roboto" }}>
        Ghana
      </span>
      <span className="font-medium leading-none" style={{ fontFamily: "Roboto" }}>
        {timeLabel}
      </span>
    </div>
  );
}
