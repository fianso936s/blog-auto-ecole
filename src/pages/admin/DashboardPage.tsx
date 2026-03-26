import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Eye, TrendingUp, Plus } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: total } = await supabase
          .from("articles")
          .select("*", { count: "exact", head: true });

        const { count: published } = await supabase
          .from("articles")
          .select("*", { count: "exact", head: true })
          .eq("published", true);

        setStats({
          total: total || 0,
          published: published || 0,
          drafts: (total || 0) - (published || 0),
        });
      } catch {
        // Fallback
        setStats({ total: 6, published: 6, drafts: 0 });
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total articles",
      value: stats.total,
      icon: FileText,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Publi\u00e9s",
      value: stats.published,
      icon: Eye,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Brouillons",
      value: stats.drafts,
      icon: TrendingUp,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Bonjour, {user?.full_name || "Admin"} !
        </h1>
        <p className="text-gray-500">
          Bienvenue dans votre espace d'administration.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{stat.label}</span>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Actions rapides</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/articles/new"
            className="inline-flex items-center gap-2 bg-[#cf5c36] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#b8502f] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouvel article
          </Link>
          <Link
            to="/admin/articles"
            className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-200 transition-colors"
          >
            <FileText className="w-4 h-4" />
            G\u00e9rer les articles
          </Link>
        </div>
      </div>
    </div>
  );
}
