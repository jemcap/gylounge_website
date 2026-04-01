export type AdminNavigationItem = {
  href: string;
  label: string;
};

export const adminNavigationItems: AdminNavigationItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
  },
  {
    href: "/admin/members",
    label: "Memberships",
  },
  {
    href: "/admin/bookings",
    label: "Bookings",
  },
];

export function isAdminNavigationItemActive(currentPath: string, href: string) {
  if (href === "/admin") {
    return currentPath === href;
  }

  return currentPath === href || currentPath.startsWith(`${href}/`);
}
