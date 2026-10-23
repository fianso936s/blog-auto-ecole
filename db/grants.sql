-- Execute as the database owner. Replace repere_runtime only if your runtime role differs.
-- This role must not have neon_superuser, CREATEDB or CREATEROLE.
GRANT USAGE ON SCHEMA public TO repere_runtime;
GRANT SELECT,INSERT,UPDATE,DELETE ON users,routes,gps_coordinates,pedagogical_points,photographs,assignments,favorites,quiz_attempts,progress,map_spots TO repere_runtime;
GRANT SELECT,DELETE ON app_settings TO repere_runtime;
GRANT SELECT,INSERT,UPDATE,DELETE ON mobile_identities,mobile_auth_requests,mobile_auth_codes,mobile_sessions,teacher_students,student_invitations,mobile_rate_limits,deleted_auth_subjects TO repere_runtime;
GRANT USAGE ON SCHEMA neon_auth TO repere_runtime;
GRANT SELECT(id,email,name,"emailVerified") ON neon_auth."user" TO repere_runtime;

GRANT EXECUTE ON FUNCTION public.delete_own_neon_identity(text) TO repere_runtime;

GRANT SELECT,INSERT,UPDATE,DELETE ON spot_media,spot_quiz_versions,spot_activity,spot_quiz_attempts TO repere_runtime;

-- Metadata for private recordings and live audiences (migrations 009-011).
-- The API still enforces ownership and explicit teacher/student grants.
GRANT SELECT,INSERT,UPDATE,DELETE ON video_sessions,video_grants,video_segments TO repere_runtime;
