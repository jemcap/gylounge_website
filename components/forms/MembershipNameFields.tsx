import type { UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { MembershipFormValues } from "@/lib/membership-form";
import {
  errorFieldClass,
  errorMessageClass,
  labelClass,
} from "@/components/forms/membership-form-styles";

type MembershipNameFieldsProps = {
  register: UseFormRegister<MembershipFormValues>;
  firstNameError?: string;
  lastNameError?: string;
};

export function MembershipNameFields({
  register,
  firstNameError,
  lastNameError,
}: MembershipNameFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="member-first-name" className={labelClass}>
          First name <span className="text-red-600">*</span>
        </label>
        <Input
          id="member-first-name"
          placeholder="Ama"
          aria-invalid={Boolean(firstNameError)}
          className={firstNameError ? errorFieldClass : undefined}
          {...register("firstName")}
        />
        {firstNameError ? (
          <p className={errorMessageClass}>{firstNameError}</p>
        ) : null}
      </div>
      <div>
        <label htmlFor="member-last-name" className={labelClass}>
          Last name <span className="text-red-600">*</span>
        </label>
        <Input
          id="member-last-name"
          placeholder="Boateng"
          aria-invalid={Boolean(lastNameError)}
          className={lastNameError ? errorFieldClass : undefined}
          {...register("lastName")}
        />
        {lastNameError ? (
          <p className={errorMessageClass}>{lastNameError}</p>
        ) : null}
      </div>
    </div>
  );
}
