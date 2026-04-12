"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import {
  BOOKING_IDEMPOTENCY_KEY_FIELD,
  BOOKING_REQUEST_STATUS,
  resolveBookingRequestReplay,
} from "@/lib/booking-idempotency";
import { generateBankTransferReference, getBankTransferDetails, normalizeEmail } from "@/lib/membership";
import {
  sendBookingConfirmation,
  sendBookingNotification,
  sendMembershipInstructions,
} from "@/lib/resend";
import { supabaseAdminClient } from "@/lib/supabase";

const redirectHome = (
  section: "register" | "booking",
  params: Record<string, string>,
): never => {
  const query = new URLSearchParams(params).toString();
  redirect(`/${query ? `?${query}` : ""}#${section}`);
};

const resolveRegisterRedirectTarget = (formData: FormData) => {
  const target = formData.get("redirectTarget");
  return target === "register" ? "register" : "home";
};

const redirectRegister = (
  target: "home" | "register",
  params: Record<string, string>,
): never => {
  const query = new URLSearchParams(params).toString();

  if (target === "register") {
    redirect(`/register${query ? `?${query}` : ""}`);
  }

  redirect(`/${query ? `?${query}` : ""}#register`);
};

const readRequiredValue = (formData: FormData, field: string) => {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
};

const buildIsoDate = (year: string, month: string, day: string) => {
  if (!year || !month || !day) {
    return "";
  }

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const formatAccraDate = (raw: string) => {
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw;
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Accra",
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return formatter.format(parsed);
};

const formatAccraTime = (raw: string) => {
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw;
  }
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Accra",
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).format(parsed);
};

const isMissingGuestCountColumnError = (error: unknown) =>
  Boolean(
    error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string" &&
      error.message.includes("guest_count") &&
      "code" in error &&
      (error.code === "42703" || error.code === "PGRST204"),
  );

const isMissingBookingRequestsTableError = (error: unknown) =>
  Boolean(
    error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string" &&
      error.message.includes("booking_requests") &&
      "code" in error &&
      (error.code === "42P01" || error.code === "PGRST205"),
  );

const isUniqueViolationError = (error: unknown) =>
  Boolean(error && typeof error === "object" && "code" in error && error.code === "23505");

const buildBookingSuccessParams = ({
  availableSlot,
  bookingId,
  email,
  includeFallbackParams,
  locationName,
  name,
  numberOfGuests,
  phone,
}: {
  availableSlot: {
    date: string;
    end_time: string;
    start_time: string;
  };
  bookingId: string;
  email: string;
  includeFallbackParams: boolean;
  locationName: string;
  name: string;
  numberOfGuests: number;
  phone: string | null;
}) => {
  const successParams: Record<string, string> = {
    booking: "success",
    bookingId,
  };

  if (includeFallbackParams) {
    successParams.bookingDate = formatAccraDate(availableSlot.date);
    successParams.bookingEmail = email;
    successParams.bookingGuestCount = String(numberOfGuests);
    successParams.bookingLocation = locationName;
    successParams.bookingName = name;
    successParams.bookingPhone = phone ?? "Not provided";
    successParams.bookingTime =
      `${formatAccraTime(availableSlot.start_time)} - ${formatAccraTime(availableSlot.end_time)}`;
  }

  return successParams;
};

const getExistingMemberSlotBookingId = async (
  admin: ReturnType<typeof supabaseAdminClient>,
  memberId: string,
  slotId: string,
) => {
  const { data, error } = await admin
    .from("bookings")
    .select("id")
    .eq("member_id", memberId)
    .eq("slot_id", slotId)
    .limit(1);

  return {
    bookingId: data?.[0]?.id ?? null,
    error,
  };
};

const shouldIncludeBookingFallbackParams = async (
  admin: ReturnType<typeof supabaseAdminClient>,
  bookingId: string,
) => {
  const { error } = await admin
    .from("bookings")
    .select("id, guest_count")
    .eq("id", bookingId)
    .maybeSingle();

  return isMissingGuestCountColumnError(error);
};

