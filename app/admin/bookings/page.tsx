import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { requireAdminUser } from "@/lib/admin-session";

export default async function AdminBookingsPage() {
  const adminUser = await requireAdminUser();

  return (
    <AdminShell
      currentPath="/admin/bookings"
      description="This route is now protected. Calendar counts, date detail views, and booking edits are still pending."
      email={adminUser?.email}
      title="Admin bookings"
    >
      <Card
        title="Booking management placeholder"
        description="Booking oversight, date navigation, and amendment actions will be added in the later admin phases."
      >
        <p className="text-sm text-[#3b3127]">Phase 1 is limited to auth, recovery, and route protection.</p>
      </Card>
    </AdminShell>
  );
}
