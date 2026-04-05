import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "action";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClassMap: Record<ButtonVariant, string> = {
  primary: "bg-[#14110b] text-[#f5f1ea] hover:opacity-90",
  secondary: "border border-[#14110b] text-[#14110b] hover:bg-[#f3ede3]",
  ghost: "text-[#14110b] hover:bg-[#f3ede3]",
  action:
    "min-h-11 border-3 border-[#3F2D17] bg-[#EBBF6C] text-lg font-bold text-[#3F2D17] hover:bg-[#3F2D17] hover:text-[#F1D39B]",
};

export const actionVariantClass = variantClassMap.action;

export function Button({
  variant,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  const classNames = [
    "inline-flex items-center justify-center rounded-full transition",
    variant ? variantClassMap[variant] : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <button type={type} className={classNames} {...props} />;
}
