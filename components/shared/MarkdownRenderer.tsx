"use client";

import { Children, isValidElement } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import MermaidChart from "./MermaidChart";
import ImagePreview from "./ImagePreview";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function stripEditorMarkers(markdown: string) {
  return markdown.replace(/<!--\s*\/?(?:PARA|FAQ):[\s\S]*?-->/gi, "");
}

function parseNumericDimension(value: string | number | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const normalizedContent = stripEditorMarkers(content);

  return (
    <div className={["markdown-body", className].filter(Boolean).join(" ")}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeKatex,
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "wrap" }],
        ]}
        components={{
          code({ className: codeClassName, children, ...props }) {
            return (
              <code className={codeClassName} {...props}>
                {children}
              </code>
            );
          },
          pre({ children }) {
            const firstChild = Children.toArray(children)[0];
            if (isValidElement(firstChild) && firstChild.type === "code") {
              const codeProps = firstChild.props as {
                className?: string;
                children?: unknown;
              };
              const rawCode = String(codeProps.children ?? "").replace(/\n$/, "");
              const languageMatch = /language-([a-z0-9-]+)/i.exec(codeProps.className || "");
              const language = languageMatch?.[1]?.toLowerCase();

              if (language === "mermaid") {
                return <MermaidChart chart={rawCode} />;
              }
            }

            return <pre>{children}</pre>;
          },
          table({ children }) {
            return (
              <div className="markdown-table-wrap">
                <p className="markdown-table-hint">Swipe left and right to view full table.</p>
                <table>{children}</table>
              </div>
            );
          },
          a({ href, children, ...props }) {
            const isExternal = !!href && /^https?:\/\//i.test(href);
            return (
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },
          img({ src, alt, width, height }) {
            if (!src) {
              return null;
            }

            const resolvedAlt = alt?.trim() || "Article image";
            const imageWidth = parseNumericDimension(width);
            const imageHeight = parseNumericDimension(height);
            const aspectRatio =
              imageWidth && imageHeight
                ? `${imageWidth} / ${imageHeight}`
                : "16 / 10";

            return (
              <figure className="my-5">
                <div
                  className="relative w-full overflow-hidden rounded-sm border border-border bg-background-muted/70"
                  style={{ aspectRatio }}
                >
                  <ImagePreview
                    src={src}
                    alt={resolvedAlt}
                    sizes="(max-width: 768px) 100vw, 840px"
                    loading="lazy"
                    className="object-contain"
                    previewLabel="View Large"
                  />
                </div>
              </figure>
            );
          },
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
}
