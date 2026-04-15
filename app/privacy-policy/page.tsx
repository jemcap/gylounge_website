import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#0E0B0A] px-5 py-16 text-[#EBBF6C] md:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <Link
          href="/"
          className="text-sm underline underline-offset-4 transition-opacity hover:opacity-75"
        >
          Back to Home
        </Link>

        <div className="space-y-4">
          <h1 className="font-serif text-5xl italic wrap-break-word">
            Privacy Policy
          </h1>
          <p className="max-w-3xl text-sm md:text-base">
            Golden Years Lounge collects only the information needed to manage
            memberships, bookings, support requests, and essential service
            communications.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <section className="space-y-3">
            <h2 className="text-2xl font-medium">What We Collect</h2>
            <p className="text-sm md:text-base">
              We may collect names, email addresses, phone numbers, booking
              details, membership details, and related operational records that
              help us provide the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-medium">How We Use It</h2>
            <p className="text-sm md:text-base">
              This information is used to process registrations, manage
              bookings, confirm payments manually, communicate important
              updates, and operate the admin side of the platform safely.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-medium">How We Protect It</h2>
            <p className="text-sm md:text-base">
              Access to sensitive data is limited to authorized staff and
              protected admin tools. We keep personal data scoped to the needs
              of the service and avoid exposing unnecessary personal details in
              public flows.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-medium">Questions</h2>
            <p className="text-sm md:text-base">
              If you have questions about privacy or data handling, please use
              the contact details provided on the home page and our team will
              respond as soon as possible.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
