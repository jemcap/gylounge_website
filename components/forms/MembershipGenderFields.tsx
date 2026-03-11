import type { UseFormRegister } from "react-hook-form";
import { genderOptions, type MembershipFormValues } from "@/lib/membership-form";
import { labelClass } from "@/components/forms/membership-form-styles";

type MembershipGenderFieldsProps = {
  register: UseFormRegister<MembershipFormValues>;
};

export function MembershipGenderFields({
  register,
}: MembershipGenderFieldsProps) {
  return (
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
              value={option}
              className="h-4 w-4 accent-[#3F2D17]"
              {...register("gender")}
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}
