import { Pool } from "pg";
import { readFile } from "node:fs/promises";
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url || new URL(url).hostname.includes("-pooler"))
  throw new Error("Une connexion PostgreSQL directe est requise.");
const db = new Pool({ connectionString: url, max: 1 });
try {
  await db.query(
    "CREATE TABLE IF NOT EXISTS mobile_schema_migrations(name text PRIMARY KEY,applied_at timestamptz NOT NULL DEFAULT now())",
  );
  for (const name of [
    "db/001-base.sql",
    "db/002-map-spots.sql",
    "db/migrations/003-native.sql",
    "db/migrations/004-idempotent-sync.sql",
    "db/migrations/005-gpx-time.sql",
    "db/migrations/006-delete-auth-identity.sql",
    "db/migrations/007-spot-photos-sharing.sql",
    "db/migrations/008-learning-catalog.sql",
    "db/migrations/009-private-videos.sql",
    "db/migrations/010-live-private-segments.sql",
    "db/migrations/011-webrtc-livekit.sql",
    // 012–017 were applied outside this runner; only later files are listed.
    "db/migrations/018-slot-bookings.sql",
  ]) {
    if (
      (
        await db.query("SELECT 1 FROM mobile_schema_migrations WHERE name=$1", [
          name,
        ])
      ).rowCount
    )
      continue;
    await db.query("BEGIN");
    try {
      await db.query(await readFile(name, "utf8"));
      await db.query("INSERT INTO mobile_schema_migrations(name) VALUES($1)", [
        name,
      ]);
      await db.query("COMMIT");
      console.log(`Appliqué : ${name}`);
    } catch (e) {
      await db.query("ROLLBACK");
      throw e;
    }
  }
} finally {
  await db.end();
}
