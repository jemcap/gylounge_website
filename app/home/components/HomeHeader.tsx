import Image from "next/image";
import Link from "next/link";
import { GhanaTimePill } from "@/components/hero/TimePill";

export function HomeHeader() {
  return (
    <header className="border-b border-[#d9ccb5] bg-[#f5f1ea]/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href="/"
          aria-label="Go to landing page"
          className="inline-flex items-center"
        >
          <Image
            src="/gylounge_logo.svg"
            alt="GYLounge"
            width={132}
            height={50}
            priority
          />
        </Link>
        <GhanaTimePill className="h-10 w-auto px-4 py-2 text-sm" />
      </div>
    </header>
  );
}
