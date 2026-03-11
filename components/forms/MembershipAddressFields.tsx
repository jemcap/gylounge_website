import type { UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { MembershipFormValues } from "@/lib/membership-form";
import { labelClass } from "@/components/forms/membership-form-styles";

type MembershipAddressFieldsProps = {
  register: UseFormRegister<MembershipFormValues>;
};

export function MembershipAddressFields({
  register,
}: MembershipAddressFieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="address-line1" className={labelClass}>
          Address line 1
        </label>
        <Input
          id="address-line1"
          placeholder="House number & street"
          {...register("addressLine1")}
        />
      </div>
      <div>
        <label htmlFor="address-line2" className={labelClass}>
          Address line 2
        </label>
        <Input
          id="address-line2"
          placeholder="Area / suburb"
          {...register("addressLine2")}
        />
      </div>
      <div>
        <label htmlFor="digital-address" className={labelClass}>
          Digital address
        </label>
        <Input
          id="digital-address"
          placeholder="e.g. GA-000-0000"
          {...register("digitalAddress")}
        />
      </div>
    </>
  );
}
