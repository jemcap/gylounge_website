import { adminRequestPasswordResetAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAdminErrorMessage, getAdminSuccessMessage } from "@/lib/admin-auth";
import { LoginHeader } from "../login/components/LoginHeader";
import Link from "next/link";

type ForgotPasswordPageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const errorMessage = getAdminErrorMessage(resolvedSearchParams.error);
  const successMessage = getAdminSuccessMessage(resolvedSearchParams.message);

  return (
    <>
      <LoginHeader />
      <main className="flex-1 bg-[#f5f1ea] px-6 py-12 text-[#1c1b18] md:px-12 lg:px-20 flex justify-center items-center">
        <div className="mx-auto w-full max-w-md">
          <Card>
            <h2 className="text-3xl flex justify-center font-bold text-[#1c1b18]">
              Forgotten Password?
            </h2>
            <p className="mt-2 text-lg font-bold text-[#3b3127]">
              Please enter the email address or username associated to your
              account.
            </p>

            {errorMessage ? (
              <div className="mt-4 mb-4 rounded-2xl border border-[#c97e6a] bg-[#fff0ec] px-4 py-3 text-sm text-[#7a2d1e]">
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className="mt-4 mb-4 rounded-2xl border border-[#8b6b3f] bg-[#f7ead2] px-4 py-3 text-sm text-[#3b3127]">
                {successMessage}
              </div>
            ) : null}

            <form
              action={adminRequestPasswordResetAction}
              className="mt-4 space-y-4"
            >
              <div>
                <label
                  htmlFor="reset-email"
                  className="mb-1 block text-sm font-bold text-[#1c1b18]"
                >
                  Email *
                </label>
                <Input
                  id="reset-email"
                  type="email"
                  name="email"
                  placeholder="admin@gylounge.com"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full font-bold text-2xl py-2 border-3 border-[#3F2D17] bg-[#3F2D17] text-[#F1D39B] cursor-pointer"
              >
                Reset Password
              </Button>
            </form>

            <div className="mt-4 text-start text-sm">
              <Link
                href="/admin/login"
                className="font-bold underline text-[#1c1b18]"
              >
                Back to login
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
