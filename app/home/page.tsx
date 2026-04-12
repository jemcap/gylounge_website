import { PublicSiteExperience } from "./components/PublicSiteExperience"

type HomePageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export const dynamic = "force-dynamic"

export default async function HomePage({ searchParams }: HomePageProps) {
  return <PublicSiteExperience searchParams={searchParams} autoScrollToHome />
}
