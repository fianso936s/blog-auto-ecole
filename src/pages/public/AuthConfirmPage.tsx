import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

/**
 * Handles Supabase email confirmation redirects.
 * Supabase PKCE email templates send users to: /auth/confirm?token_hash=xxx&type=recovery&next=/reset-password
 * This page exchanges the token and redirects to the appropriate page.
 */
export default function AuthConfirmPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get("token_hash");
    const type = params.get("type");
    const next = params.get("next") || "/";

    if (tokenHash && type) {
      supabase.auth
        .verifyOtp({ token_hash: tokenHash, type: type as "recovery" | "signup" | "email" })
        .then(({ error }) => {
          if (error) {
            console.error("Auth confirmation failed:", error.message);
            navigate("/login", { replace: true });
          } else {
            // For recovery, redirect to reset-password page
            if (type === "recovery") {
              navigate("/reset-password", { replace: true, state: { fromConfirm: true } });
            } else {
              navigate(next, { replace: true });
            }
          }
        });
    } else {
      // No token, redirect home
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center animate-fade-up">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-muted text-sm">Vérification en cours...</p>
      </div>
    </div>
  );
}
