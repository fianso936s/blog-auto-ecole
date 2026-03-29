import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, Image } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { categories } from "../../data/articles";

export default function ArticleEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = id && id !== "new";
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    show_cover_image: true,
    category: categories[0],
    author: "",
    published: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditing) {
      const fetchArticle = async () => {
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("id", id)
          .single();

        if (!error && data) {
          setForm({
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt,
            content: data.content,
            cover_image: data.cover_image,
            show_cover_image: data.show_cover_image ?? true,
            category: data.category,
            author: data.author,
            published: data.published,
          });
        }
      };
      fetchArticle();
    }
  }, [id, isEditing]);

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "title" && !isEditing ? { slug: generateSlug(value) } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const articleData = {
        ...form,
        updated_at: new Date().toISOString(),
        ...(isEditing ? {} : { created_at: new Date().toISOString() }),
      };

      if (isEditing) {
        const { error } = await supabase
          .from("articles")
          .update(articleData)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("articles").insert([articleData]);
        if (error) throw error;
      }

      navigate("/admin/articles");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de la sauvegarde";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate("/admin/articles")}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux articles
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? "Modifier l'article" : "Nouvel article"}
      </h1>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Titre
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#cf5c36] focus:ring-1 focus:ring-[#cf5c36]"
            placeholder="Le titre de votre article"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Slug (URL)
          </label>
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:border-[#cf5c36] focus:ring-1 focus:ring-[#cf5c36]"
            placeholder="le-titre-de-votre-article"
          />
        </div>

        {/* Category + Author */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Cat&eacute;gorie
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#cf5c36] focus:ring-1 focus:ring-[#cf5c36]"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Auteur
            </label>
            <input
              name="author"
              value={form.author}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#cf5c36] focus:ring-1 focus:ring-[#cf5c36]"
              placeholder="Nom de l'auteur"
            />
          </div>
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Image de couverture (URL)
          </label>
          <div className="flex gap-3">
            <input
              name="cover_image"
              value={form.cover_image}
              onChange={handleChange}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#cf5c36] focus:ring-1 focus:ring-[#cf5c36]"
              placeholder="https://images.unsplash.com/..."
            />
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
              {form.cover_image ? (
                <img
                  src={form.cover_image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        {/* Show Cover Image checkbox */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="show_cover_image"
            checked={form.show_cover_image}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, show_cover_image: e.target.checked }))
            }
            className="w-4 h-4 text-[#cf5c36] border-gray-300 rounded focus:ring-[#cf5c36]"
          />
          <label htmlFor="show_cover_image" className="text-sm text-gray-700">
            Afficher l'image de couverture sur l'article
          </label>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Extrait
          </label>
          <textarea
            name="excerpt"
            value={form.excerpt}
            onChange={handleChange}
            rows={3}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#cf5c36] focus:ring-1 focus:ring-[#cf5c36] resize-none"
            placeholder="Un court r&eacute;sum&eacute; de l'article..."
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Contenu (HTML)
          </label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            rows={15}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:border-[#cf5c36] focus:ring-1 focus:ring-[#cf5c36] resize-y"
            placeholder="<p>Le contenu de votre article...</p>"
          />
        </div>

        {/* Published toggle */}
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${form.published ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, published: e.target.checked }))
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#cf5c36]"></div>
          </label>
          <div>
            <span className="text-sm font-semibold text-gray-700">
              {form.published ? "Publi\u00e9" : "Brouillon"}
            </span>
            <p className="text-xs text-gray-500 mt-0.5">
              {form.published
                ? "L'article sera visible sur le site public."
                : "L'article ne sera PAS visible sur le site. Activez pour le publier."}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#cf5c36] text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#b8502f] transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/articles")}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 px-4 py-3 transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
