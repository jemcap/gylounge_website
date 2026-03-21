import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { requireAdminUser } from "@/lib/admin-session";

export default async function AdminMembersPage() {
  const adminUser = await requireAdminUser();

  return (
    <AdminShell
      currentPath="/admin/members"
      description="This route is now protected behind Supabase Auth and the admin allowlist. Member search and mutations come next."
      email={adminUser.email}
      title="Admin members"
    >
      <Card
        title="Member management placeholder"
        description="Pending-to-active activation, search, edit, and delete flows are the next slice after auth."
      >
        <p className="text-sm text-[#3b3127]">Phase 1 intentionally stops at session handling and route protection.</p>
      </Card>
    </AdminShell>
  );
}
