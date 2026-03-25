import { BookingForm } from "@/components/forms/BookingForm";
import { Card } from "@/components/ui/card";
import type { BookingConfirmation } from "@/lib/booking-confirmation";
import type {
  BookableLocation,
  AvailableSlot,
  Feedback,
} from "@/app/home/home-page-helpers";

type FormAction = string | ((formData: FormData) => void | Promise<void>);

type BookingAccordionContentProps = {
  action: FormAction;
  bookingConfirmation?: BookingConfirmation | null;
  locations: BookableLocation[];
  slots: AvailableSlot[];
  bookingFeedback?: Feedback;
  bookingContext?: string;
};

export function BookingAccordionContent({
  action,
  bookingConfirmation,
  locations,
  slots,
  bookingFeedback,
  bookingContext,
}: BookingAccordionContentProps) {
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
      <BookingForm
        bookingConfirmation={bookingConfirmation}
        locations={locations}
        slots={slots}
        action={action}
        feedback={bookingFeedback}
        context={bookingContext}
      />
    </>
  );
}
