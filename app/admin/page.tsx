import Link from "next/link";
import { Card } from "@/components/ui/card";

const adminLinks = [
  { href: "/admin/members", label: "Members" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/slots", label: "Slots" },
];

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-[#f5f1ea] px-6 py-12 text-[#1c1b18] md:px-12 lg:px-20">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-[#8b6b3f]">Admin</p>
          <h1 className="mt-3 text-3xl font-semibold">Admin dashboard</h1>
          <p className="mt-2 text-sm text-[#3b3127]">
            Boilerplate hub for management pages. Add auth guards before connecting write operations.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {adminLinks.map((link) => (
            <Card key={link.href} title={link.label} description={`Scaffold page for ${link.label.toLowerCase()} operations.`}>
              <Link href={link.href} className="text-sm font-semibold text-[#1c1b18] hover:underline">
                Open {link.label}
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
