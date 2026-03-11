import type { UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { MembershipFormValues } from "@/lib/membership-form";
import {
  errorFieldClass,
  errorMessageClass,
  labelClass,
} from "@/components/forms/membership-form-styles";

type MembershipPhoneFieldsProps = {
  register: UseFormRegister<MembershipFormValues>;
  mobilePhoneError?: string;
};

export function MembershipPhoneFields({
  register,
  mobilePhoneError,
}: MembershipPhoneFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="member-mobile" className={labelClass}>
          Mobile phone number <span className="text-red-600">*</span>
        </label>
        <Input
          id="member-mobile"
          type="tel"
          placeholder="+233 20 000 0000"
          aria-invalid={Boolean(mobilePhoneError)}
          className={mobilePhoneError ? errorFieldClass : undefined}
          {...register("mobilePhone")}
        />
        {mobilePhoneError ? (
          <p className={errorMessageClass}>{mobilePhoneError}</p>
        ) : null}
      </div>
      <div>
        <label htmlFor="member-home-phone" className={labelClass}>
          Home phone number
        </label>
        <Input
          id="member-home-phone"
          type="tel"
          placeholder="+233 30 000 0000"
          {...register("homePhone")}
        />
      </div>
    </div>
  );
}
