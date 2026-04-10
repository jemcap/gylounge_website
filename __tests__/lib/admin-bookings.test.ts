import { describe, expect, it } from "vitest";
import {
  adminBookingUpdateSchema,
  buildAdminBookingCapacityPlan,
  buildAdminBookingLocationGroups,
  buildAdminBookingCalendarCells,
  buildAdminBookingCalendarCounts,
  filterAdminBookingLocationGroups,
  getAdminBookingCountLookup,
  getPreferredAdminBookingMonth,
  isAdminBookingDateKey,
  toAdminBookingMonthKey,
} from "@/lib/admin-bookings";

const createAdminMember = (
  id: string,
  firstName: string,
  lastName: string,
  email: string,
) => ({
  birthday: "1950-01-01",
  created_at: "2026-01-01T00:00:00.000Z",
  email,
  emergency_contact_first_name: "Akosua",
  emergency_contact_last_name: "Mensah",
  emergency_contact_phone: "0200000000",
  emergency_contact_relationship: "Child",
  first_name: firstName,
  gender: "Female",
  home_address_digital: "GA-123-4567",
  home_address_line1: "123 Palm Street",
  home_address_line2: "",
  id,
  last_name: lastName,
  phone: "0240000000",
  status: "active",
});

describe("admin bookings helpers", () => {
  it("parses editable booking update payloads", () => {
    expect(
      adminBookingUpdateSchema.parse({
        email: " AMA@EXAMPLE.COM ",
        first_name: "Ama",
        guest_count: "3",
        last_name: "Mensah",
        location_id: "11111111-1111-4111-8111-111111111111",
        phone: " ",
        slot_id: "22222222-2222-4222-8222-222222222222",
      }),
    ).toEqual({
      email: "ama@example.com",
      first_name: "Ama",
      guest_count: 3,
      last_name: "Mensah",
      location_id: "11111111-1111-4111-8111-111111111111",
      phone: null,
      slot_id: "22222222-2222-4222-8222-222222222222",
    });
  });

  it("builds capacity plans for same-slot and moved bookings", () => {
    expect(
      buildAdminBookingCapacityPlan("slot-1", 2, "slot-1", 4),
    ).toEqual({
      delta: -2,
      kind: "same-slot",
      slotId: "slot-1",
    });
    expect(
      buildAdminBookingCapacityPlan("slot-1", 2, "slot-2", 3),
    ).toEqual({
      currentGuestCount: 2,
      currentSlotId: "slot-1",
      kind: "change-slot",
      nextGuestCount: 3,
      nextSlotId: "slot-2",
    });
  });

  it("aggregates booking counts by location and slot date", () => {
    const counts = buildAdminBookingCalendarCounts(
      [
        {
          guest_count: 1,
          id: "booking-1",
          location_id: "location-1",
          member_id: "member-1",
          slot_id: "slot-1",
        },
        {
          guest_count: 1,
          id: "booking-2",
          location_id: "location-1",
          member_id: "member-2",
          slot_id: "slot-2",
        },
        {
          guest_count: 1,
          id: "booking-3",
          location_id: "location-2",
          member_id: "member-3",
          slot_id: "slot-3",
        },
        {
          guest_count: 1,
          id: "booking-4",
          location_id: "location-2",
          member_id: null,
          slot_id: null,
        },
        {
          guest_count: 1,
          id: "booking-5",
          location_id: "location-2",
          member_id: "member-4",
          slot_id: "missing-slot",
        },
      ],
      [
        {
          date: "2026-05-14",
          end_time: "09:00:00",
          id: "slot-1",
          location_id: "location-1",
          start_time: "08:00:00",
        },
        {
          date: "2026-05-14",
          end_time: "10:00:00",
          id: "slot-2",
          location_id: "location-1",
          start_time: "09:00:00",
        },
        {
          date: "2026-05-15",
          end_time: "09:00:00",
          id: "slot-3",
          location_id: "location-2",
          start_time: "08:00:00",
        },
      ],
    );

    expect(counts).toEqual([
      {
        count: 2,
        date: "2026-05-14",
        locationId: "location-1",
      },
      {
        count: 1,
        date: "2026-05-15",
        locationId: "location-2",
      },
    ]);
  });

  it("builds per-date lookup values for all or one location", () => {
    const counts = [
      {
        count: 2,
        date: "2026-05-14",
        locationId: "location-1",
      },
      {
        count: 1,
        date: "2026-05-14",
        locationId: "location-2",
      },
      {
        count: 3,
        date: "2026-05-15",
        locationId: "location-1",
      },
    ];

    expect(Array.from(getAdminBookingCountLookup(counts, "").entries())).toEqual(
      [
        ["2026-05-14", 3],
        ["2026-05-15", 3],
      ],
    );
    expect(
      Array.from(
        getAdminBookingCountLookup(counts, "location-1").entries(),
      ),
    ).toEqual([
      ["2026-05-14", 2],
      ["2026-05-15", 3],
    ]);
  });

  it("builds calendar cells with booking counts in the matching day cell", () => {
    const cells = buildAdminBookingCalendarCells(
      new Date("2026-05-01T00:00:00.000Z"),
      new Map([
        ["2026-05-14", 3],
        ["2026-05-21", 1],
      ]),
    );
    const mayFourteenth = cells.find(
      (cell) => cell.type === "day" && cell.dateKey === "2026-05-14",
    );
    const mayTwentyFirst = cells.find(
      (cell) => cell.type === "day" && cell.dateKey === "2026-05-21",
    );

    expect(mayFourteenth).toMatchObject({
      bookingCount: 3,
      dayNumber: 14,
      type: "day",
    });
    expect(mayTwentyFirst).toMatchObject({
      bookingCount: 1,
      dayNumber: 21,
      type: "day",
    });
  });

  it("prefers the current month when it has bookings, otherwise the first booked month", () => {
    const aprilMonth = getPreferredAdminBookingMonth(
      new Map([["2026-04-10", 1]]),
      new Date("2026-04-01T00:00:00.000Z"),
    );
    const julyMonth = getPreferredAdminBookingMonth(
      new Map([["2026-07-02", 2]]),
      new Date("2026-04-01T00:00:00.000Z"),
    );
    const emptyMonth = getPreferredAdminBookingMonth(
      new Map(),
      new Date("2026-04-01T00:00:00.000Z"),
    );

    expect(toAdminBookingMonthKey(aprilMonth)).toBe("2026-04");
    expect(toAdminBookingMonthKey(julyMonth)).toBe("2026-07");
    expect(toAdminBookingMonthKey(emptyMonth)).toBe("2026-04");
  });

  it("groups booked slots under their location and slot start time", () => {
    const ama = createAdminMember(
      "member-1",
      "Ama",
      "Mensah",
      "ama@example.com",
    );
    const kwesi = createAdminMember(
      "member-2",
      "Kwesi",
      "Owusu",
      "kwesi@example.com",
    );
    const efua = createAdminMember(
      "member-3",
      "Efua",
      "Boateng",
      "efua@example.com",
    );
    const groups = buildAdminBookingLocationGroups(
      [
        { id: "location-1", name: "Accra" },
        { id: "location-2", name: "Kumasi" },
      ],
      [
        {
          date: "2026-05-14",
          end_time: "09:00:00",
          id: "slot-1",
          location_id: "location-1",
          start_time: "08:00:00",
        },
        {
          date: "2026-05-14",
          end_time: "10:00:00",
          id: "slot-2",
          location_id: "location-1",
          start_time: "09:00:00",
        },
        {
          date: "2026-05-14",
          end_time: "09:00:00",
          id: "slot-3",
          location_id: "location-2",
          start_time: "08:00:00",
        },
      ],
      [
        {
          guest_count: 1,
          id: "booking-1",
          location_id: "location-1",
          member_id: "member-2",
          slot_id: "slot-1",
        },
        {
          guest_count: 3,
          id: "booking-2",
          location_id: "location-1",
          member_id: "member-1",
          slot_id: "slot-1",
        },
        {
          guest_count: 1,
          id: "booking-3",
          location_id: "location-2",
          member_id: "member-3",
          slot_id: "slot-3",
        },
      ],
      [
        ama,
        kwesi,
        efua,
      ],
    );

    expect(groups).toEqual([
      {
        bookingCount: 2,
        locationId: "location-1",
        locationName: "Accra",
        slots: [
          {
            bookingCount: 2,
            bookings: [
              {
                bookingId: "booking-2",
                email: "ama@example.com",
                firstName: "Ama",
                guestCount: 3,
                lastName: "Mensah",
                memberId: "member-1",
                memberName: "Ama Mensah",
                phone: "0240000000",
                searchValue: "ama mensah ama@example.com",
              },
              {
                bookingId: "booking-1",
                email: "kwesi@example.com",
                firstName: "Kwesi",
                guestCount: 1,
                lastName: "Owusu",
                memberId: "member-2",
                memberName: "Kwesi Owusu",
                phone: "0240000000",
                searchValue: "kwesi owusu kwesi@example.com",
              },
            ],
            endTime: "09:00:00",
            locationId: "location-1",
            locationName: "Accra",
            slotId: "slot-1",
            startTime: "08:00:00",
          },
        ],
      },
      {
        bookingCount: 1,
        locationId: "location-2",
        locationName: "Kumasi",
        slots: [
          {
            bookingCount: 1,
            bookings: [
              {
                bookingId: "booking-3",
                email: "efua@example.com",
                firstName: "Efua",
                guestCount: 1,
                lastName: "Boateng",
                memberId: "member-3",
                memberName: "Efua Boateng",
                phone: "0240000000",
                searchValue: "efua boateng efua@example.com",
              },
            ],
            endTime: "09:00:00",
            locationId: "location-2",
            locationName: "Kumasi",
            slotId: "slot-3",
            startTime: "08:00:00",
          },
        ],
      },
    ]);
  });

  it("filters grouped bookings by location and member search", () => {
    const filtered = filterAdminBookingLocationGroups(
      [
        {
          bookingCount: 2,
          locationId: "location-1",
          locationName: "Accra",
          slots: [
            {
              bookingCount: 2,
              bookings: [
                {
                  bookingId: "booking-1",
                  email: "ama@example.com",
                  firstName: "Ama",
                  guestCount: 1,
                  lastName: "Mensah",
                  memberId: "member-1",
                  memberName: "Ama Mensah",
                  phone: "0240000000",
                  searchValue: "ama mensah ama@example.com",
                },
                {
                  bookingId: "booking-2",
                  email: "kwesi@example.com",
                  firstName: "Kwesi",
                  guestCount: 2,
                  lastName: "Owusu",
                  memberId: "member-2",
                  memberName: "Kwesi Owusu",
                  phone: "0240000000",
                  searchValue: "kwesi owusu kwesi@example.com",
                },
              ],
              endTime: "09:00:00",
              locationId: "location-1",
              locationName: "Accra",
              slotId: "slot-1",
              startTime: "08:00:00",
            },
          ],
        },
        {
          bookingCount: 1,
          locationId: "location-2",
          locationName: "Kumasi",
          slots: [
            {
              bookingCount: 1,
              bookings: [
                {
                  bookingId: "booking-3",
                  email: "efua@example.com",
                  firstName: "Efua",
                  guestCount: 1,
                  lastName: "Boateng",
                  memberId: "member-3",
                  memberName: "Efua Boateng",
                  phone: "0240000000",
                  searchValue: "efua boateng efua@example.com",
                },
              ],
              endTime: "09:00:00",
              locationId: "location-2",
              locationName: "Kumasi",
              slotId: "slot-2",
              startTime: "08:00:00",
            },
          ],
        },
      ],
      "kwesi",
      "location-1",
    );

    expect(filtered).toEqual([
      {
        bookingCount: 1,
        locationId: "location-1",
        locationName: "Accra",
        slots: [
          {
            bookingCount: 1,
            bookings: [
              {
                bookingId: "booking-2",
                email: "kwesi@example.com",
                firstName: "Kwesi",
                guestCount: 2,
                lastName: "Owusu",
                memberId: "member-2",
                memberName: "Kwesi Owusu",
                phone: "0240000000",
                searchValue: "kwesi owusu kwesi@example.com",
              },
            ],
            endTime: "09:00:00",
            locationId: "location-1",
            locationName: "Accra",
            slotId: "slot-1",
            startTime: "08:00:00",
          },
        ],
      },
    ]);
  });

  it("validates booking date params", () => {
    expect(isAdminBookingDateKey("2026-05-14")).toBe(true);
    expect(isAdminBookingDateKey("2026-02-30")).toBe(false);
    expect(isAdminBookingDateKey("2026/05/14")).toBe(false);
  });
});
