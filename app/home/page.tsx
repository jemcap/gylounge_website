import { createBookingAction, registerMemberAction } from "@/app/home/actions";
import { MembershipForm } from "@/components/forms/MembershipForm";
import { BookingAccordionContent } from "./components/BookingAccordionContent";
import { HomeSideNavLayout } from "./components/HomeAccordionSection";
import { HomeContactContent } from "./components/HomeContactContent";
import { HomeFaqsContent } from "./components/HomeFaqContent";
import { HomeHeader } from "./components/HomeHeader";
import {
  formatAccraDate,
  formatAccraTime,
  getBookingTarget,
  getSingleParam,
  resolveBookingFeedback,
  resolveRegisterFeedback,
} from "./home-page-helpers";

type HomePageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const registerStatus = getSingleParam(resolvedSearchParams.register);
  const registerReference = getSingleParam(resolvedSearchParams.reference);
  const bookingStatus = getSingleParam(resolvedSearchParams.booking);

  const registerFeedback = resolveRegisterFeedback(
    registerStatus,
    registerReference,
  );
  const bookingFeedback = resolveBookingFeedback(bookingStatus);
  const bookingTarget = await getBookingTarget();
  const bookingContext = bookingTarget
    ? `Next available: ${bookingTarget.eventTitle} (${bookingTarget.locationName}) on ${formatAccraDate(
        bookingTarget.eventDate,
      )} at ${formatAccraTime(bookingTarget.startTime)} - ${formatAccraTime(bookingTarget.endTime)}.`
    : undefined;

  // Auto-scroll to the relevant section when returning from a form submission
  let initialActiveId: string | null = null;
  if (registerFeedback) initialActiveId = "register";
  if (bookingFeedback) initialActiveId = "booking";

  const entries = [
    {
      id: "register",
      title: "Register",
      bg: "#DBD1B9",
      text: "#261B07",
      content: (
        <MembershipForm
          action={registerMemberAction}
          feedback={registerFeedback}
        />
      ),
    },
    {
      id: "booking",
      title: "Booking",
      bg: "#3F2D17",
      text: "#DBD1B9",
      content: (
        <BookingAccordionContent
          action={createBookingAction}
          bookingTarget={bookingTarget}
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
    <main className="flex min-h-screen flex-col">
      <HomeHeader />
      <HomeSideNavLayout entries={entries} initialActiveId={initialActiveId} />
    </main>
  );
}
