"use client";

import { Pencil, Trash2, X } from "lucide-react";
import {
  useDeferredValue,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogSideContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  labelClass,
  selectClass,
} from "@/components/forms/membership-form-styles";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  adminMemberStatusOptions,
  filterAdminMembers,
  formatAdminMemberDateAdded,
  getAdminMemberFullName,
  getTotalPages,
  normalizeAdminMemberForForm,
  paginateItems,
  type AdminMember,
  type AdminMemberFormValues,
} from "@/lib/admin-member";
import { genderOptions } from "@/lib/membership-form";

type AdminMembersManagerProps = {
  members: AdminMember[];
};

type MemberActionFeedback = {
  message: string;
  tone: "success" | "error";
};

import { feedbackClassMap } from "@/lib/feedback-styles";

const statusDotClassMap = {
  active: "bg-[#22c55e]",
  pending: "bg-[#ef4444]",
} as const;
const editDrawerAnimationDurationMs = 300;

type MemberTextFieldProps = {
  defaultValue: string;
  label: string;
  name: keyof AdminMemberFormValues;
  required?: boolean;
  type?: "date" | "email" | "tel" | "text";
};

function MemberTextField({
  defaultValue,
  label,
  name,
  required = false,
  type = "text",
}: MemberTextFieldProps) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <Input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="bg-white"
      />
    </label>
  );
}

type MemberSelectFieldProps = {
  defaultValue: string;
  label: string;
  name: keyof Pick<AdminMemberFormValues, "gender" | "status">;
  options: { label: string; value: string }[];
};

