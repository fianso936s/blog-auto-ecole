import { Link } from "react-router-dom";
import { BookOpen, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#cf5c36] rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-serif font-bold text-white text-lg">
                Auto-<span className="text-[#cf5c36]">Blog</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              Votre ressource en ligne pour r&eacute;ussir le permis de conduire.
              Conseils, actualit&eacute;s et guides pratiques pour les futurs conducteurs.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              <li><Link to="/" className="text-sm hover:text-white transition-colors">Accueil</Link></li>
              <li><Link to="/articles" className="text-sm hover:text-white transition-colors">Articles</Link></li>
              <li><Link to="/articles?cat=code-de-la-route" className="text-sm hover:text-white transition-colors">Code de la Route</Link></li>
              <li><Link to="/articles?cat=conduite" className="text-sm hover:text-white transition-colors">Conduite</Link></li>
              <li><Link to="/quiz" className="text-sm hover:text-white transition-colors">Quiz Code de la Route</Link></li>
            </ul>
          </div>

          {/* Cat&eacute;gories */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">
              Cat&eacute;gories
            </h4>
            <ul className="space-y-2.5">
              <li><Link to="/articles?cat=code-de-la-route" className="text-sm hover:text-white transition-colors">Code de la Route</Link></li>
              <li><Link to="/articles?cat=conduite" className="text-sm hover:text-white transition-colors">Le&ccedil;ons de Conduite</Link></li>
              <li><Link to="/articles?cat=securite" className="text-sm hover:text-white transition-colors">S&eacute;curit&eacute; Routi&egrave;re</Link></li>
              <li><Link to="/articles?cat=actualites" className="text-sm hover:text-white transition-colors">Actualit&eacute;s</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">
              Contact
            </h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-[#cf5c36]" />
                contact@auto-blog.fr
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-[#cf5c36]" />
                01 23 45 67 89
              </li>
              <li className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-[#cf5c36]" />
                Paris, France
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Auto-Blog. Tous droits r&eacute;serv&eacute;s.</p>
        </div>
      </div>
    </footer>
  );
}
