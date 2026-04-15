"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import GhanaFlag from "@/app/assets/ghana_flag.svg";

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
  isHeader?: boolean;
  className?: string;
};

export function GhanaTimePill({ isHeader, className }: GhanaTimePillProps) {
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

  const pillClasses = `flex h-12.25 w-67 items-center justify-center gap-2 rounded-4xl px-8 py-4 text-[#1c1b18] backdrop-blur-sm ${
    isHeader ? "shadow-none" : "bg-[#f5f1ea]/95 shadow-[0_8px_20px_rgba(0,0,0,0.22)]"
  } ${className ?? ""}`;

  return (
    <div className={pillClasses}>
      <Image
        src={GhanaFlag}
        alt="Ghana Flag"
        width={32}
        height={32}
        className={isHeader ? "items-center justify-center" : ""}
      />
      <div className={isHeader ? "flex flex-col" : "space-x-1"}>
        <span className="font-medium" style={{ fontFamily: "Roboto" }}>
          Ghana
        </span>
        <span
          className="font-medium leading-none"
          style={{ fontFamily: "Roboto" }}
        >
          {timeLabel}
        </span>
      </div>
    </div>
  );
}
