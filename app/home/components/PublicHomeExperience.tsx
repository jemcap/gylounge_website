import { createBookingAction } from "@/app/home/actions";
import { getBookingConfirmationFromParams } from "@/lib/booking-confirmation";
import { BookingAccordionContent } from "./BookingAccordionContent";
import { HomeContactContent } from "./HomeContactContent";
import { HomeDefaultContent } from "./HomeDefaultContent";
import { HomeFaqsContent } from "./HomeFaqContent";
import { HomeMobileMenuProvider } from "./HomeMobileMenuContext";
import { HomeSectionShell } from "./HomeSectionShell";
import { getSingleParam } from "@/lib/query-params";
import {
  getBookingConfirmation,
  getBookingFormOptions,
  resolveBookingFeedback,
} from "../home-page-helpers";

type PublicHomeExperienceProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function PublicHomeExperience({
  searchParams,
}: PublicHomeExperienceProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const bookingStatus = getSingleParam(resolvedSearchParams.booking);
  const bookingId = getSingleParam(resolvedSearchParams.bookingId);

  const bookingConfirmation =
    bookingStatus === "success"
      ? (await getBookingConfirmation(bookingId)) ??
        getBookingConfirmationFromParams(resolvedSearchParams)
      : null;
  const bookingFeedback =
    bookingStatus === "success" && bookingConfirmation
      ? undefined
      : resolveBookingFeedback(bookingStatus);
  const { locations, slots } = await getBookingFormOptions();
  const bookingContext = slots.length
    ? "Choose a location to unlock its available dates and hourly booking slots."
    : undefined;

  const initialActiveId = bookingFeedback || bookingConfirmation ? "booking" : null;

  const entries = [
    {
      id: "register",
      title: "Register",
      bg: "#DBD1B9",
      text: "#261B07",
      content: <HomeDefaultContent />,
    },
    {
      id: "booking",
      title: "Booking",
      bg: "#3F2D17",
      text: "#DBD1B9",
      content: (
        <BookingAccordionContent
          action={createBookingAction}
          bookingConfirmation={bookingConfirmation}
          locations={locations}
          slots={slots}
          bookingFeedback={bookingFeedback}
          bookingContext={bookingContext}
        />
      ),
    },
    {
      id: "faqs",
      title: "FAQs",
      bg: "#EBBF6C",
      text: "#261B07",
      content: <HomeFaqsContent />,
    },
    {
      id: "contact-us",
      title: "Contact Us",
      bg: "#0E0B0A",
      text: "#EBBF6C",
      content: <HomeContactContent />,
    },
  ];

  return (
    <HomeMobileMenuProvider>
      <HomeSectionShell entries={entries} initialActiveId={initialActiveId} />
    </HomeMobileMenuProvider>
  );
}
