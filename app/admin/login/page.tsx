import { adminSignInAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAdminErrorMessage, getAdminSuccessMessage } from "@/lib/admin-auth";
import Link from "next/link";
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
      <main className="flex-1 bg-[#f5f1ea] px-6 py-12 text-[#1c1b18] md:px-12 lg:px-20 flex justify-center items-center">
        <div className="mx-auto w-full max-w-md ">
          <Card>
            <h2 className="text-3xl flex justify-center font-bold text-[#1c1b18] mb-8">Log in</h2>

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
                  className="mb-1 block text-sm font-bold text-[#1c1b18]"
                >
                  Email *
                </label>
                <Input
                  id="admin-email"
                  type="email"
                  name="email"
                  placeholder="admin@goldenyearslounge.com"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-1 block text-sm font-bold text-[#1c1b18]"
                >
                  Password *
                </label>
                <Input
                  id="admin-password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                />
              </div>
              {/* Forgot password */}
              <div className="flex items-center justify-start text-sm text-[#1c1b18]">
                <span>Forgotten password?</span>
                <Link
                  href="/admin/forgot-password"
                  className="py-1 px-1 text-sm font-bold underline"
                >
                  Click here
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full font-bold text-2xl py-2 border-3 border-[#3F2D17] bg-[#3F2D17] text-[#F1D39B] cursor-pointer"
              >
                Login
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </>
  );
}
