CREATE TABLE IF NOT EXISTS teacher_slots (
 id uuid PRIMARY KEY,
 teacher_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 starts_at timestamptz NOT NULL,
 ends_at timestamptz NOT NULL,
 is_open boolean NOT NULL DEFAULT false,
 version integer NOT NULL DEFAULT 1 CHECK(version>0),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(teacher_id,starts_at),
 CHECK(ends_at>starts_at AND ends_at-starts_at BETWEEN interval '15 minutes' AND interval '120 minutes')
);
CREATE INDEX IF NOT EXISTS teacher_slots_range ON teacher_slots(teacher_id,starts_at);
REVOKE ALL ON TABLE teacher_slots FROM PUBLIC;
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE teacher_slots TO repere_runtime;
DO $$ BEGIN
 IF to_regprocedure('repere_content_changed()') IS NOT NULL AND NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgname='teacher_slots_notify' AND tgrelid='teacher_slots'::regclass) THEN
  CREATE TRIGGER teacher_slots_notify AFTER INSERT OR UPDATE OR DELETE ON teacher_slots FOR EACH STATEMENT EXECUTE FUNCTION repere_content_changed();
 END IF;
END $$;
CREATE TABLE IF NOT EXISTS meta_device_status (
 user_id text PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 module_present boolean NOT NULL,
 available boolean NOT NULL,
 connected boolean NOT NULL,
 registered boolean NOT NULL,
 frames_recent boolean NOT NULL,
 source text NOT NULL,
 app_version text NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON TABLE meta_device_status FROM PUBLIC;
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE meta_device_status TO repere_runtime;
