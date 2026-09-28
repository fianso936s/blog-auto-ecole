import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const DESCRIPTION = "WEBEDRIVE à Asnières-sur-Seine : formation à la conduite, formules lisibles, blog et guides pour progresser.";
export default function PageMeta({ title, description = DESCRIPTION, noIndex = false }: { title: string; description?: string; noIndex?: boolean }) {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = `${title} | WEBEDRIVE`;
    const update = (key: string, value: string, property = false) => {
      const attr = property ? "property" : "name";
      let element = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      if (!element) { element = document.createElement("meta"); element.setAttribute(attr, key); document.head.appendChild(element); }
      element.content = value;
    };
    update("description", description);
    update("og:title", document.title, true); update("og:description", description, true);
    update("twitter:title", document.title); update("twitter:description", description);
    update("robots", noIndex ? "noindex,follow" : "index,follow");
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = `https://blog-auto-ecole.vercel.app${pathname}`;
    return () => {
      document.title = "WEBEDRIVE — Auto-école à Asnières-sur-Seine";
      update("description", DESCRIPTION); update("robots", "noindex,follow");
    };
  }, [title, description, noIndex, pathname]);
  return null;
}
