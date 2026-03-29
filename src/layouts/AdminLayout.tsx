import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, Settings, LogOut, BookOpen } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function AdminLayout() {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Articles", href: "/admin/articles", icon: FileText },
    { label: "Paramètres", href: "/admin/settings", icon: Settings },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border hidden lg:flex flex-col relative">
        {/* Primary accent line */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />

        <div className="p-6 pl-7">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm group-hover:bg-primary-dark transition-colors">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif font-bold text-secondary text-lg tracking-tight">
              Auto-<span className="text-primary">Blog</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 pl-5 mt-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-3 px-3">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-primary-light text-primary shadow-sm"
                    : "text-text-muted hover:bg-surface-alt hover:text-text"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "text-primary" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 pl-5 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-secondary hover:bg-secondary hover:text-white w-full transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar mobile */}
        <header className="lg:hidden bg-surface border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif font-bold text-secondary text-sm">
              Auto-<span className="text-primary">Blog</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`p-2.5 rounded-xl transition-all duration-200 ${
                    active
                      ? "bg-primary-light text-primary"
                      : "text-text-muted hover:bg-surface-alt"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl text-text-muted hover:bg-secondary hover:text-white transition-all duration-200 ml-1"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
