import { Fragment, createElement, useMemo, type ReactNode } from "react";

// Render editorial HTML as constrained React nodes, never as executable raw HTML.
const ALLOWED = new Set(["p", "h2", "h3", "h4", "h5", "h6", "strong", "b", "em", "i", "u", "s", "ul", "ol", "li", "blockquote", "br", "hr", "pre", "code", "table", "thead", "tbody", "tr", "th", "td", "caption", "sup", "sub", "a", "img"]);
const DROP = new Set(["script", "style", "iframe", "object", "embed", "form", "input", "button", "textarea", "select", "svg", "math", "template", "noscript", "link", "meta", "base"]);
function safeUrl(raw: string | null): string | undefined {
  if (!raw || raw.length > 4096) return undefined;
  try {
    const url = new URL(raw, window.location.origin);
    return url.protocol === "https:" || (url.protocol === "http:" && url.origin === window.location.origin) ? url.href : undefined;
  } catch { return undefined; }
}
export default function ArticleBody({ html }: { html: string }) {
  const content = useMemo(() => {
    if (typeof DOMParser === "undefined") return null;
    const document = new DOMParser().parseFromString(html.slice(0, 300000), "text/html");
    let visited = 0;
    const render = (node: Node, key: string, depth = 0): ReactNode => {
      if (++visited > 15000 || depth > 40) return null;
      if (node.nodeType === Node.TEXT_NODE) return node.textContent;
      if (node.nodeType !== Node.ELEMENT_NODE) return null;
      const element = node as Element;
      const tag = element.tagName.toLowerCase();
      if (DROP.has(tag)) return null;
      const children = Array.from(node.childNodes).map((child, index) => render(child, `${key}-${index}`, depth + 1));
      if (tag === "img") { const src = safeUrl(element.getAttribute("src")); return src ? <img key={key} src={src} alt={element.getAttribute("alt") || ""} loading="lazy" decoding="async" /> : null; }
      if (tag === "a") { const href = safeUrl(element.getAttribute("href")); return href ? <a key={key} href={href} rel="noopener noreferrer">{children}</a> : <Fragment key={key}>{children}</Fragment>; }
      if (tag === "h1") return createElement("h2", { key }, children);
      if (tag === "br" || tag === "hr") return createElement(tag, { key });
      if (ALLOWED.has(tag)) return createElement(tag, { key }, children);
      return <Fragment key={key}>{children}</Fragment>;
    };
    return Array.from(document.body.childNodes).map((node, index) => render(node, String(index)));
  }, [html]);
  return <div className="prose max-w-none">{content}</div>;
}
