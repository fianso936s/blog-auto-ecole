-- Narrow server capability: only the identity attached to a live, hashed native session.
-- No database password, raw session token, or arbitrary subject is accepted by this function.
CREATE OR REPLACE FUNCTION public.delete_own_neon_identity(p_hash text) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog AS $$
 DELETE FROM neon_auth."user" u USING public.mobile_identities m, public.mobile_sessions s
 WHERE m.auth_subject=u.id::text AND m.user_id=s.user_id
 AND s.token_hash=p_hash AND s.expires_at>now();
$$;
REVOKE ALL ON FUNCTION public.delete_own_neon_identity(text) FROM PUBLIC;
-- Grant execution only after choosing the runtime role; see db/grants.sql.
