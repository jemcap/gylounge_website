"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BirthDateFields } from "@/components/forms/BirthDateFields";
import { MembershipAddressFields } from "@/components/forms/MembershipAddressFields";
import { MembershipEmailField } from "@/components/forms/MembershipEmailField";
import { MembershipEmergencyContactFields } from "@/components/forms/MembershipEmergencyContactFields";
import { MembershipGenderFields } from "@/components/forms/MembershipGenderFields";
import { MembershipNameFields } from "@/components/forms/MembershipNameFields";
import { MembershipPhoneFields } from "@/components/forms/MembershipPhoneFields";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  createMembershipSubmission,
  defaultMembershipFormValues,
  membershipFormSchema,
  type MembershipFormValues,
} from "@/lib/membership-form";

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

import { feedbackClassMap } from "@/lib/feedback-styles";

const sectionHeadingClass = "text-lg font-semibold text-[#261B07]";

export function MembershipForm({
  action = "#",
  feedback,
  layout = "card",
  redirectTarget = "home",
}: MembershipFormProps) {
  const [clientFeedback, setClientFeedback] =
    useState<MembershipFeedback | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipFormSchema),
    defaultValues: defaultMembershipFormValues,
  });

  const activeFeedback = clientFeedback ?? feedback;
  const birthDateError =
    errors.birthDay?.message ||
    errors.birthMonth?.message ||
    errors.birthYear?.message;

  const onSubmit = handleSubmit(async (values) => {
    setClientFeedback(null);

    if (typeof action !== "function") {
      setClientFeedback({
        tone: "info",
        message:
          "This page is a placeholder. Use the live register flow to submit membership details.",
      });
      return;
    }

    await action(createMembershipSubmission(values, redirectTarget));
  });

  const content = (
    <>
      {activeFeedback ? (
        <p
          className={`mb-4 rounded-xl border px-4 py-3 text-sm ${feedbackClassMap[activeFeedback.tone]}`}
        >
          {activeFeedback.message}
        </p>
      ) : null}

      <form noValidate onSubmit={onSubmit} className="space-y-8 pb-24">
        <fieldset className="space-y-4">
          <legend className={sectionHeadingClass}>Your Details</legend>

          <MembershipNameFields
            register={register}
            firstNameError={errors.firstName?.message}
            lastNameError={errors.lastName?.message}
          />

          <BirthDateFields
            register={register}
            errorMessage={birthDateError}
            hasDayError={Boolean(errors.birthDay)}
            hasMonthError={Boolean(errors.birthMonth)}
            hasYearError={Boolean(errors.birthYear)}
          />

          <MembershipGenderFields register={register} />

          <MembershipPhoneFields
            register={register}
            mobilePhoneError={errors.mobilePhone?.message}
          />

          <MembershipEmailField
            register={register}
            emailError={errors.email?.message}
          />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className={sectionHeadingClass}>Home Address</legend>
          <MembershipAddressFields register={register} />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className={sectionHeadingClass}>Emergency Contact</legend>
          <MembershipEmergencyContactFields register={register} />
        </fieldset>

        <button
          type="submit"
          disabled={isSubmitting}
          className="fixed bottom-6 right-6 z-50 inline-flex h-14 items-center justify-center gap-1 rounded-full bg-[#3F2D17] px-8 text-lg font-bold text-[#F1D39B] shadow-lg transition-colors hover:bg-[#d9ae5a] hover:text-[#3F2D17] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-[#3F2D17] disabled:hover:text-[#F1D39B]"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
          <ChevronRight className="size-4" />
        </button>
      </form>
    </>
  );

  if (layout === "full") {
    return (
      <section className="flex h-full w-full flex-col px-6 pt-5">
        <h1 className="font-serif text-4xl italic text-[#261B07] md:text-[86px]">
          Membership Form
        </h1>
        <div className=" w-full max-w-3xl">{content}</div>
      </section>
    );
  }

  return (
    <Card
      title="Membership Form"
      description="Complete your registration to join Golden Years Lounge."
    >
      {content}
    </Card>
  );
}
