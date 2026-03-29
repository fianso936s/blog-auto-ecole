import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, User } from "lucide-react";
import { sampleArticles } from "../../data/articles";
import { supabase } from "../../lib/supabase";
import type { Article } from "../../lib/types";
import PageMeta from "../../components/PageMeta";

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("slug", slug)
          .single();

        if (!error && data) {
          setArticle(data);
        } else {
          // Fallback to sample
          const sample = sampleArticles.find((a) => a.slug === slug);
          if (sample) setArticle(sample);
        }
      } catch {
        const sample = sampleArticles.find((a) => a.slug === slug);
        if (sample) setArticle(sample);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-surface-alt rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-surface-alt rounded w-1/2 mx-auto mb-8"></div>
          <div className="h-72 bg-surface-alt rounded-2xl mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-surface-alt rounded"></div>
            <div className="h-4 bg-surface-alt rounded w-5/6"></div>
            <div className="h-4 bg-surface-alt rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="font-serif text-3xl font-bold text-secondary mb-4">
          Article introuvable
        </h1>
        <p className="font-sans text-text-muted mb-8">
          L'article que vous recherchez n'existe pas ou a &eacute;t&eacute; supprim&eacute;.
        </p>
        <Link
          to="/articles"
          className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold font-sans px-6 py-3 rounded-xl hover:bg-primary-dark transition-all duration-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux articles
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(article.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const readTime = Math.max(1, Math.ceil(article.content.split(/\s+/).length / 200));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <PageMeta title={article.title} />
      {/* Back link */}
      <Link
        to="/articles"
        className="animate-fade-in inline-flex items-center gap-2 text-sm font-sans text-text-muted hover:text-primary transition-colors duration-200 mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux articles
      </Link>

      {/* Cover Image */}
      <div className="animate-fade-up relative overflow-hidden rounded-2xl mb-10 group">
        <img
          src={article.cover_image}
          alt={article.title}
          className="w-full h-72 sm:h-96 object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {/* Category badge on image */}
        <span className="absolute top-5 left-5 inline-block text-xs font-semibold font-sans uppercase tracking-wider px-4 py-1.5 rounded-full bg-primary text-white shadow-md">
          {article.category}
        </span>
      </div>

      {/* Article Header */}
      <header className="animate-fade-up delay-100 mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary leading-tight mb-6">
          {article.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm font-sans text-text-muted border-b border-border pb-6">
          <span className="flex items-center gap-1.5 text-primary font-medium">
            <User className="w-4 h-4" />
            {article.author}
          </span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {formattedDate}
          </span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {readTime} min de lecture
          </span>
        </div>
      </header>

      {/* Article Content */}
      <div
        className="animate-fade-up delay-200 prose max-w-none"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Bottom CTA */}
      <div className="animate-fade-up delay-300 mt-16 pt-10 border-t border-border">
        <div className="bg-gradient-to-br from-primary-light to-[#FDE4DC] rounded-2xl p-8 sm:p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-[0.06] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-secondary mb-3">
              Cet article vous a plu ?
            </h3>
            <p className="font-sans text-text-muted text-sm mb-6 max-w-sm mx-auto">
              D&eacute;couvrez d'autres conseils pour r&eacute;ussir votre permis.
            </p>
            <Link
              to="/articles"
              className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold font-sans px-6 py-3 rounded-xl hover:bg-primary-dark transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Voir tous les articles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
