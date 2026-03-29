import { supabase } from "./supabase";
import { badges } from "../data/badges";

interface QuizResult {
  id: string;
  competence_id: number;
  score: number;
  total: number;
  created_at: string;
}

/**
 * Check all badge conditions and award any newly earned badges.
 * Returns an array of newly earned badge IDs.
 */
export async function checkAndAwardBadges(
  userId: string,
  quizResults: QuizResult[]
): Promise<string[]> {
  if (!userId || quizResults.length === 0) return [];

  // Fetch already earned badges
  const { data: existingBadges } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", userId);

  const earnedSet = new Set(
    (existingBadges || []).map((b: { badge_id: string }) => b.badge_id)
  );

  const newBadges: string[] = [];

  const totalQuizzes = quizResults.length;
  const globalAvg =
    quizResults.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) /
    totalQuizzes;

  // Helper: count quizzes with 80%+ for a given competence
  const highScoreCount = (compId: number) =>
    quizResults.filter(
      (r) => r.competence_id === compId && (r.score / r.total) * 100 >= 80
    ).length;

  // Helper: check if competence has at least one quiz
  const hasCompetence = (compId: number) =>
    quizResults.some((r) => r.competence_id === compId);

  // Check each badge
  for (const badge of badges) {
    if (earnedSet.has(badge.id)) continue;

    let earned = false;

    switch (badge.id) {
      case "premier_quiz":
        earned = totalQuizzes >= 1;
        break;
      case "score_parfait":
        earned = quizResults.some((r) => r.score === r.total);
        break;
      case "serie_5":
        earned = totalQuizzes >= 5;
        break;
      case "c1_maitre":
        earned = highScoreCount(1) >= 3;
        break;
      case "c2_maitre":
        earned = highScoreCount(2) >= 3;
        break;
      case "c3_maitre":
        earned = highScoreCount(3) >= 3;
        break;
      case "c4_maitre":
        earned = highScoreCount(4) >= 3;
        break;
      case "assidu":
        earned = totalQuizzes >= 10;
        break;
      case "champion":
        earned = totalQuizzes >= 3 && globalAvg >= 90;
        break;
      case "explorateur":
        earned =
          hasCompetence(1) &&
          hasCompetence(2) &&
          hasCompetence(3) &&
          hasCompetence(4);
        break;
    }

    if (earned) {
      newBadges.push(badge.id);
    }
  }

  // Insert new badges
  if (newBadges.length > 0) {
    const rows = newBadges.map((badge_id) => ({
      user_id: userId,
      badge_id,
    }));

    try {
      await supabase.from("user_badges").insert(rows);
    } catch {
      // Silently fail if table doesn't exist yet
    }
  }

  return newBadges;
}
