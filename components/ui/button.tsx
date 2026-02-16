import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClassMap: Record<ButtonVariant, string> = {
  primary: "bg-[#14110b] text-[#f5f1ea] hover:opacity-90",
  secondary: "border border-[#14110b] text-[#14110b] hover:bg-[#f3ede3]",
  ghost: "text-[#14110b] hover:bg-[#f3ede3]",
};

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  const classNames = [
    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition",
    variantClassMap[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <button type={type} className={classNames} {...props} />;
}
