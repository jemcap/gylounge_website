import { describe, expect, it } from "vitest";
import {
  createBookingConfirmationRows,
  getBookingConfirmationFromParams,
} from "@/lib/booking-confirmation";

const confirmation = {
  date: "Wednesday 26th March",
  email: "ama@example.com",
  guestCount: 3,
  location: "Accra Community Center",
  name: "Ama Boateng",
  phone: "+233 20 000 0000",
  time: "09:00 - 10:00",
};

describe("booking confirmation helpers", () => {
  it("creates confirmation rows from the booking fields in the expected order", () => {
    expect(createBookingConfirmationRows(confirmation)).toEqual([
      { label: "Location", value: "Accra Community Center" },
      { label: "Date", value: "Wednesday 26th March" },
      { label: "Time", value: "09:00 - 10:00" },
      { label: "Name of person booked", value: "Ama Boateng" },
      { label: "Email address of person booked", value: "ama@example.com" },
      { label: "Phone number of person booked", value: "+233 20 000 0000" },
      { label: "Number of guests selected", value: "3" },
    ]);
  });

  it("builds a confirmation payload from success query params", () => {
    expect(
      getBookingConfirmationFromParams({
        bookingDate: "Wednesday 26th March",
        bookingEmail: "ama@example.com",
        bookingGuestCount: "3",
        bookingLocation: "Accra Community Center",
        bookingName: "Ama Boateng",
        bookingPhone: "+233 20 000 0000",
        bookingTime: "09:00 - 10:00",
      }),
    ).toEqual(confirmation);
  });

  it("rejects incomplete or invalid query-param confirmation data", () => {
    expect(
      getBookingConfirmationFromParams({
        bookingDate: "Wednesday 26th March",
        bookingEmail: "ama@example.com",
        bookingGuestCount: "0",
        bookingLocation: "Accra Community Center",
        bookingName: "Ama Boateng",
        bookingPhone: "+233 20 000 0000",
        bookingTime: "09:00 - 10:00",
      }),
    ).toBeNull();

    expect(
      getBookingConfirmationFromParams({
        bookingDate: "Wednesday 26th March",
        bookingEmail: "ama@example.com",
        bookingGuestCount: "2",
        bookingLocation: "Accra Community Center",
        bookingName: "Ama Boateng",
        bookingTime: "09:00 - 10:00",
      }),
    ).toBeNull();
  });
});
