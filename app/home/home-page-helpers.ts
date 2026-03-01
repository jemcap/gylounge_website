import { supabaseAdminClient } from "@/lib/supabase";

export type BookingTarget = {
  eventId: string;
  slotId: string;
  eventTitle: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  locationName: string;
};

export type Feedback = {
  tone: "success" | "error" | "info";
  message: string;
};

export const getSingleParam = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

export const formatAccraDate = (raw: string) => {
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw;
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Accra",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parsed);
};

export const formatAccraTime = (raw: string) => {
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
      };
    case "saved":
      return {
        tone: "info",
        message: reference
          ? `Registration saved with reference ${reference}, but we could not send the email. Contact support if needed.`
          : "Registration saved, but we could not send the email. Contact support if needed.",
      };
    case "already-active":
      return {
        tone: "info",
        message: "This email already has an active membership.",
      };
    case "invalid":
      return {
        tone: "error",
        message: "Please provide valid name, email, and phone details.",
      };
    case "error":
      return {
        tone: "error",
        message: "We could not save your registration right now. Please try again.",
      };
    default:
      return undefined;
  }
};

export const resolveBookingFeedback = (status?: string): Feedback | undefined => {
  switch (status) {
    case "success":
      return {
        tone: "success",
        message: "Booking created successfully. A confirmation email has been sent.",
      };
    case "success-email-warning":
      return {
        tone: "info",
        message: "Booking created, but one or more confirmation emails could not be sent.",
      };
    case "membership-required":
      return {
        tone: "info",
        message:
          "You need an active membership before booking. Complete Register first.",
      };
    case "slot-unavailable":
      return {
        tone: "error",
        message: "That slot is no longer available. Please try another available slot.",
      };
    case "invalid":
      return {
        tone: "error",
        message: "Please complete all required booking fields.",
      };
    case "error":
      return {
        tone: "error",
        message: "We could not complete your booking right now. Please try again.",
      };
    default:
      return undefined;
  }
};

export const getBookingTarget = async (): Promise<BookingTarget | null> => {
  try {
    const admin = supabaseAdminClient();
    const { data: slots, error: slotError } = await admin
      .from("slots")
      .select("id, event_id, start_time, end_time, available_spots")
      .gt("available_spots", 0)
      .order("start_time", { ascending: true })
      .limit(1);

    if (slotError || !slots?.length || !slots[0].event_id) {
      return null;
    }

    const slot = slots[0];
    const slotEventId = slot.event_id as string;

    const { data: event, error: eventError } = await admin
      .from("events")
      .select("id, title, date, location_id")
      .eq("id", slotEventId)
      .maybeSingle();

    if (eventError || !event) {
      return null;
    }

    let locationName = "Location pending";
    if (event.location_id) {
      const { data: location } = await admin
        .from("locations")
        .select("name")
        .eq("id", event.location_id)
        .maybeSingle();
      if (location?.name) {
        locationName = location.name;
      }
    }

    return {
      eventId: event.id,
      slotId: slot.id,
      eventTitle: event.title,
      eventDate: event.date,
      startTime: slot.start_time,
      endTime: slot.end_time,
      locationName,
    };
  } catch (error) {
    console.error("home getBookingTarget failed", error);
    return null;
  }
};
