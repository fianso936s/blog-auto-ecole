-- No video blobs in PostgreSQL. All videos remain PRIVATE until individually granted.
-- Safe additive migration: never changes route or user visibility.
CREATE TABLE IF NOT EXISTS video_sessions (
  id uuid PRIMARY KEY,
  author_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  route_id uuid REFERENCES routes(id) ON DELETE SET NULL,
  title varchar(120) NOT NULL,
  mime_type varchar(32) NOT NULL DEFAULT 'video/mp4'
    CHECK (mime_type IN ('video/mp4', 'video/quicktime')),
  storage_key text UNIQUE,
  state text NOT NULL DEFAULT 'local'
    CHECK (state IN ('local', 'uploading', 'ready')),
  visibility text NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private', 'students')),
  bytes bigint NOT NULL DEFAULT 0 CHECK (bytes >= 0),
  duration_ms bigint CHECK (duration_ms IS NULL OR duration_ms BETWEEN 0 AND 86400000),
  capture_started_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (visibility <> 'students' OR state = 'ready')
);
CREATE INDEX IF NOT EXISTS video_sessions_author_idx ON video_sessions(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS video_sessions_route_idx ON video_sessions(route_id);
CREATE TABLE IF NOT EXISTS video_grants (
  video_id uuid NOT NULL REFERENCES video_sessions(id) ON DELETE CASCADE,
  student_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  granted_by text NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(video_id, student_id)
);
CREATE INDEX IF NOT EXISTS video_grants_student_idx ON video_grants(student_id);
-- No grants to everyone, no public visibility mode, no inherited route publication.
