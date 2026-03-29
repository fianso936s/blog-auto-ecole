import { Link } from "react-router-dom";
import type { Article } from "../lib/types";

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const formattedDate = new Date(article.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const showImage = (article as Article & { show_cover_image?: boolean }).show_cover_image !== false;

  if (featured) {
    return (
      <article className="group">
        <Link to={`/articles/${article.slug}`} className="block">
          <div className={`grid grid-cols-1 ${showImage ? 'lg:grid-cols-2' : ''} gap-6 lg:gap-10`}>
            {/* Image */}
            {showImage && (
            <div className="overflow-hidden rounded-xl">
              <img
                src={article.cover_image}
                alt={article.title}
                className="w-full h-64 lg:h-80 object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            )}
            {/* Content */}
            <div className="flex flex-col justify-center">
              <span className="text-[#cf5c36] text-xs font-semibold uppercase tracking-wide mb-3">
                {article.category}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mb-4 group-hover:text-[#cf5c36] transition-colors duration-200">
                {article.title}
              </h2>
              <p className="text-gray-600 leading-relaxed line-clamp-3 mb-4">
                {article.excerpt}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#cf5c36] font-medium">{article.author}</span>
                <span className="text-gray-400">&middot;</span>
                <span className="text-gray-500">{formattedDate}</span>
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group">
      <Link to={`/articles/${article.slug}`} className="block">
        {/* Image */}
        {showImage && (
        <div className="overflow-hidden rounded-xl mb-4">
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full h-48 sm:h-52 object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        )}
        {/* Content */}
        <span className="text-[#cf5c36] text-xs font-semibold uppercase tracking-wide">
          {article.category}
        </span>
        <h2 className="font-serif text-lg sm:text-xl font-bold text-gray-900 mt-2 mb-2 group-hover:text-[#cf5c36] transition-colors duration-200">
          {article.title}
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-3">
          {article.excerpt}
        </p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#cf5c36] font-medium">{article.author}</span>
          <span className="text-gray-400">&middot;</span>
          <span className="text-gray-500">{formattedDate}</span>
        </div>
      </Link>
    </article>
  );
}
