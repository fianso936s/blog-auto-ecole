import { useState } from "react";
import { Send } from "lucide-react";

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
    <section className="bg-[#fcedea] rounded-2xl p-8 sm:p-12 text-center">
      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
        Restez inform&eacute;
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Recevez nos derniers articles et conseils pour r&eacute;ussir votre permis directement dans votre bo&icirc;te mail.
      </p>
      {submitted ? (
        <p className="text-[#cf5c36] font-semibold">
          Merci pour votre inscription !
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            required
            className="flex-1 px-4 py-3 rounded-full bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#cf5c36] focus:ring-1 focus:ring-[#cf5c36]"
          />
          <button
            type="submit"
            className="bg-[#cf5c36] text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#b8502f] transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            S'inscrire
          </button>
        </form>
      )}
    </section>
  );
}
