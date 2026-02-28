import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { BookingForm } from "@/components/forms/booking-form";
import { MembershipForm } from "@/components/forms/membership-form";
import { GhanaTimePill } from "@/components/hero/TimePill";

type AccordionItemProps = {
  id?: string;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

function AccordionItem({ id, title, children, defaultOpen = false }: AccordionItemProps) {
  return (
    <details
      id={id}
      className="group rounded-2xl border border-[#d6cab4] bg-white/85 shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-lg font-semibold text-[#2a2216] md:px-6 md:py-5 md:text-xl">
        <span>{title}</span>
        <span aria-hidden="true" className="text-2xl leading-none text-[#6d5a3f] transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="border-t border-[#e7dcc8] px-5 py-5 md:px-6 md:py-6">{children}</div>
    </details>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f5f1ea] text-[#1c1b18]">
      <header className="border-b border-[#d9ccb5] bg-[#f5f1ea]/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" aria-label="Go to landing page" className="inline-flex items-center">
            <Image src="/gylounge_logo.svg" alt="GYLounge" width={132} height={50} priority />
          </Link>
          <GhanaTimePill className="h-10 w-auto px-4 py-2 text-sm" />
        </div>
      </header>

      <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-[#2a2216] md:text-4xl">Home</h1>
          <p className="mt-2 max-w-3xl text-base text-[#5b4b36] md:text-lg">
            Register, book activities, review common questions, and contact our team from a single page.
          </p>
        </div>

        <div className="space-y-4">
          <AccordionItem id="register" title="Register" defaultOpen>
            <MembershipForm />
          </AccordionItem>

          <AccordionItem id="booking" title="Booking">
            <BookingForm eventId="home-demo-event" slotId="home-demo-slot" />
          </AccordionItem>

          <AccordionItem id="faqs" title="FAQs">
            <div className="space-y-5 text-[#2a2216]">
              <div>
                <h2 className="text-base font-semibold md:text-lg">Who can register as a member?</h2>
                <p className="mt-1 text-sm text-[#5b4b36] md:text-base">
                  The lounge is designed for older adults in Ghana and the diaspora who want a welcoming social space.
                </p>
              </div>
              <div>
                <h2 className="text-base font-semibold md:text-lg">How does booking work?</h2>
                <p className="mt-1 text-sm text-[#5b4b36] md:text-base">
                  Submit the booking form with your details and preferred slot. Active members receive confirmation details by
                  email.
                </p>
              </div>
              <div>
                <h2 className="text-base font-semibold md:text-lg">How long does membership activation take?</h2>
                <p className="mt-1 text-sm text-[#5b4b36] md:text-base">
                  Activation timing depends on transfer verification. Most requests are reviewed within one to two business
                  days.
                </p>
              </div>
            </div>
          </AccordionItem>

          <AccordionItem id="contact-us" title="Contact Us">
            <div className="space-y-3 text-sm text-[#2a2216] md:text-base">
              <p>
                Email:{" "}
                <a href="mailto:hello@gylounge.com" className="font-medium text-[#3f2d17] underline">
                  hello@gylounge.com
                </a>
              </p>
              <p>
                Phone:{" "}
                <a href="tel:+233200000000" className="font-medium text-[#3f2d17] underline">
                  +233 20 000 0000
                </a>
              </p>
              <p>Address: Accra, Ghana</p>
              <p>Hours: Monday to Saturday, 9:00 AM to 6:00 PM GMT</p>
            </div>
          </AccordionItem>
        </div>
      </section>
    </main>
  );
}