const releaseBookingRequestClaim = async (
  admin: ReturnType<typeof supabaseAdminClient>,
  bookingIdempotencyKey: string,
) => {
  const { error } = await admin
    .from("booking_requests")
    .delete()
    .eq("idempotency_key", bookingIdempotencyKey);

  if (error && !isMissingBookingRequestsTableError(error)) {
    console.error("createBookingAction booking request release failed", error);
  }
};

export async function registerMemberAction(formData: FormData) {
  const redirectTarget = resolveRegisterRedirectTarget(formData);
  const firstName = readRequiredValue(formData, "firstName");
  const lastName = readRequiredValue(formData, "lastName");
  const name =
    readRequiredValue(formData, "name") ||
    [firstName, lastName].filter(Boolean).join(" ");
  const emailInput = readRequiredValue(formData, "email");
  const phone =
    readRequiredValue(formData, "mobilePhone") ||
    readRequiredValue(formData, "phone");
  const birthday = buildIsoDate(
    readRequiredValue(formData, "birthYear"),
    readRequiredValue(formData, "birthMonth"),
    readRequiredValue(formData, "birthDay"),
  );
  const gender = readRequiredValue(formData, "gender") || "Prefer not to say";
  const addressLine1 = readRequiredValue(formData, "addressLine1");
  const addressLine2 = readRequiredValue(formData, "addressLine2");
  const digitalAddress = readRequiredValue(formData, "digitalAddress");
  const emergencyFirstName = readRequiredValue(formData, "emergencyFirstName");
  const emergencyLastName = readRequiredValue(formData, "emergencyLastName");
  const emergencyRelationship = readRequiredValue(formData, "emergencyRelationship");
  const emergencyPhone = readRequiredValue(formData, "emergencyPhone");

  if (
    !name ||
    !firstName ||
    !lastName ||
    !emailInput ||
    !phone ||
    !birthday ||
    !emailInput.includes("@")
  ) {
    redirectRegister(redirectTarget, { register: "invalid" });
  }

  const email = normalizeEmail(emailInput);
  const reference = generateBankTransferReference();
  const memberPayload = {
    first_name: firstName,
    last_name: lastName,
    birthday,
    gender,
    phone,
    home_address_line1: addressLine1,
    home_address_line2: addressLine2,
    home_address_digital: digitalAddress,
    emergency_contact_first_name: emergencyFirstName,
    emergency_contact_last_name: emergencyLastName,
    emergency_contact_relationship: emergencyRelationship,
    emergency_contact_phone: emergencyPhone,
    status: "pending" as const,
  };

  try {
    const admin = supabaseAdminClient();
    const { data: existingMember, error: lookupError } = await admin
      .from("members")
      .select("id, status")
      .eq("email", email)
      .maybeSingle();

    if (lookupError) {
      console.error("registerMemberAction lookup failed", lookupError);
      redirectRegister(redirectTarget, { register: "error" });
    }

    if (existingMember?.status === "active") {
      redirectRegister(redirectTarget, { register: "already-active" });
    }

    if (existingMember) {
      const { error: updateError } = await admin
        .from("members")
        .update(memberPayload)
        .eq("id", existingMember.id);

      if (updateError) {
        console.error("registerMemberAction update failed", updateError);
        redirectRegister(redirectTarget, { register: "error" });
      }
    } else {
      const { error: insertError } = await admin.from("members").insert({
        email,
        ...memberPayload,
      });

      if (insertError) {
        console.error("registerMemberAction insert failed", insertError);
        redirectRegister(redirectTarget, { register: "error" });
      }
    }

    const details = getBankTransferDetails();
    const emailResult = await sendMembershipInstructions(email, name, reference, details);

    if (!emailResult.ok) {
      console.error("registerMemberAction instruction email failed", emailResult.error);
      redirectRegister(redirectTarget, { register: "saved", reference });
    }

    redirectRegister(redirectTarget, { register: "success", reference });
  } catch (error) {
    unstable_rethrow(error);
    console.error("registerMemberAction unexpected failure", error);
    redirectRegister(redirectTarget, { register: "error" });
  }
}

