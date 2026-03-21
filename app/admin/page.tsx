import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { getAdminSuccessMessage } from "@/lib/admin-auth";
import { requireAdminUser } from "@/lib/admin-session";
import { supabaseAdminClient } from "@/lib/supabase";

type AdminDashboardPageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminDashboardPage({
  searchParams,
}: AdminDashboardPageProps) {
  const adminUser = await requireAdminUser();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const successMessage = getAdminSuccessMessage(resolvedSearchParams.message);

  // Get total members from supabase
  const { count, error: totalMembersError } = await supabaseAdminClient().from("members").select("*", { count: "exact", head: true });
  console.log("Total members count:", count, "Error:", totalMembersError); 

  return (
    <AdminShell
      currentPath="/admin"
      description="Phase 1 secures the admin routes and gets email/password auth, password recovery, and logout in place before dashboard metrics are added."
      email={adminUser.email}
      title="Admin dashboard"
    >
      {successMessage ? (
        <div className="rounded-2xl border border-[#8b6b3f] bg-[#f7ead2] px-4 py-3 text-sm text-[#3b3127]">
          {successMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Card
          title="Members"
          description="Member search, activation, editing, and safe delete operations land in phase 3."
        >
          <p className="text-sm text-[#3b3127]">
            {count}
          </p>
        </Card>

        <Card
          title="Bookings"
          description="Calendar counts, date detail, and booking amendment flows land in later admin phases."
        >
          <p className="text-sm text-[#3b3127]">
            Phase 1 focuses only on the auth boundary around these routes.
          </p>
        </Card>
      </div>
    </AdminShell>
  );
}
