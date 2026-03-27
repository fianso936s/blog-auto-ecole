import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { BookOpen, Eye, EyeOff, User, Mail, Phone, Lock, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const isPasswordValid = passwordChecks.length && passwordChecks.uppercase && passwordChecks.number;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Veuillez entrer votre nom complet.");
      return;
    }

    if (!isPasswordValid) {
      setError("Le mot de passe ne respecte pas les critères requis.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    const result = await register({
      email,
      password,
      fullName: fullName.trim(),
      phone: phone.trim(),
    });

    if (result.success) {
      setSuccess(true);
      // Redirection après 2 secondes
      setTimeout(() => navigate("/"), 2000);
    } else {
      setError(result.error || "Une erreur est survenue lors de l'inscription.");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#fcfaf8] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">
            Inscription r&eacute;ussie !
          </h2>
          <p className="text-gray-600 mb-2">
            Bienvenue sur Auto-Blog, {fullName} !
          </p>
          <p className="text-gray-500 text-sm">
            Redirection en cours...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaf8] flex items-center justify-center px-4 py-8">
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
          <h1 className="font-serif text-2xl font-bold text-gray-900 mt-4 mb-1">
            Cr&eacute;er un compte
          </h1>
          <p className="text-gray-500 text-sm">
            Inscrivez-vous pour suivre votre progression
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Nom complet */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
                Nom complet
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#cf5c36] focus:ring-1 focus:ring-[#cf5c36] transition-colors"
                  placeholder="Jean Dupont"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#cf5c36] focus:ring-1 focus:ring-[#cf5c36] transition-colors"
                  placeholder="jean@exemple.fr"
                />
              </div>
            </div>

            {/* Téléphone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                T&eacute;l&eacute;phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#cf5c36] focus:ring-1 focus:ring-[#cf5c36] transition-colors"
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#cf5c36] focus:ring-1 focus:ring-[#cf5c36] transition-colors"
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

              {/* Password strength indicators */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${passwordChecks.length ? "bg-green-500" : "bg-gray-200"}`} />
                    <span className={`text-xs ${passwordChecks.length ? "text-green-600" : "text-gray-400"}`}>
                      Au moins 8 caract&egrave;res
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${passwordChecks.uppercase ? "bg-green-500" : "bg-gray-200"}`} />
                    <span className={`text-xs ${passwordChecks.uppercase ? "text-green-600" : "text-gray-400"}`}>
                      Une majuscule
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${passwordChecks.number ? "bg-green-500" : "bg-gray-200"}`} />
                    <span className={`text-xs ${passwordChecks.number ? "text-green-600" : "text-gray-400"}`}>
                      Un chiffre
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirmer mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-1 transition-colors ${
                    confirmPassword && confirmPassword !== password
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-200 focus:border-[#cf5c36] focus:ring-[#cf5c36]"
                  }`}
                  placeholder="Confirmez votre mot de passe"
                />
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid || password !== confirmPassword}
              className="w-full bg-[#cf5c36] text-white font-semibold py-3 rounded-xl hover:bg-[#b8502f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Inscription en cours..." : "S'inscrire"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          D&eacute;j&agrave; un compte ?{" "}
          <Link to="/login" className="text-[#cf5c36] font-medium hover:underline">
            Se connecter
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
