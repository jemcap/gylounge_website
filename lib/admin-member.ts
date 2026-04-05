import { z } from "zod";
import type { Database } from "@/app/types/database";
import { genderOptions } from "@/lib/membership-form";

export type AdminMember = Database["public"]["Tables"]["members"]["Row"];

export const adminMemberStatusOptions = ["pending", "active"] as const;

const normalizeMemberEmail = (email: string) => email.trim().toLowerCase();
const normalizeSearchValue = (value: string | null | undefined) =>
  (value || "").trim().toLowerCase();
const adminMemberDateAddedFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required.`);

const optionalText = z.string().trim();
const birthdayErrorMessage = "Enter a valid date of birth.";

const birthdaySchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, birthdayErrorMessage)
  .superRefine((value, ctx) => {
    const [yearValue, monthValue, dayValue] = value.split("-");
    const year = Number(yearValue);
    const month = Number(monthValue);
    const day = Number(dayValue);

    const birthDate = new Date(Date.UTC(year, month - 1, day));
    const isValidDate =
      birthDate.getUTCFullYear() === year &&
      birthDate.getUTCMonth() === month - 1 &&
      birthDate.getUTCDate() === day;

    if (!isValidDate) {
      ctx.addIssue({
        code: "custom",
        message: birthdayErrorMessage,
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
        message: "Date of birth cannot be in the future.",
      });
    }
  });

export const adminMemberIdSchema = z
  .string()
  .trim()
  .uuid("Invalid member id.");

export const adminMemberUpdateSchema = z
  .object({
    first_name: requiredText("First name"),
    last_name: requiredText("Last name"),
    email: z
      .string()
      .trim()
      .min(1, "Email address is required.")
      .email("Enter a valid email address."),
    birthday: birthdaySchema,
    gender: z.union([z.literal(""), z.enum(genderOptions)]),
    phone: optionalText,
    home_address_line1: optionalText,
    home_address_line2: optionalText,
    home_address_digital: optionalText,
    emergency_contact_first_name: optionalText,
    emergency_contact_last_name: optionalText,
    emergency_contact_relationship: optionalText,
    emergency_contact_phone: optionalText,
    status: z.enum(adminMemberStatusOptions),
  })
  .transform((value) => ({
    ...value,
    email: normalizeMemberEmail(value.email),
    phone: value.phone || null,
  }));

export type AdminMemberFormValues = z.input<typeof adminMemberUpdateSchema>;
export type AdminMemberUpdateInput = z.output<typeof adminMemberUpdateSchema>;

export const getAdminMemberFullName = (
  member: Pick<AdminMember, "first_name" | "last_name">,
) => {
  const fullName = [member.first_name || "", member.last_name || ""]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return fullName || "Unnamed member";
};

export const formatAdminMemberDateAdded = (
  createdAt: AdminMember["created_at"],
) => {
  if (!createdAt) {
    return "Unknown";
  }

  const parsedDate = new Date(createdAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown";
  }

  return adminMemberDateAddedFormatter.format(parsedDate);
};

export const filterAdminMembers = (
  members: AdminMember[],
  query: string,
) => {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return members;
  }

  return members.filter((member) =>
    [member.first_name, member.last_name, member.email]
      .map(normalizeSearchValue)
      .some((value) => value.includes(normalizedQuery)),
  );
};

export const normalizeAdminMemberForForm = (
  member: AdminMember,
): AdminMemberFormValues => ({
  first_name: member.first_name || "",
  last_name: member.last_name || "",
  email: member.email,
  birthday: member.birthday,
  gender: genderOptions.includes(member.gender as (typeof genderOptions)[number])
    ? (member.gender as (typeof genderOptions)[number])
    : "",
  phone: member.phone || "",
  home_address_line1: member.home_address_line1,
  home_address_line2: member.home_address_line2,
  home_address_digital: member.home_address_digital,
  emergency_contact_first_name: member.emergency_contact_first_name,
  emergency_contact_last_name: member.emergency_contact_last_name,
  emergency_contact_relationship: member.emergency_contact_relationship,
  emergency_contact_phone: member.emergency_contact_phone,
  status: member.status === "active" ? "active" : "pending",
});
