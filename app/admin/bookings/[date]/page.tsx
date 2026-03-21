import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { requireAdminUser } from "@/lib/admin-session";

type AdminBookingDateDetailPageProps = {
  params: Promise<{
    date: string;
  }>;
};

export default async function AdminBookingDateDetailPage({
  params,
}: AdminBookingDateDetailPageProps) {
  const adminUser = await requireAdminUser();
  const { date } = await params;

  return (
    <AdminShell
      currentPath="/admin/bookings"
      description="Phase 1 adds auth and route protection. Booking date detail management lands in the next admin slices."
      email={adminUser.email}
      title={`Bookings for ${date}`}
    >
      <Card
        title="Booking detail placeholder"
        description="This route now exists so the protected booking detail flow can be wired in phase 1."
      >
        <p className="text-sm text-[#3b3127]">
          Booking groups, slot detail, and amendment actions will be added in later admin phases.
        </p>
      </Card>
    </AdminShell>
  );
}
