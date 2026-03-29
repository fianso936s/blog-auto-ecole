import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { BookOpen, Eye, EyeOff, CheckCircle, AlertCircle, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("Erreur lors de la mise à jour du mot de passe. Veuillez réessayer.");
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 3000);
    }
    setLoading(false);
  };

  const Logo = () => (
    <Link to="/" className="inline-flex items-center gap-2.5">
      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
        <BookOpen className="w-5 h-5 text-white" />
      </div>
      <span className="font-serif font-bold text-text text-xl">
        Auto-<span className="text-primary">Blog</span>
      </span>
    </Link>
  );

  // Écran de succès
  if (success) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="w-full max-w-md animate-scale-in">
          <div className="text-center mb-8">
            <Logo />
          </div>
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-serif font-bold text-text text-xl mb-2">
              Mot de passe modifi&eacute; !
            </h3>
            <p className="text-sm text-text-muted mb-6 leading-relaxed">
              Votre mot de passe a &eacute;t&eacute; mis &agrave; jour avec succ&egrave;s.
              Vous allez &ecirc;tre redirig&eacute; vers la page de connexion.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
            >
              Se connecter maintenant
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Écran lien invalide
  if (!ready) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="w-full max-w-md animate-fade-up">
          <div className="text-center mb-8">
            <Logo />
          </div>
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-8 text-center">
            <div className="w-16 h-16 bg-amber-light rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-8 h-8 text-amber" />
            </div>
            <h3 className="font-serif font-bold text-text text-xl mb-2">
              Lien invalide ou expir&eacute;
            </h3>
            <p className="text-sm text-text-muted mb-6 leading-relaxed">
              Ce lien de r&eacute;initialisation n'est plus valide.
              Veuillez en demander un nouveau.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-secondary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Retour &agrave; la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Formulaire de nouveau mot de passe
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <Logo />
          <div className="mt-6">
            <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-text">
              Nouveau mot de passe
            </h2>
            <p className="text-text-muted text-sm mt-2">
              Choisissez votre nouveau mot de passe.
            </p>
          </div>
        </div>

        <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 animate-fade-in">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3.5 rounded-xl border border-border bg-bg text-sm text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all pr-12"
                  placeholder="Minimum 6 caractères"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text mb-2">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className={`w-full px-4 py-3.5 rounded-xl border text-sm text-text bg-bg focus:outline-none focus:ring-2 transition-all ${
                  confirmPassword && confirmPassword !== password
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                    : "border-border focus:border-primary focus:ring-primary/20"
                }`}
                placeholder="Confirmez votre mot de passe"
              />
              {confirmPassword && confirmPassword !== password && (
                <p className="text-xs text-red-500 mt-1.5">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-text-muted mt-6">
          <Link to="/login" className="text-primary hover:underline font-medium">
            &larr; Retour &agrave; la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
