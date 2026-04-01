import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { requireAdminUser } from "@/lib/admin-session";

export default async function AdminBookingsPage() {
  const adminUser = await requireAdminUser();

  return (
    <AdminShell
      currentPath="/admin/bookings"
      description="Phase 2 adds the shared admin shell. Calendar counts, date detail views, and booking edits remain later booking-management phases."
      email={adminUser.email}
      title="Bookings"
    ></AdminShell>
  );
}
