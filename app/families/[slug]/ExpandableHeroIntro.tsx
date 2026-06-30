"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type ExpandableHeroIntroProps = {
  text: string;
  preview: string;
};

export default function ExpandableHeroIntro({ text, preview }: ExpandableHeroIntroProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const canExpand = text !== preview;

  return (
    <div className="mb-5 text-base text-secondary">
      <p className="leading-7">{isExpanded ? text : preview}</p>
      {canExpand && (
        <button
          type="button"
          className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((current) => !current)}
        >
          {isExpanded ? "Show less" : "Read more"}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  );
}
