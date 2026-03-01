import Image from "next/image";

type HomeDefaultContentProps = {
  onRegisterClick: () => void;
};

export function HomeDefaultContent({
  onRegisterClick,
}: HomeDefaultContentProps) {
  return (
    <div className="flex h-full flex-col justify-center px-6 py-10 md:px-10 md:py-12">
      <h2 className="font-serif text-3xl font-bold text-[#261B07] md:text-4xl lg:text-5xl">
        Become a Member
      </h2>
      <p className="mt-3 max-w-lg text-base leading-relaxed text-[#3b3127] md:text-lg">
        Join a welcoming community of older adults across Ghana. Connect through
        local events, social activities, and shared experiences.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Membership info card */}
        <div className="flex flex-col justify-center rounded-2xl border border-[#c9b86e] bg-white/60 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#5b4b36]">
            Annual Membership
          </p>
          <p className="mt-2 text-3xl font-bold text-[#261B07]">
            GHS&nbsp;50
            <span className="text-base font-normal text-[#5b4b36]">
              {" "}
              / year
            </span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#5b4b36]">
            Access all events, priority booking, and community perks.
          </p>
          <button
            type="button"
            onClick={onRegisterClick}
            className="mt-5 w-full rounded-full bg-[#261B07] px-6 py-3 text-center text-sm font-semibold text-[#DBD189] transition-colors hover:bg-[#3F2D17]"
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
