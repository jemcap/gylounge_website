import Link from "next/link";
import { BookingForm } from "@/components/forms/BookingForm";

type EventDetailPageProps = {
  params: Promise<{ eventId: string }>;
};

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { eventId } = await params;

  return (
    <main className="min-h-screen bg-[#f5f1ea] px-6 py-12 text-[#1c1b18] md:px-12 lg:px-20">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header className="rounded-3xl border border-[#dcccb8] bg-white/80 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-[#8b6b3f]">Event Detail</p>
          <h1 className="mt-3 text-3xl font-semibold">Event {eventId}</h1>
          <p className="mt-2 text-sm text-[#3b3127]">
            Boilerplate detail route for event-specific data, slot selection, and booking.
          </p>
        </header>

        <BookingForm eventId={eventId} />

        <Link href="/events" className="text-sm font-semibold text-[#1c1b18] underline-offset-4 hover:underline">
          Back to events
        </Link>
      </div>
    </main>
  );
}
