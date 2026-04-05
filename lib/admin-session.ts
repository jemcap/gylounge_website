import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { isAdminEmailAllowlisted } from "@/lib/admin-allowlist.server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export type AdminUser = User & {
  email: string;
};

export type AdminAccessErrorCode = "session-expired" | "access-denied";

type AdminAccessResult =
  | {
      error: null;
      user: AdminUser;
    }
  | {
      error: AdminAccessErrorCode;
      user: null;
    };

const resolveAdminUser = async (): Promise<AdminAccessResult> => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return {
      error: "session-expired",
      user: null,
    };
  }

  if (!isAdminEmailAllowlisted(user.email)) {
    return {
      error: "access-denied",
      user: null,
    };
  }

  return {
    error: null,
    user: user as AdminUser,
  };
};

export const getAdminUser = async () => {
  const adminAccess = await resolveAdminUser();
  return adminAccess.user;
};

export const requireAdminUser = async () => {
  const adminAccess = await resolveAdminUser();

  if (!adminAccess.user) {
    redirect(`/admin/login?error=${adminAccess.error}`);
  }

  return adminAccess.user;
};

export const requireAdminApiUser = resolveAdminUser;
