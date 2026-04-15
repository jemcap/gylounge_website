import { AdminBookingDateDetail } from "@/components/admin/AdminBookingDateDetail";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  buildAdminBookingLocationGroups,
  formatAdminBookingDateLabel,
  isAdminBookingDateKey,
} from "@/lib/admin-bookings";
import { requireAdminUser } from "@/lib/admin-session";
import { supabaseAdminClient } from "@/lib/supabase";

type AdminBookingDateDetailPageProps = {
  params: Promise<{
    date: string;
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

const getSingleSearchParam = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
};

export default async function AdminBookingDateDetailPage({
  params,
  searchParams,
}: AdminBookingDateDetailPageProps) {
  const adminUser = await requireAdminUser();
  const { date } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const initialLocationId = getSingleSearchParam(
    resolvedSearchParams.locationId,
  );
  const formattedDate = formatAdminBookingDateLabel(date);
  const isValidDate = isAdminBookingDateKey(date);
  const supabase = supabaseAdminClient();
  const { data: locations, error: locationsError } = await supabase
    .from("locations")
    .select("id, name")
    .order("name");

  let slots:
    | {
        date: string;
        end_time: string;
        id: string;
        location_id: string;
        start_time: string;
      }[]
    | null = [];
  let bookings:
    | {
        guest_count: number;
        id: string;
        location_id: string;
        member_id: string | null;
        slot_id: string | null;
      }[]
    | null = [];
  let members:
    | {
        email: string;
        first_name: string | null;
        id: string;
        last_name: string | null;
        phone: string | null;
      }[]
    | null = [];
  let slotsError: unknown = null;
  let bookingsError: unknown = null;
  let membersError: unknown = null;

  if (isValidDate) {
    const slotsResponse = await supabase
      .from("slots")
      .select("id, date, start_time, end_time, location_id")
      .eq("date", date)
      .order("start_time");

    slots = slotsResponse.data;
    slotsError = slotsResponse.error;

    const slotIds = (slotsResponse.data ?? []).map((slot) => slot.id);

    if (slotIds.length) {
      const bookingsResponse = await supabase
        .from("bookings")
        .select("id, guest_count, location_id, member_id, slot_id")
        .in("slot_id", slotIds);

      bookings = bookingsResponse.data;
      bookingsError = bookingsResponse.error;

      const memberIds = Array.from(
        new Set(
          (bookingsResponse.data ?? [])
            .map((booking) => booking.member_id)
            .filter((memberId): memberId is string => Boolean(memberId)),
        ),
      );

      if (memberIds.length) {
        const membersResponse = await supabase
          .from("members")
          .select("id, first_name, last_name, email, phone")
          .in("id", memberIds);

        members = membersResponse.data;
        membersError = membersResponse.error;
      }
    }
  }

  if (locationsError || slotsError || bookingsError || membersError) {
    console.error("Admin booking detail page failed to load date data", {
      bookingsError,
      locationsError,
      membersError,
      slotsError,
    });
  }

  const groups = buildAdminBookingLocationGroups(
    locations ?? [],
    slots ?? [],
    bookings ?? [],
    members ?? [],
  );

  return (
    <AdminShell
      currentPath="/admin/bookings"
      title={formattedDate}
    >
      {!isValidDate ? (
        <div className="rounded-2xl border border-[#c97e6a] bg-[#fff0ec] px-4 py-3 text-sm text-[#7a2d1e]">
          The selected booking date is invalid. Open the bookings calendar and
          choose a valid date.
        </div>
      ) : null}

      {isValidDate &&
      (locationsError || slotsError || bookingsError || membersError) ? (
        <div className="rounded-2xl border border-[#c97e6a] bg-[#fff0ec] px-4 py-3 text-sm text-[#7a2d1e]">
          Booking detail data is temporarily unavailable. Reload the page after
          the underlying data issue is resolved.
        </div>
      ) : null}

      {isValidDate ? (
        <AdminBookingDateDetail
          groups={groups}
          hasConfiguredSlots={Boolean(slots?.length)}
          initialLocationId={initialLocationId}
          locations={locations ?? []}
          slots={slots ?? []}
        />
      ) : null}
    </AdminShell>
  );
}
