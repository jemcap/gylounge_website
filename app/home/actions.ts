"use server";

import { redirect, unstable_rethrow } from "next/navigation";
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
  redirect(`/home${query ? `?${query}` : ""}#${section}`);
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

  redirect(`/home${query ? `?${query}` : ""}#register`);
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
  const phone = phoneRaw || null;
  const numberOfGuests = guestCountRaw ? Number.parseInt(guestCountRaw, 10) : 1;

  if (
    !name ||
    !emailInput ||
    !locationId ||
    !slotId ||
    !emailInput.includes("@") ||
    !Number.isInteger(numberOfGuests) ||
    numberOfGuests < 1
  ) {
    redirectHome("booking", { booking: "invalid" });
  }

  const email = normalizeEmail(emailInput);

  try {
    const admin = supabaseAdminClient();

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

    const { data: slotUpdate, error: slotUpdateError } = await admin
      .from("slots")
      .update({ available_spots: availableSlot.available_spots - numberOfGuests })
      .eq("id", availableSlot.id)
      .eq("available_spots", availableSlot.available_spots)
      .select("id")
      .maybeSingle();

    if (slotUpdateError) {
      console.error("createBookingAction slot decrement failed", slotUpdateError);
      redirectHome("booking", { booking: "error" });
    }

    if (!slotUpdate) {
      redirectHome("booking", { booking: "slot-unavailable" });
    }

    const { data: booking, error: bookingError } = await admin
      .from("bookings")
      .insert({
        member_id: activeMember.id,
        location_id: availableSlot.location_id,
        slot_id: availableSlot.id,
        status: "confirmed",
      })
      .select("id")
      .maybeSingle();

    if (bookingError || !booking) {
      console.error("createBookingAction insert failed", bookingError);
      await admin
        .from("slots")
        .update({ available_spots: availableSlot.available_spots })
        .eq("id", availableSlot.id);
      redirectHome("booking", { booking: "error" });
    }

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

    redirectHome("booking", { booking: "success" });
  } catch (error) {
    unstable_rethrow(error);
    console.error("createBookingAction unexpected failure", error);
    redirectHome("booking", { booking: "error" });
  }
}
