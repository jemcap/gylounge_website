import { AdminBookingsCalendar } from "@/components/admin/AdminBookingsCalendar";
import { AdminShell } from "@/components/admin/AdminShell";
import { buildAdminBookingCalendarCounts } from "@/lib/admin-bookings";
import { supabaseAdminClient } from "@/lib/supabase";

type AdminBookingsPageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

const getSingleSearchParam = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
};

export default async function AdminBookingsPage({
  searchParams,
}: AdminBookingsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const initialLocationId = getSingleSearchParam(
    resolvedSearchParams.locationId,
  );
  const supabase = supabaseAdminClient();
  const [
    { data: locations, error: locationsError },
    { data: slots, error: slotsError },
    { data: bookings, error: bookingsError },
  ] = await Promise.all([
    supabase.from("locations").select("id, name").order("name"),
    supabase.from("slots").select("id, date, location_id"),
    supabase.from("bookings").select("id, location_id, slot_id"),
  ]);

  if (locationsError || slotsError || bookingsError) {
    console.error("Admin bookings page failed to load calendar data", {
      bookingsError,
      locationsError,
      slotsError,
    });
  }

  const bookingCounts = buildAdminBookingCalendarCounts(
    bookings ?? [],
    slots ?? [],
  );

  return (
    <AdminShell
      currentPath="/admin/bookings"
      description="View booking counts by date and filter the calendar by location."
      title="Bookings"
    >
      {locationsError || slotsError || bookingsError ? (
        <div className="rounded-2xl border border-[#c97e6a] bg-[#fff0ec] px-4 py-3 text-sm text-[#7a2d1e]">
          Booking calendar data is temporarily unavailable. Reload the page
          after the underlying data issue is resolved.
        </div>
      ) : null}

      <AdminBookingsCalendar
        bookingCounts={bookingCounts}
        initialLocationId={initialLocationId}
        locations={locations ?? []}
      />
    </AdminShell>
  );
}
