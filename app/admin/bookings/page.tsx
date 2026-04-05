import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminBookingsPage() {

  return (
    <AdminShell
      currentPath="/admin/bookings"
      description="Phase 2 adds the shared admin shell. Calendar counts, date detail views, and booking edits remain later booking-management phases."
      title="Bookings"
    ></AdminShell>
  );
}
