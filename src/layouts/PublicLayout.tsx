import { Outlet, NavLink } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import RouteEffects from "../components/RouteEffects";

export default function PublicLayout() {
  return <div className="site-shell">
    <RouteEffects /><Header />
    <nav className="site-blog-nav" aria-label="Rubriques du blog">
      <span>Le journal</span><NavLink to="/blog" end>À la une</NavLink><NavLink to="/blog/articles">Tous les articles</NavLink><NavLink to="/blog/quiz">Quiz code</NavLink>
    </nav>
    <main id="site-content" tabIndex={-1} className="site-content"><Outlet /></main>
    <Footer />
  </div>;
}
