import { describe, expect, it } from "vitest"
import {
  BOOKING_REQUEST_STATUS,
  resolveBookingRequestReplay,
} from "@/lib/booking-idempotency"

describe("resolveBookingRequestReplay", () => {
  it("returns success when the existing request is already completed", () => {
    expect(
      resolveBookingRequestReplay({
        expectedMemberId: "member-1",
        expectedSlotId: "slot-1",
        request: {
          bookingId: "booking-1",
          memberId: "member-1",
          slotId: "slot-1",
          status: BOOKING_REQUEST_STATUS.completed,
        },
      }),
    ).toEqual({
      kind: "completed",
      bookingId: "booking-1",
    })
  })

  it("falls back to an existing booking when the request is still marked in progress", () => {
    expect(
      resolveBookingRequestReplay({
        existingBookingId: "booking-2",
        expectedMemberId: "member-1",
        expectedSlotId: "slot-1",
        request: {
          bookingId: null,
          memberId: "member-1",
          slotId: "slot-1",
          status: BOOKING_REQUEST_STATUS.inProgress,
        },
      }),
    ).toEqual({
      kind: "completed",
      bookingId: "booking-2",
    })
  })

  it("returns processing when the request is in progress with no saved booking yet", () => {
    expect(
      resolveBookingRequestReplay({
        expectedMemberId: "member-1",
        expectedSlotId: "slot-1",
        request: {
          bookingId: null,
          memberId: "member-1",
          slotId: "slot-1",
          status: BOOKING_REQUEST_STATUS.inProgress,
        },
      }),
    ).toEqual({
      kind: "processing",
    })
  })

  it("rejects a replay when the request key belongs to a different booking payload", () => {
    expect(
      resolveBookingRequestReplay({
        expectedMemberId: "member-1",
        expectedSlotId: "slot-1",
        request: {
          bookingId: "booking-3",
          memberId: "member-2",
          slotId: "slot-2",
          status: BOOKING_REQUEST_STATUS.completed,
        },
      }),
    ).toEqual({
      kind: "invalid",
    })
  })
})
