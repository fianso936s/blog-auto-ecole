import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Eye, TrendingUp, Plus, ArrowRight, Users, Activity, BarChart3 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

interface RecentQuizResult {
  id: string;
  competence_id: number;
  score: number;
  total: number;
  created_at: string;
  profiles: { full_name: string } | null;
}

interface CompetenceAvg {
  competenceId: number;
  label: string;
  avg: number;
  color: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0 });
  const [studentStats, setStudentStats] = useState({
    totalStudents: 0,
    activeThisWeek: 0,
    avgQuizScore: 0,
  });
  const [competenceAvgs, setCompetenceAvgs] = useState<CompetenceAvg[]>([]);
  const [recentQuizzes, setRecentQuizzes] = useState<RecentQuizResult[]>([]);

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

    const fetchStudentStats = async () => {
      try {
        // Total registered students
        const { count: totalStudents } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "user");

        // Active students this week (distinct users with quiz results in last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const { data: activeData } = await supabase
          .from("quiz_results")
          .select("user_id")
          .gte("created_at", oneWeekAgo.toISOString());

        const uniqueActiveUsers = new Set(
          (activeData || []).map((r: { user_id: string }) => r.user_id)
        );

        // All quiz results for average and competence breakdown
        const { data: allResults } = await supabase
          .from("quiz_results")
          .select("competence_id, score, total");

        let avgScore = 0;
        const compMap = new Map<number, { totalPct: number; count: number }>();

        if (allResults && allResults.length > 0) {
          let totalPct = 0;
          for (const r of allResults) {
            const pct = (r.score / r.total) * 100;
            totalPct += pct;

            const existing = compMap.get(r.competence_id) || {
              totalPct: 0,
              count: 0,
            };
            existing.totalPct += pct;
            existing.count += 1;
            compMap.set(r.competence_id, existing);
          }
          avgScore = Math.round(totalPct / allResults.length);
        }

        setStudentStats({
          totalStudents: totalStudents || 0,
          activeThisWeek: uniqueActiveUsers.size,
          avgQuizScore: avgScore,
        });

        // Competence averages
        const compColors: Record<number, string> = {
          1: "#2563eb",
          2: "#059669",
          3: "#d97706",
          4: "#9333ea",
        };
        const compLabels: Record<number, string> = {
          1: "C1 - Maniement",
          2: "C2 - Circulation",
          3: "C3 - Partage",
          4: "C4 - Autonomie",
        };

        const avgs: CompetenceAvg[] = [1, 2, 3, 4].map((id) => {
          const data = compMap.get(id);
          return {
            competenceId: id,
            label: compLabels[id],
            avg: data ? Math.round(data.totalPct / data.count) : 0,
            color: compColors[id],
          };
        });
        setCompetenceAvgs(avgs);

        // Recent quiz results (last 10)
        const { data: recentData } = await supabase
          .from("quiz_results")
          .select("id, competence_id, score, total, created_at, profiles(full_name)")
          .order("created_at", { ascending: false })
          .limit(10);

        setRecentQuizzes((recentData as unknown as RecentQuizResult[]) || []);
      } catch {
        // Silently handle if tables don't exist
      }
    };

    fetchStats();
    fetchStudentStats();
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

      {/* Student Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-10 mb-10">
        <div className="bg-surface rounded-2xl border border-border p-6 hover-lift animate-fade-up delay-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-text-muted font-medium">Eleves inscrits</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600 border border-purple-100">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="font-serif text-4xl font-bold text-secondary">{studentStats.totalStudents}</p>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-6 hover-lift animate-fade-up delay-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-text-muted font-medium">Actifs cette semaine</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="font-serif text-4xl font-bold text-secondary">{studentStats.activeThisWeek}</p>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-6 hover-lift animate-fade-up delay-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-text-muted font-medium">Score moyen quiz</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber/10 text-amber border-amber/20">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <p className="font-serif text-4xl font-bold text-secondary">{studentStats.avgQuizScore}%</p>
        </div>
      </div>

      {/* Competence Performance Chart */}
      <div className="bg-surface rounded-2xl border border-border p-6 mb-10 animate-fade-up delay-400">
        <h2 className="font-serif text-lg font-bold text-secondary mb-6">Performance par competence</h2>
        <div className="space-y-4">
          {competenceAvgs.map((comp) => (
            <div key={comp.competenceId} className="flex items-center gap-4">
              <span className="text-sm font-medium text-secondary w-36 flex-shrink-0 truncate">
                {comp.label}
              </span>
              <div className="flex-1 bg-surface-alt rounded-full h-7 overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-3"
                  style={{
                    width: `${Math.max(comp.avg, 4)}%`,
                    backgroundColor: comp.color,
                  }}
                >
                  {comp.avg > 15 && (
                    <span className="text-xs font-bold text-white">{comp.avg}%</span>
                  )}
                </div>
                {comp.avg <= 15 && (
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">
                    {comp.avg}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Quiz Activity */}
      <div className="bg-surface rounded-2xl border border-border p-6 animate-fade-up delay-500">
        <h2 className="font-serif text-lg font-bold text-secondary mb-5">Activite recente des quiz</h2>
        {recentQuizzes.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-6">Aucun resultat de quiz pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 text-text-muted font-medium">Eleve</th>
                  <th className="text-left py-3 px-3 text-text-muted font-medium">Competence</th>
                  <th className="text-left py-3 px-3 text-text-muted font-medium">Score</th>
                  <th className="text-left py-3 px-3 text-text-muted font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentQuizzes.map((quiz) => {
                  const pct = Math.round((quiz.score / quiz.total) * 100);
                  const compLabels: Record<number, string> = {
                    1: "C1",
                    2: "C2",
                    3: "C3",
                    4: "C4",
                  };
                  const compBadgeColors: Record<number, string> = {
                    1: "bg-blue-50 text-blue-600",
                    2: "bg-emerald-50 text-emerald-600",
                    3: "bg-amber-50 text-amber-600",
                    4: "bg-purple-50 text-purple-600",
                  };
                  return (
                    <tr key={quiz.id} className="border-b border-border/50 hover:bg-surface-alt/50 transition-colors">
                      <td className="py-3 px-3 font-medium text-secondary">
                        {quiz.profiles?.full_name || "Eleve"}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${compBadgeColors[quiz.competence_id] || ""}`}>
                          {compLabels[quiz.competence_id] || `C${quiz.competence_id}`}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`font-bold ${pct >= 75 ? "text-emerald-600" : "text-primary"}`}>
                          {quiz.score}/{quiz.total}
                        </span>
                        <span className="text-text-muted ml-1">({pct}%)</span>
                      </td>
                      <td className="py-3 px-3 text-text-muted">
                        {new Date(quiz.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
