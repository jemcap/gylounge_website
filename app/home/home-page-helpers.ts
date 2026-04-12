import type { Tables } from "@/app/types/database"
import type { BookingConfirmation } from "@/lib/booking-confirmation"
import { supabaseAdminClient } from "@/lib/supabase"

type LocationRow = Pick<Tables<"locations">, "id" | "name" | "address" | "region">

type SlotRow = Pick<
  Tables<"slots">,
  "id" | "location_id" | "date" | "start_time" | "end_time" | "available_spots"
>

type BookingRow = Pick<
  Tables<"bookings">,
  "guest_count" | "id" | "location_id" | "member_id" | "slot_id"
>

type MemberRow = Pick<Tables<"members">, "email" | "first_name" | "last_name" | "phone">

export type BookableLocation = {
  id: string
  name: string
  address: string
  region: string
}

export type AvailableSlot = {
  id: string
  locationId: string
  date: string
  startTime: string
  endTime: string
  availableSpots: number
}

export type Feedback = {
  tone: "success" | "error" | "info"
  message: string
}

export { getSingleParam } from "@/lib/query-params"

export const formatAccraDate = (raw: string) => {
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) {
    return raw
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Accra",
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  const parts = formatter.formatToParts(parsed)
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? ""
  const day = parts.find((p) => p.type === "day")?.value ?? ""
  const month = parts.find((p) => p.type === "month")?.value ?? ""

  const dayNum = Number.parseInt(day, 10)
  const ordinal = getOrdinal(dayNum)

  return `${weekday} ${dayNum}${ordinal} ${month}`
}

const getOrdinal = (num: number): string => {
  if (num > 3 && num < 21) return "th"
  switch (num % 10) {
    case 1:
      return "st"
    case 2:
      return "nd"
    case 3:
      return "rd"
    default:
      return "th"
  }
}

export const formatAccraTime = (raw: string) => {
  const timeOnlyMatch = raw.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/)
  if (timeOnlyMatch) {
    const hours = Number.parseInt(timeOnlyMatch[1], 10)
    const minutes = Number.parseInt(timeOnlyMatch[2], 10)
    const seconds = Number.parseInt(timeOnlyMatch[3] ?? "0", 10)

    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Africa/Accra",
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(Date.UTC(1970, 0, 1, hours, minutes, seconds)))
  }

  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) {
    return raw
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Accra",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).format(parsed)
}

const getTimeSortValue = (raw: string) => {
  const timeOnlyMatch = raw.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/)
  if (timeOnlyMatch) {
    const hours = Number.parseInt(timeOnlyMatch[1], 10)
    const minutes = Number.parseInt(timeOnlyMatch[2], 10)
    const seconds = Number.parseInt(timeOnlyMatch[3] ?? "0", 10)

    return hours * 3600 + minutes * 60 + seconds
  }

  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? Number.MAX_SAFE_INTEGER : parsed.getTime()
}

export const resolveRegisterFeedback = (
  status?: string,
  reference?: string,
): Feedback | undefined => {
  switch (status) {
    case "success":
      return {
        tone: "success",
        message: reference
          ? `Registration saved. Your transfer reference is ${reference}.`
          : "Registration saved. Check your email for bank transfer details.",
      }
    case "saved":
      return {
        tone: "info",
        message: reference
          ? `Registration saved with reference ${reference}, but we could not send the email. Contact support if needed.`
          : "Registration saved, but we could not send the email. Contact support if needed.",
      }
    case "already-active":
      return {
        tone: "info",
        message: "This email already has an active membership.",
      }
    case "invalid":
      return {
        tone: "error",
        message: "Please complete the required membership details before submitting.",
      }
    case "error":
      return {
        tone: "error",
        message: "We could not save your registration right now. Please try again.",
      }
    default:
      return undefined
  }
}

export const resolveBookingFeedback = (status?: string): Feedback | undefined => {
  switch (status) {
    case "success":
      return {
        tone: "success",
        message: "Booking created successfully. A confirmation email has been sent.",
      }
    case "success-email-warning":
      return {
        tone: "info",
        message: "Booking created, but one or more confirmation emails could not be sent.",
      }
    case "membership-required":
      return {
        tone: "info",
        message:
          "You need an active membership before booking. Complete Register first.",
      }
    case "already-booked":
      return {
        tone: "info",
        message:
          "This email already has a booking for that time slot. Choose a different slot if you need another visit.",
      }
    case "processing":
      return {
        tone: "info",
        message:
          "This booking request is already being processed. Wait a moment, then refresh if the confirmation modal does not appear.",
      }
    case "slot-unavailable":
      return {
        tone: "error",
        message: "That slot is no longer available. Please try another available slot.",
      }
    case "invalid":
      return {
        tone: "error",
        message: "Please complete all required booking fields.",
      }
    case "error":
      return {
        tone: "error",
        message: "We could not complete your booking right now. Please try again.",
      }
    default:
      return undefined
  }
}

