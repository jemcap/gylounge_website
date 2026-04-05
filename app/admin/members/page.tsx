import { AdminShell } from "@/components/admin/AdminShell";
import { AdminMembersManager } from "@/components/admin/AdminMembersManager";
import { supabaseAdminClient } from "@/lib/supabase";

export default async function AdminMembersPage() {
  const supabase = supabaseAdminClient();
  const { data: members, error } = await supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin members page failed to load members", error);
  }

  return (
    <AdminShell
      currentPath="/admin/members"
      description="View, edit and delete memberships here."
      title="Memberships"
    >
      {error ? (
        <div className="rounded-2xl border border-[#c97e6a] bg-[#fff0ec] px-4 py-3 text-sm text-[#7a2d1e]">
          Member records are temporarily unavailable. Reload the page after the
          underlying data issue is resolved.
        </div>
      ) : null}

      <AdminMembersManager members={members ?? []} />
    </AdminShell>
  );
}
