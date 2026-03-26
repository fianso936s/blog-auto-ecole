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
    if (!confirm("\u00cates-vous s\u00fbr de vouloir supprimer cet article ?")) return;
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Articles</h1>
          <p className="text-gray-500 text-sm">{articles.length} article(s)</p>
        </div>
        <Link
          to="/admin/articles/new"
          className="inline-flex items-center gap-2 bg-[#cf5c36] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#b8502f] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvel article
        </Link>
      </div>

      {/* Articles list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">
                  Article
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3 hidden sm:table-cell">
                  Cat&eacute;gorie
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3 hidden md:table-cell">
                  Date
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">
                  Statut
                </th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={article.cover_image}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover hidden sm:block"
                      />
                      <div>
                        <p className="font-medium text-gray-900 text-sm line-clamp-1">
                          {article.title}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">{article.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="text-xs font-medium text-[#cf5c36] bg-[#fcedea] px-2.5 py-1 rounded-full">
                      {article.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                    {formatDate(article.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => togglePublish(article)}
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                        article.published
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {article.published ? (
                        <>
                          <Eye className="w-3 h-3" /> Publi&eacute;
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" /> Brouillon
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/articles/${article.id}/edit`}
                        className="p-2 text-gray-400 hover:text-[#cf5c36] transition-colors"
                        title="Modifier"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => deleteArticle(article.id)}
                        disabled={deleting === article.id}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
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
