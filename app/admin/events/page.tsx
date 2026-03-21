import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { requireAdminUser } from "@/lib/admin-session";

export default async function AdminEventsPage() {
  const adminUser = await requireAdminUser();

  return (
    <AdminShell
      currentPath="/admin/events"
      description="This legacy route name is now auth-gated as part of the admin boundary."
      email={adminUser.email}
      title="Admin locations"
    >
      <Card
        title="Location management placeholder"
        description="Location creation and editing stay out of scope for phase 1."
      >
        <p className="text-sm text-[#3b3127]">The route remains available, but only to authenticated allowlisted admins.</p>
      </Card>
    </AdminShell>
  );
}
