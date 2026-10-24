-- Repères proposed by students, reviewed by their teacher (or the director) before publication.
CREATE TABLE IF NOT EXISTS spot_proposals (
 id uuid PRIMARY KEY,
 student_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 name text NOT NULL CHECK(char_length(name) BETWEEN 1 AND 120),
 category text NOT NULL,
 lat double precision NOT NULL CHECK(lat BETWEEN -90 AND 90),
 lng double precision NOT NULL CHECK(lng BETWEEN -180 AND 180),
 remark text NOT NULL DEFAULT '' CHECK(char_length(remark) <= 1000),
 route_id uuid REFERENCES routes(id) ON DELETE SET NULL,
 exam_center text CHECK(exam_center IS NULL OR char_length(exam_center) <= 80),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','rejected')),
 created_at timestamptz NOT NULL DEFAULT now(),
 reviewed_by text REFERENCES users(id) ON DELETE SET NULL,
 reviewed_at timestamptz,
 spot_id uuid
);
CREATE INDEX IF NOT EXISTS spot_proposals_pending ON spot_proposals(status,created_at);
CREATE INDEX IF NOT EXISTS spot_proposals_student ON spot_proposals(student_id,created_at);
REVOKE ALL ON TABLE spot_proposals FROM PUBLIC;
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE spot_proposals TO repere_runtime;
DO $$ BEGIN
 IF to_regprocedure('repere_content_changed()') IS NOT NULL AND NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgname='spot_proposals_notify' AND tgrelid='spot_proposals'::regclass) THEN
  CREATE TRIGGER spot_proposals_notify AFTER INSERT OR UPDATE OR DELETE ON spot_proposals FOR EACH STATEMENT EXECUTE FUNCTION repere_content_changed();
 END IF;
END $$;
