import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, LogOut, GraduationCap, ClipboardList, ArrowLeft, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Ma progression", href: "/eleve", icon: LayoutDashboard },
    { label: "Mes cours", href: "/eleve/cours", icon: BookOpen },
    { label: "Quiz REMC", href: "/eleve/quiz", icon: ClipboardList },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border hidden lg:flex flex-col relative">
        {/* Warm accent gradient line */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-amber to-primary" />

        {/* Logo */}
        <div className="p-6 pl-7">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif font-bold text-secondary text-lg tracking-tight">
              Auto-<span className="text-primary">Blog</span>
            </span>
          </Link>
        </div>

        {/* User info card */}
        <div className="px-5 pl-6 pb-6">
          <div className="bg-gradient-to-br from-primary-light via-amber-light to-primary-light rounded-2xl p-4 border border-border/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/15 to-amber/15 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-secondary truncate font-serif">
                  {user?.full_name || "Eleve"}
                </p>
                <p className="text-xs text-text-muted truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 pl-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-3 px-3">
            Espace eleve
          </p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    active
                      ? "bg-primary text-white shadow-sm"
                      : "text-text-muted hover:bg-primary-light hover:text-primary"
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-colors ${active ? "text-white" : "group-hover:text-primary"}`} />
                  {item.label}
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-border mt-5 pt-5">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-muted hover:bg-amber-light hover:text-amber transition-all duration-200 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              Retour au blog
            </Link>
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 pl-5 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-muted hover:bg-secondary hover:text-white w-full transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Deconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar mobile */}
        <header className="lg:hidden bg-surface/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-40">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif font-bold text-secondary text-sm">
              Auto-<span className="text-primary">Blog</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-2 mr-2">
              <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-primary" />
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-text-muted hover:bg-secondary hover:text-white transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mobile bottom nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-sm border-t border-border z-50 px-2 py-1 safe-area-bottom">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all duration-200 relative ${
                    active
                      ? "text-primary"
                      : "text-text-muted"
                  }`}
                >
                  {active && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary" />
                  )}
                  <div className={`p-1.5 rounded-lg transition-colors ${active ? "bg-primary-light" : ""}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
            <Link
              to="/"
              className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl text-text-muted transition-all duration-200"
            >
              <div className="p-1.5">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">Blog</span>
            </Link>
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
