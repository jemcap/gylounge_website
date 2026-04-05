import { describe, expect, it } from "vitest";
import {
  adminMemberUpdateSchema,
  filterAdminMembers,
  formatAdminMemberDateAdded,
  getAdminMemberFullName,
  normalizeAdminMemberForForm,
  type AdminMember,
} from "@/lib/admin-member";

const baseMember: AdminMember = {
  birthday: "1952-03-05",
  created_at: null,
  email: "ama@example.com",
  emergency_contact_first_name: "Kwame",
  emergency_contact_last_name: "Boateng",
  emergency_contact_phone: "+233200000002",
  emergency_contact_relationship: "Son",
  first_name: "Ama",
  gender: "Female",
  home_address_digital: "GA-123-4567",
  home_address_line1: "House 5",
  home_address_line2: "",
  id: "11111111-1111-4111-8111-111111111111",
  last_name: "Boateng",
  phone: "+233200000001",
  status: "pending",
};

describe("admin member helpers", () => {
  it("normalizes the admin member update payload", () => {
    const parsed = adminMemberUpdateSchema.parse({
      ...normalizeAdminMemberForForm(baseMember),
      email: " AMA@EXAMPLE.COM ",
      phone: " ",
    });

    expect(parsed.email).toBe("ama@example.com");
    expect(parsed.phone).toBeNull();
  });

  it("rejects future birthdays", () => {
    const nextYear = new Date().getUTCFullYear() + 1;
    const result = adminMemberUpdateSchema.safeParse({
      ...normalizeAdminMemberForForm(baseMember),
      birthday: `${nextYear}-01-01`,
    });

    expect(result.success).toBe(false);
  });

  it("filters members by name or email case-insensitively", () => {
    const members = [
      baseMember,
      {
        ...baseMember,
        id: "22222222-2222-4222-8222-222222222222",
        email: "kwesi@example.com",
        first_name: "Kwesi",
        last_name: "Owusu",
        status: "active",
      },
    ];

    expect(filterAdminMembers(members, "owu")).toHaveLength(1);
    expect(filterAdminMembers(members, "AMA@EXAMPLE")).toHaveLength(1);
    expect(getAdminMemberFullName(members[0])).toBe("Ama Boateng");
  });

  it("formats the member created date safely", () => {
    expect(formatAdminMemberDateAdded("2026-04-05T10:00:00.000Z")).toBe(
      "Apr 5, 2026",
    );
    expect(formatAdminMemberDateAdded(null)).toBe("Unknown");
  });
});
