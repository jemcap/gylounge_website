"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useState, type FormEvent } from "react";
import {
  labelClass,
  selectClass,
} from "@/components/forms/membership-form-styles";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogSideContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  filterAdminBookingLocationGroups,
  formatAdminBookingCountLabel,
  formatAdminBookingGuestCountLabel,
  formatAdminBookingTimeLabel,
  formatAdminBookingTimeRangeLabel,
  resolveAdminLocationFilter,
  type AdminBookingEditableSlot,
  type AdminBookingLocation,
  type AdminBookingLocationGroup,
} from "@/lib/admin-bookings";

type AdminBookingDateDetailProps = {
  groups: AdminBookingLocationGroup[];
  hasConfiguredSlots: boolean;
  initialLocationId?: string;
  locations: AdminBookingLocation[];
  slots: AdminBookingEditableSlot[];
};

type BookingActionFeedback = {
  message: string;
  tone: "success" | "error";
};

type DrawerMode = "view" | "edit";

type SelectedBookingDetail = {
  booking: AdminBookingLocationGroup["slots"][number]["bookings"][number];
  group: AdminBookingLocationGroup;
  slot: AdminBookingLocationGroup["slots"][number];
};

import { feedbackClassMap } from "@/lib/feedback-styles";

const editDrawerAnimationDurationMs = 300;

