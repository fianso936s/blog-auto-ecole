import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Pause, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const PRICES = {
  13: { classic: 890, accelerated: 1090 },
  20: { classic: 1290, accelerated: 1490 },
} as const;

function RoadScene({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let frame = 0;
    let tick = 0;
    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, "#153D58");
      bg.addColorStop(1, "#092435");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#0b2433";
      ctx.beginPath();
      ctx.moveTo(width * 0.04, height);
      ctx.lineTo(width * 0.43, height * 0.38);
      ctx.lineTo(width * 0.57, height * 0.38);
      ctx.lineTo(width * 0.96, height);
      ctx.fill();
      ctx.strokeStyle = "#D7B98E";
      ctx.lineWidth = 3;
      ctx.setLineDash([22, 24]);
      ctx.lineDashOffset = -(tick % 46);
      ctx.beginPath();
      ctx.moveTo(width * 0.5, height);
      ctx.lineTo(width * 0.5, height * 0.4);
      ctx.stroke();
      ctx.setLineDash([]);
      if (!paused) {
        tick += 0.45;
        frame = requestAnimationFrame(draw);
      }
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [paused]);
  return <canvas ref={canvasRef} className="wd-canvas" aria-hidden="true" />;
}

function OfferCard({ title, note, price, dark = false, children }: { title: string; note: string; price: number; dark?: boolean; children: React.ReactNode }) {
  return <article className={`wd-card ${dark ? "wd-card-dark" : ""}`}>
    <div className="wd-card-head"><strong>{title}</strong><small>{note}</small></div>
    <div className="wd-price">{price.toLocaleString("fr-FR")} €</div>
    {children}
  </article>;
}

export default function WebedriveLanding() {
  const [hours, setHours] = useState<13 | 20>(20);
  const [paused, setPaused] = useState(false);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const price = PRICES[hours];

  return <div className="wd-site">
    <header className="wd-nav">
      <a className="wd-brand" href="#top" aria-label="WEBEDRIVE accueil"><span>webe</span><b>drive</b><small>AUTO-ÉCOLE</small></a>
      <nav><a href="#formules">Formules</a><a href="#methode">Méthode</a><Link to="/blog">Blog</Link></nav>
      <a className="wd-pill" href="#formules">Voir les tarifs <ArrowRight size={17}/></a>
    </header>

    <main>
      <section id="top" className="wd-hero">
        <div className="wd-copy">
          <div className="wd-eyebrow"><i/> AUTO-ÉCOLE · ASNIÈRES-SUR-SEINE</div>
          <h1>Votre permis.<br/><em>En plus clair.</em></h1>
          <p>Comprenez votre budget, choisissez votre rythme et avancez avec une prochaine étape lisible.</p>
          <div className="wd-actions"><a className="wd-pill" href="#formules">Découvrir les formules <ArrowRight size={18}/></a><a className="wd-ghost" href="#methode">Notre approche</a></div>
          <div className="wd-progress"><span><b>01</b> Comprendre</span><i/><span><b>02</b> Organiser</span><i/><span><b>03</b> Avancer</span></div>
        </div>
        <div className="wd-visual">
          <RoadScene paused={paused || reducedMotion}/>
          <div className="wd-tag"><Sparkles size={16}/> Une vision claire à chaque étape</div>
          <button className="wd-motion" onClick={() => setPaused(!paused)} aria-label={paused ? "Reprendre l’animation" : "Mettre en pause l’animation"}>{paused ? <Play size={17}/> : <Pause size={17}/>}</button>
          <div className="wd-car"><div className="wd-glass"/><div className="wd-lamp wd-left"/><div className="wd-lamp wd-right"/><div className="wd-plate">WEBEDRIVE</div></div>
        </div>
      </section>

      <section id="formules" className="wd-offers">
        <div className="wd-head"><div><span>LES FORMULES</span><h2>Deux rythmes.<br/>Un même suivi.</h2></div><p>L’évaluation détermine le volume conseillé. Le rythme change l’organisation, pas la clarté du parcours.</p></div>
        <div className="wd-switch" role="group" aria-label="Volume de formation"><button className={hours === 13 ? "active" : ""} onClick={() => setHours(13)}>13 heures</button><button className={hours === 20 ? "active" : ""} onClick={() => setHours(20)}>20 heures</button></div>
        <div className="wd-cards">
          <OfferCard title="CLASSIQUE" note="Planning régulier" price={price.classic}><p>Des séances réparties selon les disponibilités communes.</p><ul><li><Check/>Évaluation préalable en plus du volume</li><li><Check/>Code en ligne pendant 6 mois</li><li><Check/>Démarches et livret numérique</li><li><Check/>Suivi pédagogique et bilans</li><li><Check/>1 accompagnement pratique en plus</li></ul></OfferCard>
          <OfferCard dark title="ACCÉLÉRÉE" note="+ 200 € · séances regroupées" price={price.accelerated}><p>Une formation concentrée lorsque le planning le permet.</p><ul><li><Check/>Les mêmes inclusions</li><li><Check/>Créneaux validés avant engagement</li><li><Check/>Objectif 2 à 3 semaines si planning possible</li><li><Check/>Aucune date d’examen garantie</li></ul></OfferCard>
        </div>
        <p className="wd-fine">À prévoir séparément : examen du code 30 € / tentative · heures complémentaires 65 € / h.</p>
      </section>

      <section id="methode" className="wd-method">
        <span>LA MÉTHODE</span><h2>La prochaine étape<br/>n’est jamais cachée.</h2>
        <div className="wd-steps">{[["01","Comprendre","Évaluation, besoins et budget lisibles avant de décider."],["02","Organiser","Un rythme cohérent avec la formule choisie."],["03","Avancer","Des bilans pour savoir ce qui est acquis et ce qui vient ensuite."]].map(([n,t,d]) => <article key={n}><b>{n}</b><h3>{t}</h3><p>{d}</p></article>)}</div>
      </section>

      <section className="wd-closing"><div><span>WEBEDRIVE</span><h2>Votre permis commence<br/>par une vision claire.</h2></div><a className="wd-pill wd-light" href="#formules">Comparer les formules <ArrowRight size={18}/></a></section>
    </main>
    <footer className="wd-footer"><div className="wd-brand"><span>webe</span><b>drive</b><small>AUTO-ÉCOLE</small></div><div><Link to="/blog">Accéder au blog</Link><p>Prototype · coordonnées publiques et mentions légales à valider avant mise en production.</p></div></footer>
  </div>;
}
