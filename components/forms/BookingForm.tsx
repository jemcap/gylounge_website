"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { createBookingIdempotencyKey } from "@/lib/booking-idempotency";
import type { BookingConfirmation } from "@/lib/booking-confirmation";
import type {
  AvailableSlot,
  BookableLocation,
} from "@/app/home/home-page-helpers";
import { formatAccraDate, formatAccraTime } from "@/app/home/home-page-helpers";
import { BookingConfirmationModal } from "@/app/home/components/BookingConfirmationModal";
import {
  bookingFormSchema,
  createBookingSubmission,
  defaultBookingFormValues,
  type BookingFormValues,
} from "@/lib/booking-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FormAction = string | ((formData: FormData) => void | Promise<void>);

type BookingFeedback = {
  tone: "success" | "error" | "info";
  message: string;
};

type LocationDateOption = {
  date: string;
  slots: AvailableSlot[];
};

export type BookingFormProps = {
  bookingConfirmation?: BookingConfirmation | null;
  locations: BookableLocation[];
  slots: AvailableSlot[];
  action?: FormAction;
  feedback?: BookingFeedback;
  context?: string;
};

import { feedbackClassMap } from "@/lib/feedback-styles";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const sectionHeadingClass = "text-[48px] font-serif italic text-[#261B07]";
const helperTextClass = "text-sm text-[#5f5240]";
const errorTextClass = "mt-2 text-sm text-[#8b2e2a]";

const toMonthKey = (value: Date) =>
  `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}`;

const monthKeyToUtcDate = (monthKey: string) =>
  new Date(`${monthKey}-01T00:00:00.000Z`);

const getMonthStartFromDateKey = (dateKey: string) =>
  monthKeyToUtcDate(dateKey.slice(0, 7));

const addMonths = (value: Date, amount: number) =>
  new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth() + amount, 1));

const formatMonthLabel = (value: Date) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Accra",
    month: "long",
    year: "numeric",
  }).format(value);

const getSlotSortValue = (raw: string) => {
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

const getInitialSelection = (
  locations: BookableLocation[],
  locationDateMap: Map<string, LocationDateOption[]>,
) => {
  const firstBookableLocation =
    locations.find(
      (location) => (locationDateMap.get(location.id) ?? []).length > 0,
    ) ?? locations[0];
  const firstLocationId = firstBookableLocation?.id ?? "";
  const firstDate = (locationDateMap.get(firstLocationId) ?? [])[0];
  const firstSlot = firstDate?.slots[0];

  return {
    locationId: firstLocationId,
    date: firstDate?.date ?? "",
    slotId: firstSlot?.id ?? "",
  };
};

const buildCalendarCells = (
  monthStart: Date,
  availableDateLookup: Set<string>,
) => {
  const year = monthStart.getUTCFullYear();
  const month = monthStart.getUTCMonth();
  const firstWeekday = monthStart.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const cells: Array<
    | { type: "empty" }
    | { type: "day"; dateKey: string; dayNumber: number; isAvailable: boolean }
  > = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push({ type: "empty" });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({
      type: "day",
      dateKey,
      dayNumber: day,
      isAvailable: availableDateLookup.has(dateKey),
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ type: "empty" });
  }

  return cells;
};

