import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmailAllowlisted } from "@/lib/admin-allowlist.server";
import { createProxySupabaseClient } from "@/lib/supabase-server";

const publicAdminPaths = new Set(["/admin/login", "/admin/reset-password", "/admin/forgot-password"]);

const copyCookies = (from: NextResponse, to: NextResponse) => {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });

  return to;
};

const redirectTo = (
  request: NextRequest,
  response: NextResponse,
  pathname: string,
  params?: Record<string, string>,
) => {
  const url = new URL(pathname, request.url);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return copyCookies(response, NextResponse.redirect(url));
};

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPublicAdminPath = publicAdminPaths.has(pathname);
  const { supabase, getResponse } = createProxySupabaseClient(request);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  const response = getResponse();

  if (user?.email && !isAdminEmailAllowlisted(user.email)) {
    await supabase.auth.signOut();
    return redirectTo(request, getResponse(), "/admin/login", {
      error: "access-denied",
    });
  }

  if (!isPublicAdminPath && (error || !user?.email)) {
    const hadSession = request.cookies
      .getAll()
      .some((c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));

    return redirectTo(
      request,
      response,
      "/admin/login",
      hadSession ? { error: "session-expired" } : undefined,
    );
  }

  if (isPublicAdminPath && user?.email && request.method === "GET") {
    return redirectTo(request, response, "/admin");
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