function BookingTextField({
  defaultValue,
  label,
  name,
  required = false,
  type = "text",
}: {
  defaultValue: string;
  label: string;
  name: "email" | "first_name" | "last_name" | "phone";
  required?: boolean;
  type?: "email" | "tel" | "text";
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <Input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="bg-white"
      />
    </label>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-[#dcccb8] bg-white px-4 py-3">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#8b6b3f]">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-[#261B07] sm:text-base">
        {value}
      </p>
    </div>
  );
}

const getSelectedBookingDetail = (
  groups: AdminBookingLocationGroup[],
  bookingId: string | null,
): SelectedBookingDetail | null => {
  if (!bookingId) {
    return null;
  }

  for (const group of groups) {
    for (const slot of group.slots) {
      const booking = slot.bookings.find(
        (entry) => entry.bookingId === bookingId,
      );

      if (booking) {
        return { booking, group, slot };
      }
    }
  }

  return null;
};

export function AdminBookingDateDetail({
  groups,
  hasConfiguredSlots,
  initialLocationId = "",
  locations,
  slots,
}: AdminBookingDateDetailProps) {
  const router = useRouter();
  const resolvedInitialLocationId = resolveAdminLocationFilter(
    initialLocationId,
    locations,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState(
    resolvedInitialLocationId,
  );
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("view");
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<BookingActionFeedback | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draftLocationId, setDraftLocationId] = useState("");
  const [draftSlotId, setDraftSlotId] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    setSelectedLocationId(resolvedInitialLocationId);
  }, [resolvedInitialLocationId]);

  useEffect(() => {
    if (isDrawerOpen || !selectedBookingId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSelectedBookingId(null);
      setDrawerMode("view");
    }, editDrawerAnimationDurationMs);

    return () => window.clearTimeout(timeoutId);
  }, [isDrawerOpen, selectedBookingId]);

  const filteredGroups = filterAdminBookingLocationGroups(
    groups,
    deferredSearchQuery,
    selectedLocationId,
  );
  const visibleBookingCount = filteredGroups.reduce(
    (sum, group) => sum + group.bookingCount,
    0,
  );
  const visibleSlotCount = filteredGroups.reduce(
    (sum, group) => sum + group.slots.length,
    0,
  );
  const hasSearchQuery = deferredSearchQuery.trim().length > 0;
  const selectedBookingDetail = getSelectedBookingDetail(groups, selectedBookingId);
  const selectedBooking = selectedBookingDetail?.booking ?? null;
  const selectedGroup = selectedBookingDetail?.group ?? null;
  const selectedSlot = selectedBookingDetail?.slot ?? null;
  const selectedLocationValue = selectedGroup?.locationId ?? "";
  const selectedSlotValue = selectedSlot?.slotId ?? "";
  const availableLocations = locations.filter((location) =>
    slots.some((slot) => slot.location_id === location.id),
  );
  const availableSlotsForLocation = slots
    .filter((slot) => slot.location_id === draftLocationId)
    .sort((left, right) => left.start_time.localeCompare(right.start_time));
  const canEditBooking = Boolean(
    selectedBooking?.memberId && selectedSlot?.slotId && selectedGroup?.locationId,
  );

  useEffect(() => {
    if (drawerMode !== "edit" || !selectedLocationValue || !selectedSlotValue) {
      return;
    }

    setDraftLocationId(selectedLocationValue);
    setDraftSlotId(selectedSlotValue);
  }, [drawerMode, selectedLocationValue, selectedSlotValue]);

  useEffect(() => {
    if (drawerMode !== "edit") {
      return;
    }

    if (!availableSlotsForLocation.length) {
      setDraftSlotId("");
      return;
    }

    if (
      draftSlotId &&
      availableSlotsForLocation.some((slot) => slot.id === draftSlotId)
    ) {
      return;
    }

    setDraftSlotId(availableSlotsForLocation[0]?.id ?? "");
  }, [availableSlotsForLocation, draftSlotId, drawerMode]);

  const handleDialogOpenChange = (open: boolean) => {
    if (!open && !isSaving) {
      setIsDrawerOpen(false);
      setDrawerMode("view");
      setDialogError(null);
    }
  };

  const handleOpenBooking = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setDrawerMode("view");
    setDialogError(null);
    setIsDrawerOpen(true);
  };

  const handleStartEdit = () => {
    if (!canEditBooking || !selectedGroup || !selectedSlot) {
      return;
    }

    setDraftLocationId(selectedGroup.locationId);
    setDraftSlotId(selectedSlot.slotId);
    setDialogError(null);
    setDrawerMode("edit");
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedBookingId) {
      return;
    }

    setIsSaving(true);
    setDialogError(null);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`/api/admin/bookings/${selectedBookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(result?.error || "Booking update failed.");
      }

      router.refresh();
      setFeedback({
        tone: "success",
        message: "Booking details were updated.",
      });
      setIsDrawerOpen(false);
      setDrawerMode("view");
    } catch (error) {
      setDialogError(
        error instanceof Error ? error.message : "Booking update failed.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Card>
        <div className="space-y-4">
          {feedback ? (
            <p
              className={`rounded-2xl border px-4 py-3 text-sm ${feedbackClassMap[feedback.tone]}`}
            >
              {feedback.message}
            </p>
          ) : null}

          <div>
            <label className="block">
              <span className={labelClass}>Search bookings</span>
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by member first name, last name, or email"
                className="bg-white"
              />
            </label>
          </div>

          {filteredGroups.length ? (
            filteredGroups.map((group) => (
              <section
                key={group.locationId}
                className="overflow-hidden rounded-4xl border-3 border-[#8F887D] bg-[#fdfaf4]"
              >
                <div className="border-b-3 border-[#8F887D] bg-white px-4 py-4 sm:px-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <h2 className="text-lg font-semibold text-[#261B07]">
                        {group.locationName}
                      </h2>
                    </div>

                    <p className="rounded-full bg-[#f7ead2] px-4 py-2 text-sm font-medium text-[#5d4a2e]">
                      {formatAdminBookingCountLabel(group.bookingCount)}
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-[#e9dccb]">
                  {group.slots.map((slot) => (
                    <div
                      key={slot.slotId}
                      className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(12rem,14rem)_minmax(0,1fr)] lg:px-5"
                    >
                      <div className="space-y-2">
                        <p className="text-base font-semibold text-[#261B07]">
                          {formatAdminBookingTimeRangeLabel(
                            slot.startTime,
                            slot.endTime,
                          )}
                        </p>
                        <p className="text-sm text-[#5c5348]">
                          {formatAdminBookingCountLabel(slot.bookingCount)}
                        </p>
                      </div>

                      <div className="space-y-3">
                        {slot.bookings.map((booking) => (
                          <button
                            key={booking.bookingId}
                            type="button"
                            onClick={() => handleOpenBooking(booking.bookingId)}
                            className="w-full rounded-3xl border border-[#dcccb8] bg-white px-4 py-3 text-left transition hover:border-[#8f887d] hover:bg-[#fffdfa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3f2d17] focus-visible:ring-offset-2"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="space-y-1">
                                <p className="font-semibold text-[#1c1b18]">
                                  {booking.memberName}
                                </p>
                                <p className="text-sm text-[#5c5348]">
                                  {booking.email}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {booking.guestCount > 1 ? (
                                  <span className="inline-flex w-fit rounded-full bg-[#f1ede5] px-3 py-1 text-sm font-medium text-[#5d4a2e]">
                                    {formatAdminBookingGuestCountLabel(
                                      booking.guestCount,
                                    )}
                                  </span>
                                ) : null}

                                <span className="inline-flex rounded-full bg-[#f7ead2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#5d4a2e]">
                                  View booking
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="rounded-4xl border-3 border-[#8F887D] bg-[#fdfaf4] px-4 py-6 text-sm text-[#5c5348]">
              {hasSearchQuery
                ? "No bookings match that search for the selected date."
                : !hasConfiguredSlots
                  ? "No slots are configured for this date yet."
                  : "No booked slots match the current location filter."}
            </div>
          )}
        </div>
      </Card>

      <Dialog open={isDrawerOpen} onOpenChange={handleDialogOpenChange}>
        {selectedBooking && selectedGroup && selectedSlot ? (
          <DialogSideContent>
            <button
              type="button"
              aria-label="Close booking panel"
              className="absolute right-4 top-6 inline-flex h-9 w-9 items-center justify-center rounded-full text-[#261B07] transition hover:bg-[#eee8dd]"
              onClick={() => handleDialogOpenChange(false)}
              disabled={isSaving}
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>

            <DialogHeader className="pr-12">
              <DialogTitle className="text-[#261B07]">
                {drawerMode === "view" ? "Booking Details" : "Edit Booking"}
              </DialogTitle>
              <DialogDescription className="text-sm text-[#5f5240] sm:text-sm">
                {drawerMode === "view"
                  ? "Review the selected booking details before making any changes."
                  : "Update the selected booking and the linked member contact details for this date."}
              </DialogDescription>
            </DialogHeader>

            {drawerMode === "view" ? (
              <div className="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden rounded-4xl bg-[#f8f4eb] p-4 text-[#261B07] sm:p-6">
                {dialogError ? (
                  <p
                    className={`rounded-2xl border px-4 py-3 text-sm ${feedbackClassMap.error}`}
                  >
                    {dialogError}
                  </p>
                ) : null}

                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                  <div className="grid gap-4">
                    <DetailField label="Booking ID" value={selectedBooking.bookingId} />
                    <DetailField
                      label="Time booked"
                      value={formatAdminBookingTimeLabel(selectedSlot.startTime)}
                    />
                    <DetailField
                      label="First name"
                      value={selectedBooking.firstName || "Unavailable"}
                    />
                    <DetailField
                      label="Last name"
                      value={selectedBooking.lastName || "Unavailable"}
                    />
                    <DetailField label="Email" value={selectedBooking.email} />
                    <DetailField
                      label="Phone number"
                      value={selectedBooking.phone || "Unavailable"}
                    />
                    <DetailField
                      label="Number of guests"
                      value={String(selectedBooking.guestCount)}
                    />
                    <DetailField
                      label="Location booked"
                      value={selectedGroup.locationName}
                    />
                  </div>

                  {!canEditBooking ? (
                    <p className="mt-4 rounded-2xl border border-[#dcccb8] bg-white px-4 py-3 text-sm text-[#5c5348]">
                      This booking cannot be edited because its linked member or
                      slot record is unavailable.
                    </p>
                  ) : null}
                </div>

                <div className="mt-4 border-t border-[#dcccb8] pt-4">
                  <DialogFooter className="mt-0 flex-col gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      className="min-h-11 w-full px-5 py-2 font-semibold"
                      onClick={() => handleDialogOpenChange(false)}
                    >
                      Close
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      className="min-h-11 w-full px-5 py-2 font-semibold"
                      onClick={handleStartEdit}
                      disabled={!canEditBooking}
                    >
                      Edit booking
                    </Button>
                  </DialogFooter>
                </div>
              </div>
            ) : (
              <form
                key={`${selectedBooking.bookingId}-${drawerMode}`}
                onSubmit={handleSave}
                className="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden rounded-4xl bg-[#f8f4eb] p-4 text-[#261B07] sm:p-6"
              >
                {dialogError ? (
                  <p
                    className={`rounded-2xl border px-4 py-3 text-sm ${feedbackClassMap.error}`}
                  >
                    {dialogError}
                  </p>
                ) : null}

                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      <BookingTextField
                        name="first_name"
                        label="First name"
                        defaultValue={selectedBooking.firstName}
                        required
                      />
                      <BookingTextField
                        name="last_name"
                        label="Last name"
                        defaultValue={selectedBooking.lastName}
                        required
                      />
                      <BookingTextField
                        name="email"
                        label="Email"
                        defaultValue={selectedBooking.email}
                        type="email"
                        required
                      />
                      <BookingTextField
                        name="phone"
                        label="Phone number"
                        defaultValue={selectedBooking.phone}
                        type="tel"
                      />
                      <label className="block">
                        <span className={labelClass}>Number of guests</span>
                        <Input
                          name="guest_count"
                          type="number"
                          min={1}
                          max={10}
                          required
                          defaultValue={String(selectedBooking.guestCount)}
                          className="bg-white"
                        />
                      </label>
                      <label className="block">
                        <span className={labelClass}>Location booked</span>
                        <select
                          name="location_id"
                          value={draftLocationId}
                          onChange={(event) =>
                            setDraftLocationId(event.target.value)
                          }
                          className={`${selectClass} min-h-[50px] bg-white`}
                        >
                          {availableLocations.map((location) => (
                            <option key={location.id} value={location.id}>
                              {location.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className={labelClass}>Time booked</span>
                        <select
                          name="slot_id"
                          value={draftSlotId}
                          onChange={(event) => setDraftSlotId(event.target.value)}
                          className={`${selectClass} min-h-[50px] bg-white`}
                        >
                          {availableSlotsForLocation.map((slotOption) => (
                            <option key={slotOption.id} value={slotOption.id}>
                              {formatAdminBookingTimeRangeLabel(
                                slotOption.start_time,
                                slotOption.end_time,
                              )}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-[#dcccb8] pt-4">
                  <DialogFooter className="mt-0 flex-col gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      className="min-h-11 w-full px-5 py-2 font-semibold"
                      onClick={() => {
                        setDialogError(null);
                        setDrawerMode("view");
                        setDraftLocationId(selectedLocationValue);
                        setDraftSlotId(selectedSlotValue);
                      }}
                      disabled={isSaving}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="min-h-11 w-full px-5 py-2 font-semibold"
                      disabled={isSaving || !draftSlotId || !draftLocationId}
                    >
                      {isSaving ? "Saving..." : "Save booking"}
                    </Button>
                  </DialogFooter>
                </div>
              </form>
            )}
          </DialogSideContent>
        ) : null}
      </Dialog>
    </>
  );
}
