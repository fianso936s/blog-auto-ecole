import { useEffect, useState } from "react";
import ArticleCard from "../../components/ArticleCard";
import { SkeletonCard } from "../../components/Skeleton";
import CategoryBadge from "../../components/CategoryBadge";
import Newsletter from "../../components/Newsletter";
import { sampleArticles, categories } from "../../data/articles";
import { supabase } from "../../lib/supabase";
import type { Article } from "../../lib/types";
import { ArrowRight, BookOpen, Shield, Car } from "lucide-react";
import { Link } from "react-router-dom";
import PageMeta from "../../components/PageMeta";

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>(sampleArticles);
  const [loading, setLoading] = useState(true);

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
    <div>
      <PageMeta title="Accueil" />
      {/* Hero Section */}
      <section className="relative overflow-hidden grain">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-light via-primary-light/40 to-bg" />

        {/* Decorative geometric shapes */}
        <div className="absolute top-16 right-[10%] w-64 h-64 rounded-full border-2 border-primary/10 opacity-60" />
        <div className="absolute top-32 right-[15%] w-40 h-40 rounded-full border-2 border-amber/15 opacity-50" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-amber/5 rotate-45 rounded-3xl" />
        <div className="absolute top-24 left-[5%] w-20 h-20 border-2 border-primary/8 rotate-12 rounded-xl" />
        <div className="absolute bottom-16 right-[8%] w-24 h-24 bg-primary/5 rounded-full" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-20 sm:pb-28">
          <div className="max-w-3xl">
            <span className="inline-block text-primary text-sm font-semibold uppercase tracking-widest mb-4 animate-fade-up">
              Blog Auto-&Eacute;cole
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary leading-tight mb-6 animate-fade-up delay-100">
              R&eacute;ussissez votre permis
              <span className="text-primary"> avec confiance</span>
            </h1>
            <p className="font-sans text-text-muted text-lg sm:text-xl leading-relaxed max-w-2xl mb-8 animate-fade-up delay-200">
              Conseils d'experts, actualit&eacute;s du code de la route et guides pratiques
              pour les futurs conducteurs.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-up delay-300">
              <Link
                to="/articles"
                className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-7 py-3.5 rounded-full hover:bg-primary-dark transition-colors duration-300 text-sm"
              >
                D&eacute;couvrir les articles
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/quiz"
                className="inline-flex items-center gap-2 bg-surface text-secondary font-semibold px-7 py-3.5 rounded-full border border-border hover:border-primary/30 hover:text-primary transition-colors duration-300 text-sm"
              >
                Tester vos connaissances
              </Link>
            </div>
          </div>

          {/* Floating stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-14 animate-fade-up delay-400">
            <div className="flex items-center gap-4 bg-surface/80 backdrop-blur-sm rounded-xl p-5 border border-border">
              <div className="w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-serif font-bold text-secondary text-lg">Articles experts</p>
                <p className="text-text-muted text-sm">Guides complets et d&eacute;taill&eacute;s</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-surface/80 backdrop-blur-sm rounded-xl p-5 border border-border">
              <div className="w-11 h-11 rounded-xl bg-amber-light flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-amber" />
              </div>
              <div>
                <p className="font-serif font-bold text-secondary text-lg">S&eacute;curit&eacute; routi&egrave;re</p>
                <p className="text-text-muted text-sm">Bonnes pratiques essentielles</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-surface/80 backdrop-blur-sm rounded-xl p-5 border border-border">
              <div className="w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                <Car className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-serif font-bold text-secondary text-lg">Code &amp; Conduite</p>
                <p className="text-text-muted text-sm">Pr&eacute;paration compl&egrave;te</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Featured Article */}
        {featuredArticle && (
          <section className="py-16 animate-fade-up">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-1 bg-primary rounded-full" />
              <h2 className="font-serif text-sm font-bold text-primary uppercase tracking-widest">
                &Agrave; la une
              </h2>
            </div>
            <ArticleCard article={featuredArticle} featured />
          </section>
        )}

        {/* Recent Articles */}
        <section className="pb-16">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-1 bg-primary rounded-full" />
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">
                Articles r&eacute;cents
              </h2>
            </div>
            <Link
              to="/articles"
              className="flex items-center gap-1.5 text-sm font-semibold text-primary link-underline"
            >
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : recentArticles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentArticles.map((article, index) => (
                <div
                  key={article.id}
                  className={`animate-fade-up ${
                    index === 0 ? "delay-100" : index === 1 ? "delay-200" : "delay-300"
                  }`}
                >
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          ) : null}
        </section>

        {/* Categories Section */}
        <section className="pb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-1 bg-amber rounded-full" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-secondary">
              Cat&eacute;gories
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <CategoryBadge key={cat} category={cat} />
            ))}
          </div>
        </section>

        {/* More Articles */}
        {moreArticles.length > 0 && (
          <section className="pb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {moreArticles.map((article, index) => (
                <div
                  key={article.id}
                  className={`animate-fade-up ${index === 0 ? "delay-100" : "delay-200"}`}
                >
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Newsletter */}
        <section className="pb-16 animate-fade-up">
          <Newsletter />
        </section>
      </div>
    </div>
  );
}
