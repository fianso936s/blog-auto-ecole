import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
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

  // Estimate reading time from content length
  const wordCount = article.content ? article.content.split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  if (featured) {
    return (
      <article className="group">
        <Link to={`/articles/${article.slug}`} className="block focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none rounded-2xl">
          <div className={`grid grid-cols-1 ${showImage ? 'lg:grid-cols-5' : ''} gap-0 bg-surface rounded-2xl overflow-hidden border border-border hover-lift`}>
            {/* Image — takes 3 of 5 columns (60%) */}
            {showImage && (
              <div className="lg:col-span-3 relative overflow-hidden">
                <img
                  src={article.cover_image}
                  alt={article.title}
                  className="w-full h-72 lg:h-[420px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Category badge */}
                <span className="absolute top-4 left-4 bg-primary text-white text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full z-10">
                  {article.category}
                </span>
                {/* Reading time badge */}
                <span className="absolute top-4 right-4 bg-secondary/80 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 z-10">
                  <Clock className="w-3 h-3" />
                  {readingTime} min
                </span>
              </div>
            )}
            {/* Content — takes 2 of 5 columns, overlaps slightly via negative margin */}
            <div className={`${showImage ? 'lg:col-span-2 lg:-ml-6' : ''} flex flex-col justify-center p-8 lg:p-10 relative z-10`}>
              {!showImage && (
                <span className="text-primary text-xs font-semibold uppercase tracking-wider mb-3">
                  {article.category}
                </span>
              )}
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary mb-4 group-hover:text-primary transition-colors duration-300 leading-tight">
                {article.title}
              </h2>
              <p className="text-text-muted font-sans leading-relaxed line-clamp-3 mb-6 text-base">
                {article.excerpt}
              </p>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-primary font-semibold">{article.author}</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="text-text-muted">{formattedDate}</span>
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group">
      <Link to={`/articles/${article.slug}`} className="block bg-surface rounded-2xl overflow-hidden border border-border hover-lift focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none">
        {/* Image */}
        {showImage && (
          <div className="relative overflow-hidden">
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-52 sm:h-56 object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Category badge — absolute top-left */}
            <span className="absolute top-3 left-3 bg-primary text-white text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full z-10">
              {article.category}
            </span>
            {/* Reading time badge */}
            <span className="absolute top-3 right-3 bg-secondary/80 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 z-10">
              <Clock className="w-3 h-3" />
              {readingTime} min
            </span>
          </div>
        )}
        {/* Content */}
        <div className="p-5 sm:p-6">
          {!showImage && (
            <span className="text-primary text-xs font-semibold uppercase tracking-wider">
              {article.category}
            </span>
          )}
          <h2 className="font-serif text-lg sm:text-xl font-bold text-secondary mt-1 mb-2 group-hover:text-primary transition-colors duration-300 leading-snug">
            {article.title}
          </h2>
          <p className="text-text-muted font-sans text-sm leading-relaxed line-clamp-3 mb-4">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-primary font-semibold">{article.author}</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-text-muted">{formattedDate}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
