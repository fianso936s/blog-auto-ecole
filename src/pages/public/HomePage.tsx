import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ArticleCard from "../../components/ArticleCard";
import CategoryBadge from "../../components/CategoryBadge";
import Newsletter from "../../components/Newsletter";
import PageMeta from "../../components/PageMeta";
import { sampleArticles, categories } from "../../data/articles";
import { supabase } from "../../lib/supabase";
import type { Article } from "../../lib/types";

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>(sampleArticles);
  const [contentSource, setContentSource] = useState<"sample" | "live">("sample");
  const [isChecking, setIsChecking] = useState(true);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data, error } = await supabase.from("articles").select("*").eq("published", true).order("created_at", { ascending: false }).limit(6);
        if (!cancelled && !error && data && data.length) { setArticles(data); setContentSource("live"); }
      } catch { /* Keep the existing editorial examples when the API is unavailable. */ }
      finally { if (!cancelled) setIsChecking(false); }
    };
    void load(); return () => { cancelled = true; };
  }, []);
  const [featured, ...others] = articles;
  return <>
    <PageMeta title="Blog & guides" description="Le journal WEBEDRIVE : conseils, actualités du code de la route, guides de conduite et quiz. Retrouvez les ressources de votre formation." />
    <section className="blog-hero">
      <span className="site-eyebrow">Le journal WEBEDRIVE</span>
      <h1>Les bons repères.<br />Sur la route, et avant.</h1>
      <p>Conseils, actualités du code de la route et guides pratiques pour préparer votre parcours de conducteur.</p>
      <div className="wd-actions"><Link className="site-button" to="/blog/articles">Explorer les articles <ArrowRight size={18} aria-hidden="true" /></Link><Link className="wd-ghost" to="/blog/quiz">Tester mes connaissances</Link></div>
    </section>
    <div className="blog-container">
      {contentSource === "sample" && <aside className={`blog-editorial-note${isChecking ? " is-checking" : ""}`} aria-label="Information éditoriale" role={isChecking ? "status" : undefined} aria-live={isChecking ? "polite" : undefined}>
        <span className="blog-editorial-note-kicker">{isChecking ? "Synchronisation" : "Aperçu éditorial"}</span>
        <strong>{isChecking ? "Vérification des publications en cours." : "Contenu de démonstration."}</strong>
        <span>{isChecking ? "L’aperçu reste disponible pendant ce contrôle." : "Certains articles affichés sont des exemples de démonstration tant que la publication réelle n’est pas validée."}</span>
      </aside>}
      {featured && <section aria-label="À la une"><div className="blog-section-title"><h2>À la une</h2><Link to="/blog/articles">Tous les articles</Link></div><ArticleCard article={featured} featured /></section>}
      <section aria-labelledby="recent-title"><div className="blog-section-title"><h2 id="recent-title">Pour aller plus loin</h2></div><div className="blog-grid">{others.map(article => <ArticleCard key={article.id} article={article} />)}</div></section>
      <section aria-labelledby="categories-title"><div className="blog-section-title"><h2 id="categories-title">Vos sujets</h2></div><div className="blog-filters">{categories.map(category => <CategoryBadge key={category} category={category} />)}</div></section>
      <Newsletter />
    </div>
  </>;
}
