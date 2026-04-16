type PolicyHeaderProps = {
  title: string;
  lastUpdated: string;
  introLead: {
    organisation: string;
    aliases: string;
  };
  intro: string[];
};

export function PolicyHeader({
  title,
  lastUpdated,
  introLead,
  intro,
}: PolicyHeaderProps) {
  return (
    <section aria-labelledby="privacy-policy-title">
      <div>
        <h1
          id="privacy-policy-title"
          className="underline font-bold text-lg text-[#261B07]"
        >
          {title}
        </h1>
        <p
          aria-label={`Last updated ${lastUpdated}`}
          className="text-sm text-[#5A4521]"
        >
          Last Updated: {lastUpdated}
        </p>
      </div>

      <div className="text-sm text-[#261B07] md:text-base">
        <p>
          <strong>{introLead.organisation}</strong> {introLead.aliases}
        </p>
        {intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
