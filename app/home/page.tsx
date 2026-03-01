import { createBookingAction, registerMemberAction } from "@/app/home/actions";
import { MembershipForm } from "@/components/forms/MembershipForm";
import { BookingAccordionContent } from "./components/BookingAccordionContent";
import { HomeAccordionSection } from "./components/HomeAccordionSection";
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

  // Auto-open the relevant accordion when returning from a form submission
  let initialOpenId: string | null = null;
  if (registerFeedback) initialOpenId = "register";
  if (bookingFeedback) initialOpenId = "booking";

  const entries = [
    {
      id: "register",
      title: "Register",
      expandedBg: "#DBD1B9",
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
      expandedBg: "#3F2D17",
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
      expandedBg: "#EBBF6C",
      content: <HomeFaqsContent />,
    },
    {
      id: "contact-us",
      title: "Contact Us",
      expandedBg: "#0E0B0A",
      content: <HomeContactContent />,
    },
  ];

  return (
    <main className="flex min-h-screen flex-col bg-[#DBD1B9] text-[#261B07]">
      <HomeHeader />
      <HomeAccordionSection entries={entries} initialOpenId={initialOpenId} />
    </main>
  );
}
