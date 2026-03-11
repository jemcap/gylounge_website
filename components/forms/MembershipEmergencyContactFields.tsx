import type { UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { MembershipFormValues } from "@/lib/membership-form";
import { labelClass } from "@/components/forms/membership-form-styles";

type MembershipEmergencyContactFieldsProps = {
  register: UseFormRegister<MembershipFormValues>;
};

export function MembershipEmergencyContactFields({
  register,
}: MembershipEmergencyContactFieldsProps) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="emergency-first-name" className={labelClass}>
            First name
          </label>
          <Input
            id="emergency-first-name"
            placeholder="Kofi"
            {...register("emergencyFirstName")}
          />
        </div>
        <div>
          <label htmlFor="emergency-last-name" className={labelClass}>
            Last name
          </label>
          <Input
            id="emergency-last-name"
            placeholder="Mensah"
            {...register("emergencyLastName")}
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
            placeholder="e.g. Daughter, Nephew"
            {...register("emergencyRelationship")}
          />
        </div>
        <div>
          <label htmlFor="emergency-phone" className={labelClass}>
            Phone number
          </label>
          <Input
            id="emergency-phone"
            type="tel"
            placeholder="+233 20 000 0000"
            {...register("emergencyPhone")}
          />
        </div>
      </div>
    </>
  );
}
