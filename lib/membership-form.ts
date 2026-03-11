import { z } from "zod";

export const genderOptions = ["Male", "Female", "Prefer not to say"] as const;

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required`);

const optionalText = z.string().trim();

export const membershipFormSchema = z
  .object({
    firstName: requiredText("First name"),
    lastName: requiredText("Last name"),
    birthDay: requiredText("Birth day"),
    birthMonth: requiredText("Birth month"),
    birthYear: requiredText("Birth year"),
    gender: z.union([z.literal(""), z.enum(genderOptions)]),
    mobilePhone: requiredText("Mobile phone number"),
    homePhone: optionalText,
    email: z
      .string()
      .trim()
      .min(1, "Email address is required")
      .email("Enter a valid email address"),
    addressLine1: optionalText,
    addressLine2: optionalText,
    digitalAddress: optionalText,
    emergencyFirstName: optionalText,
    emergencyLastName: optionalText,
    emergencyRelationship: optionalText,
    emergencyPhone: optionalText,
  })
  .superRefine((value, ctx) => {
    const day = Number(value.birthDay);
    const month = Number(value.birthMonth);
    const year = Number(value.birthYear);

    if (
      !Number.isInteger(day) ||
      !Number.isInteger(month) ||
      !Number.isInteger(year)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["birthDay"],
        message: "Enter a valid date of birth",
      });
      return;
    }

    const birthDate = new Date(Date.UTC(year, month - 1, day));
    const isValidDate =
      birthDate.getUTCFullYear() === year &&
      birthDate.getUTCMonth() === month - 1 &&
      birthDate.getUTCDate() === day;

    if (!isValidDate) {
      ctx.addIssue({
        code: "custom",
        path: ["birthDay"],
        message: "Enter a valid date of birth",
      });
      return;
    }

    const today = new Date();
    const todayUtc = Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
    );

    if (birthDate.getTime() > todayUtc) {
      ctx.addIssue({
        code: "custom",
        path: ["birthDay"],
        message: "Date of birth cannot be in the future",
      });
    }
  });

export type MembershipFormValues = z.infer<typeof membershipFormSchema>;

export const defaultMembershipFormValues: MembershipFormValues = {
  firstName: "",
  lastName: "",
  birthDay: "",
  birthMonth: "",
  birthYear: "",
  gender: "",
  mobilePhone: "",
  homePhone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  digitalAddress: "",
  emergencyFirstName: "",
  emergencyLastName: "",
  emergencyRelationship: "",
  emergencyPhone: "",
};

export const getMembershipFullName = (values: MembershipFormValues) =>
  `${values.firstName} ${values.lastName}`.replace(/\s+/g, " ").trim();

export const createMembershipSubmission = (
  rawValues: MembershipFormValues,
  redirectTarget: "home" | "register" = "home",
) => {
  const values = membershipFormSchema.parse(rawValues);
  const formData = new FormData();

  for (const [field, value] of Object.entries(values)) {
    formData.set(field, value);
  }

  formData.set("name", getMembershipFullName(values));
  formData.set("phone", values.mobilePhone);
  formData.set("redirectTarget", redirectTarget);

  return formData;
};
