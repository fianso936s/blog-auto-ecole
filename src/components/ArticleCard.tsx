import { Link } from "react-router-dom";
import type { Article } from "../lib/types";
import { articlePath } from "../lib/navigation";

export default function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  const showImage = (article as Article & { show_cover_image?: boolean }).show_cover_image !== false && Boolean(article.cover_image);
  const date = new Date(article.created_at);
  const formattedDate = Number.isNaN(date.getTime()) ? null : date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const readTime = Math.max(1, Math.ceil((article.content || "").replace(/<[^>]*>/g, " ").trim().split(/\s+/).length / 200));
  return <article className={`article-card hover-lift ${featured ? "featured" : ""}`}>
    <Link to={articlePath(article.slug)} style={featured && !showImage ? { gridTemplateColumns: "1fr" } : undefined}>
      {showImage && <img src={article.cover_image} alt="" width="800" height="500" loading="lazy" decoding="async" />}
      <div className="article-card-content">
        <span className="article-card-category">{article.category}</span>
        <h2>{article.title}</h2><p className="line-clamp-3">{article.excerpt}</p>
        <div className="article-card-meta"><span>{article.author}</span>{formattedDate && <time dateTime={date.toISOString()}>{formattedDate}</time>}<span>{readTime} min de lecture</span></div>
      </div>
    </Link>
  </article>;
}
