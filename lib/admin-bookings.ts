import { z } from "zod";
import type { Database } from "@/app/types/database";
import { normalizeEmail } from "@/lib/membership";

type AdminBookingCalendarRow = Pick<
  Database["public"]["Tables"]["bookings"]["Row"],
  "id" | "location_id" | "slot_id"
>;

type AdminBookingDetailRow = AdminBookingCalendarRow &
  Pick<
    Database["public"]["Tables"]["bookings"]["Row"],
    "guest_count" | "member_id"
  >;

type AdminCalendarSlotRow = Pick<
  Database["public"]["Tables"]["slots"]["Row"],
  "date" | "id" | "location_id"
>;

type AdminDetailSlotRow = AdminCalendarSlotRow &
  Pick<Database["public"]["Tables"]["slots"]["Row"], "end_time" | "start_time">;

type AdminBookingMemberRow = Pick<
  Database["public"]["Tables"]["members"]["Row"],
  "email" | "first_name" | "id" | "last_name" | "phone"
>;

export type AdminBookingLocation = Pick<
  Database["public"]["Tables"]["locations"]["Row"],
  "id" | "name"
>;

export type AdminBookingCalendarCount = {
  count: number;
  date: string;
  locationId: string;
};

export type AdminBookingEditableSlot = AdminDetailSlotRow;

export type AdminBookingCalendarCell =
  | { type: "empty" }
  | {
      type: "day";
      bookingCount: number;
      dateKey: string;
      dayNumber: number;
    };

export type AdminBookingSlotBooking = {
  bookingId: string;
  email: string;
  firstName: string;
  guestCount: number;
  lastName: string;
  memberId: string | null;
  memberName: string;
  phone: string;
  searchValue: string;
};

export type AdminBookingSlotGroup = {
  bookingCount: number;
  bookings: AdminBookingSlotBooking[];
  endTime: string;
  locationId: string;
  locationName: string;
  slotId: string;
  startTime: string;
};

export type AdminBookingLocationGroup = {
  bookingCount: number;
  locationId: string;
  locationName: string;
  slots: AdminBookingSlotGroup[];
};

export type AdminBookingCapacityPlan =
  | {
      delta: number;
      kind: "same-slot";
      slotId: string;
    }
  | {
      currentGuestCount: number;
      currentSlotId: string;
      kind: "change-slot";
      nextGuestCount: number;
      nextSlotId: string;
    };

const adminBookingMonthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

const adminBookingDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  weekday: "long",
  year: "numeric",
});
const adminBookingTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  hour12: false,
  minute: "2-digit",
  timeZone: "Africa/Accra",
});
const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required.`);
const optionalText = z.string().trim();

const getUtcMonthStart = (value: Date) =>
  new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), 1));
const normalizeAdminBookingSearchValue = (value: string | null | undefined) =>
  (value || "").trim().toLowerCase();

const getAdminBookingTimeSortValue = (raw: string) => {
  const timeOnlyMatch = raw.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);

  if (timeOnlyMatch) {
    const hours = Number.parseInt(timeOnlyMatch[1], 10);
    const minutes = Number.parseInt(timeOnlyMatch[2], 10);
    const seconds = Number.parseInt(timeOnlyMatch[3] ?? "0", 10);

    return hours * 3600 + minutes * 60 + seconds;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime())
    ? Number.MAX_SAFE_INTEGER
    : parsed.getTime();
};

const getAdminBookingMemberName = (
  member: Pick<AdminBookingMemberRow, "email" | "first_name" | "last_name">,
) => {
  const fullName = [member.first_name || "", member.last_name || ""]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return fullName || member.email || "Unknown member";
};

export const toAdminBookingMonthKey = (value: Date) =>
  `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}`;

export const adminBookingIdSchema = z
  .string()
  .trim()
  .uuid("Invalid booking id.");

export const adminBookingUpdateSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Email address is required.")
      .email("Enter a valid email address."),
    first_name: requiredText("First name"),
    guest_count: z.coerce
      .number()
      .int("Number of guests must be a whole number.")
      .min(1, "Number of guests must be at least 1.")
      .max(10, "Number of guests cannot exceed 10."),
    last_name: requiredText("Last name"),
    location_id: z.string().trim().uuid("Select a valid location."),
    phone: optionalText,
    slot_id: z.string().trim().uuid("Select a valid time slot."),
  })
  .transform((value) => ({
    ...value,
    email: normalizeEmail(value.email),
    phone: value.phone || null,
  }));

export type AdminBookingUpdateFormValues = z.input<typeof adminBookingUpdateSchema>;
export type AdminBookingUpdateInput = z.output<typeof adminBookingUpdateSchema>;

export const buildAdminBookingCapacityPlan = (
  currentSlotId: string,
  currentGuestCount: number,
  nextSlotId: string,
  nextGuestCount: number,
): AdminBookingCapacityPlan =>
  currentSlotId === nextSlotId
    ? {
        delta: currentGuestCount - nextGuestCount,
        kind: "same-slot",
        slotId: currentSlotId,
      }
    : {
        currentGuestCount,
        currentSlotId,
        kind: "change-slot",
        nextGuestCount,
        nextSlotId,
      };

export const isAdminBookingDateKey = (value: string) => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  return (
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day
  );
};

export const getAdminBookingMonthStartFromMonthKey = (monthKey: string) =>
  new Date(`${monthKey}-01T00:00:00.000Z`);

export const getAdminBookingMonthStartFromDateKey = (dateKey: string) =>
  getAdminBookingMonthStartFromMonthKey(dateKey.slice(0, 7));

export const addAdminBookingMonths = (value: Date, amount: number) =>
  new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth() + amount, 1));

export const formatAdminBookingMonthLabel = (value: Date) =>
  adminBookingMonthFormatter.format(value);

export const formatAdminBookingDateLabel = (dateKey: string) => {
  const parsedDate = new Date(`${dateKey}T00:00:00.000Z`);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateKey;
  }

  return adminBookingDateFormatter.format(parsedDate);
};

export const formatAdminBookingCountLabel = (count: number) =>
  `${count} booking${count === 1 ? "" : "s"}`;

export const formatAdminBookingGuestCountLabel = (count: number) =>
  `${count} guest${count === 1 ? "" : "s"}`;

export const formatAdminBookingTimeLabel = (raw: string) => {
  const timeOnlyMatch = raw.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);

  if (timeOnlyMatch) {
    const hours = Number.parseInt(timeOnlyMatch[1], 10);
    const minutes = Number.parseInt(timeOnlyMatch[2], 10);
    const seconds = Number.parseInt(timeOnlyMatch[3] ?? "0", 10);

    return adminBookingTimeFormatter.format(
      new Date(Date.UTC(1970, 0, 1, hours, minutes, seconds)),
    );
  }

  const parsedDate = new Date(raw);

  if (Number.isNaN(parsedDate.getTime())) {
    return raw;
  }

  return adminBookingTimeFormatter.format(parsedDate);
};

export const formatAdminBookingTimeRangeLabel = (
  startTime: string,
  endTime: string,
) => `${formatAdminBookingTimeLabel(startTime)} - ${formatAdminBookingTimeLabel(endTime)}`;

export const resolveAdminLocationFilter = (
  locationId: string,
  locations: AdminBookingLocation[],
) => {
  if (!locationId) {
    return "";
  }

  return locations.some((location) => location.id === locationId)
    ? locationId
    : "";
};

export const buildAdminBookingCalendarCounts = (
  bookings: AdminBookingCalendarRow[],
  slots: AdminCalendarSlotRow[],
) => {
  const slotsById = new Map(slots.map((slot) => [slot.id, slot]));
  const countMap = new Map<string, AdminBookingCalendarCount>();

  for (const booking of bookings) {
    if (!booking.slot_id) {
      continue;
    }

    const slot = slotsById.get(booking.slot_id);

    if (!slot) {
      continue;
    }

    const locationId = booking.location_id || slot.location_id;
    const key = `${locationId}::${slot.date}`;
    const existingCount = countMap.get(key);

    if (existingCount) {
      existingCount.count += 1;
      continue;
    }

    countMap.set(key, {
      count: 1,
      date: slot.date,
      locationId,
    });
  }

  return Array.from(countMap.values()).sort(
    (left, right) =>
      left.date.localeCompare(right.date) ||
      left.locationId.localeCompare(right.locationId),
  );
};

export const buildAdminBookingLocationGroups = (
  locations: AdminBookingLocation[],
  slots: AdminDetailSlotRow[],
  bookings: AdminBookingDetailRow[],
  members: AdminBookingMemberRow[],
) => {
  const locationNameById = new Map(
    locations.map((location) => [location.id, location.name]),
  );
  const bookingsBySlotId = new Map<string, AdminBookingDetailRow[]>();
  const membersById = new Map(members.map((member) => [member.id, member]));

  for (const booking of bookings) {
    if (!booking.slot_id) {
      continue;
    }

    const slotBookings = bookingsBySlotId.get(booking.slot_id) ?? [];
    slotBookings.push(booking);
    bookingsBySlotId.set(booking.slot_id, slotBookings);
  }

  const groups = new Map<string, AdminBookingLocationGroup>();
  const sortedSlots = [...slots].sort(
    (left, right) =>
      (locationNameById.get(left.location_id) || left.location_id).localeCompare(
        locationNameById.get(right.location_id) || right.location_id,
      ) ||
      getAdminBookingTimeSortValue(left.start_time) -
        getAdminBookingTimeSortValue(right.start_time),
  );

  for (const slot of sortedSlots) {
    const slotBookings = bookingsBySlotId.get(slot.id) ?? [];

    if (!slotBookings.length) {
      continue;
    }

    const locationId = slot.location_id;
    const locationName = locationNameById.get(locationId) || "Unknown location";
    const slotGroup: AdminBookingSlotGroup = {
      bookingCount: slotBookings.length,
      bookings: slotBookings
        .map((booking) => {
          const member = booking.member_id
            ? membersById.get(booking.member_id) ?? null
            : null;
          const memberName = member
            ? getAdminBookingMemberName(member)
            : "Unknown member";
          const email = member?.email || "No email available";

          return {
            bookingId: booking.id,
            email,
            firstName: member?.first_name || "",
            guestCount: booking.guest_count ?? 1,
            lastName: member?.last_name || "",
            memberId: booking.member_id,
            memberName,
            phone: member?.phone || "",
            searchValue: normalizeAdminBookingSearchValue(
              `${member?.first_name || ""} ${member?.last_name || ""} ${email}`,
            ),
          };
        })
        .sort(
          (left, right) =>
            left.memberName.localeCompare(right.memberName) ||
            left.email.localeCompare(right.email),
        ),
      endTime: slot.end_time,
      locationId,
      locationName,
      slotId: slot.id,
      startTime: slot.start_time,
    };
    const existingGroup = groups.get(locationId);

    if (existingGroup) {
      existingGroup.bookingCount += slotGroup.bookingCount;
      existingGroup.slots.push(slotGroup);
      continue;
    }

    groups.set(locationId, {
      bookingCount: slotGroup.bookingCount,
      locationId,
      locationName,
      slots: [slotGroup],
    });
  }

  return Array.from(groups.values()).sort((left, right) =>
    left.locationName.localeCompare(right.locationName),
  );
};

export const filterAdminBookingLocationGroups = (
  groups: AdminBookingLocationGroup[],
  query: string,
  locationId: string,
) => {
  const normalizedQuery = normalizeAdminBookingSearchValue(query);

  return groups
    .filter((group) => !locationId || group.locationId === locationId)
    .map((group) => {
      const filteredSlots = group.slots
        .map((slot) => {
          const filteredBookings = normalizedQuery
            ? slot.bookings.filter((booking) =>
                booking.searchValue.includes(normalizedQuery),
              )
            : slot.bookings;

          if (!filteredBookings.length) {
            return null;
          }

          return {
            ...slot,
            bookingCount: filteredBookings.length,
            bookings: filteredBookings,
          };
        })
        .filter((slot): slot is AdminBookingSlotGroup => Boolean(slot));

      if (!filteredSlots.length) {
        return null;
      }

      return {
        ...group,
        bookingCount: filteredSlots.reduce(
          (sum, slot) => sum + slot.bookingCount,
          0,
        ),
        slots: filteredSlots,
      };
    })
    .filter((group): group is AdminBookingLocationGroup => Boolean(group));
};

export const getAdminBookingCountLookup = (
  counts: AdminBookingCalendarCount[],
  locationId: string,
) => {
  const countLookup = new Map<string, number>();

  for (const count of counts) {
    if (locationId && count.locationId !== locationId) {
      continue;
    }

    countLookup.set(count.date, (countLookup.get(count.date) ?? 0) + count.count);
  }

  return countLookup;
};

export const getPreferredAdminBookingMonth = (
  bookingCountLookup: Map<string, number>,
  fallbackDate: Date = new Date(),
) => {
  const fallbackMonth = getUtcMonthStart(fallbackDate);
  const fallbackMonthKey = toAdminBookingMonthKey(fallbackMonth);
  const sortedDateKeys = Array.from(bookingCountLookup.keys()).sort();

  if (sortedDateKeys.some((dateKey) => dateKey.startsWith(fallbackMonthKey))) {
    return fallbackMonth;
  }

  const firstBookedDate = sortedDateKeys[0];

  return firstBookedDate
    ? getAdminBookingMonthStartFromDateKey(firstBookedDate)
    : fallbackMonth;
};

export const buildAdminBookingCalendarCells = (
  monthStart: Date,
  bookingCountLookup: Map<string, number>,
): AdminBookingCalendarCell[] => {
  const year = monthStart.getUTCFullYear();
  const month = monthStart.getUTCMonth();
  const firstWeekday = monthStart.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: AdminBookingCalendarCell[] = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push({ type: "empty" });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    cells.push({
      bookingCount: bookingCountLookup.get(dateKey) ?? 0,
      dateKey,
      dayNumber: day,
      type: "day",
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ type: "empty" });
  }

  return cells;
};
