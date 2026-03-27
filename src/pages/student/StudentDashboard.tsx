import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { remcCompetences } from "../../data/remc";
import {
  Trophy,
  Target,
  TrendingUp,
  Clock,
  ArrowRight,
  Star,
  ClipboardList,
} from "lucide-react";

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
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color: string;
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
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
        className="text-gray-100"
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

export default function StudentDashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<CompetenceProgress[]>([]);
  const [recentSessions, setRecentSessions] = useState<QuizResult[]>([]);
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

          // Calculer la progression par compétence
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

    fetchProgress();
  }, [user]);

  // Calcul progression globale
  const globalProgress =
    progress.length > 0
      ? Math.round(
          progress.reduce((sum, p) => sum + p.avgScore, 0) / progress.length
        )
      : 0;

  const totalSessions = progress.reduce((sum, p) => sum + p.totalAttempts, 0);

  // Couleurs pour le cercle de progression
  const circleColors = ["#2563eb", "#059669", "#d97706", "#9333ea"];

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
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#cf5c36] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Bonjour, {user?.full_name || "Élève"} !
        </h1>
        <p className="text-gray-500">
          Suivez votre progression sur les 4 comp&eacute;tences REMC.
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="w-10 h-10 bg-[#fcedea] rounded-lg flex items-center justify-center mx-auto mb-2">
            <Target className="w-5 h-5 text-[#cf5c36]" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{globalProgress}%</p>
          <p className="text-xs text-gray-500">Progression globale</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalSessions}</p>
          <p className="text-xs text-gray-500">Sessions de quiz</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Trophy className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{strongPoints.length}</p>
          <p className="text-xs text-gray-500">Points forts</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{weakPoints.length}</p>
          <p className="text-xs text-gray-500">&Agrave; am&eacute;liorer</p>
        </div>
      </div>

      {/* Progression globale circulaire + Compétences REMC */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Cercle global */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Progression globale
          </h2>
          <div className="relative">
            <ProgressCircle
              percentage={globalProgress}
              size={140}
              strokeWidth={10}
              color="#cf5c36"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-3xl font-bold text-gray-900">
                  {globalProgress}%
                </span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center">
            {globalProgress >= 75
              ? "Excellent ! Vous êtes prêt(e) pour l'examen."
              : globalProgress >= 50
                ? "Bonne progression, continuez !"
                : "Continuez vos révisions pour progresser."}
          </p>
        </div>

        {/* Cartes compétences REMC */}
        <div className="lg:col-span-2 space-y-4">
          {remcCompetences.map((comp, index) => {
            const prog = progress.find((p) => p.competenceId === comp.id);
            const percentage = prog?.avgScore || 0;

            return (
              <div
                key={comp.id}
                className={`bg-white rounded-xl border ${comp.borderColor} p-4 hover:shadow-sm transition-shadow`}
              >
                <div className="flex items-start gap-4">
                  {/* Mini cercle progression */}
                  <div className="relative flex-shrink-0">
                    <ProgressCircle
                      percentage={percentage}
                      size={56}
                      strokeWidth={5}
                      color={circleColors[index]}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-700">
                        {percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{comp.icon}</span>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        C{comp.id}. {comp.shortTitle}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                      {comp.description}
                    </p>

                    {/* Barre progression */}
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: circleColors[index],
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {prog?.totalAttempts || 0} session(s)
                        {prog?.bestScore
                          ? ` · Meilleur : ${prog.bestScore}%`
                          : ""}
                      </span>
                      <Link
                        to={`/eleve/quiz?competence=${comp.id}`}
                        className={`text-xs font-medium ${comp.color} hover:underline inline-flex items-center gap-1`}
                      >
                        S'entra&icirc;ner <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historique récent + Points forts/faibles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historique récent */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            Derni&egrave;res sessions
          </h2>
          {recentSessions.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400 mb-3">
                Aucune session pour le moment.
              </p>
              <Link
                to="/eleve/quiz"
                className="inline-flex items-center gap-2 bg-[#cf5c36] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#b8502f] transition-colors"
              >
                Commencer un quiz
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
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
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {comp?.icon || "📝"}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {comp?.shortTitle || "Quiz"}
                        </p>
                        <p className="text-xs text-gray-400">
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
                        className={`text-sm font-bold ${passed ? "text-green-600" : "text-red-500"}`}
                      >
                        {session.score}/{session.total}
                      </span>
                      <p className="text-xs text-gray-400">{pct}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Points forts / faibles */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-gray-400" />
            Points forts &amp; faibles
          </h2>

          {totalSessions === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400">
                Faites quelques quiz pour voir vos points forts et faibles.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {strongPoints.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">
                    Points forts
                  </p>
                  {strongPoints.map((p) => {
                    const comp = remcCompetences.find(
                      (c) => c.id === p.competenceId
                    );
                    return (
                      <div
                        key={p.competenceId}
                        className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-green-50"
                      >
                        <span>{comp?.icon}</span>
                        <span className="text-sm text-gray-700 flex-1">
                          {comp?.shortTitle}
                        </span>
                        <span className="text-sm font-bold text-green-600">
                          {p.avgScore}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {weakPoints.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">
                    &Agrave; am&eacute;liorer
                  </p>
                  {weakPoints.map((p) => {
                    const comp = remcCompetences.find(
                      (c) => c.id === p.competenceId
                    );
                    return (
                      <div
                        key={p.competenceId}
                        className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-amber-50"
                      >
                        <span>{comp?.icon}</span>
                        <span className="text-sm text-gray-700 flex-1">
                          {comp?.shortTitle}
                        </span>
                        <span className="text-sm font-bold text-amber-600">
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

