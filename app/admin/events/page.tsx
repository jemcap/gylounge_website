import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { requireAdminUser } from "@/lib/admin-session";

export default async function AdminEventsPage() {
  const adminUser = await requireAdminUser();

  return (
    <AdminShell
      currentPath="/admin/events"
      description="This legacy route name now sits inside the shared Phase 2 admin shell, even though location CRUD stays out of scope for now."
      email={adminUser.email}
      title="Locations"
    >
      <Card
        title="Location management placeholder"
        description="Location creation and editing stay out of scope for the current admin slice."
        className="bg-white/80"
      >
        <p className="text-sm text-[#3b3127]">
          The route remains available inside the shared admin navigation, but the
          actual location management tools stay in a later slice.
        </p>
      </Card>
    </AdminShell>
  );
}
