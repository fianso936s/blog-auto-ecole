CREATE OR REPLACE FUNCTION repere_content_changed() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM pg_notify('repere_content','changed');
  RETURN NULL;
END;
$$;
DO $$
DECLARE relation_name text;
BEGIN
  FOREACH relation_name IN ARRAY ARRAY['routes','map_spots','pedagogical_points','assignments','video_sessions','video_grants','teacher_students','hidden_content','blocked_authors'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='repere_content_notify' AND tgrelid=to_regclass(relation_name)) THEN
      EXECUTE format('CREATE TRIGGER repere_content_notify AFTER INSERT OR UPDATE OR DELETE ON %I FOR EACH STATEMENT EXECUTE FUNCTION repere_content_changed()', relation_name);
    END IF;
  END LOOP;
END;
$$;
