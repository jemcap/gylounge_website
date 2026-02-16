import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function MyBookingsPage() {
  return (
    <main className="min-h-screen bg-[#f5f1ea] px-6 py-12 text-[#1c1b18] md:px-12 lg:px-20">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-[#8b6b3f]">My Bookings</p>
          <h1 className="mt-3 text-3xl font-semibold">Lookup bookings by email</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#3b3127]">
            Boilerplate lookup page for the privacy-safe email search flow.
          </p>
        </header>

        <Card title="Find your bookings">
          <form action="#" className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="w-full">
              <label htmlFor="lookup-email" className="mb-1 block text-sm font-medium text-[#1c1b18]">
                Email
              </label>
              <Input id="lookup-email" type="email" name="email" placeholder="member@example.com" required />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </Card>

        <Card title="Lookup result placeholder" description="Render sanitized booking rows here after wiring server-side lookup.">
          <ul className="space-y-2 text-sm text-[#3b3127]">
            <li>Morning Stretch Circle - 2026-03-01 - Confirmed</li>
            <li>Community Tea Social - 2026-03-05 - Pending</li>
          </ul>
        </Card>
      </div>
    </main>
  );
}
