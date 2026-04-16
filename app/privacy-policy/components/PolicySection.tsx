import { PolicyList } from "./PolicyList";
import type { PolicySectionData } from "../policy-content";

type PolicySectionProps = {
  section: PolicySectionData;
};

export function PolicySection({ section }: PolicySectionProps) {
  return (
    <li
      id={section.id}
      aria-labelledby={`${section.id}-title`}
      className="scroll-mt-24 mt-5"
    >
      <h2
        id={`${section.id}-title`}
        className="font-serif text-3xl italic text-[#261B07] md:text-5xl"
      >
        {section.number}. {section.title}
      </h2>

      <div className="text-sm text-[#261B07] md:text-base">
        {section.description.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}

        <PolicyList items={section.items} />

        {section.additionalInfo ? <p>{section.additionalInfo}</p> : null}

        {section.contact ? (
          <address className="not-italic pb-5">
            <p>
              <span className="font-semibold">Email:</span>{" "}
              <a
                href={`mailto:${section.contact.email}`}
                className="underline decoration-[#7A5A1E]/40 underline-offset-4 transition-opacity hover:opacity-70"
              >
                {section.contact.email}
              </a>
            </p>
            <p>
              <span className="font-semibold">Organisation:</span>{" "}
              {section.contact.organisation}
            </p>
            <p>
              <span className="font-semibold">Location:</span>{" "}
              {section.contact.location}
            </p>
          </address>
        ) : null}
      </div>
    </li>
  );
}
