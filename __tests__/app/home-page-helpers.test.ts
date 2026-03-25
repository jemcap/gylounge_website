import { describe, expect, it } from "vitest";
import { resolveBookingFeedback } from "@/app/home/home-page-helpers";

describe("resolveBookingFeedback", () => {
  it("returns duplicate-booking feedback for an existing email/slot booking", () => {
    expect(resolveBookingFeedback("already-booked")).toEqual({
      tone: "info",
      message:
        "This email already has a booking for that time slot. Choose a different slot if you need another visit.",
    });
  });

  it("returns undefined for unknown statuses", () => {
    expect(resolveBookingFeedback("unknown-status")).toBeUndefined();
  });

  it("returns processing feedback when the same idempotency key is already in flight", () => {
    expect(resolveBookingFeedback("processing")).toEqual({
      tone: "info",
      message:
        "This booking request is already being processed. Wait a moment, then refresh if the confirmation modal does not appear.",
    });
  });
});
