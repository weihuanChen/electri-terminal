import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import MermaidChart from "./MermaidChart";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function stripParaMarkers(markdown: string) {
  return markdown.replace(/<!--\s*\/?PARA:[\s\S]*?-->/gi, "");
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const normalizedContent = stripParaMarkers(content);

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
          code({ className: codeClassName, children, inline, ...props }) {
            const rawCode = String(children).replace(/\n$/, "");
            const languageMatch = /language-([a-z0-9-]+)/i.exec(codeClassName || "");
            const language = languageMatch?.[1]?.toLowerCase();

            if (inline) {
              return (
                <code className={codeClassName} {...props}>
                  {children}
                </code>
              );
            }

            if (language === "mermaid") {
              return <MermaidChart chart={rawCode} />;
            }

            return (
              <pre>
                <code className={codeClassName} {...props}>
                  {rawCode}
                </code>
              </pre>
            );
          },
          table({ children }) {
            return (
              <div className="markdown-table-wrap">
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
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
}
