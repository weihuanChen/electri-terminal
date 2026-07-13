import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { resolveLocalizedPath } from "@/lib/i18n/urlResolver";
import type {
  StaticPageContentBlock,
  StaticPageContentHeading,
  StaticPageStructuredContent,
} from "@/lib/i18n/staticPageContent";

function localizedHref(href: string | undefined, locale: Locale) {
  if (!href) return undefined;
  if (/^(?:https?:|mailto:|tel:|#)/i.test(href)) return href;
  return resolveLocalizedPath(href, locale);
}

function Heading({ heading }: { heading: StaticPageContentHeading }) {
  const className =
    heading.level === 1
      ? "text-3xl font-bold leading-tight md:text-5xl"
      : heading.level === 2
        ? "text-2xl font-bold leading-tight md:text-3xl"
        : "text-lg font-semibold leading-7";
  switch (heading.level) {
    case 1: return <h1 className={className}>{heading.text}</h1>;
    case 2: return <h2 className={className}>{heading.text}</h2>;
    case 3: return <h3 className={className}>{heading.text}</h3>;
    case 4: return <h4 className={className}>{heading.text}</h4>;
    case 5: return <h5 className={className}>{heading.text}</h5>;
    default: return <h6 className={className}>{heading.text}</h6>;
  }
}

function ContentBlock({ block, locale, depth = 0 }: { block: StaticPageContentBlock; locale: Locale; depth?: number }) {
  const Wrapper = block.type === "article" ? "article" : "section";
  return (
    <Wrapper
      id={block.id}
      className={depth === 0 ? "border-b border-border py-10 last:border-b-0 md:py-16" : "mt-8 border-l-2 border-border pl-5"}
    >
      <div className={depth === 0 ? "container max-w-5xl" : ""}>
        <div className="space-y-5">
          {block.headings.map((heading, index) => <Heading key={`${heading.level}-${index}`} heading={heading} />)}
          {block.paragraphs.map((paragraph, index) => (
            <p key={index} className="max-w-4xl text-base leading-7 text-secondary md:text-lg">{paragraph}</p>
          ))}
          {block.lists.map((list, index) => {
            const List = list.ordered ? "ol" : "ul";
            return (
              <List key={index} className={`space-y-2 pl-6 text-secondary ${list.ordered ? "list-decimal" : "list-disc"}`}>
                {list.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}
              </List>
            );
          })}
          {block.ctas.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2">
              {block.ctas.map((cta, index) => {
                const href = localizedHref(cta.href, locale);
                if (!href) return <span key={index} className="btn btn-secondary">{cta.label}</span>;
                const className = index === 0 ? "btn btn-primary" : "btn btn-secondary";
                return /^(?:https?:|mailto:|tel:)/i.test(href) ? (
                  <a key={index} href={href} className={className} target="_blank" rel="noreferrer">{cta.label}</a>
                ) : (
                  <Link key={index} href={href} className={className}>{cta.label}</Link>
                );
              })}
            </div>
          )}
        </div>
        {block.children.map((child) => <ContentBlock key={child.id} block={child} locale={locale} depth={depth + 1} />)}
      </div>
    </Wrapper>
  );
}

export default function LocalizedStaticPage({ content, locale }: { content: StaticPageStructuredContent; locale: Locale }) {
  return (
    <div className="bg-background">
      {content.blocks.map((block) => <ContentBlock key={block.id} block={block} locale={locale} />)}
    </div>
  );
}
