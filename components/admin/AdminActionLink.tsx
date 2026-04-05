import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { actionVariantClass } from "@/components/ui/button";

type AdminActionLinkProps = ComponentPropsWithoutRef<typeof Link>;

export function AdminActionLink({
  className,
  ...props
}: AdminActionLinkProps) {
  const classNames = [
    "inline-flex w-full items-center justify-center rounded-full px-4 py-2 transition",
    actionVariantClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <Link className={classNames} {...props} />;
}
