import Link from "next/link";
import type { Tables } from "@/app/types/database";
import { Card } from "@/components/ui/card";

export type EventCardData = Pick<
  Tables<"events">,
  "id" | "title" | "description" | "date" | "capacity"
> & {
  locationName?: string | null;
};

export type EventCardProps = {
  event: EventCardData;
  href?: string;
};

export function EventCard({ event, href }: EventCardProps) {
  const targetHref = href ?? `/events/${event.id}`;

  return (
    <Card
      title={event.title}
      description={event.description ?? "Event details will be added soon."}
      className="h-full"
      footer={
        <div className="flex items-center justify-between gap-4 text-sm text-[#3b3127]">
          <span>{event.locationName ?? "Location pending"}</span>
          <span>{event.capacity} spots</span>
        </div>
      }
    >
      <p className="text-sm text-[#3b3127]">Date: {event.date}</p>
      <Link
        href={targetHref}
        className="mt-4 inline-flex rounded-full border border-[#14110b] px-4 py-2 text-sm font-semibold text-[#14110b] transition hover:bg-[#f3ede3]"
      >
        View event
      </Link>
    </Card>
  );
}
