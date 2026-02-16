import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function MembershipPendingPage() {
  return (
    <main className="min-h-screen bg-[#f5f1ea] px-6 py-12 text-[#1c1b18] md:px-12 lg:px-20">
      <div className="mx-auto w-full max-w-3xl">
        <Card
          title="Membership pending"
          description="This page will show the waiting state while bank transfer verification is completed by admin."
        >
          <p className="text-sm text-[#3b3127]">
            Keep your bank transfer reference handy. Activation usually happens after transfer verification.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link href="/events" className="text-sm font-semibold text-[#1c1b18] hover:underline">
              Back to events
            </Link>
            <Link href="/my-bookings" className="text-sm font-semibold text-[#1c1b18] hover:underline">
              My bookings lookup
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
