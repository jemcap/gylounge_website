import type { HTMLAttributes, ReactNode } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  description?: string;
  footer?: ReactNode;
};

export function Card({
  title,
  description,
  footer,
  className,
  children,
  ...props
}: CardProps) {
  const classNames = [
    "rounded-3xl border border-[#dcccb8] bg-white/80 p-6 shadow-sm",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classNames} {...props}>
      {title ? <h2 className="text-xl font-semibold text-[#1c1b18]">{title}</h2> : null}
      {description ? <p className="mt-2 text-sm text-[#3b3127]">{description}</p> : null}
      <div className={title || description ? "mt-4" : ""}>{children}</div>
      {footer ? <div className="mt-4">{footer}</div> : null}
    </section>
  );
}
