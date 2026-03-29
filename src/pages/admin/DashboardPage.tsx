import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Eye, TrendingUp, Plus, ArrowRight } from "lucide-react";
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
      accent: "bg-blue-50 text-blue-600 border-blue-100",
      ring: "ring-blue-50",
    },
    {
      label: "Publiés",
      value: stats.published,
      icon: Eye,
      accent: "bg-green-50 text-green-600 border-green-100",
      ring: "ring-green-50",
    },
    {
      label: "Brouillons",
      value: stats.drafts,
      icon: TrendingUp,
      accent: "bg-amber/10 text-amber border-amber/20",
      ring: "ring-amber/10",
    },
  ];

  const delayClasses = ["delay-100", "delay-200", "delay-300"];

  return (
    <div>
      {/* Welcome */}
      <div className="mb-10 animate-fade-up">
        <h1 className="font-serif text-3xl font-bold text-secondary mb-2">
          Bonjour, {user?.full_name || "Admin"} !
        </h1>
        <p className="text-text-muted font-sans">
          Bienvenue dans votre espace d'administration.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`bg-surface rounded-2xl border border-border p-6 hover-lift animate-fade-up ${delayClasses[index]}`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-text-muted font-medium">{stat.label}</span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.accent}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="font-serif text-4xl font-bold text-secondary">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-surface rounded-2xl border border-border p-6 animate-fade-up delay-400">
        <h2 className="font-serif text-lg font-bold text-secondary mb-5">Actions rapides</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/articles/new"
            className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-primary-dark transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            Créer un article
          </Link>
          <Link
            to="/admin/articles"
            className="inline-flex items-center gap-2 bg-surface-alt text-secondary text-sm font-semibold px-6 py-3 rounded-full hover:bg-border transition-all duration-200"
          >
            <FileText className="w-4 h-4" />
            Gérer les articles
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
