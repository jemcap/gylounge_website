"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { labelClass, selectClass } from "@/components/forms/membership-form-styles";
import { Card } from "@/components/ui/card";
import {
  addAdminBookingMonths,
  buildAdminBookingCalendarCells,
  formatAdminBookingCountLabel,
  formatAdminBookingDateLabel,
  formatAdminBookingMonthLabel,
  getAdminBookingCountLookup,
  getPreferredAdminBookingMonth,
  resolveAdminLocationFilter,
  type AdminBookingCalendarCount,
  type AdminBookingLocation,
} from "@/lib/admin-bookings";

type AdminBookingsCalendarProps = {
  bookingCounts: AdminBookingCalendarCount[];
  initialLocationId?: string;
  locations: AdminBookingLocation[];
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getUtcDateKey = (value: Date) =>
  `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}-${String(value.getUTCDate()).padStart(2, "0")}`;

export function AdminBookingsCalendar({
  bookingCounts,
  initialLocationId = "",
  locations,
}: AdminBookingsCalendarProps) {
  const resolvedInitialLocationId = useMemo(
    () => resolveAdminLocationFilter(initialLocationId, locations),
    [initialLocationId, locations],
  );
  const [selectedLocationId, setSelectedLocationId] = useState(
    resolvedInitialLocationId,
  );
  const bookingCountLookup = useMemo(
    () => getAdminBookingCountLookup(bookingCounts, selectedLocationId),
    [bookingCounts, selectedLocationId],
  );
  const [visibleMonth, setVisibleMonth] = useState(() =>
    getPreferredAdminBookingMonth(
      getAdminBookingCountLookup(bookingCounts, resolvedInitialLocationId),
    ),
  );

  useEffect(() => {
    setSelectedLocationId(resolvedInitialLocationId);
  }, [resolvedInitialLocationId]);

  useEffect(() => {
    setVisibleMonth(getPreferredAdminBookingMonth(bookingCountLookup));
  }, [bookingCountLookup]);

  const calendarCells = useMemo(
    () => buildAdminBookingCalendarCells(visibleMonth, bookingCountLookup),
    [bookingCountLookup, visibleMonth],
  );
  const totalBookings = useMemo(
    () =>
      Array.from(bookingCountLookup.values()).reduce(
        (sum, count) => sum + count,
        0,
      ),
    [bookingCountLookup],
  );
  const datesWithBookings = bookingCountLookup.size;
  const selectedLocationName =
    locations.find((location) => location.id === selectedLocationId)?.name ||
    "All locations";
  const todayDateKey = useMemo(() => getUtcDateKey(new Date()), []);

  const currentMonthHasBookings = calendarCells.some(
    (cell) => cell.type === "day" && cell.bookingCount > 0,
  );

  const createDateHref = (dateKey: string) => {
    const searchParams = new URLSearchParams();

    if (selectedLocationId) {
      searchParams.set("locationId", selectedLocationId);
    }

    const query = searchParams.toString();

    return query
      ? `/admin/bookings/${dateKey}?${query}`
      : `/admin/bookings/${dateKey}`;
  };

  return (
    <Card>
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <label className="block max-w-sm">
            <span className={labelClass}>Location</span>
            <select
              value={selectedLocationId}
              onChange={(event) => setSelectedLocationId(event.target.value)}
              className={`${selectClass} bg-white`}
            >
              <option value="">All locations</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </label>

          <p className="rounded-2xl bg-[#f1ede5] px-4 py-3 text-sm text-[#5c5348]">
            {formatAdminBookingCountLabel(totalBookings)} across {datesWithBookings}{" "}
            {datesWithBookings === 1 ? "date" : "dates"}
          </p>
        </div>

        <div className="overflow-hidden rounded-4xl border-3 border-[#8F887D] bg-[#fdfaf4]">
          <div className="border-b-3 border-[#8F887D] bg-white px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-lg font-semibold text-[#261B07]">
                  {formatAdminBookingMonthLabel(visibleMonth)}
                </p>
                <p className="text-sm text-[#5c5348]">
                  {selectedLocationId
                    ? `Showing ${selectedLocationName}`
                    : "Showing all locations"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVisibleMonth((current) => addAdminBookingMonths(current, -1))}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d7c7b2] px-4 py-2 text-sm font-medium text-[#1c1b18] transition hover:bg-[#f6efe3]"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setVisibleMonth((current) => addAdminBookingMonths(current, 1))}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d7c7b2] px-4 py-2 text-sm font-medium text-[#1c1b18] transition hover:bg-[#f6efe3]"
                >
                  Next
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-7 gap-2 text-center text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#7d6c54] sm:text-xs">
              {weekdayLabels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2">
              {calendarCells.map((cell, index) => {
                if (cell.type === "empty") {
                  return (
                    <span
                      key={`empty-${index}`}
                      className="min-h-16 rounded-2xl sm:min-h-24"
                    />
                  );
                }

                const hasBookings = cell.bookingCount > 0;
                const isToday = cell.dateKey === todayDateKey;

                return (
                  <Link
                    key={cell.dateKey}
                    href={createDateHref(cell.dateKey)}
                    className={[
                      "flex min-h-16 flex-col justify-between rounded-2xl border px-2 py-2 text-left transition sm:min-h-24 sm:px-3 sm:py-3",
                      hasBookings
                        ? "border-[#3F2D17] bg-[#f7ead2] text-[#261B07] hover:bg-[#f2e3c0]"
                        : "border-[#d9ccb8] bg-white text-[#5c5348] hover:border-[#8b6b3f] hover:bg-[#faf5ec]",
                      isToday
                        ? "ring-2 ring-[#8b6b3f] ring-offset-2 ring-offset-[#fdfaf4]"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-label={`${formatAdminBookingDateLabel(cell.dateKey)}. ${formatAdminBookingCountLabel(cell.bookingCount)}.`}
                  >
                    <span className="text-xs font-semibold sm:text-sm">
                      {cell.dayNumber}
                    </span>
                    <span className="space-y-0.5">
                      <span className="block text-sm font-semibold sm:text-lg">
                        {cell.bookingCount}
                      </span>
                      <span className="hidden text-[0.65rem] text-[#5c5348] sm:block">
                        {cell.bookingCount === 1 ? "booking" : "bookings"}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>

            {!datesWithBookings ? (
              <p className="mt-4 text-sm text-[#5c5348]">
                No bookings are currently saved for {selectedLocationName.toLowerCase()}.
              </p>
            ) : !currentMonthHasBookings ? (
              <p className="mt-4 text-sm text-[#5c5348]">
                No bookings are scheduled in this month for{" "}
                {selectedLocationId
                  ? selectedLocationName
                  : "the current location filter"}.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
