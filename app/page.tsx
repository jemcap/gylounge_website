import Image from "next/image";
import Link from "next/link";
import { GhanaTimePill } from "@/components/hero/TimePill";

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
  const marqueeDurationSeconds = sports.length * 4; // Adjust duration based on number of sports

  return (
    <main className="min-h-screen w-full bg-[#f5f1ea] text-[#1c1b18]">
      <section className="relative min-h-screen w-full overflow-hidden px-6 py-16 md:px-12 lg:px-20">
        <Image
          src="/gylounge_hero.svg"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="relative z-10 mx-auto flex h-full min-h-[calc(100vh-8rem)] max-w-5xl flex-col justify-center ">
          <Image
            src="/gylounge_hero_logo.svg"
            alt="GYLounge Logo"
            width={1000}
            height={1000}
            className="drop-shadow-[0_20px_30px_rgba(0,0,0,1)]"
          />
          <div className="flex w-full justify-center">
            <GhanaTimePill />
          </div>
        </div>
      </section>

      <section className="w-full bg-[#efe7dc]">
        <div className="mx-auto flex w-full flex-col">
          <div className="w-full flex justify-center flex-col items-center text-justify bg-[#EBBF6C] text-[#261B07] pb-10">
            <h2
              className="text-[86px] font-light italic"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Enjoy Your Golden Years
            </h2>
            <p
              className="max-w-2xl text-3xl"
              style={{ fontFamily: "'Roboto', sans-serif" }}
            >
              Golden Years Lounge is a social space created to bring older
              adults from Ghana and the diaspora together in a friendly and
              welcoming environment.
            </p>
          </div>
          <div className="w-full flex justify-center flex-col items-center text-center bg-[#3F2D17] text-[#DBD1B9] pb-10">
            <h2
              className="text-[86px] font-light italic "
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Play, Relax & Connect
            </h2>
            <p
              className="max-w-2xl text-3xl"
              style={{ fontFamily: "'Roboto', sans-serif" }}
            >
              With classic games and group activities available daily, unwind,
              connect with others, and enjoy light-hearted fun at your own pace.
            </p>
          </div>
        </div>

        <div
          id="sports-carousel"
          className="relative w-full overflow-hidden bg-[#DBD1B9]"
        >
          <div className="flex h-[163px] items-center">
            <div
              className="flex min-w-max items-center whitespace-nowrap will-change-transform"
              style={{
                animation: `marquee ${marqueeDurationSeconds}s linear infinite`,
              }}
            >
              {[0, 1].map((loopIndex) => (
                <div
                  key={`sports-loop-${loopIndex}`}
                  aria-hidden={loopIndex === 1}
                  className="flex shrink-0 items-center"
                >
                  {sports.map((sport) => (
                    <div
                      key={`${sport}-${loopIndex}`}
                      className="flex h-full shrink-0 items-center px-4 md:px-5 lg:px-6"
                    >
                      <h1
                        className="text-center text-2xl leading-none font-light md:text-3xl lg:text-7xl italic"
                        style={{ fontFamily: "'Instrument Serif', serif" }}
                      >
                        {sport}
                      </h1>
                      <span
                        aria-hidden="true"
                        className="ml-4 text-center text-2xl leading-none font-light md:ml-5 md:text-3xl lg:ml-6 lg:text-7xl italic"
                        style={{ fontFamily: "'Instrument Serif', serif" }}
                      >
                        •
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-[#F1EDE5] px-6 py-16 text-[#14110b] md:px-12 lg:px-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/events"
              className="rounded-full bg-[#f5f1ea] border-2 border-[#3F2D17] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#14110b]"
            >
              Discover The Lounge
            </Link>
            <Link
              href="/membership"
              className="rounded-full bg-[#EBBF6C] border-2 border-[#3F2D17] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[#3F2D17]"
            >
              Become A Member
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
