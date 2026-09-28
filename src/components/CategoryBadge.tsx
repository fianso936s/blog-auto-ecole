import { Link } from "react-router-dom";
import { categorySlug } from "../lib/navigation";
export default function CategoryBadge({ category, active = false }: { category: string; active?: boolean }) {
  return <Link to={`/blog/articles?cat=${encodeURIComponent(categorySlug(category))}`} aria-current={active ? "page" : undefined} className="inline-flex items-center min-h-12 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-primary bg-surface">{category}</Link>;
}
