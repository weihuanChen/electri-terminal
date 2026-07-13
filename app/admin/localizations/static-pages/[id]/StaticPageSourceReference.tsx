"use client";

import { useRef, useState } from "react";
import { Check, ChevronDown, Copy, ExternalLink } from "lucide-react";
import type { StaticPageContentBlock } from "@/lib/i18n/staticPageContent";

type CopyState = "idle" | "copied" | "failed";
type SourceField =
  | "title"
  | "headline"
  | "intro"
  | "contentJson"
  | "primaryCta"
  | "secondaryCta"
  | "seoTitle"
  | "seoDescription";

const COPY_OPTIONS = [
  { field: "title", label: "Title" },
  { field: "headline", label: "Headline (H1)" },
  { field: "intro", label: "Intro" },
  { field: "contentJson", label: "Full content (structured JSON)" },
  { field: "primaryCta", label: "Primary CTA" },
  { field: "secondaryCta", label: "Secondary CTA" },
  { field: "seoTitle", label: "SEO Title" },
  { field: "seoDescription", label: "SEO Description" },
] as const satisfies ReadonlyArray<{ field: SourceField; label: string }>;

async function writeClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!copied) throw new Error("clipboard_unavailable");
}

function cleanText(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function directMatches(element: Element, selector: string) {
  return Array.from(element.children).filter((child) => child.matches(selector));
}

function childContentSections(element: Element) {
  return Array.from(element.querySelectorAll("section, article")).filter((candidate) => {
    const parentSection = candidate.parentElement?.closest("section, article");
    return parentSection === null || parentSection === element;
  });
}

function buildContentBlock(element: Element, fallbackId: string): StaticPageContentBlock {
  const nestedSections = childContentSections(element);
  const owned = Array.from(element.querySelectorAll("h1, h2, h3, h4, h5, h6, p, ul, ol, a, button"))
    .filter((node) => !nestedSections.some((section) => section.contains(node)));
  const headings = owned
    .filter((node) => /^H[1-6]$/.test(node.tagName))
    .map((node) => ({ level: Number(node.tagName.slice(1)), text: cleanText(node.textContent) }))
    .filter((item) => item.text);
  const paragraphs = owned
    .filter((node) => node.tagName === "P")
    .map((node) => cleanText(node.textContent))
    .filter(Boolean);
  const lists = owned
    .filter((node) => node.tagName === "UL" || node.tagName === "OL")
    .map((node) => ({
      ordered: node.tagName === "OL",
      items: directMatches(node, "li").map((item) => cleanText(item.textContent)).filter(Boolean),
    }))
    .filter((list) => list.items.length > 0);
  const ctas = owned
    .filter((node) =>
      (node.tagName === "A" || node.tagName === "BUTTON") &&
      (node.classList.contains("btn") || node.getAttribute("href")?.includes("contact"))
    )
    .map((node) => ({
      label: cleanText(node.textContent),
      ...(node instanceof HTMLAnchorElement && node.getAttribute("href")
        ? { href: node.getAttribute("href") ?? undefined }
        : {}),
    }))
    .filter((cta) => cta.label);

  return {
    id: element.id || element.getAttribute("data-section") || fallbackId,
    type: element.tagName === "ARTICLE" ? "article" : element.tagName === "MAIN" ? "main" : "section",
    headings,
    paragraphs,
    lists,
    ctas,
    children: nestedSections.map((section, index) =>
      buildContentBlock(section, `${fallbackId}.${index + 1}`)
    ),
  };
}

function buildStructuredContent(documentCopy: Document, sourcePath: string) {
  const main = documentCopy.querySelector("main");
  if (!main) throw new Error("source_main_missing");
  const sections = childContentSections(main);
  const pageKey = sourcePath === "/" ? "home" : sourcePath.replace(/^\//, "");
  return {
    schemaVersion: 1,
    pageKey,
    sourcePath,
    blocks: sections.length > 0
      ? sections.map((section, index) => buildContentBlock(section, `section-${index + 1}`))
      : [buildContentBlock(main, "main")],
  };
}

export function StaticPageSourceReference({ sourcePath }: { sourcePath: string }) {
  const [state, setState] = useState<CopyState>("idle");
  const [lastCopiedLabel, setLastCopiedLabel] = useState("");
  const menuRef = useRef<HTMLDetailsElement>(null);

  async function copySourceField(field: SourceField, label: string) {
    try {
      const response = await fetch(sourcePath, { credentials: "same-origin" });
      if (!response.ok) throw new Error("source_page_unavailable");
      const html = await response.text();
      const documentCopy = new DOMParser().parseFromString(html, "text/html");
      const main = documentCopy.querySelector("main");
      const h1 = main?.querySelector("h1");
      const paragraphs = Array.from(main?.querySelectorAll("p") ?? [])
        .map((element) => element.textContent?.trim() ?? "")
        .filter((text) => text.length >= 20);
      const ctas = Array.from(
        main?.querySelectorAll(
          'a.btn, button.btn, a[href*="contact"], a[href*="request-quote"]'
        ) ?? []
      )
        .map((element) => element.textContent?.replace(/\s+/g, " ").trim() ?? "")
        .filter((text, index, values) => Boolean(text) && values.indexOf(text) === index);
      const values: Record<SourceField, string> = {
        title: documentCopy.title,
        headline: h1?.textContent?.trim() ?? "",
        intro: paragraphs[0] ?? "",
        contentJson: JSON.stringify(buildStructuredContent(documentCopy, sourcePath), null, 2),
        primaryCta: ctas[0] ?? "",
        secondaryCta: ctas[1] ?? "",
        seoTitle: documentCopy.title,
        seoDescription:
          documentCopy.querySelector('meta[name="description"]')?.getAttribute("content")?.trim() ?? "",
      };
      const text = values[field];
      if (!text) throw new Error("source_field_empty");
      await writeClipboard(text);
      setLastCopiedLabel(label);
      setState("copied");
    } catch {
      setLastCopiedLabel(label);
      setState("failed");
    }
    if (menuRef.current) menuRef.current.open = false;
    window.setTimeout(() => setState("idle"), 2000);
  }

  return (
    <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-zinc-950 dark:text-zinc-50">English source page</h2>
            <p className="mt-1 text-xs text-zinc-500">Live reference; copying never modifies Russian fields.</p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <details ref={menuRef} className="group relative z-40 min-w-0 flex-1 sm:flex-none">
              <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
                {state === "copied" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {state === "copied"
                  ? `Copied: ${lastCopiedLabel}`
                  : state === "failed"
                    ? `Unavailable: ${lastCopiedLabel}`
                    : "Copy source field"}
                <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
              </summary>
              <div className="absolute left-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-3rem)] overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                {COPY_OPTIONS.map((option) => (
                  <button
                    key={option.field}
                    type="button"
                    onClick={() => copySourceField(option.field, option.label)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Copy className="h-3.5 w-3.5 text-zinc-400" />
                    {option.label}
                  </button>
                ))}
              </div>
            </details>
            <a
              href={sourcePath}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <ExternalLink className="h-4 w-4" /> Open
            </a>
          </div>
        </div>
      </div>
      <div className="relative z-0 h-[calc(100vh-12rem)] min-h-[640px] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800">
        <iframe
          src={sourcePath}
          title="English source page preview"
          className="h-full w-full bg-white"
        />
      </div>
    </aside>
  );
}
