import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { requireAdminUser } from "@/lib/admin-session";

export default async function AdminSlotsPage() {
  const adminUser = await requireAdminUser();

  return (
    <AdminShell
      currentPath="/admin/slots"
      description="Availability management remains a later slice, but this route now uses the shared Phase 2 admin shell and navigation."
      email={adminUser.email}
      title="Availability"
    >
      <Card
        title="Availability placeholder"
        description="Slot CRUD and capacity management are not part of the current admin slice."
        className="bg-white/80"
      >
        <p className="text-sm text-[#3b3127]">
          Only authenticated allowlisted admins can reach this route, and the
          layout is ready for the later availability management slice.
        </p>
      </Card>
    </AdminShell>
  );
}
