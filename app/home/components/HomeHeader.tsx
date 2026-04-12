import Image from "next/image";
import Link from "next/link";
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
};

export function HomeHeader({ entries }: HomeHeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#3F2D17] bg-[#F1EDE5] backdrop-blur-sm">
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
        <GhanaTimePill className="hidden h-10 w-auto px-4 py-2 text-sm md:inline-flex" />
        <HomeMobileMenu entries={entries} />
      </div>
    </header>
  );
}
