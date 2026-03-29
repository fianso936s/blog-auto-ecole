import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit3, Trash2, Eye, EyeOff } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { sampleArticles } from "../../data/articles";
import type { Article } from "../../lib/types";

export default function ArticlesAdminPage() {
  const [articles, setArticles] = useState<Article[]>(sampleArticles);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          setArticles(data);
        }
      } catch {
        // Fallback
      }
    };

    fetchArticles();
  }, []);

  const togglePublish = async (article: Article) => {
    const { error } = await supabase
      .from("articles")
      .update({ published: !article.published })
      .eq("id", article.id);

    if (!error) {
      setArticles((prev) =>
        prev.map((a) =>
          a.id === article.id ? { ...a, published: !a.published } : a
        )
      );
    }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;
    setDeleting(id);

    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (!error) {
      setArticles((prev) => prev.filter((a) => a.id !== id));
    }
    setDeleting(null);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div>
      <div className="flex items-center justify-between mb-8 animate-fade-up">
        <div>
          <h1 className="font-serif text-3xl font-bold text-secondary mb-1">
            Gérer les articles
          </h1>
          <p className="text-text-muted text-sm">{articles.length} article(s)</p>
        </div>
        <Link
          to="/admin/articles/new"
          className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-primary-dark transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          Nouvel article
        </Link>
      </div>

      {/* Articles list */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden animate-fade-up delay-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-alt">
                <th className="text-left text-[11px] font-semibold text-text-muted uppercase tracking-widest px-6 py-4">
                  Article
                </th>
                <th className="text-left text-[11px] font-semibold text-text-muted uppercase tracking-widest px-6 py-4 hidden sm:table-cell">
                  Catégorie
                </th>
                <th className="text-left text-[11px] font-semibold text-text-muted uppercase tracking-widest px-6 py-4 hidden md:table-cell">
                  Date
                </th>
                <th className="text-left text-[11px] font-semibold text-text-muted uppercase tracking-widest px-6 py-4">
                  Statut
                </th>
                <th className="text-right text-[11px] font-semibold text-text-muted uppercase tracking-widest px-6 py-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-b border-border/50 hover:bg-surface-alt/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={article.cover_image}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover hidden sm:block ring-1 ring-border"
                      />
                      <div>
                        <p className="font-medium text-text text-sm line-clamp-1">
                          {article.title}
                        </p>
                        <p className="text-text-muted text-xs mt-0.5">{article.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="text-xs font-medium text-primary bg-primary-light px-3 py-1 rounded-full">
                      {article.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted hidden md:table-cell">
                    {formatDate(article.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => togglePublish(article)}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                        article.published
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-amber/10 text-amber hover:bg-amber/20"
                      }`}
                    >
                      {article.published ? (
                        <>
                          <Eye className="w-3 h-3" /> Publié
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" /> Brouillon
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/admin/articles/${article.id}/edit`}
                        className="p-2 rounded-lg text-text-muted hover:text-secondary hover:bg-surface-alt transition-all duration-200"
                        title="Modifier"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => deleteArticle(article.id)}
                        disabled={deleting === article.id}
                        className="p-2 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 transition-all duration-200 disabled:opacity-50"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
