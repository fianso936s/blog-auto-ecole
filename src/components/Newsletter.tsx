import { useId, useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Newsletter() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (loading) return;
    setError(null); setLoading(true);
    try {
      const { error: insertError } = await supabase.from("newsletter_subscribers").insert({ email: email.trim() });
      if (insertError) setError(insertError.code === "23505" ? "Cette adresse est déjà inscrite." : "L’inscription n’a pas abouti. Veuillez réessayer.");
      else { setSubmitted(true); setEmail(""); }
    } catch { setError("L’inscription n’a pas abouti. Veuillez réessayer."); }
    finally { setLoading(false); }
  };
  return <section className="site-newsletter" aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`}>Gardez les bons repères.</h2><p>Retrouvez nos nouveaux articles et conseils dans votre boîte mail.</p>
    {submitted ? <p role="status">Votre inscription a été enregistrée.</p> : <form onSubmit={submit} aria-busy={loading}>
      <label htmlFor={`${id}-email`}>Votre adresse e-mail</label>
      <div className="site-newsletter-row"><input id={`${id}-email`} type="email" name="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required maxLength={254} aria-describedby={error ? `${id}-error` : undefined} aria-invalid={Boolean(error)} /><button type="submit" className="site-button" disabled={loading}>{loading ? "Enregistrement…" : "M’inscrire"}<ArrowRight size={18} aria-hidden="true" /></button></div>
      {error && <p id={`${id}-error`} className="site-form-status" role="alert">{error}</p>}
    </form>}
  </section>;
}
