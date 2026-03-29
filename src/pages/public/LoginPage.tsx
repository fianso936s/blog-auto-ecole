import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { BookOpen, Eye, EyeOff, ArrowLeft, CheckCircle, Mail } from "lucide-react";

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

  // Écran mot de passe oublié
  if (showReset) {
    return (
      <div className="min-h-screen bg-[#fcfaf8] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-[#cf5c36] rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-serif font-bold text-gray-900 text-xl">
                Auto-<span className="text-[#cf5c36]">Blog</span>
              </span>
            </Link>
            <h2 className="font-serif text-xl font-bold text-gray-900 mt-4">
              Mot de passe oubli&eacute; ?
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Entrez votre email pour recevoir un lien de r&eacute;initialisation.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {resetError && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                {resetError}
              </div>
            )}
            {resetSent ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Email envoy&eacute; !</h3>
                <p className="text-sm text-gray-500 mb-4">
                  V&eacute;rifiez votre bo&icirc;te mail <strong>{resetEmail}</strong> pour
                  r&eacute;initialiser votre mot de passe.
                </p>
                <button
                  onClick={() => { setShowReset(false); setResetSent(false); setResetEmail(""); }}
                  className="text-sm text-[#cf5c36] font-medium hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Retour &agrave; la connexion
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="resetEmail"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#cf5c36] focus:ring-1 focus:ring-[#cf5c36] transition-colors"
                      placeholder="votre@email.fr"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-[#cf5c36] text-white font-semibold py-3 rounded-xl hover:bg-[#b8502f] transition-colors disabled:opacity-50"
                >
                  {resetLoading ? "Envoi en cours..." : "Envoyer le lien"}
                </button>
              </form>
            )}
          </div>

          {!resetSent && (
            <p className="text-center text-sm text-gray-500 mt-6">
              <button
                onClick={() => setShowReset(false)}
                className="text-[#cf5c36] hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Retour &agrave; la connexion
              </button>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaf8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-[#cf5c36] rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif font-bold text-gray-900 text-xl">
              Auto-<span className="text-[#cf5c36]">Blog</span>
            </span>
          </Link>
          <p className="text-gray-500 text-sm mt-3">
            Connectez-vous &agrave; votre espace
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#cf5c36] focus:ring-1 focus:ring-[#cf5c36] transition-colors"
                placeholder="admin@auto-ecole.fr"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#cf5c36] focus:ring-1 focus:ring-[#cf5c36] transition-colors pr-12"
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Se souvenir de moi + Mot de passe oublié */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#cf5c36] focus:ring-[#cf5c36] cursor-pointer"
                />
                <span className="text-sm text-gray-600">Se souvenir de moi</span>
              </label>
              <button
                type="button"
                onClick={() => { setShowReset(true); setResetEmail(email); }}
                className="text-sm text-[#cf5c36] hover:underline font-medium"
              >
                Mot de passe oubli&eacute; ?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#cf5c36] text-white font-semibold py-3 rounded-xl hover:bg-[#b8502f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?{" "}
          <Link to="/inscription" className="text-[#cf5c36] font-medium hover:underline">
            S'inscrire
          </Link>
        </p>

        <p className="text-center text-sm text-gray-500 mt-2">
          <Link to="/" className="text-[#cf5c36] hover:underline">
            &larr; Retour au blog
          </Link>
        </p>
      </div>
    </div>
  );
}
