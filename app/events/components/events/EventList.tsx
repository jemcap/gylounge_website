import { EventCard, type EventCardData } from "@/app/events/components/events/EventCard";

export type EventListProps = {
  events: EventCardData[];
};

export function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-[#d9cfbf] bg-white/70 p-6 text-sm text-[#3b3127]">
        No events yet. Add events from the admin console when management flows are connected.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
