import { HomeRouteAutoScroll } from "./HomeRouteAutoScroll";
import { PublicHomeExperience } from "./PublicHomeExperience";
import { PublicLandingSection } from "./PublicLandingSection";

type PublicSiteExperienceProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
  autoScrollToHome?: boolean;
};

export function PublicSiteExperience({
  searchParams,
  autoScrollToHome = false,
}: PublicSiteExperienceProps) {
  return (
    <main className="min-h-screen w-full bg-[#f5f1ea] text-[#1c1b18]">
      {autoScrollToHome ? <HomeRouteAutoScroll /> : null}
      <PublicLandingSection />
      <PublicHomeExperience searchParams={searchParams} />
    </main>
  );
}
