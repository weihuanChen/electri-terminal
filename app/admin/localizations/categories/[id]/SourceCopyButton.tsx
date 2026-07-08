"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Check } from "lucide-react";

type SourceCopyValues = {
  title: string;
  description: string;
  shortDescription: string;
  seoTitle: string;
  seoDescription: string;
  pageConfigJson: string;
};

function setFieldValue(form: HTMLFormElement, name: string, value: string) {
  const field = form.elements.namedItem(name);
  if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
    return;
  }

  field.value = value;
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
}

export function SourceCopyButton({
  formId,
  sourceValues,
  disabled = false,
}: {
  formId: string;
  sourceValues: SourceCopyValues;
  disabled?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) {
        window.clearTimeout(resetTimer.current);
      }
    };
  }, []);

  function copySourceIntoForm() {
    const form = document.getElementById(formId);
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    setFieldValue(form, "title", sourceValues.title);
    setFieldValue(form, "description", sourceValues.description);
    setFieldValue(form, "shortDescription", sourceValues.shortDescription);
    setFieldValue(form, "seoTitle", sourceValues.seoTitle);
    setFieldValue(form, "seoDescription", sourceValues.seoDescription);
    setFieldValue(form, "pageConfigJson", sourceValues.pageConfigJson);

    setCopied(true);
    if (resetTimer.current) {
      window.clearTimeout(resetTimer.current);
    }
    resetTimer.current = window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copySourceIntoForm}
      disabled={disabled}
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-300 px-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied" : "Copy source"}
    </button>
  );
}
