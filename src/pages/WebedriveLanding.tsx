import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageMeta from "../components/PageMeta";
import RouteEffects from "../components/RouteEffects";
import ExperiencePoster from "../features/experience3d/ExperiencePoster";
import { PRICES, INCLUDED, EXTRA_HOUR_PRICE, CODE_EXAM_PRICE } from "../lib/offers";
import "../styles/refinement-decision.css";
import "../features/experience3d/experience3d.css";

// prefers-reduced-motion is handled by the shared design system and experience3d.css.

export default function WebedriveLanding() {
  const [hours, setHours] = useState<13 | 20>(20);
  const [extraHours, setExtraHours] = useState(0);
  const [codeAttempts, setCodeAttempts] = useState(0);
  const price = PRICES[hours];

  const clampCount = (value: string, maximum: number) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.min(maximum, Math.max(0, parsed)) : 0;
  };

  const extrasTotal = extraHours * EXTRA_HOUR_PRICE + codeAttempts * CODE_EXAM_PRICE;
  const classicTotal = price.classic + extrasTotal;
  const acceleratedTotal = price.accelerated + extrasTotal;

  return <div className="site-shell wd-site">
    <PageMeta title="Votre permis, avec une vision claire à chaque étape" noIndex />
    <RouteEffects />
    <Header />
    <main id="site-content" tabIndex={-1}>
      <section id="experience" className="wd-experience" aria-label="Le ruban de progression WEBEDRIVE">
        <div className="wd-experience-grid">
          <div className="wd-experience-story">
            <article className="wd-experience-panel wd-experience-panel--lead" aria-labelledby="experience-title">
              <span className="wd-experience-kicker">Auto-école · Asnières-sur-Seine</span>
              <h1 id="experience-title">Votre permis, avec une vision claire à chaque étape.</h1>
              <p>Comprendre votre budget. Organiser vos séances. Avancer avec des objectifs clairs.</p>
              <div className="wd-experience-actions">
                <Link className="wd-pill" to="/#formations">Voir les formations <ArrowRight size={18} aria-hidden="true" /></Link>
                <span className="wd-experience-contact-pending" aria-label="Parler de mon projet — canal de contact à confirmer">
                  <strong>Parler de mon projet</strong>
                  <small>Canal de contact à confirmer</small>
                </span>
              </div>
              <div className="wd-experience-proofline" aria-label="Les trois temps du parcours">
                <span>Comprendre</span><span>Organiser</span><span>Avancer</span>
              </div>
            </article>

            <div className="wd-experience-mobile-poster">
              <ExperiencePoster variant="mobile" />
            </div>

            <article className="wd-experience-panel wd-experience-panel--compact" aria-labelledby="organiser-title">
              <span className="wd-experience-index">02 — Organiser</span>
              <h2 id="organiser-title">Un planning qui s’organise avec vous.</h2>
              <p>Un rythme de formation adapté aux disponibilités communes, avec des créneaux validés avant engagement.</p>
            </article>

            <article className="wd-experience-panel wd-experience-panel--compact" aria-labelledby="avancer-title">
              <span className="wd-experience-index">03 — Avancer</span>
              <h2 id="avancer-title">Des acquis. Un prochain objectif.</h2>
              <p>Des bilans pour comprendre votre progression et préparer la suite de votre formation.</p>
            </article>
          </div>

          <aside className="wd-experience-visual" aria-label="Illustration du parcours">
            <div className="wd-experience-visual-inner">
              <ExperiencePoster />
            </div>
          </aside>
        </div>
      </section>

      <section id="formations" className="wd-offers" aria-labelledby="formules-title">
        <span id="formules" className="wd-anchor-alias" aria-hidden="true" />
        <div className="wd-head wd-formations-intro">
          <div><span>01 — Les formations · boîte automatique</span><h2 id="formules-title">Deux rythmes.<br />Deux volumes lisibles.</h2></div>
          <p>Les quatre tarifs sont visibles dans la même comparaison. L’évaluation préalable aide ensuite à choisir le volume adapté à votre situation.</p>
        </div>

        <div className="wd-comparison-intro">
          <span>Comparer sans jargon</span>
          <p><strong>13 h et 20 h visibles ensemble.</strong> Les inclusions sont partagées ; seul le rythme des séances change.</p>
        </div>

        <div className="wd-formations-grid" aria-label="Comparaison des formules pour 13 et 20 heures">
          <article className="wd-formation-panel" aria-labelledby="classic-title">
            <div className="wd-formation-panel-head">
              <div><span>01 / SÉANCES RÉPARTIES</span><h3 id="classic-title">Classique</h3></div>
              <ArrowRight size={22} aria-hidden="true" />
            </div>
            <p>Le temps de progresser avec des séances réparties selon les disponibilités communes.</p>
            <dl className="wd-formation-prices">
              <div className="wd-formation-price"><dt>13 heures<small>Boîte automatique</small></dt><dd>{PRICES[13].classic.toLocaleString("fr-FR")} €</dd></div>
              <div className="wd-formation-price"><dt>20 heures<small>Boîte automatique</small></dt><dd>{PRICES[20].classic.toLocaleString("fr-FR")} €</dd></div>
            </dl>
          </article>

          <article className="wd-formation-panel wd-formation-panel--dark" aria-labelledby="accelerated-title">
            <div className="wd-formation-panel-head">
              <div><span>02 / SÉANCES REGROUPÉES</span><h3 id="accelerated-title">Accélérée</h3></div>
              <ArrowRight size={22} aria-hidden="true" />
            </div>
            <p>Les mêmes inclusions, avec des séances regroupées lorsque le planning le permet. Le supplément de 200 € ne garantit pas de date d’examen.</p>
            <dl className="wd-formation-prices">
              <div className="wd-formation-price"><dt>13 heures<small>Boîte automatique</small></dt><dd>{PRICES[13].accelerated.toLocaleString("fr-FR")} €</dd></div>
              <div className="wd-formation-price"><dt>20 heures<small>Boîte automatique</small></dt><dd>{PRICES[20].accelerated.toLocaleString("fr-FR")} €</dd></div>
            </dl>
          </article>
        </div>

        <div className="wd-shared-inclusions">
          <h3>Inclus dans les deux rythmes</h3>
          <ul>{INCLUDED.map(item => <li key={item}><Check aria-hidden="true" />{item}</li>)}</ul>
          <p className="wd-fine">À prévoir séparément : examen du code {CODE_EXAM_PRICE} € par tentative · heures complémentaires {EXTRA_HOUR_PRICE} € par heure. Les créneaux accélérés sont validés avant engagement.</p>
        </div>

        <section id="budget" className="wd-budget" aria-labelledby="budget-title" tabIndex={-1}>
          <div>
            <span className="site-eyebrow">Votre budget, en clair</span>
            <h3 id="budget-title">Tout se calcule.<br />Rien ne s’envoie.</h3>
            <p className="wd-budget-copy">Choisissez le volume puis ajoutez les options à simuler. Le calcul reste dans votre navigateur et ne réserve aucun créneau.</p>

            <fieldset className="wd-volume wd-budget-volume">
              <legend>Volume à simuler</legend>
              <div className="wd-switch">{([13, 20] as const).map(value => <label key={value}><input type="radio" name="formation-hours" checked={hours === value} onChange={() => setHours(value)} />{value} heures</label>)}</div>
            </fieldset>

            <fieldset className="wd-budget-fields">
              <legend className="sr-only">Options de l’estimation</legend>
              <label className="wd-budget-field"><span>Heures complémentaires</span><input type="number" inputMode="numeric" min="0" max="20" step="1" value={extraHours} onChange={(event) => setExtraHours(clampCount(event.target.value, 20))} aria-describedby="budget-extra-help" /><small id="budget-extra-help">{EXTRA_HOUR_PRICE} € par heure</small></label>
              <label className="wd-budget-field"><span>Tentatives code</span><input type="number" inputMode="numeric" min="0" max="10" step="1" value={codeAttempts} onChange={(event) => setCodeAttempts(clampCount(event.target.value, 10))} aria-describedby="budget-code-help" /><small id="budget-code-help">{CODE_EXAM_PRICE} € par tentative</small></label>
            </fieldset>
          </div>
          <div className="wd-budget-summary" role="status" aria-live="polite" aria-atomic="true">
            <div className="wd-budget-bridge"><small>Étape suivante</small><strong>{hours} h sélectionnées</strong></div>
            <span>Votre estimation / {hours} h</span>
            <div className="wd-budget-total"><span>Classique</span><strong>{classicTotal.toLocaleString("fr-FR")} €</strong></div>
            <div className="wd-budget-total"><span>Accélérée</span><strong>{acceleratedTotal.toLocaleString("fr-FR")} €</strong></div>
            <p className="wd-budget-note">Estimation locale uniquement : options saisies incluses. Aucun envoi, aucune réservation, aucun paiement.</p>
          </div>
        </section>
      </section>

      <section id="methode" className="wd-method" aria-labelledby="method-title">
        <div className="wd-head"><div><span>02 — L’approche WEBEDRIVE</span><h2 id="method-title">Apprendre à conduire.<br />Savoir où l’on va.</h2></div><p>De la première évaluation aux bilans de progression, la prochaine étape reste lisible.</p></div>
        <div className="wd-steps">{[["01", "Comprendre", "Votre point de départ", "Évaluation, besoins et budget : les bons repères avant de décider."], ["02", "Organiser", "Votre rythme", "Une organisation cohérente avec la formule choisie et les disponibilités."], ["03", "Avancer", "Votre progression", "Des bilans pour savoir ce qui est acquis et ce qui vient ensuite."]].map(([number, title, label, text]) => <article key={number}><div className="wd-step-top"><b>{number}</b><ArrowRight size={20} aria-hidden="true" /></div><small>{label}</small><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="wd-questions" aria-labelledby="questions-title">
        <div><span className="site-eyebrow">Avant de démarrer</span><h2 id="questions-title">C’est plus simple<br />quand c’est clair.</h2></div>
        <div className="wd-question-list">
          <details><summary>13 heures ou 20 heures : comment choisir ?</summary><p>L’évaluation préalable permet de conseiller un volume adapté. Le forfait constitue un point de départ ; des heures complémentaires peuvent être nécessaires selon votre progression.</p></details>
          <details><summary>L’accéléré garantit-il une date d’examen ?</summary><p>Non. Il concerne le regroupement des séances, selon le planning. Les créneaux sont validés avant engagement et aucune date d’examen n’est garantie.</p></details>
          <details><summary>Le simulateur m’engage-t-il ?</summary><p>Non. Il calcule une estimation dans votre navigateur. Il ne transmet aucune demande, ne réserve aucun créneau et ne déclenche aucun paiement.</p></details>
        </div>
      </section>

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
    </main>
    <Footer />
  </div>;
}
