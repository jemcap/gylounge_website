import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function HomeDefaultContent() {
  return (
    <div className="flex h-full w-full min-w-0 max-w-full flex-col justify-center overflow-x-hidden py-5 text-[#261B07] md:px-10 md:py-12">
      <h2 className="font-serif text-6xl italic wrap-break-word sm:text-7xl lg:text-[86px]">
        Become a Member
      </h2>
      <p className="font-roboto font-semibold mt-3 max-w-5xl wrap-break-word md:text-lg">
        At <strong>Golden Years Lounge</strong>, connection, comfort, and
        meaningful engagement are at the heart of everything we do. As a member,
        you&apos;ll enjoy a thoughtfully curated environment designed to support
        social interaction, inspire new interests, and nurture personal
        wellbeing.
      </p>
      <p className="font-roboto font-semibold mt-3 max-w-5xl wrap-break-word md:text-lg">
        Membership grants you access to our lounge, enriching activities, and a
        supportive community of peers who value companionship and purposeful
        living.
      </p>

      <div className="mt-8 grid w-full max-w-full gap-0 md:grid-cols-2 rounded-2xl text-gylounge-primary overflow-hidden h-auto">
        {/* Membership info card */}
        <div className="relative flex min-w-0 flex-col justify-center bg-gylounge-register shadow-sm px-5 pb-20 order-2 md:order-1">
          <h2 className="text-5xl italic font-serif">Membership Form</h2>
          <div className="flex flex-col gap-3 max-w-2xl">
            <p className="font-roboto mt-2 text-xl">
              With a one-time fee of <strong>GH₵250</strong>, you&apos;ll receive
              lifetime access to the space.
            </p>
            <p className="font-roboto mt-2 text-xl">
              Fill out the form below and begin your journey with us.
            </p>
          </div>
          <Link
            href="/register"
            className="absolute bottom-5 left-5 inline-flex w-64.5 h-14 items-center justify-center gap-1 rounded-full bg-[#3F2D17] text-[#F1D39B] text-xl font-bold transition-colors hover:bg-[#d9ae5a]"
          >
            Register Now
            <ChevronRight className="size-4" />
          </Link>
        </div>

        {/* Hero image */}
        <div className="relative min-h-64 overflow-hidden order-1 md:order-2">
          <Image
            src="/gylounge_hero.svg"
            alt="GYLounge community gathering"
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      </div>
    </div>
  );
}
