import { useState, type ReactNode } from "react";
import { ArrowRight, Check, Minus, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageMeta from "../components/PageMeta";
import RouteEffects from "../components/RouteEffects";
import Experience3D from "../features/experience3d/Experience3D";
import { PRICES, INCLUDED, EXTRA_HOUR_PRICE, CODE_EXAM_PRICE } from "../lib/offers";
import "../styles/refinement-decision.css";
import "../features/experience3d/experience3d.css";

type Plan = "classic" | "accelerated";

function clampCount(value: string, maximum: number) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? Math.min(maximum, Math.max(0, parsed)) : 0;
}

function BudgetCounter({ id, label, help, value, max, minusLabel, plusLabel, onChange }: {
  id: string;
  label: string;
  help: string;
  value: number;
  max: number;
  minusLabel: string;
  plusLabel: string;
  onChange: (value: number) => void;
}) {
  const helpId = `${id}-help`;
  return <div className="wd-budget-field">
    <label htmlFor={id}>{label}</label>
    <div className="wd-counter">
      <button type="button" onClick={() => onChange(Math.max(0, value - 1))} disabled={value <= 0} aria-label={minusLabel}><Minus size={18} aria-hidden="true" /></button>
      <input id={id} type="number" inputMode="numeric" min="0" max={max} step="1" value={value} onChange={(event) => onChange(clampCount(event.target.value, max))} aria-describedby={helpId} />
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={plusLabel}><Plus size={18} aria-hidden="true" /></button>
    </div>
    <small id={helpId}>{help}</small>
  </div>;
}

function OfferCard({ title, note, price, plan, selected, dark = false, onSelect, children }: { title: string; note: string; price: number; plan: Plan; selected: boolean; dark?: boolean; onSelect: (plan: Plan) => void; children: ReactNode }) {
  const titleId = dark ? "accelerated-title" : "classic-title";
  const stateId = `${titleId}-state`;
  return <article className={`wd-card ${dark ? "wd-card-dark" : ""}`} aria-labelledby={titleId} aria-describedby={stateId} data-selected={selected ? "true" : "false"}>
    <div className="wd-plan-top">
      <span>{dark ? "02 / SÉANCES REGROUPÉES" : "01 / SÉANCES RÉPARTIES"}</span>
      <span id={stateId} className="wd-plan-state">{selected ? <><Check size={13} aria-hidden="true" />Sélectionnée</> : <><span>À comparer</span><ArrowRight size={13} aria-hidden="true" /></>}</span>
    </div>
    <div className="wd-card-head"><h3 id={titleId}>{title}</h3><small>{note}</small></div>
    <div className="wd-price">{price.toLocaleString("fr-FR")} <span>€</span></div>
    {children}
    <Link className="wd-plan-link" to="/#budget" onClick={() => onSelect(plan)} aria-label={selected ? `Ajuster le budget de la formule ${title.toLowerCase()}` : `Choisir et simuler la formule ${title.toLowerCase()}`}>{selected ? "Ajuster cette estimation" : "Choisir et simuler"} <ArrowRight size={18} aria-hidden="true" /></Link>
  </article>;
}

