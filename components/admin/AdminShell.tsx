
import type { ReactNode } from "react";
import { adminSignOutAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

type AdminShellProps = {
  children: ReactNode;
  currentPath: string;
  description: string;
  email: string;
  title: string;
};

export function AdminShell({ children }: AdminShellProps) {
  return (
    <main className="min-h-screen bg-[#f5f1ea] px-6 py-12 text-[#1c1b18] md:px-12 lg:px-20">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="rounded-3xl border border-[#dcccb8] bg-white/80 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <form action={adminSignOutAction}>
              <Button type="submit" variant="secondary">
                Sign out
              </Button>
            </form>
          </div>
        </section>

        {children}
      </div>
    </main>
  );
}
