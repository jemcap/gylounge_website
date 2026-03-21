import {
  adminRequestPasswordResetAction,
  adminSignInAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAdminErrorMessage, getAdminSuccessMessage } from "@/lib/admin-auth";
import { LoginHeader } from "./components/LoginHeader";

type AdminLoginPageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const errorMessage = getAdminErrorMessage(resolvedSearchParams.error);
  const successMessage = getAdminSuccessMessage(resolvedSearchParams.message);

  return (
    <>
      <LoginHeader />
      <main className="min-h-screen bg-[#f5f1ea] px-6 py-12 text-[#1c1b18] md:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          <Card
            title="Admin login"
            description="Phase 1 uses Supabase Auth email/password sign-in with allowlist protection for the admin portal."
          >
            {errorMessage ? (
              <div className="mb-4 rounded-2xl border border-[#c97e6a] bg-[#fff0ec] px-4 py-3 text-sm text-[#7a2d1e]">
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className="mb-4 rounded-2xl border border-[#8b6b3f] bg-[#f7ead2] px-4 py-3 text-sm text-[#3b3127]">
                {successMessage}
              </div>
            ) : null}

            <form action={adminSignInAction} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-email"
                  className="mb-1 block text-sm font-medium text-[#1c1b18]"
                >
                  Admin email
                </label>
                <Input
                  id="admin-email"
                  type="email"
                  name="email"
                  placeholder="admin@gylounge.com"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-1 block text-sm font-medium text-[#1c1b18]"
                >
                  Password
                </label>
                <Input
                  id="admin-password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Sign in
              </Button>

              <Button
                type="submit"
                variant="secondary"
                className="w-full"
                formAction={adminRequestPasswordResetAction}
                formNoValidate
              >
                Send password reset email
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </>
  );
}
