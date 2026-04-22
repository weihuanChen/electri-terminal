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
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="card card-hoverable overflow-hidden"
        >
          <button
            className="tap-target w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            aria-expanded={openIndex === index}
          >
            <span className="font-semibold pr-4">{item.question}</span>
            <ChevronDown
              className={`h-5 w-5 flex-shrink-0 text-secondary transition-transform duration-200 ${
                openIndex === index ? "transform rotate-180" : ""
              }`}
            />
          </button>

          {openIndex === index && (
            <div className="px-5 pb-5 pt-0">
              <div className="text-secondary text-sm leading-relaxed">
                {item.answer}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
