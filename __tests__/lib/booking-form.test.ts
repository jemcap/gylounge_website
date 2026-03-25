import { describe, expect, it } from "vitest"
import { BOOKING_IDEMPOTENCY_KEY_FIELD } from "@/lib/booking-idempotency"
import { createBookingSubmission } from "@/lib/booking-form"

describe("createBookingSubmission", () => {
  it("includes the booking idempotency key when provided", () => {
    const formData = createBookingSubmission(
      {
        locationId: "location-1",
        slotId: "slot-1",
        firstName: "Ama",
        lastName: "Boateng",
        email: "ama@example.com",
        phone: "+233 20 000 0000",
        numberOfGuests: 2,
      },
      "request-123",
    )

    expect(formData.get("name")).toBe("Ama Boateng")
    expect(formData.get(BOOKING_IDEMPOTENCY_KEY_FIELD)).toBe("request-123")
  })
})
