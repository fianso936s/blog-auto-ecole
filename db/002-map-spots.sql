-- Additive migration: preserve existing routes, accounts and quiz attempts.
ALTER TABLE pedagogical_points ADD COLUMN IF NOT EXISTS latitude double precision CHECK(latitude BETWEEN -90 AND 90);
ALTER TABLE pedagogical_points ADD COLUMN IF NOT EXISTS longitude double precision CHECK(longitude BETWEEN -180 AND 180);
CREATE TABLE IF NOT EXISTS map_spots(
 id uuid PRIMARY KEY,
 author_id text NOT NULL REFERENCES users(id),
 name text NOT NULL,
 category text NOT NULL,
 lat double precision NOT NULL CHECK(lat BETWEEN -90 AND 90),
 lng double precision NOT NULL CHECK(lng BETWEEN -180 AND 180),
 note text NOT NULL DEFAULT '',
 photo text,
 status text NOT NULL DEFAULT 'private' CHECK(status IN ('private','published')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS map_spots_author ON map_spots(author_id);
-- Runtime privileges are applied separately using db/grants.sql.
