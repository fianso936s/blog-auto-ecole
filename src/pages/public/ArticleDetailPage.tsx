import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { sampleArticles } from "../../data/articles";
import { supabase } from "../../lib/supabase";
import type { Article } from "../../lib/types";
import PageMeta from "../../components/PageMeta";
import ArticleBody from "../../components/ArticleBody";

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setArticle(null); setLoading(true);
    const load = async () => {
      let next: Article | null = sampleArticles.find(item => item.slug === slug && item.published) || null;
      try {
        const { data, error } = await supabase.from("articles").select("*").eq("slug", slug).eq("published", true).single();
        if (!error && data) next = data;
      } catch { /* Keep the existing published sample, never the previous slug. */ }
      if (!cancelled) { setArticle(next); setLoading(false); }
    };
    void load(); return () => { cancelled = true; };
  }, [slug]);
  if (loading) return <div className="blog-container" role="status" aria-live="polite">Chargement de l’article…</div>;
  if (!article) return <div className="blog-container blog-empty"><PageMeta title="Article introuvable" noIndex /><h1 className="text-3xl font-bold">Article introuvable</h1><p>Cet article n’est pas disponible.</p><Link to="/blog/articles">Retour aux articles</Link></div>;
  const date = new Date(article.created_at);
  const formattedDate = Number.isNaN(date.getTime()) ? null : date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const showImage = (article as Article & { show_cover_image?: boolean }).show_cover_image !== false && Boolean(article.cover_image);
  return <article className="max-w-3xl mx-auto px-5 sm:px-6 py-10 sm:py-16">
    <PageMeta title={article.title} description={article.excerpt} />
    <Link to="/blog/articles" className="inline-flex min-h-12 items-center gap-2 text-primary font-semibold mb-6"><ArrowLeft size={18} aria-hidden="true" />Retour aux articles</Link>
    <header><span className="site-eyebrow">{article.category}</span><h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight my-5">{article.title}</h1><div className="flex gap-4 flex-wrap text-sm text-text-muted mb-8"><span>{article.author}</span>{formattedDate && <time dateTime={date.toISOString()}>{formattedDate}</time>}</div></header>
    {showImage && <img src={article.cover_image} alt="" width="900" height="560" className="w-full rounded-2xl mb-10" decoding="async" />}
    <ArticleBody html={article.content} />
    <div className="mt-12 pt-8 border-t border-border"><Link className="site-button" to="/blog/articles">Découvrir les autres articles</Link></div>
  </article>;
}
