import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { BookOpen, Eye, EyeOff, User, Mail, Phone, Lock, CheckCircle, MapPin } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [consentRgpd, setConsentRgpd] = useState(false);
  const [consentLocalisation, setConsentLocalisation] = useState(false);
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

    if (!consentRgpd) {
      setError("Vous devez accepter la politique de confidentialité pour vous inscrire.");
      return;
    }

    setLoading(true);

    const result = await register({
      email,
      password,
      fullName: fullName.trim(),
      phone: phone.trim(),
      postalCode: postalCode.trim(),
      consentLocalisation,
    });

    if (result.success) {
      setSuccess(true);
      // Redirection après 2 secondes vers le dashboard élève
      setTimeout(() => navigate("/eleve"), 2000);
    } else {
      setError(result.error || "Une erreur est survenue lors de l'inscription.");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center animate-scale-in">
          <div className="bg-surface rounded-2xl border border-border p-10 shadow-sm">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-text mb-2">
              Inscription r&eacute;ussie !
            </h2>
            <p className="text-text mb-2">
              Bienvenue sur Auto-Blog, {fullName} !
            </p>
            <p className="text-text-muted text-sm">
              Redirection en cours...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Password strength bar
  const strengthCount = [passwordChecks.length, passwordChecks.uppercase, passwordChecks.number].filter(Boolean).length;
  const strengthColor = strengthCount === 0 ? "bg-border" : strengthCount === 1 ? "bg-primary" : strengthCount === 2 ? "bg-amber" : "bg-green-500";
  const strengthLabel = strengthCount === 0 ? "" : strengthCount === 1 ? "Faible" : strengthCount === 2 ? "Moyen" : "Fort";

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Decorative left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary relative overflow-hidden grain flex-col justify-between p-12">
        {/* Geometric shapes */}
        <div className="absolute top-12 right-12 w-32 h-32 border-2 border-white/10 rounded-full" />
        <div className="absolute top-24 right-24 w-16 h-16 bg-primary/20 rounded-full" />
        <div className="absolute bottom-32 left-12 w-24 h-24 border-2 border-white/10 rotate-45" />
        <div className="absolute bottom-16 right-16 w-40 h-40 border border-amber/20 rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-10 h-10 bg-amber/15 rounded-full" />

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
            Rejoignez la<br />
            <span className="text-primary">communaut&eacute;.</span>
          </h2>
          <p className="text-white/60 text-lg leading-relaxed max-w-sm">
            Cr&eacute;ez votre compte pour acc&eacute;der &agrave; tous les outils de
            pr&eacute;paration au code et au permis de conduire.
          </p>
        </div>

        {/* Bottom decoration */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-1 bg-primary rounded-full" />
          <div className="w-6 h-1 bg-amber rounded-full" />
          <div className="w-3 h-1 bg-white/30 rounded-full" />
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-8 overflow-y-auto">
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile decorative header */}
          <div className="lg:hidden mb-6">
            <div className="bg-secondary rounded-2xl p-6 relative overflow-hidden grain">
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
                Cr&eacute;ez votre compte
              </p>
            </div>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-8">
            <h1 className="font-serif text-3xl font-bold text-text mb-2">
              Cr&eacute;er un compte
            </h1>
            <p className="text-text-muted">
              Inscrivez-vous pour suivre votre progression
            </p>
          </div>

          {/* Form */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl animate-fade-in">
                  {error}
                </div>
              )}

              {/* Nom complet */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-text mb-2">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    autoComplete="name"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-border bg-bg text-sm text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Jean Dupont"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-border bg-bg text-sm text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="jean@exemple.fr"
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-text mb-2">
                  T&eacute;l&eacute;phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-border bg-bg text-sm text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="06 12 34 56 78"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="w-full pl-10 pr-12 py-3.5 rounded-xl border border-border bg-bg text-sm text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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

                {/* Password strength indicators */}
                {password.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {/* Strength bar */}
                    <div className="flex gap-1.5">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strengthCount ? strengthColor : "bg-surface-alt"}`}
                        />
                      ))}
                    </div>
                    {strengthLabel && (
                      <p className={`text-xs font-medium ${strengthCount === 3 ? "text-green-600" : strengthCount === 2 ? "text-amber" : "text-primary"}`}>
                        {strengthLabel}
                      </p>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full transition-colors ${passwordChecks.length ? "bg-green-500" : "bg-surface-alt"}`} />
                        <span className={`text-xs ${passwordChecks.length ? "text-green-600" : "text-text-muted"}`}>
                          Au moins 8 caract&egrave;res
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full transition-colors ${passwordChecks.uppercase ? "bg-green-500" : "bg-surface-alt"}`} />
                        <span className={`text-xs ${passwordChecks.uppercase ? "text-green-600" : "text-text-muted"}`}>
                          Une majuscule
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full transition-colors ${passwordChecks.number ? "bg-green-500" : "bg-surface-alt"}`} />
                        <span className={`text-xs ${passwordChecks.number ? "text-green-600" : "text-text-muted"}`}>
                          Un chiffre
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmer mot de passe */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className={`w-full pl-10 pr-4 py-3.5 rounded-xl border text-sm text-text bg-bg focus:outline-none focus:ring-2 transition-all ${
                      confirmPassword && confirmPassword !== password
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-border focus:border-primary focus:ring-primary/20"
                    }`}
                    placeholder="Confirmez votre mot de passe"
                  />
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-xs text-red-500 mt-1.5">Les mots de passe ne correspondent pas</p>
                )}
              </div>

              {/* Code postal */}
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-text mb-2">
                  Code postal
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    id="postalCode"
                    type="text"
                    value={postalCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 5);
                      setPostalCode(val);
                    }}
                    inputMode="numeric"
                    maxLength={5}
                    autoComplete="postal-code"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-border bg-bg text-sm text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="75001"
                  />
                </div>
                <p className="text-xs text-text-muted mt-1.5">
                  Permet de vous proposer une auto-&eacute;cole proche de chez vous.
                </p>
              </div>

              {/* RGPD Consentements */}
              <div className="space-y-3 pt-3 border-t border-border">
                {/* Consentement obligatoire */}
                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-bg transition-colors">
                  <input
                    type="checkbox"
                    checked={consentRgpd}
                    onChange={(e) => setConsentRgpd(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary cursor-pointer flex-shrink-0"
                  />
                  <span className="text-xs text-text-muted leading-relaxed">
                    J'accepte que mes donn&eacute;es personnelles soient trait&eacute;es conform&eacute;ment &agrave; la{" "}
                    <Link to="/confidentialite" className="text-primary underline hover:text-primary-dark">
                      politique de confidentialit&eacute;
                    </Link>
                    . Mes donn&eacute;es sont utilis&eacute;es uniquement pour le suivi de ma formation.
                    <span className="text-primary"> *</span>
                  </span>
                </label>

                {/* Consentement optionnel — localisation */}
                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-bg transition-colors">
                  <input
                    type="checkbox"
                    checked={consentLocalisation}
                    onChange={(e) => setConsentLocalisation(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary cursor-pointer flex-shrink-0"
                  />
                  <span className="text-xs text-text-muted leading-relaxed">
                    J'accepte que mon code postal soit utilis&eacute; pour me proposer des auto-&eacute;coles
                    et contenus adapt&eacute;s &agrave; ma zone g&eacute;ographique.
                    <span className="text-text-muted/60"> (optionnel)</span>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !isPasswordValid || password !== confirmPassword || !consentRgpd}
                className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base mt-2"
              >
                {loading ? "Inscription en cours..." : "S'inscrire"}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-text-muted mt-6">
            D&eacute;j&agrave; un compte ?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Se connecter
            </Link>
          </p>

          <p className="text-center text-sm text-text-muted mt-2 mb-4">
            <Link to="/" className="text-primary hover:underline">
              &larr; Retour au blog
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
