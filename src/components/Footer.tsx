import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import BrandMark from "./BrandMark";

export default function Footer() {
  return <footer className="site-footer">
    <div className="site-footer-grid">
      <div><BrandMark /><p>Votre permis, avec une vision claire à chaque étape.</p><span className="site-footer-location">Auto-école · Asnières-sur-Seine</span></div>
      <nav aria-label="La formation"><h2>Votre formation</h2><Link to="/">L’auto-école</Link><Link to="/#formules">Formules et tarifs</Link><Link to="/#methode">Notre méthode</Link><Link to="/login">Espace élève</Link></nav>
      <nav aria-label="Les ressources"><h2>Pour progresser</h2><Link to="/blog">Blog & guides</Link><Link to="/blog/articles">Tous les articles</Link><Link to="/blog/quiz">Quiz code</Link><Link to="/#formules" className="site-footer-cta">Comparer les formules <ArrowRight size={16} aria-hidden="true" /></Link></nav>
    </div>
    <div className="site-footer-bottom"><p>© {new Date().getFullYear()} WEBEDRIVE</p><details><summary>Informations du site</summary><p>Site en cours de finalisation. Les coordonnées publiques, l’identité légale et les mentions réglementaires restent à valider. Les tarifs sont présentés à titre d’information ; cette vitrine ne réserve aucun créneau et ne prend aucun paiement.</p></details></div>
  </footer>;
}
