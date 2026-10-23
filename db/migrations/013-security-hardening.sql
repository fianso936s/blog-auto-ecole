-- Harden the production runtime role. Defaults apply to new connections.
-- Separately retire unused repere_app through the Neon control plane only after verifying dependencies.
-- That legacy role retirement was completed on all four project branches on 2026-10-22.
ALTER ROLE repere_runtime SET statement_timeout='20s';
ALTER ROLE repere_runtime SET lock_timeout='5s';
ALTER ROLE repere_runtime SET idle_in_transaction_session_timeout='30s';
ALTER ROLE repere_runtime SET search_path=pg_catalog,public,pg_temp;
ALTER DEFAULT PRIVILEGES FOR ROLE repere_owner IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_own_neon_identity(text) FROM PUBLIC;
