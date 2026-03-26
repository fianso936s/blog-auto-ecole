import { Link } from "react-router-dom";

interface CategoryBadgeProps {
  category: string;
  active?: boolean;
}

export default function CategoryBadge({ category, active = false }: CategoryBadgeProps) {
  return (
    <Link
      to={`/articles?cat=${encodeURIComponent(category.toLowerCase().replace(/\s+/g, "-"))}`}
      className={`inline-block text-sm font-semibold px-4 py-2 rounded-full transition-colors duration-200 ${
        active
          ? "bg-[#cf5c36] text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {category}
    </Link>
  );
}
