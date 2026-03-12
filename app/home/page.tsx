import { createBookingAction } from "@/app/home/actions"
import { BookingAccordionContent } from "./components/BookingAccordionContent"
import { HomeSideNavLayout } from "./components/HomeAccordionSection"
import { HomeContactContent } from "./components/HomeContactContent"
import { HomeFaqsContent } from "./components/HomeFaqContent"
import { HomeHeader } from "./components/HomeHeader"
import { HomeMobileMenuProvider } from "./components/HomeMobileMenuContext"
import {
  getBookingFormOptions,
  getSingleParam,
  resolveBookingFeedback,
} from "./home-page-helpers"
import { HomeDefaultContent } from "./components/HomeDefaultContent"

type HomePageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export const dynamic = "force-dynamic"

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const bookingStatus = getSingleParam(resolvedSearchParams.booking)

  const bookingFeedback = resolveBookingFeedback(bookingStatus)
  const { locations, slots } = await getBookingFormOptions()
  const bookingContext = slots.length
    ? "Choose a location to unlock its available dates and hourly booking slots."
    : undefined

  const initialActiveId = bookingFeedback ? "booking" : null

  const entries = [
    {
      id: "register",
      title: "Register",
      bg: "#DBD1B9",
      text: "#261B07",
      content: <HomeDefaultContent />,
    },
    {
      id: "booking",
      title: "Booking",
      bg: "#3F2D17",
      text: "#DBD1B9",
      content: (
        <BookingAccordionContent
          action={createBookingAction}
          locations={locations}
          slots={slots}
          bookingFeedback={bookingFeedback}
          bookingContext={bookingContext}
        />
      ),
    },
    {
      id: "faqs",
      title: "FAQs",
      bg: "#EBBF6C",
      text: "#261B07",
      content: <HomeFaqsContent />,
    },
    {
      id: "contact-us",
      title: "Contact Us",
      bg: "#0E0B0A",
      text: "#EBBF6C",
      content: <HomeContactContent />,
    },
  ]

  return (
    <HomeMobileMenuProvider>
      <main className="flex min-h-screen flex-col">
        <HomeHeader
          entries={entries.map(({ id, title, bg, text }) => ({
            id,
            title,
            bg,
            text,
          }))}
        />
        <HomeSideNavLayout entries={entries} initialActiveId={initialActiveId} />
      </main>
    </HomeMobileMenuProvider>
  )
}
