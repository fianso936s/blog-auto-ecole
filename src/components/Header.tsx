import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { MAIN_NAV, isNavigationActive } from "../lib/navigation";
import BrandMark from "./BrandMark";
import ThemeToggle from "./ThemeToggle";
import "../styles/brand.css";

export default function Header() {
  const location = useLocation();
  const { user } = useAuth();
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const accountPath = user ? (user.role === "admin" ? "/admin" : "/eleve") : "/login";
  const close = () => dialog.current?.close();

  useEffect(() => { close(); }, [location.key]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  useEffect(() => {
    const screen = window.matchMedia("(min-width: 1100px)");
    const onResize = () => { if (screen.matches) close(); };
    screen.addEventListener("change", onResize);
    return () => screen.removeEventListener("change", onResize);
  }, []);

  const links = (mobile = false) => MAIN_NAV.map((item, index) => <Link
    key={item.href} to={item.href}
    aria-current={isNavigationActive(location.pathname, location.hash, item.href) ? (item.href.includes("#") ? "location" : "page") : undefined}
    onClick={mobile ? close : undefined}>
    {mobile ? <>
      <span className="site-mobile-link-label"><b aria-hidden="true">{String(index + 1).padStart(2, "0")}</b><span>{item.label}</span></span>
      <ArrowRight size={18} aria-hidden="true" />
    </> : item.label}
  </Link>);

  return <>
    <a className="skip-link" href="#site-content">Aller au contenu</a>
    <header className="site-header">
      <div className="site-header-inner">
        <BrandMark />
        <nav className="site-main-nav" aria-label="Navigation principale">{links()}</nav>
        <div className="site-header-actions">
          <ThemeToggle />
          <Link className="site-account" to={accountPath}>{user ? "Mon espace" : "Espace élève"}<ArrowRight size={16} aria-hidden="true" /></Link>
          <button type="button" className="site-menu-trigger" aria-label="Ouvrir le menu" aria-expanded={open} aria-controls="site-mobile-menu" onClick={() => { dialog.current?.showModal(); setOpen(true); }}><Menu size={24} aria-hidden="true" /></button>
        </div>
      </div>
    </header>
    <dialog ref={dialog} id="site-mobile-menu" className="site-mobile-menu" aria-labelledby="site-menu-title" onClose={() => setOpen(false)} onClick={e => { if (e.target === dialog.current) close(); }}>
      <div className="site-mobile-panel">
        <div className="site-mobile-overline"><span>WEBEDRIVE</span><i aria-hidden="true" /><span>Asnières-sur-Seine</span></div>
        <div className="site-mobile-heading"><h2 id="site-menu-title">Votre parcours</h2><button type="button" className="site-mobile-close" aria-label="Fermer le menu" onClick={close}><X size={24} aria-hidden="true" /></button></div>
        <p className="site-mobile-description">Un parcours clair, de la formule au journal.</p>
        <nav aria-label="Navigation mobile">{links(true)}</nav>
        <Link className="site-button" to={accountPath} onClick={close}>{user ? "Mon espace" : "Espace élève"}<ArrowRight size={18} aria-hidden="true" /></Link>
        <p className="site-mobile-location">WEBEDRIVE · Asnières-sur-Seine</p>
      </div>
    </dialog>
  </>;
}
