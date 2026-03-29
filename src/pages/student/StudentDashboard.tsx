import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { remcCompetences } from "../../data/remc";
import { badges as allBadges } from "../../data/badges";
import BadgeCard from "../../components/BadgeCard";
import {
  Trophy,
  Target,
  TrendingUp,
  Clock,
  ArrowRight,
  Star,
  ClipboardList,
  Sparkles,
  Award,
} from "lucide-react";
import { SkeletonText, SkeletonCircle } from "../../components/Skeleton";

interface QuizResult {
  id: string;
  competence_id: number;
  score: number;
  total: number;
  created_at: string;
}

interface CompetenceProgress {
  competenceId: number;
  totalAttempts: number;
  bestScore: number;
  avgScore: number;
  lastAttempt: string | null;
}

// Composant cercle de progression
function ProgressCircle({
  percentage,
  size = 120,
  strokeWidth = 8,
  color,
  trackColor = "var(--color-amber)",
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  trackColor?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={trackColor}
        strokeWidth={strokeWidth}
        fill="none"
        opacity={0.2}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
}

// Couleurs par competence
const COMP_ACCENT = [
  { color: "#2563eb", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", lightBg: "bg-blue-100", gradient: "from-blue-500 to-blue-600" },
  { color: "#059669", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", lightBg: "bg-emerald-100", gradient: "from-emerald-500 to-emerald-600" },
  { color: "#d97706", bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", lightBg: "bg-amber-100", gradient: "from-amber-500 to-amber-600" },
  { color: "#9333ea", bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200", lightBg: "bg-purple-100", gradient: "from-purple-500 to-purple-600" },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<CompetenceProgress[]>([]);
  const [recentSessions, setRecentSessions] = useState<QuizResult[]>([]);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("quiz_results")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setRecentSessions(data.slice(0, 5));

          // Calculer la progression par competence
          const progressMap = new Map<number, QuizResult[]>();
          for (const result of data) {
            const existing = progressMap.get(result.competence_id) || [];
            existing.push(result);
            progressMap.set(result.competence_id, existing);
          }

          const computed: CompetenceProgress[] = remcCompetences.map((comp) => {
            const results = progressMap.get(comp.id) || [];
            if (results.length === 0) {
              return {
                competenceId: comp.id,
                totalAttempts: 0,
                bestScore: 0,
                avgScore: 0,
                lastAttempt: null,
              };
            }
            const scores = results.map((r) =>
              Math.round((r.score / r.total) * 100)
            );
            return {
              competenceId: comp.id,
              totalAttempts: results.length,
              bestScore: Math.max(...scores),
              avgScore: Math.round(
                scores.reduce((a, b) => a + b, 0) / scores.length
              ),
              lastAttempt: results[0].created_at,
            };
          });

          setProgress(computed);
        }
      } catch {
        // Pas de table quiz_results encore — on affiche 0%
      }
      setLoading(false);
    };

    const fetchBadges = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from("user_badges")
          .select("badge_id, earned_at")
          .eq("user_id", user.id);

        if (data) {
          const map = new Map<string, string>();
          for (const row of data) {
            map.set(row.badge_id, row.earned_at);
          }
          setEarnedBadgeIds(map);
        }
      } catch {
        // Table may not exist yet
      }
    };

    fetchProgress();
    fetchBadges();
  }, [user]);

  // Calcul progression globale
  const globalProgress =
    progress.length > 0
      ? Math.round(
          progress.reduce((sum, p) => sum + p.avgScore, 0) / progress.length
        )
      : 0;

  const totalSessions = progress.reduce((sum, p) => sum + p.totalAttempts, 0);

  // Identifier points forts et faibles
  const sortedProgress = [...progress].sort(
    (a, b) => b.avgScore - a.avgScore
  );
  const strongPoints = sortedProgress.filter((p) => p.avgScore >= 70);
  const weakPoints = sortedProgress.filter(
    (p) => p.avgScore < 70 && p.totalAttempts > 0
  );

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        {/* Welcome banner skeleton */}
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 mb-8">
          <SkeletonText className="h-4 w-32 mb-3" />
          <SkeletonText className="h-7 w-64 mb-2" />
          <SkeletonText className="h-4 w-80" />
        </div>
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface rounded-2xl border border-border p-5 flex flex-col items-center gap-3">
              <SkeletonCircle size="w-12 h-12" />
              <SkeletonText className="h-6 w-12" />
              <SkeletonText className="h-3 w-24" />
            </div>
          ))}
        </div>
        {/* Competences skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-surface rounded-2xl border border-border p-6 flex flex-col items-center gap-4">
            <SkeletonCircle size="w-[170px] h-[170px]" />
            <SkeletonText className="h-4 w-32" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-surface rounded-2xl border border-border p-5">
                <div className="flex items-start gap-4">
                  <SkeletonCircle size="w-16 h-16" />
                  <div className="flex-1 space-y-2">
                    <SkeletonText className="h-4 w-40" />
                    <SkeletonText className="h-3 w-full" />
                    <SkeletonText className="h-2.5 w-full rounded-full" />
                    <SkeletonText className="h-3 w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-up">
      {/* Welcome banner */}
      <div className="bg-gradient-to-br from-primary-light via-amber-light to-surface rounded-2xl border border-border p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.04]">
          <Sparkles className="w-full h-full text-primary" />
        </div>
        <div className="absolute bottom-0 left-0 w-32 h-32 opacity-[0.03]">
          <Target className="w-full h-full text-amber" />
        </div>
        <div className="relative">
          <p className="text-primary text-sm font-semibold uppercase tracking-wide mb-1 font-sans">Tableau de bord</p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-secondary mb-2 tracking-tight">
            Bonjour, {user?.full_name || "Eleve"} !
          </h1>
          <p className="text-text-muted font-sans max-w-md">
            Suivez votre progression sur les 4 competences REMC et identifiez vos axes d'amelioration.
          </p>
        </div>
      </div>

      {/* Stats overview - 4 cards with different accent colors */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface rounded-2xl border border-border p-5 text-center hover-lift animate-fade-up delay-100 group">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-light to-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-secondary font-serif">{globalProgress}%</p>
          <p className="text-xs text-text-muted mt-1 font-medium">Progression globale</p>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-5 text-center hover-lift animate-fade-up delay-200 group">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <ClipboardList className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-secondary font-serif">{totalSessions}</p>
          <p className="text-xs text-text-muted mt-1 font-medium">Sessions de quiz</p>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-5 text-center hover-lift animate-fade-up delay-300 group">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <Trophy className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-secondary font-serif">{strongPoints.length}</p>
          <p className="text-xs text-text-muted mt-1 font-medium">Points forts</p>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-5 text-center hover-lift animate-fade-up delay-400 group">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-light to-amber/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5 text-amber" />
          </div>
          <p className="text-2xl font-bold text-secondary font-serif">{weakPoints.length}</p>
          <p className="text-xs text-text-muted mt-1 font-medium">A ameliorer</p>
        </div>
      </div>

      {/* Progression globale circulaire + Competences REMC */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Cercle global */}
        <div className="bg-surface rounded-2xl border border-border p-6 flex flex-col items-center justify-center animate-scale-in">
          <h2 className="font-serif text-sm font-semibold text-text-muted uppercase tracking-wide mb-6">
            Progression globale
          </h2>
          <div className="relative">
            <ProgressCircle
              percentage={globalProgress}
              size={170}
              strokeWidth={14}
              color="var(--color-primary)"
              trackColor="var(--color-amber)"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-5xl font-bold text-secondary font-serif">
                  {globalProgress}
                </span>
                <span className="text-lg text-text-muted font-serif">%</span>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-text-muted leading-relaxed max-w-[200px]">
              {globalProgress >= 75
                ? "Excellent ! Vous etes pret(e) pour l'examen."
                : globalProgress >= 50
                  ? "Bonne progression, continuez !"
                  : "Continuez vos revisions pour progresser."}
            </p>
            {globalProgress < 75 && (
              <Link
                to="/eleve/quiz"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark mt-3 transition-colors"
              >
                Reviser <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Cartes competences REMC */}
        <div className="lg:col-span-2 space-y-4">
          {remcCompetences.map((comp, index) => {
            const prog = progress.find((p) => p.competenceId === comp.id);
            const percentage = prog?.avgScore || 0;
            const accent = COMP_ACCENT[index];

            return (
              <div
                key={comp.id}
                className={`bg-surface rounded-2xl border ${accent.border} p-5 hover-lift transition-all duration-300 animate-fade-up`}
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  {/* Mini cercle progression */}
                  <div className="relative flex-shrink-0">
                    <ProgressCircle
                      percentage={percentage}
                      size={64}
                      strokeWidth={5}
                      color={accent.color}
                      trackColor={accent.color}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-secondary">
                        {percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">{comp.icon}</span>
                      <h3 className="font-serif font-bold text-secondary text-sm">
                        C{comp.id}. {comp.shortTitle}
                      </h3>
                    </div>
                    <p className="text-xs text-text-muted mb-3 line-clamp-1">
                      {comp.description}
                    </p>

                    {/* Barre progression */}
                    <div className="w-full bg-surface-alt rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: accent.color,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-2.5">
                      <span className="text-xs text-text-muted">
                        {prog?.totalAttempts || 0} session(s)
                        {prog?.bestScore
                          ? ` · Meilleur : ${prog.bestScore}%`
                          : ""}
                      </span>
                      <Link
                        to={`/eleve/quiz?competence=${comp.id}`}
                        className={`text-xs font-semibold ${accent.text} hover:underline inline-flex items-center gap-1 transition-colors`}
                      >
                        S'entrainer <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mes badges */}
      <div className="bg-surface rounded-2xl border border-border p-6 mb-8 animate-fade-up delay-100">
        <h2 className="font-serif font-bold text-secondary mb-5 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-light to-primary-light rounded-lg flex items-center justify-center">
            <Award className="w-4 h-4 text-amber" />
          </div>
          Mes badges
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {allBadges.map((badge, index) => {
            const earned = earnedBadgeIds.has(badge.id);
            const earnedAt = earnedBadgeIds.get(badge.id) || null;
            const delayClass = [
              "delay-100",
              "delay-200",
              "delay-300",
              "delay-400",
              "delay-500",
              "delay-600",
            ][index % 6];
            return (
              <div key={badge.id} className={`animate-fade-up ${delayClass}`}>
                <BadgeCard badge={badge} earned={earned} earnedAt={earnedAt} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Historique recent + Points forts/faibles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historique recent */}
        <div className="bg-surface rounded-2xl border border-border p-6 animate-fade-up delay-200">
          <h2 className="font-serif font-bold text-secondary mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            Dernieres sessions
          </h2>
          {recentSessions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-light to-amber-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm text-text-muted mb-4">
                Aucune session pour le moment.
              </p>
              <Link
                to="/eleve/quiz"
                className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-primary-dark transition-colors shadow-sm hover:shadow-md"
              >
                Commencer un quiz
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentSessions.map((session) => {
                const comp = remcCompetences.find(
                  (c) => c.id === session.competence_id
                );
                const pct = Math.round(
                  (session.score / session.total) * 100
                );
                const passed = pct >= 75;

                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-surface-alt/50 border border-border/50 hover:bg-surface-alt hover:border-border transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {comp?.icon || "📝"}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-secondary">
                          {comp?.shortTitle || "Quiz"}
                        </p>
                        <p className="text-xs text-text-muted">
                          {new Date(session.created_at).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-sm font-bold ${passed ? "text-emerald-600" : "text-primary"}`}
                      >
                        {session.score}/{session.total}
                      </span>
                      <div className="flex items-center gap-1.5 justify-end mt-0.5">
                        <div className="w-12 h-1.5 bg-surface-alt rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${passed ? "bg-emerald-500" : "bg-primary"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-text-muted">{pct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Points forts / faibles */}
        <div className="bg-surface rounded-2xl border border-border p-6 animate-fade-up delay-300">
          <h2 className="font-serif font-bold text-secondary mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-light rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-amber" />
            </div>
            Points forts &amp; faibles
          </h2>

          {totalSessions === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-light to-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-amber" />
              </div>
              <p className="text-sm text-text-muted">
                Faites quelques quiz pour voir vos points forts et faibles.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {strongPoints.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-emerald-100 rounded flex items-center justify-center">
                      <Trophy className="w-3 h-3" />
                    </div>
                    Points forts
                  </p>
                  {strongPoints.map((p) => {
                    const comp = remcCompetences.find(
                      (c) => c.id === p.competenceId
                    );
                    return (
                      <div
                        key={p.competenceId}
                        className="flex items-center gap-2.5 mb-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 hover:border-emerald-200 transition-colors"
                      >
                        <span>{comp?.icon}</span>
                        <span className="text-sm text-secondary flex-1 font-medium">
                          {comp?.shortTitle}
                        </span>
                        <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {p.avgScore}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {weakPoints.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-amber uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-amber-light rounded flex items-center justify-center">
                      <TrendingUp className="w-3 h-3" />
                    </div>
                    A ameliorer
                  </p>
                  {weakPoints.map((p) => {
                    const comp = remcCompetences.find(
                      (c) => c.id === p.competenceId
                    );
                    return (
                      <div
                        key={p.competenceId}
                        className="flex items-center gap-2.5 mb-2 p-3 rounded-xl bg-amber-light border border-amber/20 hover:border-amber/40 transition-colors"
                      >
                        <span>{comp?.icon}</span>
                        <span className="text-sm text-secondary flex-1 font-medium">
                          {comp?.shortTitle}
                        </span>
                        <Link
                          to={`/eleve/quiz?competence=${p.competenceId}`}
                          className="text-xs font-semibold text-amber hover:underline inline-flex items-center gap-1"
                        >
                          Reviser <ArrowRight className="w-3 h-3" />
                        </Link>
                        <span className="text-sm font-bold text-amber bg-amber/10 px-2 py-0.5 rounded-full">
                          {p.avgScore}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
