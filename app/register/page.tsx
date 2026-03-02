import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { registerMemberAction } from "@/app/home/actions";
import { HomeHeader } from "@/app/home/components/HomeHeader";
import { getSingleParam, resolveRegisterFeedback } from "@/app/home/home-page-helpers";
import { MembershipForm } from "@/components/forms/MembershipForm";

type RegisterPageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const registerStatus = getSingleParam(resolvedSearchParams.register);
  const registerReference = getSingleParam(resolvedSearchParams.reference);
  const registerFeedback = resolveRegisterFeedback(registerStatus, registerReference);

  return (
    <main className="min-h-screen w-full bg-[#F1EDE5] text-[#261B07]">
      <HomeHeader />

      <section className="relative flex min-h-screen w-full pt-20">
        <Link
          href="/home"
          className="fixed left-4 top-24 z-20 inline-flex items-center gap-2 rounded-full border border-[#3F2D17] bg-[#F1EDE5] px-4 py-2 text-sm font-semibold text-[#261B07] transition-colors hover:bg-[#e6dfd2]"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back
        </Link>

        <div className="flex min-h-[calc(100vh-5rem)] w-full items-center">
          <MembershipForm
            action={registerMemberAction}
            feedback={registerFeedback}
            layout="full"
            redirectTarget="register"
          />
        </div>
      </section>
    </main>
  );
}
