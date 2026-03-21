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
          className={`mb-4 rounded-xl border px-4 py-2 text-sm ${feedbackClassMap[bookingFeedback.tone]}`}
        >
          {bookingFeedback.message}
        </p>
      ) : null}
      {/* Title and description for the booking form */}
      <h2 className="text-lg italic font-serif text-[86px] text-[#DBD1B9]">
        Make a Booking
      </h2>
      <div className="space-y-5 text-[24px] max-w-5xl mb-10">
        <p>
          To enjoy the facilities at <strong>Golden Years Lounge</strong>,
          bookings are available for members only. If you are already a member,
          you can book a time to visit and enjoy everything the lounge has to
          offer. The daily fee is <strong>GHC150</strong>, payable at reception
          on arrival.
        </p>
        <p>
          You can become a member here. For subscription options, please contact
          us or visit the GYL reception where our team will be happy to help.
          You can also view subscription details here
        </p>
        <p>
          Please note our opening hours are Monday to Friday, 8:00am to 10:00pm.
        </p>
      </div>
      {/* Booking form component with necessary props */}
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
