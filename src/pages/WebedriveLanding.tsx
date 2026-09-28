import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, Check, Pause, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageMeta from "../components/PageMeta";
import RouteEffects from "../components/RouteEffects";
import RoadScene from "../components/RoadScene";
import { PRICES, INCLUDED, EXTRA_HOUR_PRICE, CODE_EXAM_PRICE } from "../lib/offers";

function OfferCard({ title, note, price, dark = false, children }: { title: string; note: string; price: number; dark?: boolean; children: ReactNode }) {
  return <article className={`wd-card ${dark ? "wd-card-dark" : ""}`}>
    <div className="wd-card-head"><strong>{title}</strong><small>{note}</small></div>
    <div className="wd-price">{price.toLocaleString("fr-FR")} €</div>{children}
  </article>;
}

export default function WebedriveLanding() {
  const [hours, setHours] = useState<13 | 20>(20);
  const [paused, setPaused] = useState(false);
  const [extraHours, setExtraHours] = useState(0);
  const [codeAttempts, setCodeAttempts] = useState(0);
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    media.addEventListener("change", sync); return () => media.removeEventListener("change", sync);
  }, []);
  const price = PRICES[hours];
  const clampCount = (value: string, maximum: number) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.min(maximum, Math.max(0, parsed)) : 0;
  };
  const extrasTotal = extraHours * EXTRA_HOUR_PRICE + codeAttempts * CODE_EXAM_PRICE;
  const classicTotal = price.classic + extrasTotal;
  const acceleratedTotal = price.accelerated + extrasTotal;

  return <div className="site-shell wd-site">
    <PageMeta title="Votre permis, en plus clair" noIndex /><RouteEffects /><Header />
    <main id="site-content" tabIndex={-1}>
      <section id="top" className="wd-hero">
        <div className="wd-copy">
          <div className="wd-eyebrow"><i aria-hidden="true" />Auto-école · Asnières-sur-Seine</div>
          <h1>Votre permis.<br /><em>En plus clair.</em></h1>
          <p>Comprenez votre budget, choisissez votre rythme et avancez avec une prochaine étape lisible.</p>
          <div className="wd-actions"><Link className="wd-pill" to="/#formules">Découvrir les formules <ArrowRight size={18} aria-hidden="true" /></Link><Link className="wd-ghost" to="/#methode">Notre approche</Link></div>
          <div className="wd-progress"><span><b>01</b> Comprendre</span><i aria-hidden="true" /><span><b>02</b> Organiser</span><i aria-hidden="true" /><span><b>03</b> Avancer</span></div>
        </div>
        <div className="wd-visual">
          <RoadScene paused={paused || reduced} />
          <div className="wd-tag"><Sparkles size={16} aria-hidden="true" />Une vision claire à chaque étape</div>
          <button type="button" className="wd-motion" disabled={reduced} aria-label={reduced ? "Animation arrêtée selon vos préférences" : paused ? "Reprendre l’animation" : "Mettre en pause l’animation"} aria-pressed={paused || reduced} onClick={() => setPaused(value => !value)}>{paused || reduced ? <Play size={17} aria-hidden="true" /> : <Pause size={17} aria-hidden="true" />}</button>
          <div className="wd-car" aria-hidden="true"><div className="wd-glass" /><div className="wd-lamp wd-left" /><div className="wd-lamp wd-right" /><div className="wd-plate" /></div>
        </div>
      </section>
      <section id="formules" className="wd-offers" aria-labelledby="formules-title">
        <div className="wd-head"><div><span>Les formules · boîte automatique</span><h2 id="formules-title">Deux rythmes.<br />Un même suivi.</h2></div><p>L’évaluation détermine le volume conseillé. Le rythme change l’organisation, pas la clarté du parcours.</p></div>
        <fieldset className="wd-volume"><legend>Votre volume de conduite</legend><div className="wd-switch">{([13, 20] as const).map(value => <label key={value}><input type="radio" name="formation-hours" checked={hours === value} onChange={() => setHours(value)} />{value} heures</label>)}</div></fieldset>
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{hours} heures : classique {price.classic} euros, accélérée {price.accelerated} euros.</p>
        <div className="wd-cards">
          <OfferCard title="CLASSIQUE" note={`${hours} h · séances réparties`} price={price.classic}><p>Des séances réparties selon les disponibilités communes.</p><ul>{INCLUDED.map(item => <li key={item}><Check aria-hidden="true" />{item}</li>)}</ul></OfferCard>
          <OfferCard dark title="ACCÉLÉRÉE" note={`${hours} h · supplément de 200 €`} price={price.accelerated}><p>Les mêmes inclusions, avec des séances regroupées lorsque le planning le permet.</p><ul>{INCLUDED.map(item => <li key={item}><Check aria-hidden="true" />{item}</li>)}<li><Check aria-hidden="true" />Créneaux validés avant engagement. Aucune date d’examen garantie.</li></ul></OfferCard>
        </div>
        <p className="wd-fine">À prévoir séparément : examen du code {CODE_EXAM_PRICE} € par tentative · heures complémentaires {EXTRA_HOUR_PRICE} € par heure.</p>
        <section className="wd-budget" aria-labelledby="budget-title">
          <div>
            <span className="site-eyebrow">Estimer sans engagement</span>
            <h3 id="budget-title">Ajustez votre budget, sans rien envoyer.</h3>
            <p className="wd-budget-copy">Ajoutez uniquement les options que vous souhaitez simuler. Le calcul reste dans votre navigateur et ne réserve aucun créneau.</p>
            <fieldset className="wd-budget-fields">
              <legend className="sr-only">Options de l’estimation</legend>
              <label className="wd-budget-field">
                <span>Heures complémentaires</span>
                <input type="number" inputMode="numeric" min="0" max="20" step="1" value={extraHours} onChange={(event) => setExtraHours(clampCount(event.target.value, 20))} aria-describedby="budget-extra-help" />
                <small id="budget-extra-help">{EXTRA_HOUR_PRICE} € par heure</small>
              </label>
              <label className="wd-budget-field">
                <span>Tentatives code</span>
                <input type="number" inputMode="numeric" min="0" max="10" step="1" value={codeAttempts} onChange={(event) => setCodeAttempts(clampCount(event.target.value, 10))} aria-describedby="budget-code-help" />
                <small id="budget-code-help">{CODE_EXAM_PRICE} € par tentative</small>
              </label>
            </fieldset>
          </div>
          <div className="wd-budget-summary" role="status" aria-live="polite" aria-atomic="true">
            <span>Estimation pour {hours} h</span>
            <div className="wd-budget-total"><span>Classique</span><strong>{classicTotal.toLocaleString("fr-FR")} €</strong></div>
            <div className="wd-budget-total"><span>Accélérée</span><strong>{acceleratedTotal.toLocaleString("fr-FR")} €</strong></div>
            <p className="wd-budget-note">Inclut les options saisies ci-dessus. Estimation locale uniquement : aucun envoi, aucune réservation, aucun paiement.</p>
          </div>
        </section>
      </section>
      <section id="methode" className="wd-method" aria-labelledby="method-title">
        <span>La méthode</span><h2 id="method-title">La prochaine étape<br />n’est jamais cachée.</h2>
        <div className="wd-steps">{[["01", "Comprendre", "Évaluation, besoins et budget lisibles avant de décider."], ["02", "Organiser", "Un rythme cohérent avec la formule choisie."], ["03", "Avancer", "Des bilans pour savoir ce qui est acquis et ce qui vient ensuite."]].map(([number, title, text]) => <article key={number}><b>{number}</b><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>
      <section className="wd-closing"><div><span>Le journal WEBEDRIVE</span><h2>Des repères, aussi<br />entre deux séances.</h2></div><Link className="wd-pill" to="/blog">Explorer le blog & les guides <ArrowRight size={18} aria-hidden="true" /></Link></section>
    </main>
    <Footer />
  </div>;
}
