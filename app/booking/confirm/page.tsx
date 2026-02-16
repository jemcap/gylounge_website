import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function BookingConfirmPage() {
  return (
    <main className="min-h-screen bg-[#f5f1ea] px-6 py-12 text-[#1c1b18] md:px-12 lg:px-20">
      <div className="mx-auto w-full max-w-3xl">
        <Card
          title="Booking confirmation"
          description="Your booking request has been received. This page is the scaffold for post-booking status details."
        >
          <div className="mt-4 flex flex-wrap gap-4">
            <Link href="/events" className="rounded-full bg-[#14110b] px-4 py-2 text-sm font-semibold text-[#f5f1ea]">
              Browse more events
            </Link>
            <Link
              href="/my-bookings"
              className="rounded-full border border-[#14110b] px-4 py-2 text-sm font-semibold text-[#14110b]"
            >
              View my bookings
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
