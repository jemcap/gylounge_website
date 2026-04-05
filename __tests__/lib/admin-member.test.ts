import { describe, expect, it } from "vitest";
import {
  adminMemberUpdateSchema,
  filterAdminMembers,
  formatAdminMemberDateAdded,
  getAdminMemberFullName,
  getPaginationRange,
  getTotalPages,
  normalizeAdminMemberForForm,
  paginateItems,
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

describe("paginateItems", () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1);

  it("returns the first page of items", () => {
    expect(paginateItems(items, 1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("returns the second page of items", () => {
    expect(paginateItems(items, 2, 10)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });

  it("returns a partial last page", () => {
    expect(paginateItems(items, 3, 10)).toEqual([21, 22, 23, 24, 25]);
  });

  it("returns an empty array for a page beyond the total", () => {
    expect(paginateItems(items, 4, 10)).toEqual([]);
  });

  it("handles an empty list", () => {
    expect(paginateItems([], 1, 10)).toEqual([]);
  });
});

describe("getTotalPages", () => {
  it("returns 1 for zero items", () => {
    expect(getTotalPages(0, 10)).toBe(1);
  });

  it("returns 1 when items fit in one page", () => {
    expect(getTotalPages(10, 10)).toBe(1);
  });

  it("rounds up for partial pages", () => {
    expect(getTotalPages(11, 10)).toBe(2);
    expect(getTotalPages(25, 10)).toBe(3);
  });
});

describe("getPaginationRange", () => {
  it("returns [1] for a single page", () => {
    expect(getPaginationRange(1, 1)).toEqual([1]);
  });

  it("returns all pages when total is small", () => {
    expect(getPaginationRange(1, 3)).toEqual([1, 2, 3]);
    expect(getPaginationRange(2, 4)).toEqual([1, 2, 3, 4]);
  });

  it("shows left ellipsis when current page is near the end", () => {
    const range = getPaginationRange(7, 8);
    expect(range).toEqual([1, null, 6, 7, 8]);
  });

  it("shows right ellipsis when current page is near the start", () => {
    const range = getPaginationRange(2, 8);
    expect(range).toEqual([1, 2, 3, null, 8]);
  });

  it("shows both ellipses when current page is in the middle", () => {
    const range = getPaginationRange(5, 10);
    expect(range).toEqual([1, null, 4, 5, 6, null, 10]);
  });

  it("does not duplicate first or last page in siblings", () => {
    const range = getPaginationRange(2, 5);
    expect(range).toEqual([1, 2, 3, null, 5]);
  });
});
