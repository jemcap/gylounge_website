import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { registerMemberAction } from "@/app/home/actions";
import RegisterHeader from "./components/RegisterHeader";
import { getSingleParam } from "@/lib/query-params";
import { resolveRegisterFeedback } from "@/app/home/home-page-helpers";
import { MembershipForm } from "@/components/forms/MembershipForm";

type RegisterPageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const registerStatus = getSingleParam(resolvedSearchParams.register);
  const registerReference = getSingleParam(resolvedSearchParams.reference);
  const registerFeedback = resolveRegisterFeedback(
    registerStatus,
    registerReference,
  );

  return (
    <main className="min-h-screen w-full bg-gylounge-register text-[#261B07]">
      <RegisterHeader />
      <div className="pt-24 ">
        <Link
          href="/#register"
          className="underline flex items-center gap-2 rounded-full px-4 text-3xl font-semibold text-[#261B07]"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Register
        </Link>
      </div>
      <section className="relative flex min-h-screen w-full">
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
