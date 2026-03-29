import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connecter à Supabase ou un service newsletter
    setSubmitted(true);
    setEmail("");
  };

  return (
    <section className="bg-gradient-to-br from-amber-light to-[#FFF0C8] rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden">
      {/* Subtle decorative element */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-amber opacity-[0.07] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary opacity-[0.05] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-secondary mb-3">
          Restez inform&eacute;
        </h3>
        <p className="font-sans text-text-muted mb-8 max-w-md mx-auto leading-relaxed">
          Recevez nos derniers articles et conseils pour r&eacute;ussir votre permis directement dans votre bo&icirc;te mail.
        </p>
        {submitted ? (
          <div className="animate-fade-up flex flex-col items-center gap-2">
            <CheckCircle className="w-8 h-8 text-primary" />
            <p className="text-primary font-semibold font-sans text-lg">
              Merci pour votre inscription !
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              className="flex-1 px-5 py-3 rounded-xl bg-surface border border-border font-sans text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            />
            <button
              type="submit"
              className="bg-primary text-white text-sm font-semibold font-sans px-6 py-3 rounded-xl hover:bg-primary-dark transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <Send className="w-4 h-4" />
              S'inscrire
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
