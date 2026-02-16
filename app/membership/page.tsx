import Link from "next/link";
import { MembershipForm } from "@/components/forms/membership-form";
import { Card } from "@/components/ui/card";

export default function MembershipPage() {
  return (
    <main className="min-h-screen bg-[#f5f1ea] px-6 py-12 text-[#1c1b18] md:px-12 lg:px-20">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-[#8b6b3f]">Membership</p>
          <h1 className="mt-3 text-3xl font-semibold">Join GYLounge membership</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#3b3127]">
            Boilerplate membership route. Next step is wiring pending-member creation and bank transfer instructions.
          </p>
        </header>

        <MembershipForm />

        <Card title="Bank transfer instructions (placeholder)">
          <ul className="space-y-1 text-sm text-[#3b3127]">
            <li>Amount: GHS 120</li>
            <li>Bank: Example Bank Ghana</li>
            <li>Account name: GYLounge Ltd</li>
            <li>Account number: 0000000000</li>
            <li>Reference: Generated after form submit</li>
          </ul>
          <Link href="/membership/pending" className="mt-4 inline-block text-sm font-semibold text-[#1c1b18] hover:underline">
            Go to pending state
          </Link>
        </Card>
      </div>
    </main>
  );
}
