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

  const inputClasses =
    "w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200";

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate("/admin/articles")}
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary mb-8 transition-colors font-medium animate-fade-in"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux articles
      </button>

      <h1 className="font-serif text-3xl font-bold text-secondary mb-8 animate-fade-up">
        {isEditing ? "Modifier l'article" : "Nouvel article"}
      </h1>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-5 py-4 rounded-xl mb-6 border border-red-100 animate-fade-in">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title & Slug */}
        <div className="bg-surface rounded-2xl border border-border p-6 space-y-5 animate-fade-up delay-100">
          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              Titre
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className={inputClasses}
              placeholder="Le titre de votre article"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              Slug (URL)
            </label>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              required
              className={`${inputClasses} font-mono`}
              placeholder="le-titre-de-votre-article"
            />
          </div>
        </div>

        {/* Category + Author */}
        <div className="bg-surface rounded-2xl border border-border p-6 animate-fade-up delay-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Catégorie
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={inputClasses}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Auteur
              </label>
              <input
                name="author"
                value={form.author}
                onChange={handleChange}
                required
                className={inputClasses}
                placeholder="Nom de l'auteur"
              />
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <div className="bg-surface rounded-2xl border border-border p-6 space-y-4 animate-fade-up delay-300">
          <label className="block text-sm font-semibold text-text">
            Image de couverture
          </label>

          {/* Image preview card */}
          <div className="rounded-xl bg-surface-alt border border-border overflow-hidden">
            {form.cover_image ? (
              <img
                src={form.cover_image}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 flex flex-col items-center justify-center text-text-muted">
                <Image className="w-8 h-8 mb-2 opacity-40" />
                <span className="text-sm">Aucune image</span>
              </div>
            )}
          </div>

          <input
            name="cover_image"
            value={form.cover_image}
            onChange={handleChange}
            className={inputClasses}
            placeholder="https://images.unsplash.com/..."
          />

          {/* Show Cover Image toggle */}
          <div className="flex items-center gap-3 pt-1">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.show_cover_image}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, show_cover_image: e.target.checked }))
                }
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:shadow-sm after:transition-all peer-checked:bg-primary"></div>
            </label>
            <span className="text-sm text-text-muted">
              Afficher l'image de couverture sur l'article
            </span>
          </div>
        </div>

        {/* Excerpt */}
        <div className="bg-surface rounded-2xl border border-border p-6 animate-fade-up delay-400">
          <label className="block text-sm font-semibold text-text mb-2">
            Extrait
          </label>
          <textarea
            name="excerpt"
            value={form.excerpt}
            onChange={handleChange}
            rows={3}
            required
            className={`${inputClasses} resize-none`}
            placeholder="Un court résumé de l'article..."
          />
        </div>

        {/* Content */}
        <div className="bg-surface rounded-2xl border border-border p-6 animate-fade-up delay-500">
          <label className="block text-sm font-semibold text-text mb-2">
            Contenu (HTML)
          </label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            rows={15}
            required
            className={`${inputClasses} font-mono resize-y`}
            placeholder="<p>Le contenu de votre article...</p>"
          />
        </div>

        {/* Published toggle */}
        <div
          className={`flex items-center gap-4 p-5 rounded-2xl border transition-colors animate-fade-up delay-600 ${
            form.published
              ? "border-green-200 bg-green-50/50"
              : "border-amber/30 bg-amber/5"
          }`}
        >
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, published: e.target.checked }))
              }
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:shadow-sm after:transition-all peer-checked:bg-primary"></div>
          </label>
          <div>
            <span className="text-sm font-semibold text-text">
              {form.published ? "Publié" : "Brouillon"}
            </span>
            <p className="text-xs text-text-muted mt-0.5">
              {form.published
                ? "L'article sera visible sur le site public."
                : "L'article ne sera PAS visible sur le site. Activez pour le publier."}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2 pb-8 animate-fade-up delay-600">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-8 py-3.5 rounded-full hover:bg-primary-dark transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/articles")}
            className="text-sm font-medium text-text-muted hover:text-text px-5 py-3.5 rounded-full hover:bg-surface-alt transition-all duration-200"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
