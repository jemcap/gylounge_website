"use server";

import { headers } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import {
  adminLoginSchema,
  adminPasswordUpdateSchema,
  adminPasswordResetRequestSchema,
  resolveRequestOrigin,
} from "@/lib/admin-auth";
import { isAdminEmailAllowlisted } from "@/lib/admin-allowlist.server";
import { normalizeEmail } from "@/lib/membership";
import { createServerActionSupabaseClient } from "@/lib/supabase-server";

const redirectToAdminLogin = (
  params: Record<string, string>,
): never => {
  const query = new URLSearchParams(params).toString();
  redirect(`/admin/login${query ? `?${query}` : ""}`);
};

const redirectToAdminReset = (
  params: Record<string, string>,
): never => {
  const query = new URLSearchParams(params).toString();
  redirect(`/admin/reset-password${query ? `?${query}` : ""}`);
};

export async function adminSignInAction(formData: FormData) {
  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  const credentials = parsed.success
    ? parsed.data
    : redirectToAdminLogin({ error: "invalid-credentials" });
  const { email, password } = credentials;

  try {
    const supabase = await createServerActionSupabaseClient();
    const normalizedEmail = normalizeEmail(email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error || !data.user?.email) {
      console.error("adminSignInAction sign-in failed", error);
      redirectToAdminLogin({ error: "invalid-credentials" });
    }

    const authenticatedEmail = data.user?.email
      ? data.user.email
      : redirectToAdminLogin({ error: "invalid-credentials" });

    if (!isAdminEmailAllowlisted(authenticatedEmail)) {
      await supabase.auth.signOut();
      redirectToAdminLogin({ error: "access-denied" });
    }

    redirect("/admin");
  } catch (error) {
    unstable_rethrow(error);
    console.error("adminSignInAction unexpected failure", error);
    redirectToAdminLogin({ error: "invalid-credentials" });
  }
}

export async function adminRequestPasswordResetAction(formData: FormData) {
  const parsed = adminPasswordResetRequestSchema.safeParse({
    email: formData.get("email"),
  });

  const resetRequest = parsed.success
    ? parsed.data
    : redirectToAdminLogin({ error: "invalid-email" });
  const normalizedEmail = normalizeEmail(resetRequest.email);

  if (!isAdminEmailAllowlisted(normalizedEmail)) {
    redirectToAdminLogin({ error: "access-denied" });
  }

  try {
    const supabase = await createServerActionSupabaseClient();
    const requestHeaders = await headers();
    const redirectTo = `${resolveRequestOrigin(requestHeaders)}/admin/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo,
    });

    if (error) {
      console.error("adminRequestPasswordResetAction reset failed", error);
      redirectToAdminLogin({ error: "reset-email-failed" });
    }

    redirectToAdminLogin({ message: "password-reset-email-sent" });
  } catch (error) {
    unstable_rethrow(error);
    console.error("adminRequestPasswordResetAction unexpected failure", error);
    redirectToAdminLogin({ error: "reset-email-failed" });
  }
}

export async function adminUpdatePasswordAction(formData: FormData) {
  const parsed = adminPasswordUpdateSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  const credentials = parsed.success
    ? parsed.data
    : redirectToAdminReset({ error: "password-update-failed" });
  const { password } = credentials;

  try {
    const supabase = await createServerActionSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      redirectToAdminReset({ error: "invalid-reset-link" });
    }

    const authenticatedEmail = user?.email
      ? user.email
      : redirectToAdminReset({ error: "invalid-reset-link" });

    if (!isAdminEmailAllowlisted(authenticatedEmail)) {
      await supabase.auth.signOut();
      redirectToAdminLogin({ error: "access-denied" });
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      console.error("adminUpdatePasswordAction update failed", updateError);
      redirectToAdminReset({ error: "password-update-failed" });
    }

    await supabase.auth.signOut();
    redirectToAdminLogin({ message: "password-updated" });
  } catch (error) {
    unstable_rethrow(error);
    console.error("adminUpdatePasswordAction unexpected failure", error);
    redirectToAdminReset({ error: "password-update-failed" });
  }
}

export async function adminSignOutAction() {
  try {
    const supabase = await createServerActionSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("adminSignOutAction sign-out failed", error);
    }
  } catch (error) {
    unstable_rethrow(error);
    console.error("adminSignOutAction unexpected failure", error);
  }

  redirectToAdminLogin({ message: "signed-out" });
}