const buildMemberName = (member: MemberRow) => {
  const name = [member.first_name, member.last_name].filter(Boolean).join(" ").trim()
  return name || member.email
}

const isMissingGuestCountColumnError = (error: unknown) =>
  Boolean(
    error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string" &&
      error.message.includes("guest_count") &&
      "code" in error &&
      (error.code === "42703" || error.code === "PGRST204"),
  )

export const getBookingConfirmation = async (
  bookingId?: string,
): Promise<BookingConfirmation | null> => {
  if (!bookingId) {
    return null
  }

  try {
    const admin = supabaseAdminClient()
    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .select("id, member_id, location_id, slot_id, guest_count")
      .eq("id", bookingId)
      .maybeSingle()

    if (bookingError || !booking?.member_id || !booking.location_id || !booking.slot_id) {
      if (bookingError) {
        if (isMissingGuestCountColumnError(bookingError)) {
          return null
        }
        console.error("home getBookingConfirmation booking lookup failed", bookingError)
      }
      return null
    }

    const typedBooking = booking as BookingRow
    const [
      { data: member, error: memberError },
      { data: location, error: locationError },
      { data: slot, error: slotError },
    ] = await Promise.all([
      admin
        .from("members")
        .select("first_name, last_name, email, phone")
        .eq("id", String(typedBooking.member_id))
        .maybeSingle(),
      admin.from("locations").select("name").eq("id", String(typedBooking.location_id)).maybeSingle(),
      admin
        .from("slots")
        .select("date, start_time, end_time")
        .eq("id", String(typedBooking.slot_id))
        .maybeSingle(),
    ])

    if (memberError || locationError || slotError || !member || !location || !slot) {
      console.error("home getBookingConfirmation detail lookup failed", {
        locationError,
        memberError,
        slotError,
      })
      return null
    }

    const typedMember = member as MemberRow
    const time = `${formatAccraTime(slot.start_time)} - ${formatAccraTime(slot.end_time)}`

    return {
      date: formatAccraDate(slot.date),
      email: typedMember.email,
      guestCount: typedBooking.guest_count,
      location: location.name,
      name: buildMemberName(typedMember),
      phone: typedMember.phone ?? "Not provided",
      time,
    }
  } catch (error) {
    console.error("home getBookingConfirmation failed", error)
    return null
  }
}

const sortSlotsByStartTime = (slots: AvailableSlot[]) =>
  [...slots].sort(
    (left, right) => getTimeSortValue(left.startTime) - getTimeSortValue(right.startTime),
  )

export const getBookingFormOptions = async (
): Promise<{ locations: BookableLocation[]; slots: AvailableSlot[] }> => {
  try {
    const admin = supabaseAdminClient()
    const today = new Date().toISOString().slice(0, 10)

    const slotsQuery = admin
      .from("slots")
      .select("id, location_id, date, start_time, end_time, available_spots")
      .gte("date", today)
      .gt("available_spots", 0)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })

    const [{ data: locationRows, error: locationError }, { data: slotRows, error: slotError }] =
      await Promise.all([
        admin
          .from("locations")
          .select("id, name, address, region")
          .order("name", { ascending: true }),
        slotsQuery,
      ])

    if (locationError || slotError) {
      console.error("home getBookingFormOptions query failed", {
        locationError,
        slotError,
      })
      return { locations: [], slots: [] }
    }

    const locationList = (locationRows ?? []) as LocationRow[]
    const locationMap = new Map<string, BookableLocation>(
      locationList.map((location) => [
        location.id,
        {
          id: location.id,
          name: location.name,
          address: location.address,
          region: location.region,
        },
      ]),
    )

    const slots = ((slotRows ?? []) as SlotRow[])
      .map((slot) => {
        if (!slot.location_id) {
          return null
        }

        if (!locationMap.has(slot.location_id)) {
          return null
        }

        return {
          id: slot.id,
          locationId: slot.location_id,
          date: slot.date,
          startTime: slot.start_time,
          endTime: slot.end_time,
          availableSpots: slot.available_spots,
        } satisfies AvailableSlot
      })
      .filter((slot): slot is AvailableSlot => Boolean(slot))

    const locationIdsWithAvailability = new Set(slots.map((slot) => slot.locationId))
    const locations = locationList
      .filter((location) => locationIdsWithAvailability.has(location.id))
      .map((location) => ({
        id: location.id,
        name: location.name,
        address: location.address,
        region: location.region,
      }))

    return {
      locations,
      slots: sortSlotsByStartTime(slots),
    }
  } catch (error) {
    console.error("home getBookingFormOptions failed", error)
    return { locations: [], slots: [] }
  }
}