function MemberSelectField({
  defaultValue,
  label,
  name,
  options,
}: MemberSelectFieldProps) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className={`${selectClass} min-h-[50px] bg-white`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AdminMembersManager({ members }: AdminMembersManagerProps) {
  const [memberList, setMemberList] = useState(members);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<MemberActionFeedback | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const filteredMembers = filterAdminMembers(memberList, deferredSearchQuery);
  const totalPages = getTotalPages(filteredMembers.length);
  const safePage = Math.min(currentPage, totalPages);
  const paginatedMembers = paginateItems(filteredMembers, safePage);
  const editingMember =
    memberList.find((member) => member.id === editingMemberId) || null;
  const editingMemberValues = editingMember
    ? normalizeAdminMemberForForm(editingMember)
    : null;

  useEffect(() => {
    if (isEditDrawerOpen || !editingMemberId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setEditingMemberId(null);
    }, editDrawerAnimationDurationMs);

    return () => window.clearTimeout(timeoutId);
  }, [editingMemberId, isEditDrawerOpen]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearchQuery]);

  const handleDialogOpenChange = (open: boolean) => {
    if (!open && !isSaving) {
      setIsEditDrawerOpen(false);
      setDialogError(null);
    }
  };

  const handleEdit = (memberId: string) => {
    setEditingMemberId(memberId);
    setDialogError(null);
    setIsEditDrawerOpen(true);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingMember) {
      return;
    }

    setIsSaving(true);
    setDialogError(null);
    setFeedback(null);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`/api/admin/members/${editingMember.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as {
        error?: string;
        member?: AdminMember;
      } | null;

      if (!response.ok || !result?.member) {
        throw new Error(result?.error || "Member update failed.");
      }

      setMemberList((currentMembers) =>
        currentMembers.map((member) =>
          member.id === result.member?.id ? result.member : member,
        ),
      );
      setIsEditDrawerOpen(false);
      setFeedback({
        tone: "success",
        message: `${getAdminMemberFullName(result.member)} was updated.`,
      });
    } catch (error) {
      setDialogError(
        error instanceof Error ? error.message : "Member update failed.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (member: AdminMember) => {
    const memberName = getAdminMemberFullName(member);
    const shouldDelete = window.confirm(
      `Delete ${memberName}? This is blocked if the member still has bookings.`,
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingMemberId(member.id);
    setFeedback(null);

    try {
      const response = await fetch(`/api/admin/members/${member.id}`, {
        method: "DELETE",
      });
      const result = (await response.json().catch(() => null)) as {
        error?: string;
        id?: string;
      } | null;

      if (!response.ok || !result?.id) {
        throw new Error(result?.error || "Member deletion failed.");
      }

      setMemberList((currentMembers) =>
        currentMembers.filter(
          (currentMember) => currentMember.id !== result.id,
        ),
      );
      setFeedback({
        tone: "success",
        message: `${memberName} was deleted.`,
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        message:
          error instanceof Error ? error.message : "Member deletion failed.",
      });
    } finally {
      setDeletingMemberId(null);
    }
  };

  const hasSearchQuery = deferredSearchQuery.trim().length > 0;

  return (
    <>
      <Card>
        <div className="space-y-4">
          {feedback ? (
            <p
              className={`rounded-2xl px-4 py-3 text-sm ${feedbackClassMap[feedback.tone]}`}
            >
              {feedback.message}
            </p>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <label className="block">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by first name, last name, or email"
                className="bg-white"
              />
            </label>
          </div>

          <div className="overflow-hidden rounded-4xl border-3 border-[#8F887D] bg-[#fdfaf4]">
            <table className="w-full border-collapse text-left lg:table-fixed lg:min-w-2xl">
              <thead className="hidden bg-white text-lg text-[#261B07] border-b-3 border-[#8F887D] lg:table-header-group">
                <tr>
                  <th scope="col" className="w-1/4 px-4 py-3 font-semibold">
                    Name
                  </th>
                  <th scope="col" className="w-1/4 px-4 py-3 font-semibold">
                    Date Added
                  </th>
                  <th scope="col" className="w-1/4 px-4 py-3 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="w-1/4 px-4 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="block divide-y divide-[#e9dccb] lg:table-row-group">
                {paginatedMembers.length ? (
                  paginatedMembers.map((member) => {
                    const normalizedStatus =
                      member.status === "active" ? "active" : "pending";
                    const isDeleting = deletingMemberId === member.id;

                    return (
                      <tr
                        key={member.id}
                        className="block px-4 py-4 lg:table-row lg:px-0 lg:py-0"
                      >
                        <th
                          scope="row"
                          className="block px-0 pb-2 text-left font-medium text-[#1c1b18] lg:table-cell lg:px-4 lg:py-4"
                        >
                          <div className="space-y-1">
                            <p className="font-semibold">
                              {getAdminMemberFullName(member)}
                            </p>
                            <p className="text-sm font-normal text-[#5c5348]">
                              {member.email}
                            </p>
                          </div>
                        </th>
                        <td className="block px-0 py-1 text-sm text-[#3b3127] lg:table-cell lg:px-4 lg:py-4">
                          <span className="mr-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#8b6b3f] lg:hidden">
                            Joined
                          </span>
                          {formatAdminMemberDateAdded(member.created_at)}
                        </td>
                        <td className="block px-0 py-1 lg:table-cell lg:px-4 lg:py-4">
                          <span className="inline-flex items-center gap-2 text-sm text-[#3b3127]">
                            <span
                              className={`inline-block h-2.5 w-2.5 rounded-full ${statusDotClassMap[normalizedStatus]}`}
                              aria-hidden="true"
                            />
                            {normalizedStatus[0].toUpperCase() +
                              normalizedStatus.slice(1)}
                          </span>
                        </td>
                        <td className="block px-0 pt-3 lg:table-cell lg:px-4 lg:py-4">
                          {/* Mobile: full-width text buttons */}
                          <div className="flex gap-2 lg:hidden">
                            <Button
                              variant="secondary"
                              aria-label={`Edit ${getAdminMemberFullName(member)}`}
                              className="min-h-11 flex-1 rounded-xl bg-[#2c5282] font-semibold text-white hover:bg-[#234a73]"
                              onClick={() => handleEdit(member.id)}
                              disabled={isDeleting}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="secondary"
                              aria-label={`Delete ${getAdminMemberFullName(member)}`}
                              className="min-h-11 flex-1 rounded-xl bg-[#8b2e2a] font-semibold text-white hover:bg-[#6f2422]"
                              onClick={() => handleDelete(member)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? "Deleting…" : "Delete"}
                            </Button>
                          </div>
                          {/* Desktop: icon buttons */}
                          <div className="hidden items-center gap-1 lg:flex lg:justify-end">
                            <Button
                              variant="ghost"
                              aria-label={`Edit ${getAdminMemberFullName(member)}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full p-0 text-[#3b3127] hover:bg-[#eee8dd]"
                              onClick={() => handleEdit(member.id)}
                              disabled={isDeleting}
                            >
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                            </Button>
                            <Button
                              variant="ghost"
                              aria-label={`Delete ${getAdminMemberFullName(member)}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full p-0 text-[#8b2e2a] hover:bg-[#fff1f0]"
                              onClick={() => handleDelete(member)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr className="block lg:table-row">
                    <td
                      colSpan={4}
                      className="block px-4 py-8 text-sm text-[#5c5348] lg:table-cell"
                    >
                      {hasSearchQuery
                        ? "No members match that search."
                        : "No members are currently saved."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={safePage}
            onPageChange={setCurrentPage}
            totalPages={totalPages}
          />
        </div>
      </Card>

      <Dialog open={isEditDrawerOpen} onOpenChange={handleDialogOpenChange}>
        {editingMember && editingMemberValues ? (
          <DialogSideContent>
            <button
              type="button"
              aria-label="Close edit member panel"
              className="absolute right-4 top-6 inline-flex h-9 w-9 items-center justify-center rounded-full text-[#f5f1ea] transition hover:bg-[#3f2d17]"
              onClick={() => handleDialogOpenChange(false)}
              disabled={isSaving}
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>

            <DialogHeader className="pr-12">
              <DialogTitle className="text-[#261B07]">Edit Member</DialogTitle>
              <DialogDescription className="text-sm text-[#5f5240] sm:text-sm">
                Update the member profile and status, then save the record back
                through the protected admin API.
              </DialogDescription>
            </DialogHeader>

            <form
              key={editingMember.id}
              onSubmit={handleSave}
              className="mt-6 flex min-h-0 flex-1 text-[#261B07] flex-col overflow-hidden rounded-4xl bg-[#f8f4eb]  p-4  sm:p-6"
            >
              {dialogError ? (
                <p
                  className={`rounded-2xl border px-4 py-3 text-sm ${feedbackClassMap.error}`}
                >
                  {dialogError}
                </p>
              ) : null}

              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <div className="space-y-6">
                  <div className="grid gap-4">
                    <MemberTextField
                      name="first_name"
                      label="First name"
                      defaultValue={editingMemberValues.first_name}
                      required
                    />
                    <MemberTextField
                      name="last_name"
                      label="Last name"
                      defaultValue={editingMemberValues.last_name}
                      required
                    />
                    <MemberTextField
                      name="email"
                      label="Email"
                      defaultValue={editingMemberValues.email}
                      type="email"
                      required
                    />
                    <MemberTextField
                      name="phone"
                      label="Phone"
                      defaultValue={editingMemberValues.phone}
                      type="tel"
                    />
                    <MemberTextField
                      name="birthday"
                      label="Date of birth"
                      defaultValue={editingMemberValues.birthday}
                      type="date"
                      required
                    />
                    <MemberSelectField
                      name="gender"
                      label="Gender"
                      defaultValue={editingMemberValues.gender}
                      options={[
                        { label: "Prefer not to say", value: "" },
                        ...genderOptions.map((gender) => ({
                          label: gender,
                          value: gender,
                        })),
                      ]}
                    />
                    <MemberSelectField
                      name="status"
                      label="Status"
                      defaultValue={editingMemberValues.status}
                      options={adminMemberStatusOptions.map((status) => ({
                        label: status[0].toUpperCase() + status.slice(1),
                        value: status,
                      }))}
                    />
                  </div>

                  <div className="grid gap-4">
                    <MemberTextField
                      name="home_address_line1"
                      label="Address line 1"
                      defaultValue={editingMemberValues.home_address_line1}
                    />
                    <MemberTextField
                      name="home_address_line2"
                      label="Address line 2"
                      defaultValue={editingMemberValues.home_address_line2}
                    />
                    <MemberTextField
                      name="home_address_digital"
                      label="Digital address"
                      defaultValue={editingMemberValues.home_address_digital}
                    />
                  </div>

                  <div className="grid gap-4">
                    <MemberTextField
                      name="emergency_contact_first_name"
                      label="Emergency first name"
                      defaultValue={
                        editingMemberValues.emergency_contact_first_name
                      }
                    />
                    <MemberTextField
                      name="emergency_contact_last_name"
                      label="Emergency last name"
                      defaultValue={
                        editingMemberValues.emergency_contact_last_name
                      }
                    />
                    <MemberTextField
                      name="emergency_contact_relationship"
                      label="Emergency relationship"
                      defaultValue={
                        editingMemberValues.emergency_contact_relationship
                      }
                    />
                    <MemberTextField
                      name="emergency_contact_phone"
                      label="Emergency phone"
                      defaultValue={editingMemberValues.emergency_contact_phone}
                      type="tel"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-[#dcccb8] pt-4">
                <DialogFooter className="mt-0 flex-col gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    className="min-h-11 w-full px-5 py-2 font-semibold"
                    onClick={() => handleDialogOpenChange(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="min-h-11 w-full px-5 py-2 font-semibold"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save member"}
                  </Button>
                </DialogFooter>
              </div>
            </form>
          </DialogSideContent>
        ) : null}
      </Dialog>
    </>
  );
}