export default function WebedriveLanding() {
  const [hours, setHours] = useState<13 | 20>(20);
  const [plan, setPlan] = useState<Plan>("classic");
  const [extraHours, setExtraHours] = useState(0);
  const [codeAttempts, setCodeAttempts] = useState(0);
  const price = PRICES[hours];
  const extrasTotal = extraHours * EXTRA_HOUR_PRICE + codeAttempts * CODE_EXAM_PRICE;
  const classicTotal = price.classic + extrasTotal;
  const acceleratedTotal = price.accelerated + extrasTotal;
  const selectedPlanLabel = plan === "classic" ? "Classique" : "Accélérée";
  const selectedTotal = plan === "classic" ? classicTotal : acceleratedTotal;

  return <div className="site-shell wd-site">
    <PageMeta title="Votre permis, avec une vision claire à chaque étape" noIndex /><RouteEffects /><Header />
    <main id="site-content" tabIndex={-1}>
      <section id="experience" className="wd-experience" aria-label="Le ruban de progression WEBEDRIVE">
        <span id="top" className="wd-anchor-alias" aria-hidden="true" />
        <div className="wd-experience-grid">
          <div className="wd-experience-story">
            <article className="wd-experience-panel wd-experience-panel--lead" aria-labelledby="experience-title">
              <span className="wd-experience-kicker">Auto-école · Asnières-sur-Seine</span>
              <h1 id="experience-title">Votre permis, avec une vision claire à chaque étape.</h1>
              <p>Comprendre votre budget. Organiser vos séances. Avancer avec des objectifs clairs.</p>
              <div className="wd-experience-actions">
                <Link className="wd-pill" to="/#formations">Voir les formations <ArrowRight size={18} aria-hidden="true" /></Link>
                <Link className="wd-ghost" to="/#methode">Découvrir notre méthode <span aria-hidden="true">↗</span></Link>
              </div>
              <div className="wd-experience-proofline" aria-label="Les trois temps du parcours">
                <span>Comprendre</span><span>Organiser</span><span>Avancer</span>
              </div>
            </article>

            <article id="organiser" className="wd-experience-panel wd-experience-panel--compact" aria-labelledby="organiser-title">
              <span className="wd-experience-index">02 — Organiser</span>
              <h2 id="organiser-title">Un planning qui s’organise avec vous.</h2>
              <p>Un rythme de formation adapté aux disponibilités communes, avec des créneaux validés avant engagement.</p>
            </article>

            <article id="avancer" className="wd-experience-panel wd-experience-panel--compact" aria-labelledby="avancer-title">
              <span className="wd-experience-index">03 — Avancer</span>
              <h2 id="avancer-title">Des acquis. Un prochain objectif.</h2>
              <p>Des bilans pour comprendre votre progression et préparer la suite de votre formation.</p>
            </article>
          </div>

          <aside className="wd-experience-visual" aria-label="Illustration du parcours">
            <div className="wd-experience-visual-inner">
              <Experience3D />
            </div>
          </aside>
        </div>
      </section>
      <section id="formations" className="wd-offers" aria-labelledby="formules-title">
        <span id="formules" className="wd-anchor-alias" aria-hidden="true" />
        <div className="wd-head"><div><span>01 — Les formules · boîte automatique</span><h2 id="formules-title">Votre rythme.<br />Votre point de départ.</h2></div><p>L’évaluation détermine le volume conseillé. Choisissez ensuite comment répartir vos séances : les inclusions restent les mêmes.</p></div>
        <div className="wd-offer-controls"><fieldset className="wd-volume"><legend>Votre volume de conduite</legend><div className="wd-switch">{([13, 20] as const).map(value => <label key={value}><input type="radio" name="formation-hours" checked={hours === value} onChange={() => setHours(value)} />{value} heures</label>)}</div></fieldset><p>Deux formules.<br /><strong>Tout est posé, avant de commencer.</strong></p></div>
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{hours} heures : classique {price.classic} euros, accélérée {price.accelerated} euros.</p>
        <div className="wd-selection-band" aria-label="Résumé de la sélection">
          <span><small>Volume choisi</small><strong>{hours} h</strong></span>
          <span><small>Classique</small><strong>{price.classic.toLocaleString("fr-FR")} €</strong></span>
          <span><small>Accélérée</small><strong>{price.accelerated.toLocaleString("fr-FR")} €</strong></span>
          <Link to="/#budget">Ajuster l’estimation <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
        <div className="wd-comparison-intro">
          <span>Comparer sans jargon</span>
          <p><strong>{hours} h sélectionnées.</strong> Les inclusions restent les mêmes ; seul le rythme des séances change.</p>
        </div>
        <div className="wd-cards" aria-label={`Comparaison des formules pour ${hours} heures`}>
          <OfferCard title="Classique" note={`${hours} h · à votre rythme`} price={price.classic} plan="classic" selected={plan === "classic"} onSelect={setPlan}><p>Le temps de progresser, avec des séances réparties selon les disponibilités communes.</p><ul>{INCLUDED.map(item => <li key={item}><Check aria-hidden="true" />{item}</li>)}</ul></OfferCard>
          <OfferCard dark title="Accélérée" note={`${hours} h · supplément de 200 €`} price={price.accelerated} plan="accelerated" selected={plan === "accelerated"} onSelect={setPlan}><p>Les mêmes inclusions, avec des séances regroupées lorsque le planning le permet.</p><ul>{INCLUDED.map(item => <li key={item}><Check aria-hidden="true" />{item}</li>)}<li><Check aria-hidden="true" />Créneaux validés avant engagement. Aucune date d’examen garantie.</li></ul></OfferCard>
        </div>
        <p className="wd-fine">À prévoir séparément : examen du code {CODE_EXAM_PRICE} € par tentative · heures complémentaires {EXTRA_HOUR_PRICE} € par heure.</p>
        <section id="budget" className="wd-budget" aria-labelledby="budget-title" tabIndex={-1}>
          <div><span className="site-eyebrow">Votre budget, en clair</span><h3 id="budget-title">Tout se calcule.<br />Rien ne s’envoie.</h3><p className="wd-budget-copy">Choisissez votre rythme, puis ajoutez les options à simuler. Le calcul reste dans votre navigateur et ne réserve aucun créneau.</p>
            <fieldset className="wd-budget-plan"><legend>Formule à simuler</legend><div className="wd-budget-plan-switch">
              <label><input type="radio" name="budget-plan" value="classic" checked={plan === "classic"} onChange={() => setPlan("classic")} />Classique</label>
              <label><input type="radio" name="budget-plan" value="accelerated" checked={plan === "accelerated"} onChange={() => setPlan("accelerated")} />Accélérée</label>
            </div></fieldset>
            <fieldset className="wd-budget-fields"><legend className="sr-only">Options de l’estimation</legend>
              <BudgetCounter id="budget-extra-hours" label="Heures complémentaires" help={`${EXTRA_HOUR_PRICE} € par heure`} value={extraHours} max={20} minusLabel="Retirer une heure complémentaire" plusLabel="Ajouter une heure complémentaire" onChange={setExtraHours} />
              <BudgetCounter id="budget-code-attempts" label="Tentatives code" help={`${CODE_EXAM_PRICE} € par tentative`} value={codeAttempts} max={10} minusLabel="Retirer une tentative code" plusLabel="Ajouter une tentative code" onChange={setCodeAttempts} />
            </fieldset>
          </div>
          <div className="wd-budget-summary"><div className="wd-budget-bridge"><small>Étape suivante</small><strong>{hours} h · {selectedPlanLabel}</strong></div><span>Votre estimation / {hours} h / {selectedPlanLabel}</span><div className="wd-budget-total" data-active={plan === "classic" ? "true" : "false"}><div className="wd-budget-total-copy"><small>{plan === "classic" ? "Choix actuel" : "Comparatif"}</small><span>Classique</span></div><strong>{classicTotal.toLocaleString("fr-FR")} €</strong></div><div className="wd-budget-total" data-active={plan === "accelerated" ? "true" : "false"}><div className="wd-budget-total-copy"><small>{plan === "accelerated" ? "Choix actuel" : "Comparatif"}</small><span>Accélérée</span></div><strong>{acceleratedTotal.toLocaleString("fr-FR")} €</strong></div><p className="wd-budget-note">Estimation locale uniquement : options saisies incluses. Aucun envoi, aucune réservation, aucun paiement.</p><p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{selectedPlanLabel}, {hours} heures : estimation {selectedTotal.toLocaleString("fr-FR")} euros.</p></div>
        </section>
        <div className="wd-budget-handoff" aria-label="Suite du parcours">
          <div><small>Prochaine étape · 02</small><strong>Le budget est posé. La progression reste lisible.</strong><span>Évaluation, organisation, bilans : voyez comment la méthode s’enchaîne.</span></div>
          <Link to="/#methode">Découvrir la méthode <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
      </section>
      <section id="methode" className="wd-method" aria-labelledby="method-title">
        <div className="wd-head"><div><span>02 — L’approche WEBEDRIVE</span><h2 id="method-title">Apprendre à conduire.<br />Savoir où l’on va.</h2></div><p>De la première évaluation aux bilans de progression, la prochaine étape reste lisible.</p></div>
        <div className="wd-method-context" aria-label="Parcours actuellement simulé">
          <div><small>Parcours simulé</small><strong>{hours} h · {selectedPlanLabel}</strong></div>
          <div><small>Estimation actuelle</small><strong>{selectedTotal.toLocaleString("fr-FR")} €</strong></div>
          <Link to="/#budget">Ajuster le budget <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
        <div className="wd-steps">{[["01", "Comprendre", "Votre point de départ", "Évaluation, besoins et budget : les bons repères avant de décider."], ["02", "Organiser", "Votre rythme", "Une organisation cohérente avec la formule choisie et les disponibilités."], ["03", "Avancer", "Votre progression", "Des bilans pour savoir ce qui est acquis et ce qui vient ensuite."]].map(([number, title, label, text]) => <article key={number}><div className="wd-step-top"><b>{number}</b><ArrowRight size={20} aria-hidden="true" /></div><small>{label}</small><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>
      <section className="wd-questions" aria-labelledby="questions-title"><div><span className="site-eyebrow">Avant de démarrer</span><h2 id="questions-title">C’est plus simple<br />quand c’est clair.</h2></div><div className="wd-question-list">
        <details><summary>13 heures ou 20 heures : comment choisir ?</summary><p>L’évaluation préalable permet de conseiller un volume adapté. Le forfait constitue un point de départ ; des heures complémentaires peuvent être nécessaires selon votre progression.</p></details>
        <details><summary>L’accéléré garantit-il une date d’examen ?</summary><p>Non. Il concerne le regroupement des séances, selon le planning. Les créneaux sont validés avant engagement et aucune date d’examen n’est garantie.</p></details>
        <details><summary>Le simulateur m’engage-t-il ?</summary><p>Non. Il calcule une estimation dans votre navigateur. Il ne transmet aucune demande, ne réserve aucun créneau et ne déclenche aucun paiement.</p></details>
      </div></section>
      <section className="wd-closing" aria-labelledby="journal-title">
        <div className="wd-closing-copy">
          <span>03 — Le journal WEBEDRIVE</span>
          <h2 id="journal-title">Continuez à progresser.<br />Même entre deux séances.</h2>
          <p>Guides pratiques, rappels utiles et quiz pour garder les bons repères avant de reprendre le volant.</p>
          <ul className="wd-closing-topics" aria-label="Ressources du journal"><li>Guides pratiques</li><li>Quiz code</li><li>Conseils de conduite</li></ul>
        </div>
        <div className="wd-closing-actions">
          <Link className="wd-pill" to="/blog">Explorer le journal <ArrowRight size={18} aria-hidden="true" /></Link>
          <Link className="wd-closing-secondary" to="/#formules">Revoir les formules <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
      </section>
    </main><Footer />
  </div>;
}
