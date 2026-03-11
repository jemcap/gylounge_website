import type { UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { MembershipFormValues } from "@/lib/membership-form";
import {
  errorFieldClass,
  errorMessageClass,
  labelClass,
} from "@/components/forms/membership-form-styles";

type MembershipEmailFieldProps = {
  register: UseFormRegister<MembershipFormValues>;
  emailError?: string;
};

export function MembershipEmailField({
  register,
  emailError,
}: MembershipEmailFieldProps) {
  return (
    <div>
      <label htmlFor="member-email" className={labelClass}>
        Email address <span className="text-red-600">*</span>
      </label>
      <Input
        id="member-email"
        type="email"
        placeholder="ama@example.com"
        aria-invalid={Boolean(emailError)}
        className={emailError ? errorFieldClass : undefined}
        {...register("email")}
      />
      {emailError ? <p className={errorMessageClass}>{emailError}</p> : null}
    </div>
  );
}
