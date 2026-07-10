"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

type CopyState = "idle" | "copied" | "failed";
type SourceCopyGroupId =
  | "content"
  | "pageConfigContent"
  | "longform"
  | "seoBoost"
  | "pageConfig";

export type SourceCopyValues = {
  title?: string;
  description?: string;
  shortDescription?: string;
  shortTitle?: string;
  summary?: string;
  content?: string;
  seoTitle?: string;
  seoDescription?: string;
  pageConfigContentJson?: string;
  longformMarkdown?: string;
  seoBoostJson?: string;
  pageConfigJson?: string;
  highlightsJson?: string;
  featureBulletsJson?: string;
};

type SourceCopyField = keyof SourceCopyValues;

const CONTENT_FORM_FIELDS = [
  "title",
  "description",
  "shortDescription",
  "shortTitle",
  "summary",
  "content",
  "seoTitle",
  "seoDescription",
  "highlightsJson",
  "featureBulletsJson",
] as const satisfies readonly SourceCopyField[];

const PAGE_CONFIG_FORM_FIELDS = ["pageConfigJson"] as const satisfies readonly SourceCopyField[];
const PAGE_CONFIG_CONTENT_FORM_FIELDS = [
  "pageConfigContentJson",
] as const satisfies readonly SourceCopyField[];
const LONGFORM_FORM_FIELDS = ["longformMarkdown"] as const satisfies readonly SourceCopyField[];
const SEO_BOOST_FORM_FIELDS = ["seoBoostJson"] as const satisfies readonly SourceCopyField[];

const SOURCE_COPY_GROUPS = [
  {
    id: "content",
    label: "Copy fields",
    fields: CONTENT_FORM_FIELDS,
  },
  {
    id: "pageConfigContent",
    label: "Copy page content",
    fields: PAGE_CONFIG_CONTENT_FORM_FIELDS,
  },
  {
    id: "longform",
    label: "Copy longform",
    fields: LONGFORM_FORM_FIELDS,
  },
  {
    id: "seoBoost",
    label: "Copy seoBoost",
    fields: SEO_BOOST_FORM_FIELDS,
  },
  {
    id: "pageConfig",
    label: "Copy other config",
    fields: PAGE_CONFIG_FORM_FIELDS,
  },
] as const;

function setFieldValue(form: HTMLFormElement, name: string, value: string) {
  const field = form.elements.namedItem(name);
  if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
    return;
  }

  field.value = value;
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
}

function parseJsonObject(value?: string) {
  if (!value) return undefined;

  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : undefined;
  } catch {
    return undefined;
  }
}

function parseJsonArray(value?: string) {
  if (!value) return undefined;

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function hasFieldValue(sourceValues: SourceCopyValues, fields: readonly SourceCopyField[]) {
  return fields.some((key) => {
    const value = sourceValues[key];
    return typeof value === "string" && value.length > 0;
  });
}

function buildClipboardText(
  sourceValues: SourceCopyValues,
  fields: readonly SourceCopyField[]
) {
  if (fields.length === 1) {
    const [field] = fields;
    if (
      field === "pageConfigJson" ||
      field === "pageConfigContentJson" ||
      field === "seoBoostJson"
    ) {
      return sourceValues[field] || "{}";
    }
    if (field === "longformMarkdown") {
      return sourceValues.longformMarkdown || "";
    }
  }

  const payload: Record<string, unknown> = {};

  for (const key of fields) {
    const value = sourceValues[key];
    if (typeof value === "string" && value.length > 0) {
      payload[key] = value;
    }
  }

  const pageConfig = parseJsonObject(sourceValues.pageConfigJson);
  const pageConfigContent = parseJsonObject(sourceValues.pageConfigContentJson);
  const seoBoost = parseJsonObject(sourceValues.seoBoostJson);
  const highlights = parseJsonArray(sourceValues.highlightsJson);
  const featureBullets = parseJsonArray(sourceValues.featureBulletsJson);

  if (fields.includes("pageConfigJson") && pageConfig) payload.pageConfig = pageConfig;
  if (fields.includes("pageConfigContentJson") && pageConfigContent) {
    payload.pageConfigContent = pageConfigContent;
  }
  if (fields.includes("seoBoostJson") && seoBoost) payload.seoBoost = seoBoost;
  if (fields.includes("highlightsJson") && highlights) payload.highlights = highlights;
  if (fields.includes("featureBulletsJson") && featureBullets) {
    payload.featureBullets = featureBullets;
  }

  return JSON.stringify(payload, null, 2);
}

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    const didCopy = document.execCommand("copy");
    if (!didCopy) {
      throw new Error("clipboard_unavailable");
    }
  } finally {
    document.body.removeChild(textarea);
  }
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
  const [copyStates, setCopyStates] = useState<Record<SourceCopyGroupId, CopyState>>({
    content: "idle",
    pageConfigContent: "idle",
    longform: "idle",
    seoBoost: "idle",
    pageConfig: "idle",
  });
  const resetTimers = useRef<Partial<Record<SourceCopyGroupId, number>>>({});

  useEffect(() => {
    const timers = resetTimers.current;
    return () => {
      for (const timer of Object.values(timers)) {
        if (timer) window.clearTimeout(timer);
      }
    };
  }, []);

  function setGroupState(groupId: SourceCopyGroupId, state: CopyState) {
    setCopyStates((current) => ({
      ...current,
      [groupId]: state,
    }));
  }

  async function copySourceIntoForm(
    groupId: SourceCopyGroupId,
    fields: readonly SourceCopyField[]
  ) {
    const form = document.getElementById(formId);
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    for (const key of fields) {
      const value = sourceValues[key];
      if (value !== undefined) {
        setFieldValue(form, key, value);
      }
    }

    try {
      await copyToClipboard(buildClipboardText(sourceValues, fields));
      setGroupState(groupId, "copied");
    } catch {
      setGroupState(groupId, "failed");
    }

    const resetTimer = resetTimers.current[groupId];
    if (resetTimer) {
      window.clearTimeout(resetTimer);
    }
    resetTimers.current[groupId] = window.setTimeout(() => setGroupState(groupId, "idle"), 1800);
  }

  const availableGroups = SOURCE_COPY_GROUPS.filter((group) =>
    hasFieldValue(sourceValues, group.fields)
  );

  if (availableGroups.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {availableGroups.map((group) => {
        const copyState = copyStates[group.id];
        const buttonLabel =
          copyState === "copied" ? "Copied" : copyState === "failed" ? "Filled only" : group.label;

        return (
          <button
            key={group.id}
            type="button"
            onClick={() => copySourceIntoForm(group.id, group.fields)}
            disabled={disabled}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-300 px-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {copyState === "copied" ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {buttonLabel}
          </button>
        );
      })}
    </div>
  );
}
