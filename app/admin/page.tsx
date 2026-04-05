import { AdminActionLink } from "@/components/admin/AdminActionLink";
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
  const supabase = supabaseAdminClient();

  const [
    { count: totalMembersCount, error: totalMembersError },
    { count: pendingMembersCount, error: pendingMembersError },
    { count: totalBookingsCount, error: totalBookingsError },
  ] = await Promise.all([
    supabase.from("members").select("*", { count: "exact", head: true }),
    supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
  ]);

  if (totalMembersError || pendingMembersError || totalBookingsError) {
    console.error("Admin dashboard metrics failed", {
      pendingMembersError,
      totalMembersError,
      totalBookingsError,
    });
  }

  const totalMembers = totalMembersCount ?? 0;
  const totalBookings = totalBookingsCount ?? 0;
  const dashboardMetricsUnavailable = Boolean(
    totalMembersError || pendingMembersError || totalBookingsError,
  );

  return (
    <AdminShell currentPath="/admin">
      {successMessage ? (
        <div className="rounded-2xl border border-[#8b6b3f] bg-[#f7ead2] px-4 py-3 text-sm text-[#3b3127]">
          {successMessage}
        </div>
      ) : null}

      {dashboardMetricsUnavailable ? (
        <div className="rounded-2xl border border-[#c97e6a] bg-[#fff0ec] px-4 py-3 text-sm text-[#7a2d1e]">
          Some dashboard metrics are temporarily unavailable. The admin routes
          are still accessible while the underlying data issue is investigated.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 text-center ">
        <Card
          title="Members"
          className="bg-white/80 border border-[#dcccb8] p-6 shadow-sm"
        >
          <div className="flex flex-col justify-center items-center gap-6">
            <div className="space-y-2">
              <p className="text-5xl font-semibold text-[#1c1b18]">
                {totalMembers}
              </p>
            </div>

            <AdminActionLink href="/admin/members" className="bg-[#F1EDE5]">
              View memberships
            </AdminActionLink>
          </div>
        </Card>

        <Card
          title="Bookings"
          className="bg-white/80  border border-[#dcccb8] p-6 shadow-sm"
        >
          <div className="flex flex-col justify-center items-center gap-6">
            <div className="space-y-2">
              <p className="text-5xl font-semibold text-[#1c1b18]">
                {totalBookings}
              </p>
            </div>

            <AdminActionLink href="/admin/bookings" className="bg-[#F1EDE5] ">
              View bookings
            </AdminActionLink>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
