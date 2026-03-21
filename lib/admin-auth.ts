import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.email("Enter a valid admin email."),
  password: z.string().trim().min(1, "Enter your password."),
});

export const adminPasswordResetRequestSchema = z.object({
  email: z.email("Enter a valid admin email."),
});

export const adminPasswordUpdateSchema = z
  .object({
    password: z.string().trim().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().trim().min(1, "Confirm your new password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const resolveRequestOrigin = (requestHeaders: Headers) => {
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = forwardedHost || requestHeaders.get("host");
  const forwardedProto = requestHeaders.get("x-forwarded-proto");
  const fallbackOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!host) {
    if (!fallbackOrigin) {
      throw new Error("Unable to resolve request origin for Supabase auth redirects.");
    }

    return fallbackOrigin.replace(/\/$/, "");
  }

  const protocol = forwardedProto || (host.includes("localhost") ? "http" : "https");

  return `${protocol}://${host}`;
};

const adminErrorMessages = {
  "access-denied": "That email is not allowlisted for the admin portal.",
  "invalid-credentials": "The email or password was not accepted.",
  "invalid-email": "Enter a valid admin email address.",
  "invalid-reset-link": "The reset link is invalid or has expired. Request a new one.",
  "password-update-failed": "Password update failed. Request a fresh reset link and try again.",
  "reset-email-failed": "Reset email could not be sent right now.",
  "session-expired": "Sign in again to continue.",
} as const;

const adminSuccessMessages = {
  "password-reset-email-sent": "If that admin email exists, a reset link has been sent.",
  "password-updated": "Password updated. You can continue in the admin portal.",
  "signed-out": "You have been signed out.",
} as const;

export type AdminErrorCode = keyof typeof adminErrorMessages;
export type AdminSuccessCode = keyof typeof adminSuccessMessages;

export const getAdminErrorMessage = (code?: string | string[]) => {
  if (typeof code !== "string") {
    return null;
  }

  return adminErrorMessages[code as AdminErrorCode] || null;
};

export const getAdminSuccessMessage = (code?: string | string[]) => {
  if (typeof code !== "string") {
    return null;
  }

  return adminSuccessMessages[code as AdminSuccessCode] || null;
};
