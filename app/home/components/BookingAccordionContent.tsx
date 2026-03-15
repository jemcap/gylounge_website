import { BookingForm } from "@/components/forms/BookingForm";
import { Card } from "@/components/ui/card";
import type {
  BookableLocation,
  AvailableSlot,
  Feedback,
} from "@/app/home/home-page-helpers";

type FormAction = string | ((formData: FormData) => void | Promise<void>);

type BookingAccordionContentProps = {
  action: FormAction;
  locations: BookableLocation[];
  slots: AvailableSlot[];
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
  locations,
  slots,
  bookingFeedback,
  bookingContext,
}: BookingAccordionContentProps) { 
  console.log(locations, slots);
  if (locations.length === 0 || slots.length === 0) {
    return (
      <Card
        title="No bookable slots right now"
        description="We could not find an available slot. Check back later in this Booking section for updates."
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

      <BookingForm
        locations={locations}
        slots={slots}
        action={action}
        feedback={bookingFeedback}
        context={bookingContext}
      />
    </>
  );
}
