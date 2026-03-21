import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { isAdminEmailAllowlisted } from "@/lib/admin-allowlist.server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export type AdminUser = User & {
  email: string;
};

export const getAdminUser = async () => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return null;
  }

  if (!isAdminEmailAllowlisted(user.email)) {
    return null;
  }

  return user as AdminUser;
};

export const requireAdminUser = async () => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    redirect("/admin/login?error=session-expired");
  }

  if (!isAdminEmailAllowlisted(user.email)) {
    redirect("/admin/login?error=access-denied");
  }

  return user as AdminUser;
};
