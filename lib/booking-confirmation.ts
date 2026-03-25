export type BookingConfirmation = {
  date: string;
  email: string;
  guestCount: number;
  location: string;
  name: string;
  phone: string;
  time: string;
};

export type BookingConfirmationRow = {
  label: string;
  value: string;
};

export const BOOKING_CONFIRMATION_QUERY_KEYS = [
  "bookingDate",
  "bookingEmail",
  "bookingGuestCount",
  "bookingLocation",
  "bookingName",
  "bookingPhone",
  "bookingTime",
] as const;

export const getSingleParam = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

export const getBookingConfirmationFromParams = (params: {
  [key: string]: string | string[] | undefined;
}): BookingConfirmation | null => {
  const date = getSingleParam(params.bookingDate);
  const email = getSingleParam(params.bookingEmail);
  const guestCountRaw = getSingleParam(params.bookingGuestCount);
  const location = getSingleParam(params.bookingLocation);
  const name = getSingleParam(params.bookingName);
  const phone = getSingleParam(params.bookingPhone);
  const time = getSingleParam(params.bookingTime);

  const guestCount = guestCountRaw
    ? Number.parseInt(guestCountRaw, 10)
    : Number.NaN;

  if (
    !date ||
    !email ||
    !location ||
    !name ||
    !phone ||
    !time ||
    !Number.isInteger(guestCount) ||
    guestCount < 1
  ) {
    return null;
  }

  return {
    date,
    email,
    guestCount,
    location,
    name,
    phone,
    time,
  };
};

export const createBookingConfirmationRows = (
  confirmation: BookingConfirmation,
): BookingConfirmationRow[] => [
  { label: "Location", value: confirmation.location },
  { label: "Date", value: confirmation.date },
  { label: "Time", value: confirmation.time },
  { label: "Name of person booked", value: confirmation.name },
  { label: "Email address of person booked", value: confirmation.email },
  { label: "Phone number of person booked", value: confirmation.phone },
  {
    label: "Number of guests selected",
    value: String(confirmation.guestCount),
  },
];
