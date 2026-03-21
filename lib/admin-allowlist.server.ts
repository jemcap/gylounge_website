const normalizeAdminEmail = (email: string) => email.trim().toLowerCase();

export const parseAdminEmailAllowlist = (
  raw = process.env.ADMIN_EMAIL_ALLOWLIST,
) =>
  new Set(
    (raw || "")
      .split(/[,\n]/)
      .map((entry) => normalizeAdminEmail(entry))
      .filter(Boolean),
  );

export const isAdminEmailAllowlisted = (email: string) =>
  parseAdminEmailAllowlist().has(normalizeAdminEmail(email));
