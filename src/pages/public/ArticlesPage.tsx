import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ArticleCard from "../../components/ArticleCard";
import CategoryBadge from "../../components/CategoryBadge";
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          {activeCategory
            ? categories.find(
                (c) => c.toLowerCase().replace(/\s+/g, "-") === activeCategory
              ) || "Articles"
            : "Tous les articles"}
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          D&eacute;couvrez nos conseils et guides pour r&eacute;ussir votre permis de conduire
          et devenir un conducteur responsable.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        <CategoryBadge category="Tous" active={!activeCategory} />
        {categories.map((cat) => (
          <CategoryBadge
            key={cat}
            category={cat}
            active={cat.toLowerCase().replace(/\s+/g, "-") === activeCategory}
          />
        ))}
      </div>

      {/* Articles Grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">
            Aucun article trouv&eacute; dans cette cat&eacute;gorie.
          </p>
        </div>
      )}
    </div>
  );
}
