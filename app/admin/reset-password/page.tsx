import { adminUpdatePasswordAction } from "@/app/admin/actions";
import { ResetPasswordForm } from "@/app/admin/reset-password/ResetPasswordForm";
import { getAdminErrorMessage } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type AdminResetPasswordPageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminResetPasswordPage({
  searchParams,
}: AdminResetPasswordPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const errorMessage = getAdminErrorMessage(resolvedSearchParams.error);

  return (
    <main className="min-h-screen bg-[#f5f1ea] px-6 py-12 text-[#1c1b18] md:px-12 lg:px-20">
      <div className="mx-auto w-full max-w-md">
        <ResetPasswordForm
          action={adminUpdatePasswordAction}
          serverErrorMessage={errorMessage}
        />
      </div>
    </main>
  );
}
