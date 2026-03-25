export const BOOKING_IDEMPOTENCY_KEY_FIELD = "bookingIdempotencyKey"

export const BOOKING_REQUEST_STATUS = {
  completed: "completed",
  inProgress: "in_progress",
} as const

export type BookingRequestStatus =
  (typeof BOOKING_REQUEST_STATUS)[keyof typeof BOOKING_REQUEST_STATUS]

export type BookingRequestReplayRecord = {
  bookingId: string | null
  memberId: string | null
  slotId: string | null
  status: string | null
}

export type BookingRequestReplayResolution =
  | { kind: "completed"; bookingId: string }
  | { kind: "invalid" }
  | { kind: "processing" }

export const createBookingIdempotencyKey = () => globalThis.crypto.randomUUID()

export const resolveBookingRequestReplay = ({
  existingBookingId,
  expectedMemberId,
  expectedSlotId,
  request,
}: {
  existingBookingId?: string | null
  expectedMemberId: string
  expectedSlotId: string
  request: BookingRequestReplayRecord | null
}): BookingRequestReplayResolution => {
  if (!request) {
    return { kind: "invalid" }
  }

  if (request.memberId !== expectedMemberId || request.slotId !== expectedSlotId) {
    return { kind: "invalid" }
  }

  if (request.status === BOOKING_REQUEST_STATUS.completed && request.bookingId) {
    return { kind: "completed", bookingId: request.bookingId }
  }

  if (existingBookingId) {
    return { kind: "completed", bookingId: existingBookingId }
  }

  return { kind: "processing" }
}
