import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, LogOut, GraduationCap, ClipboardList } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#cf5c36] rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif font-bold text-gray-900">
              Auto-<span className="text-[#cf5c36]">Blog</span>
            </span>
          </Link>
        </div>

        {/* User info */}
        <div className="px-6 pb-4">
          <div className="bg-[#fcedea] rounded-xl p-3">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.full_name || "Élève"}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        <nav className="flex-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-[#fcedea] text-[#cf5c36]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}

          <div className="border-t border-gray-100 mt-3 pt-3">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              Retour au blog
            </Link>
          </div>
        </nav>

        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            D&eacute;connexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar mobile */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#cf5c36] rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif font-bold text-gray-900 text-sm">
              Auto-<span className="text-[#cf5c36]">Blog</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`p-2 rounded-lg ${
                    isActive(item.href) ? "bg-[#fcedea] text-[#cf5c36]" : "text-gray-500"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700"
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
