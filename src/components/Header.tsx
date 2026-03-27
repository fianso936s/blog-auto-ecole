import { Link, useLocation } from "react-router-dom";
import { BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const navLinks = [
    { label: "Accueil", href: "/" },
    { label: "Articles", href: "/articles" },
    { label: "Code de la Route", href: "/articles?cat=code-de-la-route" },
    { label: "Conduite", href: "/articles?cat=conduite" },
    { label: "Quiz Code", href: "/quiz" },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="bg-[#fcfaf8] border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-[#cf5c36] rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif font-bold text-gray-900 text-lg">
              Auto-<span className="text-[#cf5c36]">Blog</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(link.href)
                    ? "text-[#cf5c36]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link
                to={user?.role === "admin" ? "/admin" : "/eleve"}
                className="bg-[#cf5c36] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#b8502f] transition-colors duration-200"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-gray-100 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-200 transition-colors duration-200"
                >
                  Connexion
                </Link>
                <Link
                  to="/inscription"
                  className="bg-[#cf5c36] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#b8502f] transition-colors duration-200"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <nav className="md:hidden pb-4 border-t border-gray-100 pt-4">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`text-sm font-medium px-3 py-2 rounded-lg ${
                    isActive(link.href)
                      ? "text-[#cf5c36] bg-[#fcedea]"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-gray-100 pt-3 mt-1">
                {user ? (
                  <Link
                    to={user?.role === "admin" ? "/admin" : "/eleve"}
                    onClick={() => setMenuOpen(false)}
                    className="block text-center bg-[#cf5c36] text-white text-sm font-semibold px-5 py-2.5 rounded-full"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="block text-center bg-gray-100 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-full"
                    >
                      Connexion
                    </Link>
                    <Link
                      to="/inscription"
                      onClick={() => setMenuOpen(false)}
                      className="block text-center bg-[#cf5c36] text-white text-sm font-semibold px-5 py-2.5 rounded-full"
                    >
                      S'inscrire
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
