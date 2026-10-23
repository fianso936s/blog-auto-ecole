import { db } from "../services/local";
export type Reading = Record<string, { read: boolean; review: boolean }>;
async function store() {
  const d = await db();
  await d.execAsync(
    "CREATE TABLE IF NOT EXISTS pedagogy_reading(user_id TEXT NOT NULL,course_id TEXT NOT NULL,has_read INTEGER NOT NULL DEFAULT 0,review INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(user_id,course_id));",
  );
  return d;
}
export async function loadReading(userId: string): Promise<Reading> {
  const rows = await (
    await store()
  ).getAllAsync<{ course_id: string; has_read: number; review: number }>(
    "SELECT course_id,has_read,review FROM pedagogy_reading WHERE user_id=?",
    userId,
  );
  return Object.fromEntries(
    rows.map((r) => [r.course_id, { read: !!r.has_read, review: !!r.review }]),
  );
}
export async function saveReading(
  userId: string,
  courseId: string,
  value: { read: boolean; review: boolean },
) {
  await (
    await store()
  ).runAsync(
    "INSERT INTO pedagogy_reading(user_id,course_id,has_read,review) VALUES(?,?,?,?) ON CONFLICT(user_id,course_id) DO UPDATE SET has_read=excluded.has_read,review=excluded.review",
    userId,
    courseId,
    Number(value.read),
    Number(value.review),
  );
}