export function BookingForm({
  bookingConfirmation,
  locations,
  slots,
  action = "#",
  feedback,
}: BookingFormProps) {
  const locationDateMap = useMemo(() => {
    const map = new Map<string, LocationDateOption[]>();

    for (const slot of slots) {
      const locationDates = map.get(slot.locationId) ?? [];
      const existingDate = locationDates.find(
        (entry) => entry.date === slot.date,
      );

      if (existingDate) {
        existingDate.slots = [...existingDate.slots, slot].sort(
          (left, right) =>
            getSlotSortValue(left.startTime) -
            getSlotSortValue(right.startTime),
        );
      } else {
        locationDates.push({
          date: slot.date,
          slots: [slot],
        });
        locationDates.sort((left, right) =>
          left.date.localeCompare(right.date),
        );
      }

      map.set(slot.locationId, locationDates);
    }

    return map;
  }, [slots]);
  const initialSelection = useMemo(
    () => getInitialSelection(locations, locationDateMap),
    [locations, locationDateMap],
  );
  const [clientFeedback, setClientFeedback] = useState<BookingFeedback | null>(
    null,
  );
  const [bookingIdempotencyKey] = useState(createBookingIdempotencyKey);
  const [selectedDate, setSelectedDate] = useState(initialSelection.date);
  const [visibleMonth, setVisibleMonth] = useState(
    initialSelection.date
      ? getMonthStartFromDateKey(initialSelection.date)
      : new Date(
          Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1),
        ),
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: defaultBookingFormValues({
      locationId: initialSelection.locationId,
      slotId: initialSelection.slotId,
    }),
  });

  const activeFeedback = clientFeedback ?? feedback;
  const selectedLocationId = watch("locationId");
  const selectedSlotId = watch("slotId");
  const selectedLocationDates = locationDateMap.get(selectedLocationId) ?? [];
  const selectedDateEntry =
    selectedLocationDates.find((entry) => entry.date === selectedDate) ?? null;
  const monthKeys = Array.from(
    new Set(selectedLocationDates.map((entry) => entry.date.slice(0, 7))),
  );
  const availableDateLookup = new Set(
    selectedLocationDates.map((entry) => entry.date),
  );
  const calendarCells = buildCalendarCells(visibleMonth, availableDateLookup);
  const slotErrorMessage = errors.slotId?.message;
  const hasSelectableSlots = Boolean(selectedDateEntry?.slots.length);
  const canSubmit = Boolean(
    selectedLocationId && selectedDate && selectedSlotId && hasSelectableSlots,
  );
  const activeMonthKey = toMonthKey(visibleMonth);
  const canGoToPreviousMonth = monthKeys.indexOf(activeMonthKey) > 0;
  const canGoToNextMonth =
    monthKeys.length > 0 &&
    monthKeys.indexOf(activeMonthKey) < monthKeys.length - 1;

  const selectDate = (dateKey: string, shouldValidate = true) => {
    const nextDateEntry = selectedLocationDates.find(
      (entry) => entry.date === dateKey,
    );
    const nextSlot = nextDateEntry?.slots[0];

    setSelectedDate(dateKey);
    setVisibleMonth(getMonthStartFromDateKey(dateKey));
    setValue("slotId", nextSlot?.id ?? "", {
      shouldDirty: true,
      shouldValidate,
    });
  };

  const selectLocation = (locationId: string) => {
    const nextLocationDates = locationDateMap.get(locationId) ?? [];
    const nextDate = nextLocationDates[0]?.date ?? "";
    const nextSlot = nextLocationDates[0]?.slots[0];

    setClientFeedback(null);
    setValue("locationId", locationId, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setSelectedDate(nextDate);
    setVisibleMonth(
      nextDate
        ? getMonthStartFromDateKey(nextDate)
        : new Date(
            Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1),
          ),
    );
    setValue("slotId", nextSlot?.id ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const selectSlot = (slot: AvailableSlot) => {
    setClientFeedback(null);
    setValue("slotId", slot.id, { shouldDirty: true, shouldValidate: true });
  };

  const stepMonth = (direction: -1 | 1) => {
    const nextMonth = addMonths(visibleMonth, direction);
    const nextMonthKey = toMonthKey(nextMonth);

    if (!monthKeys.includes(nextMonthKey)) {
      return;
    }

    const firstDateInMonth = selectedLocationDates.find((entry) =>
      entry.date.startsWith(nextMonthKey),
    );

    if (firstDateInMonth) {
      selectDate(firstDateInMonth.date, false);
      return;
    }

    setVisibleMonth(nextMonth);
  };

  const onSubmit = handleSubmit(async (values) => {
    setClientFeedback(null);

    if (typeof action !== "function") {
      setClientFeedback({
        tone: "info",
        message:
          "This page is still using placeholder submission wiring. Use the live home booking flow to submit a booking.",
      });
      return;
    }

    await action(createBookingSubmission(values, bookingIdempotencyKey));
  });

  return (
    <Card className="bg-[#DBD1B9]">
      {bookingConfirmation ? (
        <BookingConfirmationModal confirmation={bookingConfirmation} />
      ) : null}
      {activeFeedback ? (
        <p
          className={`mb-4 rounded-xl border px-4 py-3 text-sm ${feedbackClassMap[activeFeedback.tone]}`}
        >
          {activeFeedback.message}
        </p>
      ) : null}

      <form noValidate onSubmit={onSubmit} className="space-y-2">
        <input type="hidden" {...register("locationId")} />
        <input type="hidden" {...register("slotId")} />

        <section className="p-5">
          <div>
            <div>
              <h3 className={sectionHeadingClass}>Select a Location</h3>
            </div>

            <label className="block">
              <select
                value={selectedLocationId}
                onChange={(event) => selectLocation(event.target.value)}
                className="w-full rounded-full border-3 border-[#3F2D17] bg-[#DBD1B9] px-4 py-3 text-sm text-[#1c1b18] outline-none transition focus:border-[#8b6b3f]"
              >
                <option value="">Choose a location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </label>

            {errors.locationId?.message ? (
              <p className={errorTextClass}>{errors.locationId.message}</p>
            ) : null}
          </div>
        </section>

        <section className="p-5">
          <div className="space-y-4">
            <div>
              <h3 className={sectionHeadingClass}>
                Choose a Date &amp; Time Slot
              </h3>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
              <div className="rounded-[1.75rem] p-3">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => stepMonth(-1)}
                    disabled={!canGoToPreviousMonth}
                    className="rounded-full border border-[#d7c7b2] px-3 py-2 text-sm font-medium text-[#1c1b18] transition hover:bg-[#f6efe3] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <p className="text-sm font-semibold text-[#261B07]">
                    {formatMonthLabel(visibleMonth)}
                  </p>
                  <button
                    type="button"
                    onClick={() => stepMonth(1)}
                    disabled={!canGoToNextMonth}
                    className="rounded-full border border-[#d7c7b2] px-3 py-2 text-sm font-medium text-[#1c1b18] transition hover:bg-[#f6efe3] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>

                <div className="grid w-full grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#7d6c54]">
                  {weekdayLabels.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>

                <div className="mt-2 grid w-full grid-cols-7 gap-2">
                  {calendarCells.map((cell, index) => {
                    if (cell.type === "empty") {
                      return (
                        <span
                          key={`empty-${index}`}
                          className="aspect-square w-full"
                        />
                      );
                    }

                    const isSelected = cell.dateKey === selectedDate;

                    return (
                      <button
                        key={cell.dateKey}
                        type="button"
                        onClick={() => selectDate(cell.dateKey)}
                        disabled={!cell.isAvailable}
                        className={[
                          "aspect-square w-full rounded-full border p-0 text-xs font-semibold transition",
                          cell.isAvailable
                            ? "border-[#3F2D17] border-3 text-[#261B07] hover:border-[#8b6b3f]"
                            : "bg-transparent border-3  text-[#b4a58f]",
                          isSelected
                            ? "border-[#3F2D17] bg-[#3F2D17] text-[#F1D39B]"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        aria-pressed={isSelected}
                        aria-label={formatAccraDate(cell.dateKey)}
                      >
                        {cell.dayNumber}
                      </button>
                    );
                  })}
                </div>

                {!selectedLocationDates.length ? (
                  <p className="mt-4 text-sm text-[#8b2e2a]">
                    No available booking dates have been configured for this
                    location yet.
                  </p>
                ) : null}
              </div>

              <div className="rounded-4xl  p-4">
                <div className="mb-4">
                  <p className="text-2xl text-[#261B07]">
                    {selectedDateEntry
                      ? formatAccraDate(selectedDateEntry.date)
                      : "Choose a date"}
                  </p>
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {selectedDateEntry?.slots.map((slot) => {
                    const isSelected = selectedSlotId === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => selectSlot(slot)}
                        className={[
                          "flex min-h-12.5 w-full shrink-0 items-center justify-between rounded-full border px-4 py-3 text-sm transition sm:w-[10rem] sm:flex-col sm:justify-center sm:gap-1",
                          isSelected
                            ? "border-[#3F2D17] bg-[#3F2D17] text-[#F1D39B]"
                            : "border-[#3F2D17] border-3 text-[#261B07] hover:border-[#8b6b3f]",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        aria-pressed={isSelected}
                      >
                        <span className="font-semibold">
                          {formatAccraTime(slot.startTime)}
                        </span>
                        <span
                          className={[
                            "text-xs sm:text-xs",
                            isSelected ? "text-[#f7e6bf]" : "text-[#5f5240]",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {slot.availableSpots} spot
                          {slot.availableSpots === 1 ? "" : "s"} left
                        </span>
                      </button>
                    );
                  })}
                </div>

                {!selectedDateEntry ? (
                  <p className="mt-4 text-sm text-[#5f5240]">
                    Select one of the highlighted dates to see the time slots
                    for this location.
                  </p>
                ) : null}
              </div>
            </div>

            {slotErrorMessage ? (
              <p className={errorTextClass}>{slotErrorMessage}</p>
            ) : null}
          </div>
        </section>

        <section className="p-5">
          <div className="space-y-4">
            <div>
              <h3 className={sectionHeadingClass}>Your Details</h3>
              <p className={helperTextClass}>
                We use these details to verify your membership and send booking
                confirmations.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#1c1b18]">
                  First Name *
                </span>
                <Input placeholder="Ama" {...register("firstName")} required />
                {errors.firstName?.message ? (
                  <p className={errorTextClass}>{errors.firstName.message}</p>
                ) : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#1c1b18]">
                  Last Name *
                </span>
                <Input
                  placeholder="Mensah"
                  {...register("lastName")}
                  required
                />
                {errors.lastName?.message ? (
                  <p className={errorTextClass}>{errors.lastName.message}</p>
                ) : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#1c1b18]">
                  Email Address *
                </span>
                <Input
                  type="email"
                  placeholder="ama@example.com"
                  {...register("email")}
                  required
                />
                {errors.email?.message ? (
                  <p className={errorTextClass}>{errors.email.message}</p>
                ) : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#1c1b18]">
                  Phone Number *
                </span>
                <Input
                  placeholder="+233 24 000 0000"
                  {...register("phone")}
                  required
                />
                {errors.phone?.message ? (
                  <p className={errorTextClass}>{errors.phone.message}</p>
                ) : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#1c1b18]">
                  Number of Guests
                </span>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  {...register("numberOfGuests", { valueAsNumber: true })}
                />
                {errors.numberOfGuests?.message ? (
                  <p className={errorTextClass}>
                    {errors.numberOfGuests.message}
                  </p>
                ) : null}
              </label>
            </div>

            <Button
              type="submit"
              variant="action"
              className="w-full cursor-pointer py-2 text-2xl"
              disabled={isSubmitting || !canSubmit}
            >
              {isSubmitting ? "Submitting..." : "Continue to confirmation"}
            </Button>
          </div>
        </section>
      </form>
    </Card>
  );
}
