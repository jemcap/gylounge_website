import { NextResponse } from "next/server";
import {
  adminMemberIdSchema,
  adminMemberUpdateSchema,
} from "@/lib/admin-member";
import { requireAdminApiUser } from "@/lib/admin-session";
import { supabaseAdminClient } from "@/lib/supabase";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const jsonError = (error: string, status: number) =>
  NextResponse.json({ error }, { status });

const getAdminErrorResponse = async () => {
  const adminAccess = await requireAdminApiUser();

  if (adminAccess.user) {
    return null;
  }

  if (adminAccess.error === "access-denied") {
    return jsonError("That session is not allowed to access the admin portal.", 403);
  }

  return jsonError("Sign in again to continue.", 401);
};

const getMemberId = async (paramsPromise: Promise<{ id: string }>) => {
  const { id } = await paramsPromise;
  const parsedId = adminMemberIdSchema.safeParse(id);

  if (!parsedId.success) {
    return null;
  }

  return parsedId.data;
};

export async function PUT(request: Request, { params }: RouteContext) {
  const authErrorResponse = await getAdminErrorResponse();

  if (authErrorResponse) {
    return authErrorResponse;
  }

  const memberId = await getMemberId(params);

  if (!memberId) {
    return jsonError("Invalid member id.", 400);
  }

  const payload = await request.json().catch(() => null);

  if (!payload || typeof payload !== "object") {
    return jsonError("Invalid member payload.", 400);
  }

  const parsedPayload = adminMemberUpdateSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return jsonError(
      parsedPayload.error.issues[0]?.message || "Invalid member payload.",
      400,
    );
  }

  const supabase = supabaseAdminClient();
  const { data: updatedMember, error } = await supabase
    .from("members")
    .update(parsedPayload.data)
    .eq("id", memberId)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("Admin member update failed", { error, memberId });
    return jsonError("Member update failed.", 500);
  }

  if (!updatedMember) {
    return jsonError("Member not found.", 404);
  }

  return NextResponse.json({ member: updatedMember });
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const authErrorResponse = await getAdminErrorResponse();

  if (authErrorResponse) {
    return authErrorResponse;
  }

  const memberId = await getMemberId(params);

  if (!memberId) {
    return jsonError("Invalid member id.", 400);
  }

  const supabase = supabaseAdminClient();
  const { count: relatedBookingCount, error: relatedBookingsError } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("member_id", memberId);

  if (relatedBookingsError) {
    console.error("Admin member delete booking guard failed", {
      error: relatedBookingsError,
      memberId,
    });
    return jsonError("Member deletion could not be verified.", 500);
  }

  if ((relatedBookingCount || 0) > 0) {
    return jsonError(
      "Members with existing bookings cannot be deleted.",
      409,
    );
  }

  const { data: deletedMember, error: deleteError } = await supabase
    .from("members")
    .delete()
    .eq("id", memberId)
    .select("id")
    .maybeSingle();

  if (deleteError) {
    console.error("Admin member delete failed", { error: deleteError, memberId });
    return jsonError("Member deletion failed.", 500);
  }

  if (!deletedMember) {
    return jsonError("Member not found.", 404);
  }

  return NextResponse.json({ id: deletedMember.id });
}
