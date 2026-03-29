import { Link } from "react-router-dom";
import { Car, Mail, Phone, MapPin, ArrowRight, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-secondary text-white/60 mt-20 relative overflow-hidden">
      {/* Warm amber accent line at the top */}
      <div className="h-1 bg-gradient-to-r from-amber via-primary to-amber" />

      {/* Subtle grain texture */}
      <div className="grain" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand - wider column */}
          <div className="sm:col-span-2 lg:col-span-4">
            <Link to="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="font-serif font-extrabold text-white text-xl tracking-tight">
                Auto-<span className="text-primary">Blog</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-white/60 mb-6 max-w-xs">
              Votre ressource en ligne pour r&eacute;ussir le permis de conduire.
              Conseils, actualit&eacute;s et guides pratiques pour les futurs conducteurs.
            </p>

            {/* Newsletter mini CTA */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-white text-sm font-semibold font-serif mb-2">
                Restez inform&eacute;
              </p>
              <p className="text-xs text-white/60 mb-3">
                Recevez nos derniers articles et conseils.
              </p>
              <Link
                to="/articles"
                className="inline-flex items-center gap-2 text-amber text-xs font-semibold hover:text-white transition-colors duration-200"
              >
                <Send className="w-3.5 h-3.5" />
                D&eacute;couvrir nos articles
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="text-white font-serif font-bold text-sm mb-5 uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Accueil", href: "/" },
                { label: "Articles", href: "/articles" },
                { label: "Code de la Route", href: "/articles?cat=code-de-la-route" },
                { label: "Conduite", href: "/articles?cat=conduite" },
                { label: "Quiz Code", href: "/quiz" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-200 inline-flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cat&eacute;gories */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-serif font-bold text-sm mb-5 uppercase tracking-wider">
              Cat&eacute;gories
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Code de la Route", href: "/articles?cat=code-de-la-route" },
                { label: "Le\u00e7ons de Conduite", href: "/articles?cat=conduite" },
                { label: "S\u00e9curit\u00e9 Routi\u00e8re", href: "/articles?cat=securite" },
                { label: "Actualit\u00e9s", href: "/articles?cat=actualites" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-200 inline-flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-serif font-bold text-sm mb-5 uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/10">
                  <Mail className="w-4 h-4 text-amber" />
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-0.5">Email</p>
                  <p className="text-white/80">contact@auto-blog.fr</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/10">
                  <Phone className="w-4 h-4 text-amber" />
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-0.5">T&eacute;l&eacute;phone</p>
                  <p className="text-white/80">01 23 45 67 89</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/10">
                  <MapPin className="w-4 h-4 text-amber" />
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-0.5">Adresse</p>
                  <p className="text-white/80">Paris, France</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} Auto-Blog. Tous droits r&eacute;serv&eacute;s.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/articles" className="text-xs text-white/40 hover:text-white/80 transition-colors duration-200">
              Mentions l&eacute;gales
            </Link>
            <Link to="/articles" className="text-xs text-white/40 hover:text-white/80 transition-colors duration-200">
              Politique de confidentialit&eacute;
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
