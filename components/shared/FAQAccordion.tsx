"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3.5">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={`rounded-card border transition-all duration-200 overflow-hidden ${
              isOpen
                ? "border-primary/40 bg-white dark:bg-slate-900 shadow-sm"
                : "border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <button
              className="tap-target w-full flex items-center justify-between px-6 py-5 text-left transition-colors"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
            >
              <span
                className={`font-semibold pr-4 text-base transition-colors ${
                  isOpen ? "text-primary" : "text-foreground"
                }`}
              >
                {item.question}
              </span>
              <span
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                  isOpen
                    ? "bg-primary/10 text-primary"
                    : "bg-slate-100 dark:bg-slate-800 text-secondary"
                }`}
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </span>
            </button>

            {isOpen && (
              <div className="px-6 pb-6 pt-0">
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 text-secondary text-sm sm:text-[15px] leading-relaxed">
                  {item.answer}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
