CREATE TABLE IF NOT EXISTS course_progress (
  student_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id text NOT NULL CHECK(length(course_id) BETWEEN 1 AND 100),
  is_read boolean NOT NULL DEFAULT false,
  review boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(student_id,course_id)
);
CREATE TABLE IF NOT EXISTS course_attempts (
  id uuid PRIMARY KEY,
  student_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id text NOT NULL,
  revision text NOT NULL,
  answers jsonb NOT NULL,
  score integer NOT NULL CHECK(score>=0),
  total integer NOT NULL CHECK(total>0 AND score<=total),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS course_attempts_student_course ON course_attempts(student_id,course_id,revision,created_at DESC);
CREATE TABLE IF NOT EXISTS course_plans (
  student_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id text NOT NULL,
  teacher_id text REFERENCES users(id) ON DELETE SET NULL,
  active boolean NOT NULL DEFAULT true,
  level text NOT NULL DEFAULT 'working' CHECK(level IN ('working','validated')),
  note text NOT NULL DEFAULT '' CHECK(length(note)<=1000),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(student_id,course_id)
);
REVOKE ALL ON course_progress,course_attempts,course_plans FROM PUBLIC;
GRANT SELECT,INSERT,UPDATE,DELETE ON course_progress,course_attempts,course_plans TO repere_runtime;
