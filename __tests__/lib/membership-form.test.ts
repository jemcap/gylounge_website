import { describe, expect, it } from "vitest";
import {
  createMembershipSubmission,
  getMembershipFullName,
  membershipFormSchema,
} from "@/lib/membership-form";

const validMembershipForm = {
  firstName: " Ama ",
  lastName: " Boateng ",
  birthDay: "05",
  birthMonth: "03",
  birthYear: "1952",
  gender: "Female" as const,
  mobilePhone: " +233 20 000 0000 ",
  homePhone: "",
  email: " AMA@example.com ",
  addressLine1: "House 5",
  addressLine2: "",
  digitalAddress: "",
  emergencyFirstName: "",
  emergencyLastName: "",
  emergencyRelationship: "",
  emergencyPhone: "",
};

describe("membershipFormSchema", () => {
  it("trims values and accepts a valid membership payload", () => {
    const result = membershipFormSchema.parse(validMembershipForm);

    expect(result.firstName).toBe("Ama");
    expect(result.lastName).toBe("Boateng");
    expect(result.mobilePhone).toBe("+233 20 000 0000");
    expect(result.email).toBe("AMA@example.com");
  });

  it("rejects impossible dates of birth", () => {
    const result = membershipFormSchema.safeParse({
      ...validMembershipForm,
      birthDay: "31",
      birthMonth: "02",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.birthDay).toContain(
        "Enter a valid date of birth",
      );
    }
  });

  it("normalizes the server submission payload", () => {
    const formData = createMembershipSubmission(validMembershipForm, "register");

    expect(getMembershipFullName(membershipFormSchema.parse(validMembershipForm))).toBe(
      "Ama Boateng",
    );
    expect(formData.get("name")).toBe("Ama Boateng");
    expect(formData.get("phone")).toBe("+233 20 000 0000");
    expect(formData.get("email")).toBe("AMA@example.com");
    expect(formData.get("redirectTarget")).toBe("register");
    expect(formData.get("firstName")).toBe("Ama");
  });
});
