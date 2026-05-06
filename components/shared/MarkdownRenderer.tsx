"use client";

import { Children, isValidElement, type ReactNode } from "react";
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

interface MarkdownAstNode {
  tagName?: string;
  children?: MarkdownAstNode[];
}

const MERMAID_BLOCK_START = new RegExp(
  [
    "^graph\\s+(?:TB|TD|BT|RL|LR)$",
    "^flowchart\\s+(?:TB|TD|BT|RL|LR)$",
    "^sequenceDiagram$",
    "^classDiagram$",
    "^stateDiagram(?:-v2)?$",
    "^erDiagram$",
    "^journey$",
    "^gantt$",
    "^pie(?:\\s+title\\b.*)?$",
    "^mindmap$",
    "^timeline$",
    "^gitGraph$",
    "^sankey-beta$",
    "^quadrantChart$",
    "^requirementDiagram$",
    "^C4(?:Context|Container|Component|Dynamic|Deployment)$",
    "^xychart-beta$",
    "^packet-beta$",
    "^block-beta$",
  ].join("|"),
  "i"
);

function stripEditorMarkers(markdown: string) {
  return markdown.replace(/<!--\s*\/?(?:PARA|FAQ):[\s\S]*?-->/gi, "");
}

function looksLikeMermaidBlock(block: string) {
  const trimmed = block.trim();
  if (!trimmed || /^```/.test(trimmed)) {
    return false;
  }

  const lines = trimmed.split(/\r?\n/).map((line) => line.trimEnd());
  if (lines.length < 2 || !MERMAID_BLOCK_START.test(lines[0].trim())) {
    return false;
  }

  return lines.slice(1).some((line) => /-->|---|==>|:::|subgraph|\[.*\]|\{.*\}|\(.*\)/.test(line));
}

function normalizeMermaidBlocks(markdown: string) {
  return markdown
    .split(/\n{2,}/)
    .map((block) => {
      if (!looksLikeMermaidBlock(block)) {
        return block;
      }

      return `\`\`\`mermaid\n${block.trim()}\n\`\`\``;
    })
    .join("\n\n");
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

function isWhitespaceTextNode(node: ReactNode) {
  return typeof node === "string" && node.trim().length === 0;
}

function isMarkdownImageElement(node: ReactNode): boolean {
  if (!isValidElement(node)) {
    return false;
  }

  const props = node.props as { children?: ReactNode; "data-markdown-image"?: boolean };
  if (node.type === "img") {
    return true;
  }

  if (props["data-markdown-image"] === true) {
    return true;
  }

  if (node.type === "a") {
    const childNodes = Children.toArray(props.children).filter((child) => !isWhitespaceTextNode(child));
    return childNodes.length > 0 && childNodes.every((child) => isMarkdownImageElement(child));
  }

  return false;
}

function isImageOnlyAstNode(node: MarkdownAstNode | undefined): boolean {
  if (!node?.tagName) {
    return false;
  }

  if (node.tagName === "img") {
    return true;
  }

  if (node.tagName !== "a" || !node.children?.length) {
    return false;
  }

  return node.children.every((child) => isImageOnlyAstNode(child));
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const normalizedContent = normalizeMermaidBlocks(stripEditorMarkers(content));

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
          p({ node, children }) {
            const childNodes = Children.toArray(children).filter((child) => !isWhitespaceTextNode(child));
            const onlyImageNodes =
              childNodes.length > 0 &&
              (childNodes.every((child) => isMarkdownImageElement(child)) ||
                ((node as MarkdownAstNode | undefined)?.children?.length ?? 0) > 0 &&
                  (node as MarkdownAstNode).children!.every((child) => isImageOnlyAstNode(child)));

            if (onlyImageNodes) {
              return <>{children}</>;
            }

            return <p>{children}</p>;
          },
          code({ className: codeClassName, children, ...props }) {
            return (
              <code className={codeClassName} {...props}>
                {children}
              </code>
            );
          },
          pre({ children }) {
            const firstChild = Children.toArray(children)[0];
            if (isValidElement(firstChild)) {
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
              <figure className="my-5" data-markdown-image>
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
