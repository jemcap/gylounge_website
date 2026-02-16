import type { InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  const classNames = [
    "w-full rounded-xl border border-[#d9cfbf] bg-white px-4 py-3 text-sm text-[#1c1b18] outline-none transition focus:border-[#8b6b3f]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <input className={classNames} {...props} />;
}
