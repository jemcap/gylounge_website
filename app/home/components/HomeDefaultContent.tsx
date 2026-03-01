import Image from "next/image";

type HomeDefaultContentProps = {
  onRegisterClick: () => void;
};

export function HomeDefaultContent({
  onRegisterClick,
}: HomeDefaultContentProps) {
  return (
    <div className="flex h-full flex-col justify-center px-6 py-10 md:px-10 md:py-12">
      <h2 className="font-serif text-3xl font-bold text-[#DBD1B9] md:text-4xl lg:text-5xl">
        Become a Member
      </h2>
      <p className="mt-3 max-w-lg text-base leading-relaxed text-[#a8997f] md:text-lg">
        Join a welcoming community of older adults across Ghana. Connect through
        local events, social activities, and shared experiences.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Membership info card */}
        <div className="flex flex-col justify-center rounded-2xl border border-[#3F2D17] bg-[#261B07]/80 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#a8997f]">
            Annual Membership
          </p>
          <p className="mt-2 text-3xl font-bold text-[#DBD1B9]">
            GHS&nbsp;50
            <span className="text-base font-normal text-[#a8997f]">
              {" "}
              / year
            </span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#a8997f]">
            Access all events, priority booking, and community perks.
          </p>
          <button
            type="button"
            onClick={onRegisterClick}
            className="mt-5 w-full rounded-full bg-[#EBBF6C] px-6 py-3 text-center text-sm font-semibold text-[#261B07] transition-colors hover:bg-[#d9ae5a]"
          >
            Register Now
          </button>
        </div>

        {/* Hero image */}
        <div className="relative hidden min-h-[200px] overflow-hidden rounded-2xl lg:block">
          <Image
            src="/gylounge_hero.svg"
            alt="GYLounge community gathering"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
