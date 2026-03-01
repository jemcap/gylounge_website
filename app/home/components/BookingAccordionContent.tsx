import Link from "next/link";
import { BookingForm } from "@/components/forms/BookingForm";
import { Card } from "@/components/ui/card";
import type { BookingTarget, Feedback } from "@/app/home/home-page-helpers";

type FormAction = string | ((formData: FormData) => void | Promise<void>);

type BookingAccordionContentProps = {
  action: FormAction;
  bookingTarget: BookingTarget | null;
  bookingFeedback?: Feedback;
  bookingContext?: string;
};

const feedbackClassMap: Record<Feedback["tone"], string> = {
  success: "border-[#98c79f] bg-[#eef8f0] text-[#1f5a2b]",
  error: "border-[#e3aaa8] bg-[#fff1f0] text-[#8b2e2a]",
  info: "border-[#d3c39f] bg-[#faf5e9] text-[#5d4a2e]",
};

export function BookingAccordionContent({
  action,
  bookingTarget,
  bookingFeedback,
  bookingContext,
}: BookingAccordionContentProps) {
  if (bookingTarget) {
    return (
      <BookingForm
        eventId={bookingTarget.eventId}
        slotId={bookingTarget.slotId}
        action={action}
        feedback={bookingFeedback}
        context={bookingContext}
      />
    );
  }

  return (
    <>
      {bookingFeedback ? (
        <p
          className={`mb-4 rounded-xl border px-4 py-3 text-sm ${feedbackClassMap[bookingFeedback.tone]}`}
        >
          {bookingFeedback.message}
        </p>
      ) : null}
      <Card
        title="No bookable slots right now"
        description="We could not find an available slot. Check back later or browse events for updates."
      >
        <Link
          href="/events"
          className="text-sm font-semibold text-[#1c1b18] underline-offset-4 hover:underline"
        >
          Browse events
        </Link>
      </Card>
    </>
  );
}
