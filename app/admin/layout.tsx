import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col">{children}</div>
      <footer className="w-full bg-[#f5f1ea] px-6 py-4 text-sm text-[#3b3127] md:px-12 lg:px-20">
        <div className="mx-auto flex w-full items-center justify-between font-bold">
          <span>&copy; {currentYear} Gold Years Lounge</span>
          <span>Powered by European New Wave</span>
        </div>
      </footer>
    </div>
  );
}
