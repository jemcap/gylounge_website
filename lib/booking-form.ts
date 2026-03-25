import { z } from "zod"
import { BOOKING_IDEMPOTENCY_KEY_FIELD } from "@/lib/booking-idempotency"

export const bookingFormSchema = z.object({
  locationId: z.string().trim().min(1, "Select a location."),
  slotId: z.string().trim().min(1, "Select a time slot."),
  firstName: z.string().trim().min(1, "Enter a first name."),
  lastName: z.string().trim().min(1, "Enter a last name."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().min(1, "Enter a phone number."),
  numberOfGuests: z
    .number()
    .refine((value) => Number.isFinite(value), "Enter the number of guests.")
    .int("Enter a whole number.")
    .min(1, "At least 1 guest is required."),
})

export type BookingFormValues = z.infer<typeof bookingFormSchema>

export const defaultBookingFormValues = (
  defaults?: Partial<BookingFormValues>,
): BookingFormValues => ({
  locationId: defaults?.locationId ?? "",
  slotId: defaults?.slotId ?? "",
  firstName: defaults?.firstName ?? "",
  lastName: defaults?.lastName ?? "",
  email: defaults?.email ?? "",
  phone: defaults?.phone ?? "",
  numberOfGuests: defaults?.numberOfGuests ?? 1,
})

export const createBookingSubmission = (
  values: BookingFormValues,
  bookingIdempotencyKey?: string,
) => {
  const parsed = bookingFormSchema.parse(values)
  const formData = new FormData()
  const fullName = `${parsed.firstName} ${parsed.lastName}`.trim()

  formData.set("locationId", parsed.locationId)
  formData.set("slotId", parsed.slotId)
  formData.set("firstName", parsed.firstName)
  formData.set("lastName", parsed.lastName)
  formData.set("name", fullName)
  formData.set("email", parsed.email)
  formData.set("phone", parsed.phone)
  formData.set("numberOfGuests", String(parsed.numberOfGuests))

  if (bookingIdempotencyKey) {
    formData.set(BOOKING_IDEMPOTENCY_KEY_FIELD, bookingIdempotencyKey)
  }

  return formData
}
