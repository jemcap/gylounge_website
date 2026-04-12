"use client";

import { useMemo, useState } from "react";
import { homeFaqItems } from "@/app/home/content/home-faq-items";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function HomeFaqsContent() {
  const [query, setQuery] = useState("");

  const normalizeQuery = query.trim().toLowerCase();
  const filteredQuestions = !normalizeQuery
    ? homeFaqItems
    : homeFaqItems.filter((item) => {
        return item.title.toLowerCase().includes(normalizeQuery);
      });

  return (
    <div className="w-full space-y-6 text-[#261B07]">
      <div className="space-y-3">
        <h2 className="font-serif text-[86px] italic sm:text-6xl">
          Frequently Asked Questions
        </h2>
        <p className="max-w-3xl text-sm font-bold md:text-base">
          Browse through these FAQ&apos;s to seek answers to commonly raised
          questions about joining and using our facilities. If you don&apos;t
          find your answers below, contact us and we&apos;ll do our best to
          help.
        </p>
      </div>

      <div>
        <Input
          id="faq-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Looking for something?"
          autoComplete="off"
          className="bg-[#EFCD8D]"
          aria-label="Search through frequently asked questions"
        />
      </div>

      {filteredQuestions.length ? (
        <Accordion type="single" collapsible className="space-y-4">
          {filteredQuestions.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger>{item.title}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div
          className="rounded-4xl border-3 border-dashed border-[#3F2D17] bg-[#F1EDE5] px-6 py-8 text-sm text-[#5b4b36] md:text-base"
          role="alert"
        >
          No FAQ questions matched your search. Try a different word or phrase.
        </div>
      )}
    </div>
  );
}
