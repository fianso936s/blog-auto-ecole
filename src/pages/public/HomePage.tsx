import { useEffect, useState } from "react";
import ArticleCard from "../../components/ArticleCard";
import CategoryBadge from "../../components/CategoryBadge";
import Newsletter from "../../components/Newsletter";
import { sampleArticles, categories } from "../../data/articles";
import { supabase } from "../../lib/supabase";
import type { Article } from "../../lib/types";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>(sampleArticles);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false })
          .limit(6);

        if (!error && data && data.length > 0) {
          setArticles(data);
        }
        // Si erreur ou pas de data, on garde les exemples
      } catch {
        // Garde les exemples en fallback
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const featuredArticle = articles[0];
  const recentArticles = articles.slice(1, 4);
  const moreArticles = articles.slice(4);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Hero Section */}
      <section className="py-10 sm:py-16">
        <div className="text-center mb-12">
          <span className="text-[#cf5c36] text-sm font-semibold uppercase tracking-wide">
            Blog Auto-&Eacute;cole
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-3 mb-4">
            Tout pour r&eacute;ussir votre
            <span className="text-[#cf5c36]"> permis</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Conseils d'experts, actualit&eacute;s du code de la route et guides pratiques
            pour les futurs conducteurs.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <CategoryBadge key={cat} category={cat} />
          ))}
        </div>
      </section>

      {/* Featured Article */}
      {featuredArticle && (
        <section className="mb-16">
          <ArticleCard article={featuredArticle} featured />
        </section>
      )}

      {/* Recent Articles */}
      {recentArticles.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl font-bold text-gray-900">
              Articles r&eacute;cents
            </h2>
            <Link
              to="/articles"
              className="flex items-center gap-1 text-sm font-medium text-[#cf5c36] hover:underline"
            >
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* More Articles */}
      {moreArticles.length > 0 && (
        <section className="mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {moreArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="mb-16">
        <Newsletter />
      </section>
    </div>
  );
}
