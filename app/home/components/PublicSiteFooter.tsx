import Link from "next/link";

export function PublicSiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#EBBF6C]/20 bg-[#0E0B0A] text-[#EBBF6C]">
      <div className="mx-auto flex w-full gap-4 px-5 py-6 text-sm flex-row items-center justify-between md:px-8 md:text-base">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link
            href="/privacy-policy"
            className=" transition-opacity hover:opacity-75 border-r-2 border-[#EBBF6C]/20 pr-5 cursor-pointer"
          >
            Privacy Policy
          </Link>
          <Link href="/admin" className=" transition-opacity hover:opacity-75 cursor-pointer">
            Admin Login
          </Link>
        </div>
        <p className="text-left md:text-right">
          &copy; {currentYear} Golden Years Lounge
        </p>
      </div>
    </footer>
  );
}
