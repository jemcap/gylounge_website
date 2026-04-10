import { NextResponse } from "next/server";
import {
  adminBookingIdSchema,
  adminBookingUpdateSchema,
  buildAdminBookingCapacityPlan,
} from "@/lib/admin-bookings";
import { requireAdminApiUser } from "@/lib/admin-session";
import { supabaseAdminClient } from "@/lib/supabase";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type MutationResult =
  | { ok: true }
  | {
      error: string;
      status: number;
    };

const slotAdjustmentRetryCount = 5;

const jsonError = (error: string, status: number) =>
  NextResponse.json({ error }, { status });

const getAdminErrorResponse = async () => {
  const adminAccess = await requireAdminApiUser();

  if (adminAccess.user) {
    return null;
  }

  if (adminAccess.error === "access-denied") {
    return jsonError("That session is not allowed to access the admin portal.", 403);
  }

  return jsonError("Sign in again to continue.", 401);
};

const getBookingId = async (paramsPromise: Promise<{ id: string }>) => {
  const { id } = await paramsPromise;
  const parsedId = adminBookingIdSchema.safeParse(id);

  if (!parsedId.success) {
    return null;
  }

  return parsedId.data;
};

const updateBookingRecord = async (
  bookingId: string,
  values: {
    guest_count: number;
    location_id: string;
    slot_id: string;
  },
): Promise<MutationResult> => {
  const supabase = supabaseAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .update(values)
    .eq("id", bookingId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Admin booking update failed", { bookingId, error, values });
    return {
      error: "Booking update failed.",
      status: 500,
    };
  }

  if (!data) {
    return {
      error: "Booking not found.",
      status: 404,
    };
  }

  return { ok: true };
};

const updateMemberBasics = async (
  memberId: string,
  values: {
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
  },
): Promise<MutationResult> => {
  const supabase = supabaseAdminClient();
  const { data, error } = await supabase
    .from("members")
    .update(values)
    .eq("id", memberId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Admin booking member update failed", {
      error,
      memberId,
      values,
    });

    if (error.code === "23505") {
      return {
        error: "That email address is already in use by another member.",
        status: 409,
      };
    }

    return {
      error: "Booking update failed.",
      status: 500,
    };
  }

  if (!data) {
    return {
      error: "Linked member not found.",
      status: 404,
    };
  }

  return { ok: true };
};

const adjustSlotAvailableSpots = async (
  slotId: string,
  delta: number,
): Promise<MutationResult> => {
  if (!delta) {
    return { ok: true };
  }

  const supabase = supabaseAdminClient();

  for (let attempt = 0; attempt < slotAdjustmentRetryCount; attempt += 1) {
    const { data: slot, error: slotError } = await supabase
      .from("slots")
      .select("id, available_spots")
      .eq("id", slotId)
      .maybeSingle();

    if (slotError) {
      console.error("Admin booking slot lookup failed", { delta, error: slotError, slotId });
      return {
        error: "Booking update failed.",
        status: 500,
      };
    }

    if (!slot) {
      return {
        error: "The selected slot could not be found.",
        status: 404,
      };
    }

    const nextAvailableSpots = slot.available_spots + delta;

    if (nextAvailableSpots < 0) {
      return {
        error: "The selected slot does not have enough available spots.",
        status: 409,
      };
    }

    const { data: updatedSlot, error: slotUpdateError } = await supabase
      .from("slots")
      .update({ available_spots: nextAvailableSpots })
      .eq("id", slotId)
      .eq("available_spots", slot.available_spots)
      .select("id")
      .maybeSingle();

    if (slotUpdateError) {
      console.error("Admin booking slot update failed", {
        delta,
        error: slotUpdateError,
        nextAvailableSpots,
        slotId,
      });
      return {
        error: "Booking update failed.",
        status: 500,
      };
    }

    if (updatedSlot) {
      return { ok: true };
    }
  }

  return {
    error: "Slot availability changed. Reload and try again.",
    status: 409,
  };
};

