import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { BookOpen, Eye, EyeOff, ArrowLeft, CheckCircle, Mail } from "lucide-react";
import PageMeta from "../../components/PageMeta";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirection si déjà connecté ou après login, basée sur le rôle
  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin" : "/eleve", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const success = await login(email, password);
    if (!success) {
      setError("Email ou mot de passe incorrect.");
    }
    setLoading(false);
  };

  const [resetError, setResetError] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError("");
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setResetError("Une erreur est survenue. Veuillez réessayer.");
    } else {
      setResetSent(true);
    }
    setResetLoading(false);
  };

  // Decorative left panel component
  const DecorativePanel = () => (
    <div className="hidden lg:flex lg:w-1/2 bg-secondary relative overflow-hidden grain flex-col justify-between p-12">
      {/* Geometric shapes */}
      <div className="absolute top-12 right-12 w-32 h-32 border-2 border-white/10 rounded-full" />
      <div className="absolute top-24 right-24 w-16 h-16 bg-primary/20 rounded-full" />
      <div className="absolute bottom-32 left-12 w-24 h-24 border-2 border-white/10 rotate-45" />
      <div className="absolute bottom-16 right-16 w-40 h-40 border border-amber/20 rounded-full" />
      <div className="absolute top-1/2 left-1/3 w-8 h-8 bg-amber/15 rounded-full" />

      {/* Logo */}
      <div>
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif font-bold text-white text-xl">
            Auto-<span className="text-primary">Blog</span>
          </span>
        </Link>
      </div>

      {/* Motivational text */}
      <div className="relative z-10">
        <h2 className="font-serif text-4xl font-bold text-white leading-tight mb-4">
          Votre permis,<br />
          <span className="text-primary">votre libert&eacute;.</span>
        </h2>
        <p className="text-white/60 text-lg leading-relaxed max-w-sm">
          Acc&eacute;dez &agrave; vos cours, suivez votre progression et pr&eacute;parez
          votre examen en toute confiance.
        </p>
      </div>

      {/* Bottom decoration */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-1 bg-primary rounded-full" />
        <div className="w-6 h-1 bg-amber rounded-full" />
        <div className="w-3 h-1 bg-white/30 rounded-full" />
      </div>
    </div>
  );

  // Écran mot de passe oublié
  if (showReset) {
    return (
      <div className="min-h-screen bg-bg flex">
        <DecorativePanel />

        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md animate-fade-up">
            {/* Mobile header */}
            <div className="lg:hidden text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="font-serif font-bold text-text text-xl">
                  Auto-<span className="text-primary">Blog</span>
                </span>
              </Link>
            </div>

            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl font-bold text-text">
                Mot de passe oubli&eacute; ?
              </h2>
              <p className="text-text-muted text-sm mt-2">
                Entrez votre email pour recevoir un lien de r&eacute;initialisation.
              </p>
            </div>

            <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
              {resetError && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                  {resetError}
                </div>
              )}
              {resetSent ? (
                <div className="text-center py-4 animate-fade-in">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="font-serif font-semibold text-text mb-2">Email envoy&eacute; !</h3>
                  <p className="text-sm text-text-muted mb-4">
                    V&eacute;rifiez votre bo&icirc;te mail <strong>{resetEmail}</strong> pour
                    r&eacute;initialiser votre mot de passe.
                  </p>
                  <button
                    onClick={() => { setShowReset(false); setResetSent(false); setResetEmail(""); }}
                    className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" /> Retour &agrave; la connexion
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div>
                    <label htmlFor="resetEmail" className="block text-sm font-medium text-text mb-2">
                      Adresse email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        id="resetEmail"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-border bg-bg text-sm text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="votre@email.fr"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {resetLoading ? "Envoi en cours..." : "Envoyer le lien"}
                  </button>
                </form>
              )}
            </div>

            {!resetSent && (
              <p className="text-center text-sm text-text-muted mt-6">
                <button
                  onClick={() => setShowReset(false)}
                  className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" /> Retour &agrave; la connexion
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex">
      <PageMeta title="Connexion" />
      <DecorativePanel />

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile decorative header */}
          <div className="lg:hidden mb-8">
            <div className="bg-secondary rounded-2xl p-6 relative overflow-hidden grain mb-8">
              <div className="absolute top-4 right-4 w-16 h-16 border border-white/10 rounded-full" />
              <div className="absolute bottom-2 right-8 w-8 h-8 bg-primary/20 rounded-full" />
              <Link to="/" className="inline-flex items-center gap-2 relative z-10">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="font-serif font-bold text-white text-xl">
                  Auto-<span className="text-primary">Blog</span>
                </span>
              </Link>
              <p className="text-white/60 text-sm mt-3 relative z-10">
                Connectez-vous &agrave; votre espace
              </p>
            </div>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-8">
            <h1 className="font-serif text-3xl font-bold text-text mb-2">
              Bon retour parmi nous
            </h1>
            <p className="text-text-muted">
              Connectez-vous &agrave; votre espace
            </p>
          </div>

          {/* Form */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl animate-fade-in">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text mb-2">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3.5 rounded-xl border border-border bg-bg text-sm text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="admin@auto-ecole.fr"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full px-4 py-3.5 rounded-xl border border-border bg-bg text-sm text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all pr-12"
                    placeholder="Votre mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Se souvenir de moi + Mot de passe oublié */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="text-sm text-text-muted">Se souvenir de moi</span>
                </label>
                <button
                  type="button"
                  onClick={() => { setShowReset(true); setResetEmail(email); }}
                  className="text-sm text-primary hover:text-primary-dark hover:underline font-medium transition-colors"
                >
                  Mot de passe oubli&eacute; ?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-text-muted mt-6">
            Pas encore de compte ?{" "}
            <Link to="/inscription" className="text-primary font-medium hover:underline">
              S'inscrire
            </Link>
          </p>

          <p className="text-center text-sm text-text-muted mt-2">
            <Link to="/" className="text-primary hover:underline">
              &larr; Retour au blog
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
