import { describe, expect, it } from "vitest";
import {
  isAdminEmailAllowlisted,
  parseAdminEmailAllowlist,
} from "@/lib/admin-allowlist.server";
import { adminPasswordUpdateSchema } from "@/lib/admin-auth";

describe("admin auth helpers", () => {
  it("normalizes and parses the admin allowlist", () => {
    const allowlist = parseAdminEmailAllowlist("admin@goldenyearslounge.com, ops@gylounge.com\nteam@gylounge.com");

    expect(Array.from(allowlist)).toEqual([
      "admin@goldenyearslounge.com",
      "ops@gylounge.com",
      "team@gylounge.com",
    ]);
  });

  it("checks allowlisted emails case-insensitively", () => {
    process.env.ADMIN_EMAIL_ALLOWLIST = "admin@goldenyearslounge.com";

    expect(isAdminEmailAllowlisted("admin@goldenyearslounge.com")).toBe(true);
    expect(isAdminEmailAllowlisted("guest@gylounge.com")).toBe(false);
  });

  it("requires matching reset-password fields", () => {
    const result = adminPasswordUpdateSchema.safeParse({
      password: "new-password",
      confirmPassword: "different-password",
    });

    expect(result.success).toBe(false);
  });
});
