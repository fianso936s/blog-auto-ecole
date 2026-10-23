import type { Profile, SpotQuiz } from "./index.js";

export function quizFingerprint(quiz: SpotQuiz | null | undefined): string {
  return quiz
    ? JSON.stringify([
        quiz.question,
        quiz.options,
        quiz.answer,
        quiz.explanation || "",
      ])
    : "null";
}
export function publicQuiz(quiz: SpotQuiz | null, reveal: boolean) {
  if (!quiz) return null;
  return reveal ? quiz : { question: quiz.question, options: quiz.options };
}
export function canReadSpot(
  p: Profile,
  spot: {
    author_id: string;
    status: string;
    shared?: boolean;
    archived_at?: unknown;
  },
) {
  return (
    !spot.archived_at &&
    (p.role === "admin" ||
      p.id === spot.author_id ||
      spot.status === "published" ||
      !!spot.shared)
  );
}
export type LearningCounts = {
  views: number;
  photoViews: number;
  attempts: number;
  firstAttempts: number;
  firstCorrect: number;
};
export type LearningStats = {
  period: { from: string; to: string };
  totals: LearningCounts & { students: number };
  spots: (LearningCounts & {
    id: string;
    name: string;
    category: string;
    archived: boolean;
    uniqueViewers: number;
  })[];
  students: (LearningCounts & {
    id: string;
    name: string;
    spotsViewed: number;
    lastActivity: string | null;
  })[];
};
export function csvCell(value: string | number | boolean | null): string {
  let text = String(value ?? "");
  if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}
