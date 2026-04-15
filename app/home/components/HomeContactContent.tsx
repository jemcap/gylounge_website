import Image from "next/image";
import GYLLogo from "@/public/gyl_logo.svg";

export function HomeContactContent() {
  return (
    <div className="space-y-3 text-sm text-[#EBBF6C] md:text-base flex flex-col lg:flex-row gap-10 px-5 lg:px-0">
      <div className="flex basis-1/4 flex-col justify-end gap-10">
        <div>
          <h3 className="font-serif italic text-5xl wrap-break-word">
            Get In Touch
          </h3>
          <p>
            Browse our FAQs for quick answers, or reach out to us anytime and a
            member of our friendly team will get back to you as soon as
            possible.
          </p>
        </div>
        <div>
          <h3 className="font-serif italic text-5xl wrap-break-word">
            Contact Info
          </h3>
          <p>
            Browse our FAQs for quick answers, or reach out to us anytime and a
            member of our friendly team will get back to you as soon as
            possible.
          </p>
        </div>
      </div>
      <div className="grid flex-1 grid-cols-1 place-items-center gap-0 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className={idx === 0 ? "" : "hidden md:block"}>
            <Image
              src={GYLLogo}
              alt={`Contact icon ${idx + 1}`}
              width={250}
              height={250}
              className="block h-auto w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
