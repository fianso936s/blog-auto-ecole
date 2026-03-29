import { Link, useLocation, useNavigate } from "react-router-dom";
import { Car, Menu, X, LogOut, LayoutDashboard, User, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate("/");
  };

  const dashboardPath = user?.role === "admin" ? "/admin" : "/eleve";

  const navLinks = [
    { label: "Accueil", href: "/" },
    { label: "Articles", href: "/articles" },
    { label: "Code de la Route", href: "/articles?cat=code-de-la-route" },
    { label: "Conduite", href: "/articles?cat=conduite" },
    { label: "Quiz Code", href: "/quiz" },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-surface/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.05)] border-b border-border"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="font-serif font-extrabold text-secondary text-xl tracking-tight">
                Auto-<span className="text-primary">Blog</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`relative text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isActive(link.href)
                      ? "text-primary"
                      : "text-text-muted hover:text-text link-underline"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <ThemeToggle />
              {user ? (
                <>
                  <Link
                    to={dashboardPath}
                    className="bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-primary-dark transition-all duration-200 hover:scale-[1.03] inline-flex items-center gap-2 shadow-sm"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Mon espace
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-surface-alt text-text-muted text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-border transition-colors duration-200 inline-flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    D&eacute;connexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-text-muted text-sm font-semibold px-4 py-2.5 rounded-full hover:text-text transition-colors duration-200"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/inscription"
                    className="bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-primary-dark transition-all duration-200 hover:scale-[1.03] shadow-sm"
                  >
                    S'inscrire
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 text-text-muted hover:text-text rounded-lg transition-colors duration-200"
              aria-label="Menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 lg:hidden ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-secondary/40 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />

        {/* Drawer Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-surface shadow-2xl transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-border">
            <span className="font-serif font-extrabold text-secondary text-lg tracking-tight">
              Auto-<span className="text-primary">Blog</span>
            </span>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 text-text-muted hover:text-text rounded-lg transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Content */}
          <div className="flex flex-col h-[calc(100%-4rem)] overflow-y-auto">
            {/* Navigation Links */}
            <nav className="px-4 py-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-between text-sm font-medium px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive(link.href)
                      ? "text-primary bg-primary-light"
                      : "text-text hover:bg-surface-alt"
                  }`}
                >
                  {link.label}
                  <ChevronRight className={`w-4 h-4 ${isActive(link.href) ? "text-primary" : "text-text-muted/40"}`} />
                </Link>
              ))}
            </nav>

            {/* Divider */}
            <div className="mx-6 border-t border-border" />

            {/* User Section */}
            <div className="px-4 py-6 mt-auto">
              {user ? (
                <div className="space-y-3">
                  {/* User Info */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-surface-alt rounded-xl">
                    <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text truncate">
                        {user.full_name || "Utilisateur"}
                      </p>
                      <p className="text-xs text-text-muted truncate">{user.email}</p>
                    </div>
                  </div>

                  <Link
                    to={dashboardPath}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 bg-primary text-white text-sm font-semibold w-full py-3 rounded-full hover:bg-primary-dark transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Mon espace
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 bg-surface-alt text-text-muted text-sm font-semibold w-full py-3 rounded-full hover:bg-border transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    D&eacute;connexion
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/inscription"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center bg-primary text-white text-sm font-semibold w-full py-3 rounded-full hover:bg-primary-dark transition-colors"
                  >
                    S'inscrire
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center bg-surface-alt text-text text-sm font-semibold w-full py-3 rounded-full hover:bg-border transition-colors"
                  >
                    Connexion
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
