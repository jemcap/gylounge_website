import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

type LoginHeaderProps = {
  leftContent?: ReactNode;
};

export function LoginHeader({ leftContent }: LoginHeaderProps) {
  return (
    <header className="fixed z-30 w-full bg-[#261B07] backdrop-blur-sm">
      <div className="mx-auto flex w-full items-center justify-end gap-4 px-4 py-4 sm:px-6">
        {leftContent ? (
          <div className="absolute left-4 top-1/2 z-[100] -translate-y-1/2 sm:left-6">
            {leftContent}
          </div>
        ) : null}

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
            className="brightness-0 invert"
          />
        </Link>
      </div>
    </header>
  );
}