const logRollbackFailure = async (
  label: string,
  rollback: () => Promise<MutationResult>,
) => {
  const result = await rollback();

  if (!("ok" in result)) {
    console.error("Admin booking rollback failed", { label, ...result });
  }
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const authErrorResponse = await getAdminErrorResponse();

  if (authErrorResponse) {
    return authErrorResponse;
  }

  const bookingId = await getBookingId(params);

  if (!bookingId) {
    return jsonError("Invalid booking id.", 400);
  }

  const payload = await request.json().catch(() => null);

  if (!payload || typeof payload !== "object") {
    return jsonError("Invalid booking payload.", 400);
  }

  const parsedPayload = adminBookingUpdateSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return jsonError(
      parsedPayload.error.issues[0]?.message || "Invalid booking payload.",
      400,
    );
  }

  const nextValues = parsedPayload.data;
  const supabase = supabaseAdminClient();
  const { data: existingBooking, error: existingBookingError } = await supabase
    .from("bookings")
    .select("id, guest_count, location_id, member_id, slot_id")
    .eq("id", bookingId)
    .maybeSingle();

  if (existingBookingError) {
    console.error("Admin booking lookup failed", { bookingId, error: existingBookingError });
    return jsonError("Booking update failed.", 500);
  }

  if (!existingBooking) {
    return jsonError("Booking not found.", 404);
  }

  if (!existingBooking.member_id || !existingBooking.slot_id) {
    return jsonError(
      "This booking cannot be edited because its linked member or slot is missing.",
      409,
    );
  }

  const existingMemberId = existingBooking.member_id;
  const existingSlotId = existingBooking.slot_id;

  const { data: existingMember, error: existingMemberError } = await supabase
    .from("members")
    .select("id, email, first_name, last_name, phone")
    .eq("id", existingMemberId)
    .maybeSingle();

  if (existingMemberError) {
    console.error("Admin booking member lookup failed", {
      bookingId,
      error: existingMemberError,
    });
    return jsonError("Booking update failed.", 500);
  }

  if (!existingMember) {
    return jsonError("Linked member not found.", 404);
  }

  const [currentSlotResponse, targetSlotResponse] = await Promise.all([
    supabase
      .from("slots")
      .select("id, available_spots, date, location_id")
      .eq("id", existingSlotId)
      .maybeSingle(),
    supabase
      .from("slots")
      .select("id, available_spots, date, location_id")
      .eq("id", nextValues.slot_id)
      .maybeSingle(),
  ]);

  if (currentSlotResponse.error || targetSlotResponse.error) {
    console.error("Admin booking slot data lookup failed", {
      bookingId,
      currentSlotError: currentSlotResponse.error,
      targetSlotError: targetSlotResponse.error,
    });
    return jsonError("Booking update failed.", 500);
  }

  const currentSlot = currentSlotResponse.data;
  const targetSlot = targetSlotResponse.data;

  if (!currentSlot || !targetSlot) {
    return jsonError("The selected slot could not be found.", 404);
  }

  if (targetSlot.location_id !== nextValues.location_id) {
    return jsonError("Selected time does not belong to that location.", 400);
  }

  if (targetSlot.date !== currentSlot.date) {
    return jsonError(
      "Bookings can only be moved between slots on the same date from this page.",
      400,
    );
  }

  if (targetSlot.id !== currentSlot.id) {
    const { data: conflictingBooking, error: conflictingBookingError } = await supabase
      .from("bookings")
      .select("id")
      .eq("member_id", existingMemberId)
      .eq("slot_id", targetSlot.id)
      .neq("id", bookingId)
      .limit(1)
      .maybeSingle();

    if (conflictingBookingError) {
      console.error("Admin booking conflict lookup failed", {
        bookingId,
        error: conflictingBookingError,
      });
      return jsonError("Booking update failed.", 500);
    }

    if (conflictingBooking) {
      return jsonError(
        "This member already has a booking for the selected time slot.",
        409,
      );
    }
  }

  const currentGuestCount = existingBooking.guest_count ?? 1;
  const capacityPlan = buildAdminBookingCapacityPlan(
    currentSlot.id,
    currentGuestCount,
    targetSlot.id,
    nextValues.guest_count,
  );
  const bookingUpdateValues = {
    guest_count: nextValues.guest_count,
    location_id: targetSlot.location_id,
    slot_id: targetSlot.id,
  };
  const originalBookingValues = {
    guest_count: currentGuestCount,
    location_id: existingBooking.location_id,
    slot_id: existingSlotId,
  };
  const memberUpdateValues = {
    email: nextValues.email,
    first_name: nextValues.first_name,
    last_name: nextValues.last_name,
    phone: nextValues.phone,
  };
  const originalMemberValues = {
    email: existingMember.email,
    first_name: existingMember.first_name,
    last_name: existingMember.last_name,
    phone: existingMember.phone,
  };

  if (capacityPlan.kind === "same-slot") {
    const slotAdjustment = await adjustSlotAvailableSpots(
      capacityPlan.slotId,
      capacityPlan.delta,
    );

    if (!("ok" in slotAdjustment)) {
      return jsonError(slotAdjustment.error, slotAdjustment.status);
    }

    const bookingUpdate = await updateBookingRecord(bookingId, bookingUpdateValues);

    if (!("ok" in bookingUpdate)) {
      await logRollbackFailure("same-slot-capacity", () =>
        adjustSlotAvailableSpots(capacityPlan.slotId, -capacityPlan.delta),
      );
      return jsonError(bookingUpdate.error, bookingUpdate.status);
    }

    const memberUpdate = await updateMemberBasics(
      existingMemberId,
      memberUpdateValues,
    );

    if (!("ok" in memberUpdate)) {
      await logRollbackFailure("same-slot-booking", () =>
        updateBookingRecord(bookingId, originalBookingValues),
      );
      await logRollbackFailure("same-slot-capacity", () =>
        adjustSlotAvailableSpots(capacityPlan.slotId, -capacityPlan.delta),
      );
      return jsonError(memberUpdate.error, memberUpdate.status);
    }

    return NextResponse.json({ id: bookingId });
  }

  const reserveTargetSlot = await adjustSlotAvailableSpots(
    capacityPlan.nextSlotId,
    -capacityPlan.nextGuestCount,
  );

  if (!("ok" in reserveTargetSlot)) {
    return jsonError(reserveTargetSlot.error, reserveTargetSlot.status);
  }

  const bookingUpdate = await updateBookingRecord(bookingId, bookingUpdateValues);

  if (!("ok" in bookingUpdate)) {
    await logRollbackFailure("target-slot-reservation", () =>
      adjustSlotAvailableSpots(capacityPlan.nextSlotId, capacityPlan.nextGuestCount),
    );
    return jsonError(bookingUpdate.error, bookingUpdate.status);
  }

  const memberUpdate = await updateMemberBasics(
    existingMemberId,
    memberUpdateValues,
  );

  if (!("ok" in memberUpdate)) {
    await logRollbackFailure("changed-slot-booking", () =>
      updateBookingRecord(bookingId, originalBookingValues),
    );
    await logRollbackFailure("target-slot-reservation", () =>
      adjustSlotAvailableSpots(capacityPlan.nextSlotId, capacityPlan.nextGuestCount),
    );
    return jsonError(memberUpdate.error, memberUpdate.status);
  }

  const releaseCurrentSlot = await adjustSlotAvailableSpots(
    capacityPlan.currentSlotId,
    capacityPlan.currentGuestCount,
  );

  if (!("ok" in releaseCurrentSlot)) {
    await logRollbackFailure("changed-slot-member", () =>
      updateMemberBasics(existingMemberId, originalMemberValues),
    );
    await logRollbackFailure("changed-slot-booking", () =>
      updateBookingRecord(bookingId, originalBookingValues),
    );
    await logRollbackFailure("target-slot-reservation", () =>
      adjustSlotAvailableSpots(capacityPlan.nextSlotId, capacityPlan.nextGuestCount),
    );
    return jsonError(releaseCurrentSlot.error, releaseCurrentSlot.status);
  }

  return NextResponse.json({ id: bookingId });
}
