-- Additive migration. Apply on an isolated Neon branch before main.
ALTER TABLE routes ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;
ALTER TABLE routes ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE pedagogical_points ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE pedagogical_points ADD COLUMN IF NOT EXISTS longitude double precision;
CREATE TABLE IF NOT EXISTS mobile_identities(auth_subject text PRIMARY KEY,user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE);
CREATE TABLE IF NOT EXISTS mobile_auth_requests(id uuid PRIMARY KEY,challenge text NOT NULL,expires_at timestamptz NOT NULL DEFAULT now()+interval '10 minutes');
CREATE TABLE IF NOT EXISTS mobile_auth_codes(code_hash text PRIMARY KEY,challenge text NOT NULL,user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,expires_at timestamptz NOT NULL DEFAULT now()+interval '60 seconds');
CREATE TABLE IF NOT EXISTS mobile_sessions(token_hash text PRIMARY KEY,user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,created_at timestamptz NOT NULL DEFAULT now(),expires_at timestamptz NOT NULL DEFAULT now()+interval '30 days');
CREATE INDEX IF NOT EXISTS mobile_sessions_user ON mobile_sessions(user_id);
CREATE TABLE IF NOT EXISTS teacher_students(teacher_id text REFERENCES users(id) ON DELETE CASCADE,student_id text REFERENCES users(id) ON DELETE CASCADE,PRIMARY KEY(teacher_id,student_id));
CREATE TABLE IF NOT EXISTS student_invitations(code_hash text PRIMARY KEY,teacher_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,expires_at timestamptz NOT NULL DEFAULT now()+interval '7 days',claimed_by text REFERENCES users(id));
CREATE TABLE IF NOT EXISTS mobile_rate_limits(user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,bucket timestamptz NOT NULL,count integer NOT NULL DEFAULT 1,PRIMARY KEY(user_id,bucket));
CREATE TABLE IF NOT EXISTS deleted_auth_subjects(subject text PRIMARY KEY,deleted_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS question_snapshot text;
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS options_snapshot jsonb;
CREATE INDEX IF NOT EXISTS assignments_student ON assignments(student_id);
CREATE INDEX IF NOT EXISTS pedagogical_points_route ON pedagogical_points(route_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_student ON quiz_attempts(student_id,created_at DESC);
-- Runtime grants are listed explicitly; use db/grants.sql after choosing the runtime role.
