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
      description="The shared Phase 2 admin shell now wraps this route, while booking date detail management still lands in later booking phases."
      email={adminUser.email}
      title={`Bookings for ${date}`}
    >
      <Card
        title="Booking detail placeholder"
        description="This protected route now shares the admin shell, but slot grouping and booking amendment tools are still pending."
        className="bg-white/80"
      >
        <p className="text-sm text-[#3b3127]">
          Booking groups, slot detail, and amendment actions will be added in later admin phases.
        </p>
      </Card>
    </AdminShell>
  );
}
