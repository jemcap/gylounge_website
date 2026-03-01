"use client";

import { useState, type ReactNode } from "react";
import { AccordionItem } from "./AccordionItem";
import { HomeDefaultContent } from "./HomeDefaultContent";

type AccordionEntry = {
  id: string;
  title: string;
  content: ReactNode;
};

type HomeAccordionSectionProps = {
  entries: AccordionEntry[];
  initialOpenId?: string | null;
};

export function HomeAccordionSection({
  entries,
  initialOpenId = null,
}: HomeAccordionSectionProps) {
  const [activeId, setActiveId] = useState<string | null>(initialOpenId);

  const toggle = (id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  /* ── Default state: no accordion open ─────────────────────────────
     Flex layout — accordion titles as nav (left), promo card (right).
     On mobile: stacked vertically (nav on top, promo below).         */
  if (activeId === null) {
    return (
      <section className="flex flex-1 flex-col bg-[#DBD189] md:flex-row">
        <nav className="flex flex-col md:w-2/5 lg:w-1/3">
          {entries.map((entry) => (
            <AccordionItem
              key={entry.id}
              id={entry.id}
              title={entry.title}
              isOpen={false}
              onToggle={() => toggle(entry.id)}
            >
              {entry.content}
            </AccordionItem>
          ))}
        </nav>

        <div className="flex flex-1 border-t border-[#c9b86e]/40 md:border-l md:border-t-0">
          <HomeDefaultContent onRegisterClick={() => toggle("register")} />
        </div>
      </section>
    );
  }

  /* ── Active state: one accordion open ─────────────────────────────
     Stacked column — open accordion fills the remaining viewport
     height via cascading flex-1. Collapsed items sit above/below.   */
  return (
    <section className="flex flex-1 flex-col">
      {entries.map((entry) => (
        <AccordionItem
          key={entry.id}
          id={entry.id}
          title={entry.title}
          isOpen={activeId === entry.id}
          onToggle={() => toggle(entry.id)}
        >
          {entry.content}
        </AccordionItem>
      ))}
    </section>
  );
}
