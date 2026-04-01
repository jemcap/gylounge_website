import type { ReactNode } from "react";
import { LoginHeader } from "@/app/admin/login/components/LoginHeader";
import { AdminSidebar } from "./AdminHamburgerMenu";
import { AdminMenuToggle } from "./AdminMenuToggle";
import { AdminNavigationProvider } from "./AdminNavigationContext";
import { adminNavigationItems } from "./admin-navigation";

type AdminShellProps = {
  children: ReactNode;
  currentPath: string;
  description?: string;
  email: string;
  title: string;
};

export function AdminShell({
  children,
  currentPath,
  description,
  email,
  title,
}: AdminShellProps) {
  return (
    <AdminNavigationProvider>
      <LoginHeader leftContent={<AdminMenuToggle />} />

      <div className="flex flex-1 flex-row pt-16">
        <AdminSidebar currentPath={currentPath} items={adminNavigationItems} />

        <main className="flex flex-1 flex-col bg-[#f5f1ea] px-6 pb-0 pt-8 text-[#1c1b18] md:px-12 lg:px-20">
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6">
            {children}
          </div>

          <footer className="mt-auto w-full py-4 text-sm font-bold text-[#3b3127]">
            <div className="mx-auto flex w-full items-center justify-between">
              <span>&copy; {new Date().getFullYear()} Gold Years Lounge</span>
              <span>Powered by European New Wave</span>
            </div>
          </footer>
        </main>
      </div>
    </AdminNavigationProvider>
  );
}
