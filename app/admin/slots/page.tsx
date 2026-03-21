import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { requireAdminUser } from "@/lib/admin-session";

export default async function AdminSlotsPage() {
  const adminUser = await requireAdminUser();

  return (
    <AdminShell
      currentPath="/admin/slots"
      description="Availability management remains a later slice, but the route is now inside the protected admin boundary."
      email={adminUser.email}
      title="Admin availability"
    >
      <Card
        title="Availability placeholder"
        description="Slot CRUD and capacity management are not part of phase 1."
      >
        <p className="text-sm text-[#3b3127]">Only authenticated allowlisted admins can now reach this route.</p>
      </Card>
    </AdminShell>
  );
}
