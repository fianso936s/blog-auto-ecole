import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ArticleCard from "../../components/ArticleCard";
import { sampleArticles, categories } from "../../data/articles";
import { supabase } from "../../lib/supabase";
import type { Article } from "../../lib/types";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>(sampleArticles);
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get("cat");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          setArticles(data);
        }
      } catch {
        // Fallback to sample articles
      }
    };

    fetchArticles();
  }, []);

  const filteredArticles = activeCategory
    ? articles.filter(
        (a) =>
          a.category.toLowerCase().replace(/\s+/g, "-") === activeCategory
      )
    : articles;

  return (
    <div>
      {/* Bold page header with decorative background */}
      <section className="relative overflow-hidden grain">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-light via-primary-light/30 to-bg" />
        {/* Decorative shapes */}
        <div className="absolute top-8 right-[12%] w-48 h-48 rounded-full border-2 border-primary/10 opacity-50" />
        <div className="absolute -bottom-6 left-[8%] w-32 h-32 bg-amber/5 rotate-45 rounded-2xl" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-14 sm:pb-18">
          <div className="text-center animate-fade-up">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-1 bg-primary rounded-full" />
              <span className="text-primary text-sm font-semibold uppercase tracking-widest">Explorer</span>
              <div className="w-8 h-1 bg-primary rounded-full" />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary mb-4 leading-tight">
              {activeCategory
                ? categories.find(
                    (c) => c.toLowerCase().replace(/\s+/g, "-") === activeCategory
                  ) || "Articles"
                : "Tous les articles"}
            </h1>
            <p className="font-sans text-text-muted text-lg max-w-xl mx-auto leading-relaxed">
              D&eacute;couvrez nos conseils et guides pour r&eacute;ussir votre permis de conduire
              et devenir un conducteur responsable.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Category filter bar */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 animate-fade-up delay-100">
          <Link
            to="/articles"
            className={`inline-block text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-300 ${
              !activeCategory
                ? "bg-primary text-white shadow-sm"
                : "bg-surface-alt text-text-muted hover:bg-surface hover:text-secondary border border-transparent hover:border-border"
            }`}
          >
            Tous
          </Link>
          {categories.map((cat) => {
            const isActive = cat.toLowerCase().replace(/\s+/g, "-") === activeCategory;
            return (
              <Link
                key={cat}
                to={`/articles?cat=${encodeURIComponent(cat.toLowerCase().replace(/\s+/g, "-"))}`}
                className={`inline-block text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface-alt text-text-muted hover:bg-surface hover:text-secondary border border-transparent hover:border-border"
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        {/* Articles Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article, index) => {
              const delayClass =
                index % 3 === 0
                  ? "delay-100"
                  : index % 3 === 1
                  ? "delay-200"
                  : "delay-300";
              return (
                <div key={article.id} className={`animate-fade-up ${delayClass}`}>
                  <ArticleCard article={article} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-surface-alt flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📭</span>
            </div>
            <p className="text-text-muted text-lg font-sans">
              Aucun article trouv&eacute; dans cette cat&eacute;gorie.
            </p>
            <Link
              to="/articles"
              className="inline-block mt-4 text-sm font-semibold text-primary link-underline"
            >
              Voir tous les articles
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
