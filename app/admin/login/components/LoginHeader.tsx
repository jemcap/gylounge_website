import Image from "next/image";
import Link from "next/link";


export function LoginHeader() {
  return (
    <header className="fixed z-30 w-full bg-[#261B07] backdrop-blur-sm">
      <div className="mx-auto flex w-full justify-end gap-4 px-4 py-4 sm:px-6">
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
