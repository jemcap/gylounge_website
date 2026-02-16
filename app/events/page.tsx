import Link from "next/link";
import { EventList } from "@/components/events/event-list";
import type { EventCardData } from "@/components/events/event-card";
import { LocationPicker } from "@/components/events/location-picker";

const placeholderLocations = [
  { id: "accra", name: "Accra" },
  { id: "kumasi", name: "Kumasi" },
  { id: "takoradi", name: "Takoradi" },
];

const placeholderEvents: EventCardData[] = [
  {
    id: "boilerplate-event-1",
    title: "Morning Stretch Circle",
    description: "Gentle guided movement for all comfort levels.",
    date: "2026-03-01",
    capacity: 20,
    locationName: "Accra",
  },
  {
    id: "boilerplate-event-2",
    title: "Community Tea Social",
    description: "Low-pressure social gathering with board games and music.",
    date: "2026-03-05",
    capacity: 30,
    locationName: "Kumasi",
  },
];

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-[#f5f1ea] px-6 py-12 text-[#1c1b18] md:px-12 lg:px-20">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-[#8b6b3f]">Events</p>
          <h1 className="text-3xl font-semibold md:text-4xl">Find local gatherings near you</h1>
          <p className="max-w-2xl text-sm text-[#3b3127]">
            This is a scaffolded events page using reusable boilerplate components. Replace placeholder
            data with Supabase queries in milestone 1.
          </p>
        </header>

        <section className="rounded-3xl border border-[#dcccb8] bg-white/80 p-6 shadow-sm">
          <form className="grid gap-4 md:max-w-sm">
            <LocationPicker options={placeholderLocations} />
          </form>
        </section>

        <EventList events={placeholderEvents} />

        <div>
          <Link href="/" className="text-sm font-semibold text-[#1c1b18] underline-offset-4 hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
