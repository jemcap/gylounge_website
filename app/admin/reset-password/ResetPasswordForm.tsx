"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { adminPasswordUpdateSchema, getAdminErrorMessage } from "@/lib/admin-auth";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Notice = {
  tone: "error" | "success";
  text: string;
};

type ResetPasswordFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  serverErrorMessage?: string | null;
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={disabled || pending}>
      {pending ? "Saving..." : "Update password"}
    </Button>
  );
}

export function ResetPasswordForm({
  action,
  serverErrorMessage,
}: ResetPasswordFormProps) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [isReady, setIsReady] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(
    serverErrorMessage
      ? {
          tone: "error",
          text: serverErrorMessage,
        }
      : null,
  );

  useEffect(() => {
    let isMounted = true;

    const syncRecoverySession = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (error || !user?.email) {
        setIsReady(false);
        setNotice({
          tone: "error",
          text: getAdminErrorMessage("invalid-reset-link") || "Reset link is invalid.",
        });
        return;
      }

      if (!serverErrorMessage) {
        setNotice(null);
      }

      setIsReady(true);
    };

    void syncRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        void syncRecoverySession();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [serverErrorMessage, supabase]);

  const handleClientValidation = (event: FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    const parsed = adminPasswordUpdateSchema.safeParse({
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      event.preventDefault();
      const nextError = parsed.error.issues[0]?.message || "Password update failed.";
      setNotice({ tone: "error", text: nextError });
      return;
    }

    setNotice(null);
  };

  return (
    <Card
      title="Set a new password"
      description="Open the link from your reset email, then choose a new password for the admin portal."
    >
      {notice ? (
        <div
          className={[
            "mb-4 rounded-2xl border px-4 py-3 text-sm",
            notice.tone === "error"
              ? "border-[#c97e6a] bg-[#fff0ec] text-[#7a2d1e]"
              : "border-[#8b6b3f] bg-[#f7ead2] text-[#3b3127]",
          ].join(" ")}
        >
          {notice.text}
        </div>
      ) : null}

      <form action={action} onSubmit={handleClientValidation} className="space-y-4">
        <div>
          <label htmlFor="admin-new-password" className="mb-1 block text-sm font-medium text-[#1c1b18]">
            New password
          </label>
          <Input
            id="admin-new-password"
            type="password"
            name="password"
            placeholder="Choose a new password"
            required
          />
        </div>

        <div>
          <label
            htmlFor="admin-confirm-password"
            className="mb-1 block text-sm font-medium text-[#1c1b18]"
          >
            Confirm new password
          </label>
          <Input
            id="admin-confirm-password"
            type="password"
            name="confirmPassword"
            placeholder="Repeat the new password"
            required
          />
        </div>

        <SubmitButton disabled={!isReady} />
      </form>
    </Card>
  );
}
