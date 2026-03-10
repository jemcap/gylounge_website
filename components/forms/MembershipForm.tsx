"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronRight } from "lucide-react";

type FormAction = string | ((formData: FormData) => void | Promise<void>);

type MembershipFeedback = {
  tone: "success" | "error" | "info";
  message: string;
};

export type MembershipFormProps = {
  action?: FormAction;
  feedback?: MembershipFeedback;
  layout?: "card" | "full";
  redirectTarget?: "home" | "register";
};

const feedbackClassMap: Record<MembershipFeedback["tone"], string> = {
  success: "border-[#98c79f] bg-[#eef8f0] text-[#1f5a2b]",
  error: "border-[#e3aaa8] bg-[#fff1f0] text-[#8b2e2a]",
  info: "border-[#d3c39f] bg-[#faf5e9] text-[#5d4a2e]",
};

/* ── Shared styling constants ──────────────────────────────────── */
const labelClass = "mb-1 block text-sm font-medium text-[#1c1b18]";
const sectionHeadingClass =
  "text-lg font-semibold text-[#261B07] border-b border-[#d9cfbf] pb-2";

/* ── Birthday select helpers ───────────────────────────────────── */
const days = Array.from({ length: 31 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);
const months = [
  "01", "02", "03", "04", "05", "06",
  "07", "08", "09", "10", "11", "12",
];
const monthLabels = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

const selectClass =
  "w-full rounded-xl border border-[#d9cfbf] bg-white px-4 py-3 text-sm text-[#1c1b18] outline-none transition focus:border-[#8b6b3f]";

/* ── Gender options ────────────────────────────────────────────── */
const genderOptions = ["Male", "Female", "Prefer not to say"] as const;

export function MembershipForm({
  action = "#",
  feedback,
  layout = "card",
  redirectTarget = "home",
}: MembershipFormProps) {
  const content = (
    <>
      {feedback ? (
        <p
          className={`mb-4 rounded-xl border px-4 py-3 text-sm ${feedbackClassMap[feedback.tone]}`}
        >
          {feedback.message}
        </p>
      ) : null}

      {/* pb-24 ensures form content isn't hidden behind the fixed submit button */}
      <form action={action} className="space-y-8 pb-24">
        {redirectTarget === "register" ? (
          <input type="hidden" name="redirectTarget" value="register" />
        ) : null}

        {/* ── Personal Information ─────────────────────────────── */}
        <fieldset className="space-y-4">
          <legend className={sectionHeadingClass}>
            Personal Information
          </legend>

          {/* First name + Last name — side by side on wider screens */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="member-first-name" className={labelClass}>
                First name <span className="text-red-600">*</span>
              </label>
              <Input
                id="member-first-name"
                name="firstName"
                placeholder="Ama"
                required
              />
            </div>
            <div>
              <label htmlFor="member-last-name" className={labelClass}>
                Last name <span className="text-red-600">*</span>
              </label>
              <Input
                id="member-last-name"
                name="lastName"
                placeholder="Boateng"
                required
              />
            </div>
          </div>

          {/* Birthday — DD / MM / YYYY selects */}
          <div>
            <span className={labelClass}>
              Date of birth <span className="text-red-600">*</span>
            </span>
            <div className="grid grid-cols-3 gap-3">
              <select
                name="birthDay"
                required
                className={selectClass}
                aria-label="Day"
                defaultValue=""
              >
                <option value="" disabled>
                  DD
                </option>
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                name="birthMonth"
                required
                className={selectClass}
                aria-label="Month"
                defaultValue=""
              >
                <option value="" disabled>
                  MM
                </option>
                {months.map((m, i) => (
                  <option key={m} value={m}>
                    {monthLabels[i]}
                  </option>
                ))}
              </select>
              <select
                name="birthYear"
                required
                className={selectClass}
                aria-label="Year"
                defaultValue=""
              >
                <option value="" disabled>
                  YYYY
                </option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Gender — radio group */}
          <div>
            <span className={labelClass}>Gender</span>
            <div className="mt-1 flex flex-wrap gap-4">
              {genderOptions.map((option) => (
                <label
                  key={option}
                  className="inline-flex cursor-pointer items-center gap-2 text-sm text-[#1c1b18]"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={option}
                    className="h-4 w-4 accent-[#3F2D17]"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {/* Phone numbers */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="member-mobile" className={labelClass}>
                Mobile phone number <span className="text-red-600">*</span>
              </label>
              <Input
                id="member-mobile"
                name="mobilePhone"
                type="tel"
                placeholder="+233 20 000 0000"
                required
              />
            </div>
            <div>
              <label htmlFor="member-home-phone" className={labelClass}>
                Home phone number
              </label>
              <Input
                id="member-home-phone"
                name="homePhone"
                type="tel"
                placeholder="+233 30 000 0000"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="member-email" className={labelClass}>
              Email address <span className="text-red-600">*</span>
            </label>
            <Input
              id="member-email"
              type="email"
              name="email"
              placeholder="ama@example.com"
              required
            />
          </div>
        </fieldset>

        {/* ── Home Address ─────────────────────────────────────── */}
        <fieldset className="space-y-4">
          <legend className={sectionHeadingClass}>Home Address</legend>

          <div>
            <label htmlFor="address-line1" className={labelClass}>
              Address line 1
            </label>
            <Input
              id="address-line1"
              name="addressLine1"
              placeholder="House number & street"
            />
          </div>
          <div>
            <label htmlFor="address-line2" className={labelClass}>
              Address line 2
            </label>
            <Input
              id="address-line2"
              name="addressLine2"
              placeholder="Area / suburb"
            />
          </div>
          <div>
            <label htmlFor="digital-address" className={labelClass}>
              Digital address
            </label>
            <Input
              id="digital-address"
              name="digitalAddress"
              placeholder="e.g. GA-000-0000"
            />
          </div>
        </fieldset>

        {/* ── Emergency Contact ────────────────────────────────── */}
        <fieldset className="space-y-4">
          <legend className={sectionHeadingClass}>Emergency Contact</legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="emergency-first-name" className={labelClass}>
                First name
              </label>
              <Input
                id="emergency-first-name"
                name="emergencyFirstName"
                placeholder="Kofi"
              />
            </div>
            <div>
              <label htmlFor="emergency-last-name" className={labelClass}>
                Last name
              </label>
              <Input
                id="emergency-last-name"
                name="emergencyLastName"
                placeholder="Mensah"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="emergency-relationship" className={labelClass}>
                Relationship
              </label>
              <Input
                id="emergency-relationship"
                name="emergencyRelationship"
                placeholder="e.g. Daughter, Nephew"
              />
            </div>
            <div>
              <label htmlFor="emergency-phone" className={labelClass}>
                Phone number
              </label>
              <Input
                id="emergency-phone"
                name="emergencyPhone"
                type="tel"
                placeholder="+233 20 000 0000"
              />
            </div>
          </div>
        </fieldset>
      </form>

      {/* ── Fixed submit button — bottom-right, 24px inset ──── */}
      <button
        type="submit"
        form={undefined}
        onClick={() => {
          // Programmatically submit the closest form
          const form = document.querySelector<HTMLFormElement>(
            'form[action]',
          );
          form?.requestSubmit();
        }}
        className="fixed bottom-6 right-6 z-50 inline-flex h-14 items-center justify-center gap-1 rounded-full bg-[#3F2D17] px-8 text-lg font-bold text-[#F1D39B] shadow-lg transition-colors hover:bg-[#d9ae5a] hover:text-[#3F2D17]"
      >
        Submit
        <ChevronRight className="size-4" />
      </button>
    </>
  );

  if (layout === "full") {
    return (
      <section className="flex h-full w-full flex-col px-6 py-10 md:px-12">
        <h1 className="font-serif text-4xl italic text-[#261B07] md:text-5xl">
          Membership Signup
        </h1>
        <p className="mt-3 max-w-2xl text-base text-[#3b3127] md:text-lg">
          Complete your registration to receive bank transfer details and a
          membership reference.
        </p>
        <div className="mt-8 w-full max-w-3xl">{content}</div>
      </section>
    );
  }

  return (
    <Card
      title="Membership Signup"
      description="Complete your registration to join Golden Years Lounge."
    >
      {content}
    </Card>
  );
}
