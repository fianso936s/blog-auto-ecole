import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { BookOpen, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

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
    // Écouter l'événement PASSWORD_RECOVERY de Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Vérifier s'il y a déjà une session active (l'utilisateur vient de cliquer le lien)
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
      // Rediriger vers login après 3 secondes
      setTimeout(() => navigate("/login", { replace: true }), 3000);
    }
    setLoading(false);
  };

  // Écran de succès
  if (success) {
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
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Mot de passe modifi&eacute; !
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Votre mot de passe a &eacute;t&eacute; mis &agrave; jour avec succ&egrave;s.
              Vous allez &ecirc;tre redirig&eacute; vers la page de connexion.
            </p>
            <Link
              to="/login"
              className="text-sm text-[#cf5c36] font-medium hover:underline"
            >
              Se connecter maintenant
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Écran d'attente si le token n'est pas encore détecté
  if (!ready) {
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
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Lien invalide ou expir&eacute;
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Ce lien de r&eacute;initialisation n'est plus valide.
              Veuillez en demander un nouveau.
            </p>
            <Link
              to="/login"
              className="text-sm text-[#cf5c36] font-medium hover:underline"
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
            Nouveau mot de passe
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Choisissez votre nouveau mot de passe.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#cf5c36] focus:ring-1 focus:ring-[#cf5c36] transition-colors pr-12"
                  placeholder="Minimum 6 caract&egrave;res"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#cf5c36] focus:ring-1 focus:ring-[#cf5c36] transition-colors"
                placeholder="Confirmez votre mot de passe"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#cf5c36] text-white font-semibold py-3 rounded-xl hover:bg-[#b8502f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Mise &agrave; jour..." : "Mettre &agrave; jour le mot de passe"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
