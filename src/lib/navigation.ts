export const MAIN_NAV = [
  { label: "Accueil", href: "/" },
  { label: "Formules", href: "/#formules" },
  { label: "Notre méthode", href: "/#methode" },
  { label: "Blog & guides", href: "/blog" },
  { label: "Quiz code", href: "/blog/quiz" },
] as const;

export function isNavigationActive(pathname: string, hash: string, href: string) {
  if (href.includes("#")) return pathname === "/" && hash === `#${href.split("#")[1]}`;
  if (href === "/") return pathname === "/" && !hash;
  if (href === "/blog") return pathname.startsWith("/blog") && !pathname.startsWith("/blog/quiz");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function categorySlug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function articlePath(slug: string) {
  return `/blog/articles/${encodeURIComponent(slug)}`;
}
