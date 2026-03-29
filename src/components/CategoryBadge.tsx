import { Link } from "react-router-dom";

interface CategoryBadgeProps {
  category: string;
  active?: boolean;
}

export default function CategoryBadge({ category, active = false }: CategoryBadgeProps) {
  return (
    <Link
      to={`/articles?cat=${encodeURIComponent(category.toLowerCase().replace(/\s+/g, "-"))}`}
      className={`inline-block text-sm font-semibold font-sans px-5 py-2 rounded-full transition-all duration-300 ease-in-out ${
        active
          ? "bg-primary text-white scale-105 shadow-sm"
          : "bg-surface-alt text-text-muted hover:bg-primary-light hover:text-primary-dark"
      }`}
    >
      {category}
    </Link>
  );
}