export async function createBookingAction(formData: FormData) {
  const firstName = readRequiredValue(formData, "firstName");
  const lastName = readRequiredValue(formData, "lastName");
  const submittedName = readRequiredValue(formData, "name");
  const name = submittedName || [firstName, lastName].filter(Boolean).join(" ");
  const emailInput = readRequiredValue(formData, "email");
  const phoneRaw = readRequiredValue(formData, "phone");
  const locationId = readRequiredValue(formData, "locationId");
  const slotId = readRequiredValue(formData, "slotId");
  const guestCountRaw = readRequiredValue(formData, "numberOfGuests");
  const bookingIdempotencyKey = readRequiredValue(
    formData,
    BOOKING_IDEMPOTENCY_KEY_FIELD,
  );
  const phone = phoneRaw || null;
  const numberOfGuests = guestCountRaw ? Number.parseInt(guestCountRaw, 10) : 1;

  if (
    !name ||
    !emailInput ||
    !locationId ||
    !slotId ||
    !bookingIdempotencyKey ||
    !emailInput.includes("@") ||
    !Number.isInteger(numberOfGuests) ||
    numberOfGuests < 1
  ) {
    redirectHome("booking", { booking: "invalid" });
  }

  const email = normalizeEmail(emailInput);

  try {
    const admin = supabaseAdminClient();
    let claimedBookingRequest = false;
    let supportsBookingIdempotency = true;

    const releaseClaimAndRedirect = async (
      status: "already-booked" | "error" | "slot-unavailable",
    ) => {
      if (supportsBookingIdempotency && claimedBookingRequest) {
        await releaseBookingRequestClaim(admin, bookingIdempotencyKey);
        claimedBookingRequest = false;
      }

      redirectHome("booking", { booking: status });
    };

    const { data: member, error: memberError } = await admin
      .from("members")
      .select("id, status")
      .eq("email", email)
      .maybeSingle();

    if (memberError) {
      console.error("createBookingAction member lookup failed", memberError);
      redirectHome("booking", { booking: "error" });
    }

    if (!member || member.status !== "active") {
      redirectHome("booking", { booking: "membership-required" });
    }
    const activeMember = member as NonNullable<typeof member>;

    const { data: slot, error: slotError } = await admin
      .from("slots")
      .select("id, location_id, date, start_time, end_time, available_spots")
      .eq("id", slotId)
      .eq("location_id", locationId)
      .maybeSingle();

    if (slotError) {
      console.error("createBookingAction slot lookup failed", slotError);
      redirectHome("booking", { booking: "error" });
    }

    if (
      !slot ||
      !slot.location_id ||
      slot.available_spots <= 0 ||
      slot.available_spots < numberOfGuests
    ) {
      redirectHome("booking", { booking: "slot-unavailable" });
    }
    const availableSlot = slot as NonNullable<typeof slot>;

    let locationName = "Location pending";
    if (availableSlot.location_id) {
      const { data: location } = await admin
        .from("locations")
        .select("name")
        .eq("id", availableSlot.location_id)
        .maybeSingle();
      if (location?.name) {
        locationName = location.name;
      }
    }

    const timeLabel = `${formatAccraTime(availableSlot.start_time)} - ${formatAccraTime(availableSlot.end_time)}`;

    const { error: bookingRequestClaimError } = await admin
      .from("booking_requests")
      .insert({
        idempotency_key: bookingIdempotencyKey,
        location_id: availableSlot.location_id,
        member_id: activeMember.id,
        slot_id: availableSlot.id,
        status: BOOKING_REQUEST_STATUS.inProgress,
      });

    if (bookingRequestClaimError) {
      if (isMissingBookingRequestsTableError(bookingRequestClaimError)) {
        supportsBookingIdempotency = false;
        console.warn(
          "createBookingAction continuing without booking request idempotency because the remote schema is missing booking_requests",
        );
      } else if (isUniqueViolationError(bookingRequestClaimError)) {
        const { data: existingRequest, error: existingRequestError } = await admin
          .from("booking_requests")
          .select("booking_id, member_id, slot_id, status")
          .eq("idempotency_key", bookingIdempotencyKey)
          .maybeSingle();

        if (existingRequestError) {
          console.error(
            "createBookingAction existing booking request lookup failed",
            existingRequestError,
          );
          redirectHome("booking", { booking: "error" });
        }

        const {
          bookingId: existingMemberSlotBookingId,
          error: existingMemberSlotBookingError,
        } = await getExistingMemberSlotBookingId(admin, activeMember.id, availableSlot.id);

        if (existingMemberSlotBookingError) {
          console.error(
            "createBookingAction existing booking replay lookup failed",
            existingMemberSlotBookingError,
          );
          redirectHome("booking", { booking: "error" });
        }

        const replay = resolveBookingRequestReplay({
          existingBookingId: existingMemberSlotBookingId,
          expectedMemberId: activeMember.id,
          expectedSlotId: availableSlot.id,
          request: existingRequest
            ? {
                bookingId: existingRequest.booking_id,
                memberId: existingRequest.member_id,
                slotId: existingRequest.slot_id,
                status: existingRequest.status,
              }
            : null,
        });

        if (replay.kind === "completed") {
          if (
            existingRequest &&
            existingRequest.status !== BOOKING_REQUEST_STATUS.completed
          ) {
            const { error: completeRequestError } = await admin
              .from("booking_requests")
              .update({
                booking_id: replay.bookingId,
                status: BOOKING_REQUEST_STATUS.completed,
              })
              .eq("idempotency_key", bookingIdempotencyKey);

            if (completeRequestError) {
              console.error(
                "createBookingAction booking request completion sync failed",
                completeRequestError,
              );
            }
          }

          const includeFallbackParams = await shouldIncludeBookingFallbackParams(
            admin,
            replay.bookingId,
          );

          redirectHome(
            "booking",
            buildBookingSuccessParams({
              availableSlot,
              bookingId: replay.bookingId,
              email,
              includeFallbackParams,
              locationName,
              name,
              numberOfGuests,
              phone,
            }),
          );
        }

        if (replay.kind === "processing") {
          redirectHome("booking", { booking: "processing" });
        }

        redirectHome("booking", { booking: "error" });
      } else {
        console.error(
          "createBookingAction booking request claim failed",
          bookingRequestClaimError,
        );
        redirectHome("booking", { booking: "error" });
      }
    } else {
      claimedBookingRequest = true;
    }

    const {
      bookingId: existingBookingId,
      error: existingBookingError,
    } = await getExistingMemberSlotBookingId(admin, activeMember.id, availableSlot.id);

    if (existingBookingError) {
      console.error(
        "createBookingAction existing booking lookup failed",
        existingBookingError,
      );
      await releaseClaimAndRedirect("error");
    }

    if (existingBookingId) {
      await releaseClaimAndRedirect("already-booked");
    }

    const { data: slotUpdate, error: slotUpdateError } = await admin
      .from("slots")
      .update({ available_spots: availableSlot.available_spots - numberOfGuests })
      .eq("id", availableSlot.id)
      .eq("available_spots", availableSlot.available_spots)
      .select("id")
      .maybeSingle();

    if (slotUpdateError) {
      console.error("createBookingAction slot decrement failed", slotUpdateError);
      await releaseClaimAndRedirect("error");
    }

    if (!slotUpdate) {
      const {
        bookingId: replayBookingId,
        error: replayBookingError,
      } = await getExistingMemberSlotBookingId(admin, activeMember.id, availableSlot.id);

      if (replayBookingError) {
        console.error(
          "createBookingAction replay lookup after slot decrement miss failed",
          replayBookingError,
        );
        await releaseClaimAndRedirect("error");
      }

      if (replayBookingId) {
        const includeFallbackParams = await shouldIncludeBookingFallbackParams(
          admin,
          replayBookingId,
        );

        redirectHome(
          "booking",
          buildBookingSuccessParams({
            availableSlot,
            bookingId: replayBookingId,
            email,
            includeFallbackParams,
            locationName,
            name,
            numberOfGuests,
            phone,
          }),
        );
      }

      await releaseClaimAndRedirect("slot-unavailable");
    }

    const bookingInsertPayload = {
      guest_count: numberOfGuests,
      member_id: activeMember.id,
      location_id: availableSlot.location_id,
      slot_id: availableSlot.id,
      status: "confirmed" as const,
    };
    let usedGuestCountFallback = false;
    let { data: booking, error: bookingError } = await admin
      .from("bookings")
      .insert(bookingInsertPayload)
      .select("id")
      .maybeSingle();

    if (isMissingGuestCountColumnError(bookingError)) {
      usedGuestCountFallback = true;
      console.warn(
        "createBookingAction retrying insert without guest_count because the remote schema cache is missing that column",
      );
      const retryResult = await admin
        .from("bookings")
        .insert({
          member_id: activeMember.id,
          location_id: availableSlot.location_id,
          slot_id: availableSlot.id,
          status: "confirmed",
        })
        .select("id")
        .maybeSingle();
      booking = retryResult.data;
      bookingError = retryResult.error;
    }

    if (bookingError || !booking) {
      console.error("createBookingAction insert failed", bookingError);
      await admin
        .from("slots")
        .update({ available_spots: availableSlot.available_spots })
        .eq("id", availableSlot.id);

      const {
        bookingId: replayBookingId,
        error: replayBookingError,
      } = await getExistingMemberSlotBookingId(admin, activeMember.id, availableSlot.id);

      if (replayBookingError) {
        console.error(
          "createBookingAction replay lookup after insert failure failed",
          replayBookingError,
        );
        await releaseClaimAndRedirect("error");
      }

      if (replayBookingId) {
        await releaseClaimAndRedirect("already-booked");
      }

      await releaseClaimAndRedirect("error");
    }
    const createdBooking = booking as NonNullable<typeof booking>;

    if (supportsBookingIdempotency && claimedBookingRequest) {
      const { error: completeRequestError } = await admin
        .from("booking_requests")
        .update({
          booking_id: createdBooking.id,
          status: BOOKING_REQUEST_STATUS.completed,
        })
        .eq("idempotency_key", bookingIdempotencyKey);

      if (completeRequestError) {
        console.error(
          "createBookingAction booking request completion failed",
          completeRequestError,
        );
      }
    }
    const [confirmationResult, notificationResult] = await Promise.all([
      sendBookingConfirmation(
        email,
        name,
        availableSlot.date,
        timeLabel,
        locationName,
        numberOfGuests,
      ),
      sendBookingNotification(
        name,
        email,
        phone,
        availableSlot.date,
        timeLabel,
        locationName,
        numberOfGuests,
      ),
    ]);

    if (!confirmationResult.ok || !notificationResult.ok) {
      console.error("createBookingAction email side effect failed", {
        confirmationResult,
        notificationResult,
      });
      redirectHome("booking", { booking: "success-email-warning" });
    }

    redirectHome(
      "booking",
      buildBookingSuccessParams({
        availableSlot,
        bookingId: createdBooking.id,
        email,
        includeFallbackParams: usedGuestCountFallback,
        locationName,
        name,
        numberOfGuests,
        phone,
      }),
    );
  } catch (error) {
    unstable_rethrow(error);
    console.error("createBookingAction unexpected failure", error);
    redirectHome("booking", { booking: "error" });
  }
}
