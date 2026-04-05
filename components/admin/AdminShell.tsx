import type { ReactNode } from "react";
import { LoginHeader } from "@/app/admin/login/components/LoginHeader";
import { AdminSidebar } from "./AdminHamburgerMenu";
import { AdminMenuToggle } from "./AdminMenuToggle";
import { AdminNavigationProvider } from "./AdminNavigationContext";
import { adminNavigationItems } from "./admin-navigation";

type AdminShellProps = {
  children?: ReactNode;
  currentPath: string;
  description?: string;
  email?: string;
  title?: string;
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

        <main className="flex flex-1 flex-col bg-[#f5f1ea] pb-0 pt-8 text-[#1c1b18]">
          <div className="flex w-full flex-1 flex-col gap-6 px-4 md:px-8 lg:px-12">
            <header className="space-y-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                  {title ? (
                    <h1 className="text-4xl font-semibold text-[#1c1b18] md:text-5xl">
                      {title}
                    </h1>
                  ) : null}
                  {description ? (
                    <p className="max-w-3xl text-sm text-[#5c5348] md:text-base">
                      {description}
                    </p>
                  ) : null}
                </div>

                {email ? (
                  <p className="text-sm text-[#5c5348]">{email}</p>
                ) : null}
              </div>
            </header>

            {children}
          </div>

          <footer className="mt-auto w-full py-4 text-sm font-bold text-[#3b3127]">
            <div className="flex w-full items-center justify-between px-4 md:px-8 lg:px-12">
              <span>&copy; {new Date().getFullYear()} Gold Years Lounge</span>
              <span>Powered by European New Wave</span>
            </div>
          </footer>
        </main>
      </div>
    </AdminNavigationProvider>
  );
}
