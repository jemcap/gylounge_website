import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { requireAdminUser } from "@/lib/admin-session";

export default async function AdminMembersPage() {
  const adminUser = await requireAdminUser();

  return (
    <AdminShell
      currentPath="/admin/members"
      description="Phase 2 adds the shared admin shell. Member search, editing, status changes, and guarded delete land in phase 3."
      email={adminUser.email}
      title="Members"
    ></AdminShell>
  );
}
