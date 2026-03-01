import type { ReactNode } from "react";

type AccordionItemProps = {
  id?: string;
  title: string;
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
};

export function AccordionItem({
  id,
  title,
  children,
  isOpen,
  onToggle,
}: AccordionItemProps) {
  return (
    <div
      id={id}
      className={`bg-[#DBD1B9] ${isOpen ? "flex flex-1 flex-col" : ""}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full cursor-pointer px-5 py-4 text-left text-lg font-bold text-[#261B07] md:px-6 md:py-5 md:text-xl"
      >
        {title}
      </button>
      {isOpen && (
        <div className="flex-1 overflow-y-auto px-5 py-5 md:px-6 md:py-6">
          {children}
        </div>
      )}
    </div>
  );
}
