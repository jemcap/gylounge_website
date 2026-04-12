import { PublicSiteExperience } from "./home/components/PublicSiteExperience";

type RootPageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const dynamic = "force-dynamic";

export default function Home({ searchParams }: RootPageProps) {
  return <PublicSiteExperience searchParams={searchParams} />;
}
