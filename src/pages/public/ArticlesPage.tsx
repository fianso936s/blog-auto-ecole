import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ArticleCard from "../../components/ArticleCard";
import PageMeta from "../../components/PageMeta";
import { sampleArticles, categories } from "../../data/articles";
import { categorySlug } from "../../lib/navigation";
import { supabase } from "../../lib/supabase";
import type { Article } from "../../lib/types";

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>(sampleArticles);
  const [params] = useSearchParams();
  const category = params.get("cat");
  const active = category ? categorySlug(category) : null;
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data, error } = await supabase.from("articles").select("*").eq("published", true).order("created_at", { ascending: false });
        if (!cancelled && !error && data && data.length) setArticles(data);
      } catch { /* Existing article examples remain available. */ }
    };
    void load(); return () => { cancelled = true; };
  }, []);
  const selected = categories.find(item => categorySlug(item) === active);
  const filtered = active ? articles.filter(article => categorySlug(article.category) === active) : articles;
  return <>
    <PageMeta title={selected || "Tous les articles"} />
    <section className="blog-hero"><span className="site-eyebrow">Blog & guides</span><h1>{selected || "Tous les articles"}</h1><p>Des conseils et des guides pour comprendre la route et progresser, à votre rythme.</p></section>
    <div className="blog-container">
      <nav className="blog-filters" aria-label="Filtrer les articles par sujet"><Link to="/blog/articles" aria-current={!active ? "page" : undefined}>Tous les sujets</Link>{categories.map(item => <Link key={item} to={`/blog/articles?cat=${encodeURIComponent(categorySlug(item))}`} aria-current={categorySlug(item) === active ? "page" : undefined}>{item}</Link>)}</nav>
      <p className="sr-only" role="status" aria-live="polite">{filtered.length} article{filtered.length !== 1 ? "s" : ""} affiché{filtered.length !== 1 ? "s" : ""}.</p>
      {filtered.length ? <div className="blog-grid">{filtered.map(article => <ArticleCard key={article.id} article={article} />)}</div> : <div className="blog-empty"><h2>Aucun article dans cette rubrique</h2><p>Découvrez les autres sujets du journal.</p><Link to="/blog/articles">Afficher tous les articles</Link></div>}
    </div>
  </>;
}
