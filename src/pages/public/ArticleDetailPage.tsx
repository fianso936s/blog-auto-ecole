import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { sampleArticles } from "../../data/articles";
import { supabase } from "../../lib/supabase";
import type { Article } from "../../lib/types";

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
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
          <div className="h-64 bg-gray-200 rounded-xl mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="font-serif text-3xl font-bold text-gray-900 mb-4">
          Article introuvable
        </h1>
        <p className="text-gray-600 mb-8">
          L'article que vous recherchez n'existe pas ou a &eacute;t&eacute; supprim&eacute;.
        </p>
        <Link
          to="/articles"
          className="inline-flex items-center gap-2 bg-[#cf5c36] text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#b8502f] transition-colors"
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
      {/* Back link */}
      <Link
        to="/articles"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux articles
      </Link>

      {/* Article Header */}
      <header className="mb-8">
        <span className="text-[#cf5c36] text-xs font-semibold uppercase tracking-wide">
          {article.category}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4 leading-tight">
          {article.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className="text-[#cf5c36] font-medium">{article.author}</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {readTime} min de lecture
          </span>
        </div>
      </header>

      {/* Cover Image */}
      <div className="overflow-hidden rounded-xl mb-10">
        <img
          src={article.cover_image}
          alt={article.title}
          className="w-full h-64 sm:h-80 object-cover"
        />
      </div>

      {/* Article Content */}
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Bottom CTA */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="bg-[#fcedea] rounded-2xl p-8 text-center">
          <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">
            Cet article vous a plu ?
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            D&eacute;couvrez d'autres conseils pour r&eacute;ussir votre permis.
          </p>
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 bg-[#cf5c36] text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#b8502f] transition-colors"
          >
            Voir tous les articles
          </Link>
        </div>
      </div>
    </div>
  );
}
