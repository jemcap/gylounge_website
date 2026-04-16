import { HomeHeader } from "@/app/home/components/HomeHeader";
import { HomeMobileMenuProvider } from "@/app/home/components/HomeMobileMenuContext";
import { PolicyHeader } from "./PolicyHeader";
import { PolicySection } from "./PolicySection";
import { privacyPolicyContent } from "../policy-content";

export function PrivacyPolicyPage() {
  const headerEntries = privacyPolicyContent.sections.map(({ id, title }) => ({
    id,
    title,
    bg: "#DBD1B9",
    text: "#261B07",
  }));

  return (
    <HomeMobileMenuProvider>
      <main className="min-h-screen bg-[#DBD1B9] text-[#261B07]">
        <HomeHeader
          entries={headerEntries}
          backgroundColor="#DBD1B9"
          mobileMenuButtonBackgroundColor="#DBD1B9"
          mobileMenuOverlayBackgroundColor="#DBD1B9"
        />

        <div className="w-full px-5 md:px-6">
          <PolicyHeader
            title={privacyPolicyContent.title}
            lastUpdated={privacyPolicyContent.lastUpdated}
            introLead={privacyPolicyContent.introLead}
            intro={privacyPolicyContent.intro}
          />

          <ol aria-label="Privacy policy sections" className="space-y-10">
            {privacyPolicyContent.sections.map((section) => (
              <PolicySection key={section.id} section={section} />
            ))}
          </ol>
        </div>
      </main>
    </HomeMobileMenuProvider>
  );
}
