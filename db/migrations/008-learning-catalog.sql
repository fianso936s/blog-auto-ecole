-- Additive catalog and learning facts. Existing private points remain private.
ALTER TABLE map_spots ADD COLUMN IF NOT EXISTS quiz jsonb;
ALTER TABLE map_spots ADD COLUMN IF NOT EXISTS quiz_version integer NOT NULL DEFAULT 0 CHECK(quiz_version>=0);
ALTER TABLE map_spots ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE map_spots ADD COLUMN IF NOT EXISTS archived_at timestamptz;
ALTER TABLE map_spots ADD COLUMN IF NOT EXISTS source_route_id uuid;
ALTER TABLE pedagogical_points ADD COLUMN IF NOT EXISTS share_with_students boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS map_spots_catalog ON map_spots(status,created_at DESC) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS map_spots_source_route ON map_spots(source_route_id);
CREATE TABLE IF NOT EXISTS spot_media (
 spot_id uuid NOT NULL REFERENCES map_spots(id) ON DELETE CASCADE,
 id uuid NOT NULL,
 position integer NOT NULL CHECK(position>=0),
 mime_type text NOT NULL,
 width integer, height integer, caption text NOT NULL DEFAULT '',
 created_at timestamptz NOT NULL DEFAULT now(), archived_at timestamptz,
 PRIMARY KEY(spot_id,id)
);
INSERT INTO spot_media(spot_id,id,position,mime_type)
 SELECT s.id,(p.photo->>'id')::uuid,(p.ordinality-1)::integer,
 split_part(split_part(p.photo->>'dataUrl',';',1),':',2)
 FROM map_spots s CROSS JOIN LATERAL jsonb_array_elements(s.photos) WITH ORDINALITY p(photo,ordinality)
 ON CONFLICT(spot_id,id) DO NOTHING;
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS correct_answer_snapshot integer;
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS explanation_snapshot text;
CREATE TABLE IF NOT EXISTS spot_quiz_versions (
 spot_id uuid NOT NULL REFERENCES map_spots(id) ON DELETE CASCADE,
 version integer NOT NULL CHECK(version>0),
 question text NOT NULL, options jsonb NOT NULL CHECK(jsonb_typeof(options)='array'),
 answer integer NOT NULL CHECK(answer>=0), explanation text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(spot_id,version), CHECK(answer<jsonb_array_length(options))
);
CREATE TABLE IF NOT EXISTS spot_activity (
 id uuid PRIMARY KEY,
 spot_id uuid NOT NULL REFERENCES map_spots(id) ON DELETE CASCADE,
 student_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 kind text NOT NULL CHECK(kind IN ('opened','photo_viewed')),
 photo_id uuid,
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(spot_id,photo_id) REFERENCES spot_media(spot_id,id),
 CHECK((kind='opened' AND photo_id IS NULL) OR (kind='photo_viewed' AND photo_id IS NOT NULL))
);
CREATE TABLE IF NOT EXISTS spot_quiz_attempts (
 id uuid PRIMARY KEY,
 spot_id uuid NOT NULL,
 quiz_version integer NOT NULL,
 student_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 answer_index integer NOT NULL CHECK(answer_index>=0 AND answer_index<6),
 correct boolean NOT NULL,
 name_snapshot text NOT NULL, category_snapshot text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(spot_id,quiz_version) REFERENCES spot_quiz_versions(spot_id,version) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS spot_activity_catalog_time ON spot_activity(spot_id,created_at DESC);
CREATE INDEX IF NOT EXISTS spot_activity_student_time ON spot_activity(student_id,created_at DESC);
CREATE INDEX IF NOT EXISTS spot_attempts_catalog_student ON spot_quiz_attempts(spot_id,student_id,quiz_version,created_at,id);
CREATE INDEX IF NOT EXISTS spot_attempts_student_time ON spot_quiz_attempts(student_id,created_at DESC);
GRANT SELECT,INSERT,UPDATE,DELETE ON spot_media,spot_quiz_versions,spot_activity,spot_quiz_attempts TO repere_runtime;
