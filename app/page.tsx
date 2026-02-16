import Link from "next/link";

export default function Home() {
  const sports = [
    "Gentle Yoga",
    "Chair Aerobics",
    "Stretch & Balance",
    "Line Dancing",
    "Water Walks",
    "Tai Chi",
    "Mindful Walks",
    "Low-Impact Fitness",
  ];
  const marqueeDurationSeconds = sports.length * 2;

  return (
    <main className="min-h-screen w-full bg-[#f5f1ea] text-[#1c1b18]">
      <section className="min-h-screen w-full bg-[radial-gradient(85%_120%_at_50%_0%,#fdf2c5_0%,#f5f1ea_55%,#ede4d9_100%)] px-6 py-16 md:px-12 lg:px-20">
        <div className="mx-auto flex h-full max-w-5xl flex-col justify-center gap-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[#8b6b3f]">
            GYLounge Community
          </p>
          <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
            A warm, steady space for connection and shared moments.
          </h1>
          <p className="max-w-2xl text-lg text-[#3b3127] md:text-xl">
            Simple steps, gentle pacing, and welcoming gatherings in familiar
            neighborhoods across Ghana.
          </p>
        </div>
      </section>

      <section className="w-full bg-[#efe7dc] px-6 py-16 md:px-12 lg:px-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-[#dcccb8] bg-white/70 p-8 shadow-sm">
              <h2 className="text-2xl font-semibold">Local gatherings, crafted gently</h2>
              <p className="mt-3 max-w-2xl text-base text-[#3b3127]">
                Events are grouped by neighborhood so it is easy to find what is
                close, familiar, and welcoming.
              </p>
            </div>
            <div className="rounded-3xl border border-[#dcccb8] bg-white/70 p-8 shadow-sm">
              <h2 className="text-2xl font-semibold">Simple booking, no accounts</h2>
              <p className="mt-3 max-w-2xl text-base text-[#3b3127]">
                Reserve a place with just a name and email. Membership is verified
                without passwords or confusing steps.
              </p>
            </div>
          </div>
        </div>

        <div
          id="sports-carousel"
          className="relative left-1/2 right-1/2 mt-6 w-screen -translate-x-1/2 overflow-hidden border-y border-[#dcccb8] bg-white/70"
        >
          <div className="flex h-20 items-center md:h-24 lg:h-28">
            <div
              className="flex min-w-max items-center gap-12 whitespace-nowrap px-6"
              style={{
                animation: `marquee ${marqueeDurationSeconds}s linear infinite`,
              }}
            >
              {sports.map((sport) => (
                <h1 key={sport} className="text-2xl font-semibold md:text-3xl lg:text-4xl">
                  {sport}
                </h1>
              ))}
              {sports.map((sport) => (
                <h1
                  key={`${sport}-duplicate`}
                  aria-hidden="true"
                  className="text-2xl font-semibold md:text-3xl lg:text-4xl"
                >
                  {sport}
                </h1>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-[#14110b] px-6 py-16 text-[#f5f1ea] md:px-12 lg:px-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
          <h2 className="text-3xl font-semibold md:text-4xl">
            Start your journey with the lounge.
          </h2>
          <p className="text-base text-[#d8d1c6] md:text-lg">
            Discover upcoming gatherings or become a member today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/events"
              className="rounded-full bg-[#f5f1ea] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#14110b] transition hover:translate-y-[-2px]"
            >
              Discover The Lounge
            </Link>
            <Link
              href="/membership"
              className="rounded-full border border-[#f5f1ea] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#f5f1ea] transition hover:translate-y-[-2px]"
            >
              Become A Member
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
