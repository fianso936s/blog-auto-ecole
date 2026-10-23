import {StudentHome} from "./StudentHome";
import {MAP_RECENTER_DELAY} from "../packages/product/src/student-experience";
import {MetaConnection} from "./MetaConnection";
import {StudentDashboard,TeacherSchedule} from "./Teaching";
import {usePublishedCourses} from "../packages/product/src/content";
import product from "../packages/product/product.json";
import { VideoPlayer } from "./VideoPlayer";
import { useContentSync } from "./shared/content-sync";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useContext,
} from "react";
import { createRoot } from "react-dom/client";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Room, RoomEvent, Track } from "livekit-client";
import { courses, courseSources } from "./shared/courses";
import {
  categories,
  difficulties,
  acceptFix,
  totalDistance,
  geometry,
  heading,
  importGpx,
  exportGpx,
  type Profile,
  type Route,
  type RouteInput,
  type RouteSummary,
  type MapSpot,
  type Fix,
  type Point,
} from "./shared/core";
import {
  normalizeSearch,
  matchesRoute,
  directoryCenters,
} from "./shared/route-directory";
import "./style.css";
import { api } from "./shared/api";
import { ReplayPlayer } from "./ReplayPlayer";
import { useCourseProgress, StudyOverview, LessonQuiz, TeacherLessons } from "./CourseLearning";
import { observeMapSize } from "./shared/map-size";

type AnyData = Record<string, any>;
type Photo = NonNullable<MapSpot["photos"]>[number];
const importGPX = (xml: string, gen: () => string) => importGpx(xml, gen());
const exportGPX = exportGpx;
const icons: Record<string, React.ReactNode> = {
  book: (
    <>
      <path d="M3 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H3z" />
      <path d="M21 4h-6a3 3 0 0 0-3 3v14a4 4 0 0 1 4-2h5z" />
    </>
  ),
  map: (
    <>
      <path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3zM9 3v15m6-12v15" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="5" width="12" height="14" rx="3" />
      <path d="m15 10 6-4v12l-6-4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 22v-3a8 8 0 0 1 16 0v3" />
    </>
  ),
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  search: (
    <>
      <circle cx="10" cy="10" r="6" />
      <path d="m15 15 6 6" />
    </>
  ),
  pin: (
    <>
      <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
      <circle cx="12" cy="10" r="2" />
    </>
  ),
  play: <path d="m8 4 12 8-12 8z" />,
  plus: <path d="M12 4v16M4 12h16" />,
  check: <path d="m4 12 5 5L20 6" />,
  pause: (
    <>
      <path d="M8 5v14m8-14v14" />
    </>
  ),
  locate: (
    <>
      <circle cx="12" cy="12" r="6" />
      <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
    </>
  ),
  star: <path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" />
    </>
  ),
  shield: (
    <>
      <path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11a8 8 0 1 0-2 6M20 4v7h-7" />
    </>
  ),
  logout: (
    <>
      <path d="M9 4H4v16h5m5-14 6 6-6 6M9 12h11" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
};
function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name] || icons.pin}
    </svg>
  );
}
function Button({
  children,
  onClick,
  secondary = false,
  danger = false,
  disabled = false,
  icon,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
  icon?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      className={`btn ${secondary ? "secondary" : ""} ${danger ? "danger" : ""}`}
      disabled={disabled}
      onClick={onClick}
    >
      {icon && <Icon name={icon} />}
      <span>{children}</span>
    </button>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
function Empty({
  title,
  children,
  icon = "pin",
}: {
  title: string;
  children?: React.ReactNode;
  icon?: string;
}) {
  return (
    <div className="empty">
      <span className="icon-disc">
        <Icon name={icon} size={25} />
      </span>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  );
}
function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement;
    const d = ref.current!;
    d.showModal();
    const cancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    d.addEventListener("cancel", cancel);
    return () => {
      d.removeEventListener("cancel", cancel);
      d.close();
      prev?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "wide" : ""}`}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-label={title}
    >
      <header className="modal-head">
        <h2>{title}</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Fermer">
          <Icon name="close" />
        </button>
      </header>
      <div className="modal-body">{children}</div>
    </dialog>
  );
}
const roleLabel = (r: string) =>
  ({ admin: "Administrateur", teacher: "Enseignant", student: "Élève" })[r] ||
  r;
const tone = (s: string) =>
  /Priorité|Intersection|Vitesse|Sécurité|Avancé|revoir/.test(s)
    ? "red"
    : /Giratoire|Intermédiaire/.test(s)
      ? "amber"
      : /Manœuvre|C1/.test(s)
        ? "purple"
        : /C2|Observation|Placement/.test(s)
          ? "blue"
          : "green";
function Badge({
  children,
  color,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <span className={`badge ${color || tone(String(children))}`}>
      {children}
    </span>
  );
}
const fmt = (ms: number) =>
  `${Math.floor(ms / 60000)
    .toString()
    .padStart(2, "0")}:${Math.floor((ms / 1000) % 60)
    .toString()
    .padStart(2, "0")}`;
const km = (m: number) => `${(m / 1000).toFixed(1)} km`;
const download = (
  name: string,
  data: Blob | string,
  type = "application/octet-stream",
) => {
  const u = URL.createObjectURL(
    typeof data === "string" ? new Blob([data], { type }) : data,
  );
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 3000);
};
type Ctx = {
  profile: Profile | null;
  notify: (s: string) => void;
  reload: () => Promise<void>;
  logout: () => Promise<void>;
  login: () => void;
};
const Context = createContext<Ctx>(null!);
const useApp = () => useContext(Context);
function App() {
  const [profile, setProfile] = useState<Profile | null>(null),
    [loading, setLoading] = useState(true),
    [tab, setTab] = useState("pedagogy"),
    [home,setHome] = useState(false),
    [guest, setGuest] = useState(false),
    [auth, setAuth] = useState<string | null>(null),
    [message, setMessage] = useState("");
  const reload = useCallback(async () => {
    try {
      setProfile(await api<Profile>("/v1/me"));
    } catch (e) {
      if ((e as any).status === 401) setProfile(null);
      else setMessage((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void reload();
    const refresh = () => { if (document.visibilityState === "visible") void reload(); };
    const expired = () => { setProfile(null); setGuest(false); setAuth("signin"); setMessage("Votre session a expiré. Reconnectez-vous avec votre compte iPhone."); };
    window.addEventListener("online", refresh);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("repere:session-expired", expired);
    return () => { window.removeEventListener("online", refresh); document.removeEventListener("visibilitychange", refresh); window.removeEventListener("repere:session-expired", expired); };
  }, [reload]);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 7000);
    return () => clearTimeout(t);
  }, [message]);
  useEffect(()=>{setHome(profile?.role === "student");},[profile?.id]);
  const logout = async () => {
    await api("/session/logout", "POST", {});
    setProfile(null);
    setTab("pedagogy");
    setGuest(false);
  };
  return (
    <Context.Provider value={{ profile, notify: setMessage, reload, logout, login:()=>setAuth("signin") }}>
      {loading ? (
        <div className="loading">
          <img
            className="brand-logo"
            src="/assets/le-repere-logo.svg"
            alt="Le Repère Auto-école"
            width="1774"
            height="887"
          />
          <p>Ouverture de votre espace…</p>
        </div>
      ) : !profile && !guest ? (
        <Welcome onAuth={setAuth} onExplore={() => setGuest(true)} />
      ) : (
        <div className="shell">
          <aside className="sidebar">
            <a className="brand" href="/" aria-label="Accueil Le Repère Permis">
              <img
                className="brand-logo"
                src="/assets/le-repere-logo.svg"
                alt="Le Repère Auto-école"
                width="1774"
                height="887"
              />
            </a>
            <span className="nav-label">VOTRE COMPAGNON DE ROUTE</span>
            <nav aria-label="Navigation principale">
              {product.navigation.map(({id,label}) => {
                const icon = ({pedagogy:"book",map:"map",videos:"video",account:"user"} as Record<string,string>)[id];
                return (
                <button
                  key={id}
                  className={`nav-item ${!home && tab === id ? "active" : ""}`}
                  onClick={() => {
                    if (guest && id !== "pedagogy") {
                      setAuth("signin");
                      return;
                    }
                    setHome(false); setTab(id);
                  }}
                >
                  <Icon name={icon} />
                  <span>{label}</span>
                  {!home && tab === id && <i />}
                </button>
              );})}
            </nav>
            <div className="sidebar-bottom">
              <span className="quiet-note">
                Revoir. Comprendre.
                <br />
                Progresser.
              </span>
              <div className="mini-profile">
                <span className="avatar">
                  {profile?.name?.charAt(0) || "R"}
                </span>
                <span>
                  <strong>{profile?.name || "Bienvenue"}</strong>
                  <small>
                    {profile ? roleLabel(profile.role) : "Découvrir les fiches"}
                  </small>
                </span>
                {guest && (
                  <button
                    className="icon-btn"
                    aria-label="Se connecter"
                    onClick={() => setAuth("signin")}
                  >
                    <Icon name="arrow" />
                  </button>
                )}
              </div>
            </div>
          </aside>
          <main className={!home && tab === "map" ? "main map-main" : "main"}>
            {profile?.role === "student" && !home && <button className="student-home-return" onClick={()=>setHome(true)}>← Accueil</button>}
            {guest && (
              <div className="guest-banner">
                Retrouvez vos parcours et votre enseignant dans votre espace.
                <button onClick={() => setAuth("signin")}>
                  Se connecter <Icon name="arrow" size={15} />
                </button>
              </div>
            )}
            {home && profile ? <StudentHome user={profile.id} name={profile.name} go={id=>{setTab(id);setHome(false);}} Dialog={Modal}/> : tab === "pedagogy" ? (
              <Pedagogy />
            ) : tab === "map" ? (
              <MapPage />
            ) : tab === "videos" ? (
              <Videos />
            ) : (
              <Account />
            )}
          </main>
        </div>
      )}
      {auth && (
        <Auth
          mode={auth}
          onClose={() => setAuth(null)}
          onSuccess={async () => {
            setGuest(false);
            setAuth(null);
            await reload();
          }}
        />
      )}
      {message && (
        <div className="toast" role="status">
          <span>{message}</span>
          <button
            className="icon-btn"
            onClick={() => setMessage("")}
            aria-label="Fermer le message"
          >
            <Icon name="close" />
          </button>
        </div>
      )}
    </Context.Provider>
  );
}
function Welcome({
  onAuth,
  onExplore,
}: {
  onAuth: (s: string) => void;
  onExplore: () => void;
}) {
  return (
    <div className="welcome">
      <div className="welcome-copy">
        <a className="brand" href="/">
          <img
            className="brand-logo"
            src="/assets/le-repere-logo.svg"
            alt="Le Repère Auto-école"
            width="1774"
            height="887"
            fetchPriority="high"
          />
        </a>
        <div className="welcome-center">
          <span className="eyebrow">
            APPRENDRE À VOIR. APPRENDRE À CONDUIRE.
          </span>
          <h1>
            Chaque trajet,
            <br />
            <em>un repère.</em>
          </h1>
          <p>
            Enregistrez le réel. Repérez les situations.
            <br />
            Progressez à votre rythme.
          </p>
          <div className="welcome-features">
            {[
              ["book", "Des fiches pour comprendre"],
              ["map", "Vos parcours et repères sur la carte"],
              ["video", "Revoir vos leçons en vidéo"],
            ].map(([i, s]) => (
              <div key={i}>
                <Icon name={i} />
                {s}
              </div>
            ))}
          </div>
          <div className="welcome-actions">
            <Button onClick={() => onAuth("signin")} icon="arrow">
              Se connecter
            </Button>
            <Button secondary onClick={() => onAuth("signup")}>
              Créer mon compte
            </Button>
          </div>
          <button className="text-btn" onClick={onExplore}>
            Découvrir les fiches pédagogiques <Icon name="arrow" size={16} />
          </button>
        </div>
        <footer>
          <span>Élèves et enseignants, chacun son espace.</span>
          <a href="/privacy" target="_blank" rel="noreferrer">
            Confidentialité
          </a>
        </footer>
      </div>
      <div className="welcome-art" aria-hidden="true">
        <div className="art-road road-one" />
        <div className="art-road road-two" />
        <div className="art-road road-three" />
        <div className="art-park park-one" />
        <div className="art-park park-two" />
        <div className="art-route" />
        <div className="art-pin">
          <Icon name="pin" size={38} />
        </div>
        <div className="art-caption">
          <span>VOTRE PROCHAIN DÉCLIC</span>
          <strong>
            Un détail observé.
            <br />
            Un réflexe acquis.
          </strong>
          <p>Le bon repère, au bon moment.</p>
        </div>
        <span className="art-coordinate">48.9148° N &nbsp; 2.2851° E</span>
      </div>
    </div>
  );
}
function Auth({
  mode,
  onClose,
  onSuccess,
}: {
  mode: string;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}) {
  const [step, setStep] = useState(mode),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [name, setName] = useState(""),
    [otp, setOtp] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (step === "reset") {
        await api("/api/auth/email-otp/request-password-reset", "POST", {
          email,
        });
        setStep("reset-confirm");
        return;
      }
      if (step === "reset-confirm") {
        await api("/api/auth/email-otp/reset-password", "POST", {
          email,
          otp,
          password,
        });
        setStep("signin");
        setError("Mot de passe modifié. Connectez-vous.");
        setPassword("");
        return;
      }
      if (step === "verify") {
        await api("/api/auth/email-otp/verify-email", "POST", { email, otp });
        await api("/api/auth/sign-in/email", "POST", { email, password });
      } else {
        try {
          const signed = await api(
            step === "signup"
              ? "/api/auth/sign-up/email"
              : "/api/auth/sign-in/email",
            "POST",
            { email, password, ...(step === "signup" ? { name } : {}) },
          );
          if (signed.user?.emailVerified === false) {
            await api("/api/auth/email-otp/send-verification-otp", "POST", {
              email,
              type: "email-verification",
            });
            setStep("verify");
            return;
          }
        } catch (e) {
          if (
            /NOT_VERIFIED|vérifi|verified/i.test(
              (e as Error).message + " " + (e as any).code,
            )
          ) {
            await api("/api/auth/email-otp/send-verification-otp", "POST", {
              email,
              type: "email-verification",
            });
            setStep("verify");
            return;
          }
          throw e;
        }
      }
      await api("/session/finish", "POST", {});
      setPassword("");
      await onSuccess();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={
        step === "signup"
          ? "Créer mon compte"
          : step.startsWith("reset")
            ? "Réinitialiser le mot de passe"
            : step === "verify"
              ? "Vérifier mon adresse"
              : "Heureux de vous retrouver"
      }
      onClose={onClose}
    >
      <form onSubmit={submit} className="stack">
        <p className="muted">
          Utilisez les mêmes identifiants que dans l’application iPhone.
        </p>
        {step === "signup" && (
          <Field label="Votre nom">
            <input
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
        )}
        <Field label="Adresse e-mail">
          <input
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        {(step === "verify" || step === "reset-confirm") && (
          <Field label="Code reçu par e-mail">
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6,8}"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </Field>
        )}
        {step !== "reset" && (
          <Field
            label={
              step === "reset-confirm" ? "Nouveau mot de passe" : "Mot de passe"
            }
          >
            <input
              type="password"
              autoComplete={
                step === "signup" || step === "reset-confirm"
                  ? "new-password"
                  : "current-password"
              }
              required
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <Button type="submit" disabled={busy}>
          {busy
            ? "Connexion en cours…"
            : step === "signup"
              ? "Créer mon compte"
              : step === "reset"
                ? "Recevoir un code"
                : step === "reset-confirm"
                  ? "Changer mon mot de passe"
                  : step === "verify"
                    ? "Vérifier et me connecter"
                    : "Se connecter"}
        </Button>
        <div className="spread">
          <button
            type="button"
            className="text-btn"
            onClick={() => {
              setStep(step === "signup" ? "signin" : "signup");
              setError("");
            }}
          >
            {step === "signup" ? "J’ai déjà un compte" : "Créer un compte"}
          </button>
          <button
            type="button"
            className="text-btn"
            onClick={() => {
              setStep("reset");
              setError("");
            }}
          >
            Mot de passe oublié ?
          </button>
        </div>
        <p className="caption">
          Les nouveaux comptes sont des comptes élèves. Les accès enseignants
          sont attribués par l’administrateur.
        </p>
      </form>
    </Modal>
  );
}
function Pedagogy() {
  const { profile, login } = useApp();
  usePublishedCourses(api,!!profile);
  const {reading,quizzes,plan,busy,error,refresh,update}=useCourseProgress(profile);
  const [selectedId, setSelectedId] = useState(courses[0].id);
  const [onlyReview, setOnlyReview] = useState(false);
  const [view,setView]=useState("lessons");
  const count = courses.filter((c) => reading[c.id]?.read).length;
  const reviewCount = courses.filter((c) => reading[c.id]?.review).length;
  const visible = onlyReview ? courses.filter((c) => reading[c.id]?.review) : courses;
  const selected = visible.find((c) => c.id === selectedId) || visible[0] || courses[0];
  const groups = [
    ["C1", "C1 · Maîtriser le véhicule"],
    ["C2", "C2 · Circuler avec les autres"],
    ["Manœuvres", "Manœuvres"],
    ["Sécurité", "Sécurité et examen"],
  ];
  const position = courses.findIndex((c) => c.id === selected.id);
  function choose(id: string) { setSelectedId(id); }
  return (
    <div className="page pedagogy-page">
      <header className="pedagogy-heading">
        <span className="eyebrow">APPRENDRE AVEC LE REPÈRE</span>
        <h1>Fiches pédagogiques</h1>
        <p>Un objectif. Des étapes claires. À ton rythme.</p>
      </header>
      {profile && profile.role !== "student" && <nav className="course-tabs" aria-label="Espace pédagogique"><button aria-pressed={view==="lessons"} onClick={()=>setView("lessons")}>Les cours</button><button aria-pressed={view==="students"} onClick={()=>setView("students")}>Suivi des élèves</button></nav>}
      {view === "students" && profile?.role !== "student" ? <TeacherLessons /> : <>
      {error&&<p className="error" role="alert">{error} <button className="text-btn" onClick={refresh}>Réessayer</button></p>}
      {profile&&<details className="student-progress-menu"><summary>Mon suivi · {count} fiches lues</summary><StudyOverview reading={reading} quizzes={quizzes} plan={plan} choose={id=>{setOnlyReview(false);choose(id);}}/></details>}
      <section className="lesson-picker" aria-label="Choix de la fiche">
        <div className="lesson-picker-top">
          <label htmlFor="lesson-select">Choisis ton objectif</label>
          <span>{count} / {courses.length} fiches lues</span>
        </div>
        <select id="lesson-select" value={visible.length ? selected.id : ""}
          onChange={(e) => choose(e.target.value)}>
          <option value="" disabled>{visible.length ? "Choisir une fiche…" : "Aucune fiche à revoir"}</option>
          {groups.map(([value, label]) => (
            <optgroup key={value} label={label}>
              {visible.filter((c) => c.group === value).map((c) => (
                <option key={c.id} value={c.id}>{c.code} · {c.title}{reading[c.id]?.read ? " · Lu" : ""}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <label className="review-filter">
          <input type="checkbox" checked={onlyReview} onChange={(e) => {
            setOnlyReview(e.target.checked);
            if (e.target.checked) {
              const first = courses.find((c) => reading[c.id]?.review);
              if (first && !reading[selectedId]?.review) choose(first.id);
            }
          }} />
          Seulement mes fiches à revoir <span>({reviewCount})</span>
        </label>
      </section>
      {!visible.length ? <Empty title="Aucune fiche à revoir" icon="book">Décoche le filtre pour retrouver tous les objectifs.</Empty> : <article className="lesson-reader" key={selected.id} aria-labelledby="lesson-title">
        <header className="lesson-reader-heading">
          <div className="lesson-meta"><span>FICHE {selected.code}</span><span>{selected.minutes} min de lecture</span></div>
          <h2 id="lesson-title">{selected.title}</h2>
          <p>{selected.intro}</p>
        </header>
        <div className="lesson-objective"><span>Ton objectif</span><p>{selected.objective}</p></div>
        <ol className="lesson-instructions">
          {selected.steps.map((s, i) => (
            <li key={s.title}>
              <span className="instruction-number" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <div><h3>{s.title}</h3><p>{s.explanation}</p>
                <p className="instruction-why"><strong>Pourquoi ?</strong> {s.why}</p>
              </div>
            </li>
          ))}
        </ol>
        <section className="lesson-example"><h3>En situation</h3><p>{selected.example}</p></section>
        <details className="lesson-details lesson-caution">
          <summary>Les erreurs à éviter</summary>
          <ul>{selected.traps.map((t) => <li key={t}>{t}</li>)}</ul>
          <p>{selected.safety}</p>
        </details>
        <section className="lesson-takeaway"><span>Le repère à garder</span><p>{selected.takeaway}</p></section>
        <a className="lesson-video" href={selected.video.url} target="_blank" rel="noreferrer">
          <span className="lesson-video-icon"><Icon name="play" size={18} /></span>
          <span><strong>Voir la vidéo complémentaire</strong><small>{selected.video.title} · {selected.video.channel}</small></span>
          <Icon name="arrow" size={17} />
        </a>
        {selected.videoNote && <p className="lesson-video-note">{selected.videoNote}</p>}
        <details className="lesson-details lesson-references">
          <summary>Références et conseils de lecture</summary>
          <p>La démonstration complète la fiche. Adapte les repères à ta voiture avec ton enseignant ; les commandes et la boîte de vitesses peuvent différer.</p>
          <ul>{selected.references.map((id) => <li key={id}><a href={courseSources[id].url} target="_blank" rel="noreferrer">{courseSources[id].label} ↗</a></li>)}</ul>
        </details>
        <div className="lesson-reading-actions">
          <Button disabled={busy} icon="check" onClick={() => update(selected.id, { read: !reading[selected.id]?.read })}>
            {reading[selected.id]?.read ? "Fiche lue · Annuler" : "J’ai lu cette fiche"}
          </Button>
          <button disabled={busy} className={`lesson-review-button ${reading[selected.id]?.review ? "active" : ""}`}
            aria-pressed={!!reading[selected.id]?.review}
            onClick={() => update(selected.id, { review: !reading[selected.id]?.review })}>
            {reading[selected.id]?.review ? "À revoir · Retirer" : "Garder pour réviser"}
          </button>
        </div>
        <LessonQuiz key={selected.id} course={selected} profile={profile} onChanged={()=>void refresh()} onLogin={login}/>
        <nav className="lesson-pagination" aria-label="Navigation entre les fiches">
          <button disabled={position === 0} onClick={() => { setOnlyReview(false); choose(courses[position - 1].id); document.getElementById("lesson-select")?.focus(); }}>← Fiche précédente</button>
          <button disabled={position === courses.length - 1} onClick={() => { setOnlyReview(false); choose(courses[position + 1].id); document.getElementById("lesson-select")?.focus(); }}>Fiche suivante →</button>
        </nav>
      </article>}
      <footer className="pedagogy-footer">{profile ? (error ? "Le suivi n’est pas encore synchronisé. Réessaie avec une connexion stable." : "Ton suivi est enregistré dans ton espace connecté.") : "En découverte, ta lecture est enregistrée dans ce navigateur."} La maîtrise se travaille en voiture avec ton enseignant.</footer>
      </>}
    </div>
  );
}

type MapHandle = { map: maplibregl.Map | null; focus: (f: Fix[]) => void };
function MapCanvas({
  spots,
  route,
  recording,
  index = 0,
  pitch = 0,
  navigationMode = false,
  previewMode = false,
  onSpot,
  onPosition,
  handle,
  onReady,
  location,
}: {
  spots: MapSpot[];
  route: Route | null;
  recording: Fix[];
  index?: number;
  pitch?: number;
  navigationMode?: boolean;
  previewMode?: boolean;
  onSpot: (p: any) => void;
  onPosition: (p: { lat: number; lng: number }) => void;
  handle: React.MutableRefObject<MapHandle>;
  onReady?: () => void;
  location?: {lat:number;lng:number}|null;
}) {
  const root = useRef<HTMLDivElement>(null),
    mapRef = useRef<maplibregl.Map | null>(null),
    [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false),
    callbacks = useRef({ onSpot, onPosition, onReady }),
    resumeAt=useRef(0), lastBearing=useRef(0);
  callbacks.current = { onSpot, onPosition, onReady };
  useEffect(() => {
    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: root.current!,
        style: "https://tiles.openfreemap.org/styles/liberty",
        center: [2.2851, 48.9148],
        zoom: 13,
        pitch,
        attributionControl: { compact: true },
      });
      mapRef.current = map;
      const stopObserving = observeMapSize(root.current!, map);
      handle.current = {
        map,
        focus: (fixes) => {
          if (!fixes.length) return;
          const b = new maplibregl.LngLatBounds();
          fixes.forEach((f) => b.extend([f.lng, f.lat]));
          map.fitBounds(b, {
            padding: { top: 100, bottom: 150, left: 65, right: 65 },
            maxZoom: 16,
            duration: 700,
          });
        },
      };
      map.addControl(
        new maplibregl.NavigationControl({ showCompass: true }),
        "bottom-right",
      );
      map.on("load", () => {
        map.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "MultiLineString", coordinates: [] },
          },
        });
        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#672C3B", "line-width": 5 },
        });
        map.resize();
        setReady(true);
        callbacks.current.onReady?.();
      });
      map.on("dragstart",()=>{resumeAt.current=Date.now()+MAP_RECENTER_DELAY;});
      map.on("zoomstart",(e)=>{if(e.originalEvent)resumeAt.current=Date.now()+MAP_RECENTER_DELAY;});
      map.on("click", (e) =>
        callbacks.current.onPosition({ lng: e.lngLat.lng, lat: e.lngLat.lat }),
      );
      map.on("error", () => {
        if (!map.isStyleLoaded()) setFailed(true);
      });
      return () => {
        stopObserving();
        handle.current.map = null;
        map.remove();
      };
    } catch {
      setFailed(true);
    }
  }, []);
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    if(!previewMode)mapRef.current.easeTo({ pitch: navigationMode ? (pitch ? 80 : 0) : pitch, duration: 600 });
  }, [pitch, ready, navigationMode, previewMode]);
  useEffect(()=>{
    if(!ready||(!recording.length&&!location))return;
    const follow=()=>{if(previewMode)return;const f=recording.at(-1)||location;if(!f||Date.now()<resumeAt.current)return;const prev=recording.at(-2);if(navigationMode&&prev&&(f.lat!==prev.lat||f.lng!==prev.lng)){const rad=Math.PI/180;lastBearing.current=Math.atan2(Math.sin((f.lng-prev.lng)*rad)*Math.cos(f.lat*rad),Math.cos(prev.lat*rad)*Math.sin(f.lat*rad)-Math.sin(prev.lat*rad)*Math.cos(f.lat*rad)*Math.cos((f.lng-prev.lng)*rad))/rad;}mapRef.current?.easeTo({center:[f.lng,f.lat],zoom:navigationMode?18:Math.max(16,mapRef.current!.getZoom()),pitch:navigationMode?(pitch?80:0):pitch,bearing:navigationMode?lastBearing.current:mapRef.current!.getBearing(),duration:800,essential:true});};
    follow();const timer=setInterval(follow,1000);return()=>clearInterval(timer);
  },[ready,recording,location,navigationMode,previewMode,pitch]);
  useEffect(() => {
    if(!ready||!previewMode||recording.length<2)return;
    handle.current.focus(recording);
    mapRef.current?.easeTo({pitch:pitch?70:0,bearing:0,duration:700});
  },[ready,previewMode]);
  useEffect(() => {
    if (!ready) return;
    const m = mapRef.current!;
    const fixes = recording.length ? recording : route?.fixes || [];
    (m.getSource("route") as maplibregl.GeoJSONSource).setData({
      type: "Feature",
      properties: {},
      geometry: geometry(fixes),
    });
    if (route && !recording.length) handle.current.focus(route.fixes);
  }, [ready, route?.id, route?.version, recording]);
  useEffect(() => {
    if (!ready) return;
    const m = mapRef.current!,
      markers: maplibregl.Marker[] = [];
    const pts = [
      ...spots,
      ...(route?.points || []).filter((p) => !spots.some((s) => s.id === p.id)),
    ];
    for (const p of pts) {
      const b = document.createElement("button");
      b.className = `map-pin ${tone(p.category)}`;
      b.ariaLabel = p.name;
      b.textContent = p.category === "Priorité" ? "!" : "•";
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        callbacks.current.onSpot(p);
      });
      markers.push(
        new maplibregl.Marker({ element: b })
          .setLngLat([p.lng, p.lat])
          .addTo(m),
      );
    }
    return () => markers.forEach((x) => x.remove());
  }, [spots, route, ready]);
  useEffect(() => {
    if (!ready || !route) return;
    const f = route.fixes[index];
    if (!f) return;
    const b = document.createElement("div");
    b.className = "replay-dot";
    const marker = new maplibregl.Marker({ element: b })
      .setLngLat([f.lng, f.lat])
      .addTo(mapRef.current!);
    return () => {
      marker.remove();
    };
  }, [ready, route?.id, index]);
  return (
    <>
      <div
        ref={root}
        className="map-canvas"
        aria-label="Carte interactive des parcours et repères"
      />
      {failed && !ready && (
        <div className="map-failure">
          La carte ne peut pas s’afficher ici. Vérifiez votre connexion et la
          prise en charge de WebGL. Les parcours restent accessibles dans la
          liste.
        </div>
      )}
    </>
  );
}
const blankSpot = (pos: { lat: number; lng: number }): MapSpot => ({
  id: crypto.randomUUID(),
  name: "",
  category: "Priorité",
  ...pos,
  note: "",
  photos: [],
  status: "private",
  shareWithStudents: false,
  authorId: "",
});
function MapPage() {
  const { profile, notify } = useApp(),
    writer = profile?.role !== "student",
    handle = useRef<MapHandle>({ map: null, focus: () => {} });
  const [spots, setSpots] = useState<MapSpot[]>([]),
    [routes, setRoutes] = useState<RouteSummary[]>([]),
    [route, setRoute] = useState<Route | null>(null),
    [point, setPoint] = useState<any>(null),
    [editor, setEditor] = useState<MapSpot | null>(null),
    [placing,setPlacing] = useState(false),
    [routeEditor, setRouteEditor] = useState<Route | null>(null),
    [directory, setDirectory] = useState(!writer),
    [loading, setLoading] = useState(true),
    [loadError, setLoadError] = useState(""),
    [pitch, setPitch] = useState(70),
    [mapPos, setMapPos] = useState({ lat: 48.9148, lng: 2.2851 }),
    [category, setCategory] = useState("Toutes"),
    [index, setIndex] = useState(0),
    [playing, setPlaying] = useState(false),
    [player, setPlayer] = useState<"map" | "street" | null>(null),
    [search, setSearch] = useState(""),
    [center, setCenter] = useState("Tous les centres"),
    [difficulty, setDifficulty] = useState("Tous"),
    [favorites, setFavorites] = useState(false),
    [assign, setAssign] = useState<string | null>(null);
  const [cameraMode,setCameraMode]=useState<"pov"|"preview">("preview");
  const [gpsFollow,setGpsFollow]=useState(false),[gpsPosition,setGpsPosition]=useState<{lat:number;lng:number}|null>(null);

  const [rec, setRec] = useState<"idle" | "recording" | "paused">("idle"),
    [fixes, setFixes] = useState<Fix[]>([]),
    [recordPoints, setRecordPoints] = useState<Point[]>([]),
    [elapsed, setElapsed] = useState(0),
    [accuracy, setAccuracy] = useState<number | null>(null),
    [draft, setDraft] = useState<RouteInput | null>(null),
    [recovered, setRecovered] = useState(false),
    recRef = useRef(rec),
    fixRef = useRef<Fix[]>([]),
    segment = useRef(0),
    start = useRef(0),
    watch = useRef<number | undefined>(undefined),
    wake = useRef<any>(null);
  useEffect(()=>{if(!gpsFollow||rec!=="idle"||!navigator.geolocation)return;const id=navigator.geolocation.watchPosition(p=>{if(p.coords.accuracy<=100)setGpsPosition({lat:p.coords.latitude,lng:p.coords.longitude});},()=>{setGpsFollow(false);notify("Le suivi GPS nécessite l’autorisation de localisation.");},{enableHighAccuracy:true,maximumAge:3000,timeout:15000});return()=>navigator.geolocation.clearWatch(id);},[gpsFollow,rec]);
  recRef.current = rec;
  fixRef.current = fixes;
  const refreshing = useRef(false);
  const refresh = useCallback(async () => {
    if (refreshing.current) return;
    refreshing.current = true; setLoadError("");
    try {
      const [s, r] = await Promise.allSettled([
        api<{ spots: MapSpot[] }>("/v1/spots?summary=1"),
        api<{ routes: RouteSummary[] }>("/v1/routes"),
      ]);
      if (s.status === "fulfilled") setSpots(s.value.spots);
      if (r.status === "fulfilled") setRoutes(r.value.routes);
      setLoadError([s, r].filter(x=>x.status === "rejected").map(x=>(x as PromiseRejectedResult).reason.message).join(" "));
    } finally { refreshing.current=false; setLoading(false); }
  }, []);
  useContentSync(async()=>{
    await refresh();
    if (route) {
      try { const current=await api(`/v1/routes/${route.id}`); setRoute(current.route || current); }
      catch(e) { if ((e as any).status===404 || (e as any).status===403) {setRoute(null);setPlayer(null);notify("L’accès à ce parcours a été retiré.");} }
    }
  });
  useEffect(() => {
    void refresh();
    try {
      const saved = JSON.parse(
        localStorage.getItem(`repere.gps.${profile!.id}`) || "null",
      );
      if (saved?.fixes?.length) {
        setDraft(saved);
        setRecovered(true);
      }
    } catch {}
    return () => {
      if (watch.current !== undefined)
        navigator.geolocation.clearWatch(watch.current);
      void wake.current?.release();
    };
  }, []);
  useEffect(() => {
    if (rec === "idle") return;
    const t = setInterval(() => {
      if (recRef.current === "recording") setElapsed((v) => v + 1000);
    }, 1000);
    return () => clearInterval(t);
  }, [rec]);
  useEffect(() => {
    if (rec === "idle" || fixes.length < 2) return;
    const d = {
      id: crypto.randomUUID(),
      name: "Parcours enregistré",
      description: "",
      examCenter: "",
      difficulty: "Facile",
      status: "private",
      source: "gps",
      duration: elapsed,
      fixes,
      points: recordPoints,
      version: 0,
    };
    try {
      localStorage.setItem(`repere.gps.${profile!.id}`, JSON.stringify(d));
    } catch {
      notify("Le navigateur manque d’espace pour la sauvegarde locale.");
    }
  }, [fixes, elapsed, recordPoints]);
  useEffect(() => {
    if (!playing || !route) return;
    const t = setInterval(
      () =>
        setIndex((i) => {
          if (i >= route.fixes.length - 1) {
            setPlaying(false);
            return i;
          }
          return i + 1;
        }),
      700,
    );
    return () => clearInterval(t);
  }, [playing, route]);
  useEffect(() => {
    if (playing && route?.fixes[index]) {
      const f = route.fixes[index];
      handle.current.map?.easeTo({
        center: [f.lng, f.lat],
        bearing: route.fixes[index + 1]
          ? heading(f, route.fixes[index + 1])
          : undefined,
        pitch,
        duration: 650,
      });
    }
  }, [index, playing]);
  async function openRoute(id: string) {
    try {
      const r = await api<Route>(`/v1/routes/${id}`);
      setGpsFollow(false);setGpsPosition(null);
      setRoute(r);
      setIndex(r.progress || 0);
      setDirectory(false);
      setPlaying(false);
      handle.current.focus(r.fixes);
    } catch (e) {
      notify((e as Error).message);
    }
  }
  async function startRecording() {
    if (!navigator.geolocation) {
      notify("La géolocalisation n’est pas disponible dans ce navigateur.");
      return;
    }
    setFixes([]);
    setRecordPoints([]);
    setElapsed(0);
    segment.current = 0;
    start.current = Date.now();
    setRoute(null);
    setCameraMode("pov");
    setRec("recording");
    recRef.current = "recording";
    try {
      wake.current = await (navigator as any).wakeLock?.request("screen");
    } catch {}
    watch.current = navigator.geolocation.watchPosition(
      (p) => {
        setAccuracy(p.coords.accuracy);
        if (recRef.current !== "recording") return;
        const list = fixRef.current;
        const last = list.at(-1);
        if (last && p.timestamp - last.time > 20000) segment.current++;
        const f = acceptFix(
          last,
          {
            latitude: p.coords.latitude,
            longitude: p.coords.longitude,
            accuracy: p.coords.accuracy,
            timestamp: p.timestamp,
          },
          segment.current,
        );
        if (f.fix) {
          fixRef.current = [...list, f.fix];
          setFixes(fixRef.current);
          setMapPos({ lat: p.coords.latitude, lng: p.coords.longitude });

        }
      },
      (e) => {
        notify(
          e.code === 1
            ? "Autorisez la localisation pour enregistrer votre parcours."
            : "Position GPS indisponible. Placez-vous à l’extérieur.",
        );
        if (e.code === 1) {
          setRec("idle");
          if (watch.current !== undefined)
            navigator.geolocation.clearWatch(watch.current);
        }
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    );
  }
  function stopRecording() {
    if (fixes.length < 2) {
      notify(
        "Il faut au moins deux positions GPS valides pour conserver le parcours.",
      );
      return;
    }
    if (watch.current !== undefined)
      navigator.geolocation.clearWatch(watch.current);
    void wake.current?.release();
    setRec("idle");
    setDraft({
      id: crypto.randomUUID(),
      name: "Mon parcours",
      description: "",
      examCenter: "",
      difficulty: "Facile",
      status: "private",
      source: "gps",
      duration: elapsed,
      fixes,
      points: recordPoints,
      version: 0,
    });
    setFixes([]);
  }
  async function saveRoute(r: RouteInput) {
    const saved = await api<Route>(`/v1/routes/${r.id}`, "PUT", r);
    setRoute(saved);
    setDraft(null);
    setRouteEditor(null);
    setRecovered(false);
    localStorage.removeItem(`repere.gps.${profile!.id}`);
    await refresh();
    notify("Parcours enregistré dans votre espace.");
    return saved;
  }
  async function importFile(file: File) {
    try {
      if (file.size > 12 * 1024 * 1024)
        throw Error("Le fichier GPX est trop volumineux.");
      const imported = importGPX(await file.text(), () => crypto.randomUUID());
      setDraft(imported);
    } catch (e) {
      notify((e as Error).message);
    }
  }
  async function locate() {
    if(gpsFollow){setGpsFollow(false);setGpsPosition(null);return;}
    if (!navigator.geolocation) {
      notify("Localisation non disponible.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setMapPos({ lat: p.coords.latitude, lng: p.coords.longitude });
        setGpsPosition({lat:p.coords.latitude,lng:p.coords.longitude});setGpsFollow(true);
        handle.current.map?.flyTo({
          center: [p.coords.longitude, p.coords.latitude],
          zoom: 16,
        });
      },
      () =>
        notify("Autorisez la localisation dans les réglages du navigateur."),
      { enableHighAccuracy: true },
    );
  }
  async function chooseSpot(p: any) {
    try {
      const full = spots.some((s) => s.id === p.id)
        ? await api<MapSpot>(`/v1/spots/${p.id}`)
        : p;
      setPoint(full);
      if (spots.some((s) => s.id === p.id))
        void api(`/v1/spots/${p.id}/activity`, "POST", {
          eventId: crypto.randomUUID(),
          kind: "opened",
        }).catch(() => {});
    } catch (e) {
      notify((e as Error).message);
    }
  }
  const visibleRoutes = routes.filter((r) =>
    matchesRoute(r, {
      search,
      center,
      difficulty,
      category: "Toutes",
      favorites,
    }),
  );
  return (
    <div className={`map-page ${placing ? "placing-spot" : ""}`}>
      {!player && <MapCanvas
        spots={spots.filter(
          (s) => category === "Toutes" || s.category === category,
        )}
        route={route}
        recording={fixes}
        location={gpsFollow?gpsPosition:null}
        index={index}
        pitch={pitch}
        navigationMode={rec!=="idle"&&cameraMode==="pov"}
        previewMode={rec!=="idle"&&cameraMode==="preview"}
        onSpot={chooseSpot}
        onPosition={pos=>{setMapPos(pos);if(placing){setEditor(blankSpot(pos));setPlacing(false);}}}
        handle={handle}
      />}
      <div className="map-top">
        <div className="map-title">
          <span className="eyebrow">EXPLORER ET COMPRENDRE</span>
          <h1>Carte et parcours</h1>
        </div>
        <div className="map-actions">
          <button className="map-tool" onClick={refresh} disabled={loading} aria-label="Synchroniser les parcours et repères" title="Synchroniser"><Icon name="refresh" /></button>
          <button
            className="map-tool"
            onClick={() => setPitch((p) => (p ? 0 : 70))}
            aria-pressed={!!pitch}
          >
            {pitch ? "2D" : "3D"}
          </button>
          <button
            className="map-tool"
            onClick={locate}
            aria-label={gpsFollow?"Désactiver le suivi automatique":"Me localiser et activer le suivi automatique"}
            aria-pressed={gpsFollow}
          >
            <Icon name="locate" />
          </button>
          <button
            className="map-tool map-directory"
            onClick={() => setDirectory(true)}
          >
            <Icon name="map" />
            Les parcours <span>{routes.length}</span>
          </button>
        </div>
      </div>
      {!writer ? <label className="student-map-filter">Repères<select aria-label="Filtrer les repères" value={category} onChange={e=>setCategory(e.target.value)}><option value="Toutes">Tous les repères</option>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></label> :       <div className="map-filters filters">
        <button
          className={`chip ${category === "Toutes" ? "selected" : ""}`}
          onClick={() => setCategory("Toutes")}
        >
          Tous les repères
        </button>
        {categories.map((c) => (
          <button
            key={c}
            className={`chip ${tone(c)} ${category === c ? "selected" : ""}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      }
      {(loadError || loading) && (
        <div className="map-status">
          {loading ? (
            "Actualisation…"
          ) : (
            <>
              {loadError} <button onClick={refresh}>Réessayer</button>
            </>
          )}
        </div>
      )}
      {placing && <div className="map-placement" role="status"><strong>Touchez la carte à l’endroit du repère</strong><div className="row"><button className="btn secondary" onClick={()=>{const c=handle.current.map?.getCenter();setEditor(blankSpot(c?{lat:c.lat,lng:c.lng}:mapPos));setPlacing(false);}}>Utiliser le centre</button><button className="text-btn" onClick={()=>setPlacing(false)}>Annuler</button></div></div>}
      <div className="map-bottom" hidden={placing}>
        {route && (
          <div className="replay-panel">
            <div className="spread">
              <div>
                <Badge>{route.examCenter || "À classer"}</Badge>
                {route.status === "published" && <Badge color="green">Visible par les élèves</Badge>}
                <h3>{route.name}</h3>
              </div>
              <button
                className="icon-btn"
                onClick={() => {
                  setRoute(null);
                  setPlaying(false);
                }}
                aria-label="Fermer le parcours"
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="row">
              <button
                className="icon-btn solid"
                onClick={() => {setPlaying(false);setPlayer("map");}}
                aria-label={playing ? "Mettre en pause" : "Lire le parcours"}
              >
                <Icon name={playing ? "pause" : "play"} />
              </button>
              <input
                aria-label="Position dans le parcours"
                type="range"
                min="0"
                max={route.fixes.length - 1}
                value={index}
                onChange={(e) => {
                  setIndex(Number(e.target.value));
                  setPlaying(false);
                }}
                onPointerUp={() => {
                  void api(`/v1/routes/${route.id}/progress`, "POST", {
                    fixIndex: index,
                  }).catch((e) => notify(e.message));
                }}
              />
              <span className="caption">
                {index + 1}/{route.fixes.length}
              </span>
            </div>
            <div className="row wrap">
              <button
                className="text-btn"
                onClick={() => {setPlaying(false);setPlayer("street");}}
              >
                Street View <Icon name="arrow" size={15} />
              </button>
              <button
                className="text-btn"
                onClick={() => {
                  void api(`/v1/routes/${route.id}/favorite`, "POST", {
                    active: !route.favorite,
                  })
                    .then(() => {
                      setRoute({ ...route, favorite: !route.favorite });
                      void refresh();
                    })
                    .catch((e) => notify(e.message));
                }}
              >
                <Icon name="star" size={15} />
                {route.favorite ? "Favori" : "Ajouter aux favoris"}
              </button>
              {writer &&
                (profile?.role === "admin" ||
                  route.authorId === profile?.id) && (
                  <>
                    {route.status !== "published" && <button className="text-btn" onClick={async()=>{
                      try {await saveRoute({...route,status:"published",points:route.points.map(p=>({...p,shareWithStudents:true}))});notify("Parcours publié : les élèves peuvent le sélectionner.");}
                      catch(error){notify((error as Error).message);}
                    }}>Publier pour les élèves</button>}
                    {route.status === "published" && <button className="text-btn" onClick={async()=>{
                      try {await api(`/v1/routes/${route.id}/assignments`,"PUT",{students:[]});await saveRoute({...route,status:"private",points:route.points.map(p=>({...p,shareWithStudents:false}))});notify("Parcours passé en privé : accès élèves retiré.");}
                      catch(error){notify((error as Error).message);}
                    }}>Passer en privé</button>}
                    <button className="text-btn" onClick={() => setRouteEditor(route)}>Modifier le parcours</button>
                    <button
                      className="text-btn"
                      onClick={() => setAssign(route.id)}
                    >
                      Attribuer
                    </button>
                    <button
                      className="text-btn"
                      onClick={() => {
                        void api(`/v1/routes/${route.id}/duplicate`, "POST", {})
                          .then(() => {
                            notify("Parcours dupliqué.");
                            void refresh();
                          })
                          .catch((e) => notify(e.message));
                      }}
                    >
                      Dupliquer
                    </button>
                  </>
                )}
              <button
                className="text-btn"
                onClick={() =>
                  download(
                    "parcours.gpx",
                    exportGPX(route),
                    "application/gpx+xml",
                  )
                }
              >
                GPX <Icon name="download" size={14} />
              </button>
              <button className="text-btn" onClick={() => setDirectory(true)}>
                Repères du parcours
              </button>
            </div>
            <div className="point-strip">
              {route.points.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setIndex(p.fixIndex);
                    void chooseSpot(p);
                  }}
                >
                  <span className={`dot ${tone(p.category)}`} />
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}
        {rec !== "idle" ? (
          <div className="record-panel">
            <div className="row" role="group" aria-label="Mode d’affichage du trajet">
              <button type="button" className="map-tool" aria-pressed={cameraMode==="pov"} onClick={()=>setCameraMode("pov")}>Vue GPS</button>
              <button type="button" className="map-tool" aria-pressed={cameraMode==="preview"} onClick={()=>setCameraMode("preview")}>Aperçu complet</button>
            </div>
            <div className="spread">
              <div className="row">
                <span className={rec === "recording" ? "record-dot" : ""} />
                <strong>
                  {rec === "paused" ? "En pause" : "Enregistrement GPS"}
                </strong>
              </div>
              <strong>{fmt(elapsed)}</strong>
            </div>
            <div className="spread muted">
              <span>
                {km(totalDistance(fixes))} · {fixes.length} positions
              </span>
              <span>
                Précision{" "}
                {accuracy ? `± ${Math.round(accuracy)} m` : "en attente"}
              </span>
            </div>
            <div className="row">
              <Button
                secondary
                onClick={() => {
                  if (rec === "paused") {
                    segment.current++;
                    setRec("recording");
                  } else setRec("paused");
                }}
                icon={rec === "paused" ? "play" : "pause"}
              >
                {rec === "paused" ? "Reprendre" : "Pause"}
              </Button>
              <Button onClick={stopRecording} icon="check">
                Terminer
              </Button>
              <button
                className="icon-btn"
                aria-label="Ajouter un repère ici"
                onClick={() => setEditor(blankSpot(mapPos))}
              >
                <Icon name="plus" />
              </button>
            </div>
            <p className="caption">
              Gardez cette page ouverte et l’écran allumé. Le navigateur peut
              suspendre le GPS en arrière-plan.
            </p>
          </div>
        ) : (
          writer && (
            <div className="map-creation">
              <Button
                icon="plus"
                onClick={() => {setPlacing(true);setPlaying(false);}}
              >
                Ajouter un repère
              </Button>
              <Button secondary icon="locate" onClick={startRecording}>
                Enregistrer
              </Button>
            </div>
          )
        )}
      </div>
      {directory && (
        <Modal title="Les parcours" wide onClose={() => setDirectory(false)}>
          <div className="stack">
            <div className="row wrap">
              <div className="search grow">
                <Icon name="search" />
                <input
                  placeholder="Rechercher un parcours…"
                  aria-label="Rechercher un parcours"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {writer && (
                <label className="btn secondary">
                  <Icon name="plus" />
                  Importer GPX
                  <input
                    type="file"
                    accept=".gpx,application/gpx+xml"
                    hidden
                    onChange={(e) => {
                      if (e.target.files?.[0])
                        void importFile(e.target.files[0]);
                    }}
                  />
                </label>
              )}
            </div>
            <div className="row wrap">
              <Field label="Centre d’examen">
                <select
                  value={center}
                  onChange={(e) => setCenter(e.target.value)}
                >
                  <option>Tous les centres</option>
                  {directoryCenters(routes).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Difficulté">
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option>Tous</option>
                  {difficulties.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <button
                className={`chip amber ${favorites ? "selected" : ""}`}
                onClick={() => setFavorites((v) => !v)}
              >
                <Icon name="star" size={15} />
                Favoris
              </button>
            </div>
            {visibleRoutes.map((r) => (
              <button
                key={r.id}
                className="route-card"
                onClick={() => openRoute(r.id)}
              >
                <div className="row">
                  <span className="icon-disc">
                    <Icon name="map" />
                  </span>
                  <div className="grow">
                    <div className="row wrap">
                      <Badge color="blue">{r.examCenter || "À classer"}</Badge>
                      <Badge>{r.difficulty}</Badge>
                      {r.status === "published" && (
                        <Badge color="green">Publié</Badge>
                      )}
                    </div>
                    <h3>{r.name}</h3>
                    <p>
                      {km(r.distance)} · {Math.round(r.duration / 60000)} min ·{" "}
                      {r.pointCount} repères
                    </p>
                    <small>{r.authorName}</small>
                  </div>
                  <Icon name="arrow" />
                </div>
              </button>
            ))}
            {!visibleRoutes.length && (
              <Empty
                title={
                  loading
                    ? "Chargement des parcours…"
                    : "Aucun parcours disponible"
                }
              >
                Les parcours publiés par votre enseignant apparaîtront ici.
              </Empty>
            )}
            {loadError && <p className="error">{loadError}</p>}
            <p className="caption">
              Les parcours sont des exemples d’entraînement, pas des itinéraires
              officiels d’examen.
            </p>
          </div>
        </Modal>
      )}
      {player && route && <ReplayPlayer route={route} initialIndex={index} initialMode={player} autoplay={player === "map"} MapView={MapCanvas} notify={notify} onClose={()=>setPlayer(null)} onPoint={chooseSpot} onProgress={setIndex} />}
      {point && (
        <SpotDetails
          point={point}
          route={route}
          onClose={() => setPoint(null)}
          onEdit={() => {
            setEditor(point);
            setPoint(null);
          }}
          onChanged={() => {
            setPoint(null);
            void refresh();
            if (route) void openRoute(route.id);
          }}
        />
      )}
      {editor && (
        <SpotEditor
          initial={editor}
          onClose={() => setEditor(null)}
          onSave={async (s) => {
            await api(`/v1/spots/${s.id}`, "PUT", s);
            const routeFixes = rec !== "idle" ? fixes : route?.fixes;
            if (routeFixes?.length) {
              let nearest = 0,
                best = Infinity;
              routeFixes.forEach((f, i) => {
                const d = (f.lat - s.lat) ** 2 + (f.lng - s.lng) ** 2;
                if (d < best) {
                  best = d;
                  nearest = i;
                }
              });
              const p: Point = {
                id: s.id,
                name: s.name,
                category: s.category,
                lat: s.lat,
                lng: s.lng,
                fixIndex: nearest,
                question: s.quiz?.question || "",
                options: s.quiz?.options || ["Oui", "Non"],
                answer: s.quiz?.answer,
                explanation: s.quiz?.explanation || s.note,
                validated: !!s.quiz,
                photos: s.photos || [],
                shareWithStudents: s.shareWithStudents,
              };
              if (rec !== "idle")
                setRecordPoints((prev) => [
                  ...prev.filter((x) => x.id !== s.id),
                  p,
                ]);
              else if (
                route &&
                (profile!.role === "admin" || route.authorId === profile!.id)
              ) {
                try {
                  const updated = await api<Route>(`/v1/routes/${route.id}`,"PUT",{...route,points:[...route.points.filter(x=>x.id!==s.id),p]});
                  setRoute(updated);
                } catch(error) {
                  setEditor(null);await refresh();
                  notify(`Repère créé sur la carte. Son ajout au parcours a échoué : ${(error as Error).message}`);
                  return;
                }
              }
            }
            setEditor(null);
            await refresh();
            notify("Repère enregistré.");
          }}
        />
      )}
      {(draft || routeEditor) && (
        <RouteEditor
          initial={(draft || routeEditor)!}
          recovered={recovered}
          onClose={() => {
            setDraft(null);
            setRouteEditor(null);
          }}
          onSave={saveRoute}
          onDelete={
            routeEditor
              ? async () => {
                  await api(`/v1/routes/${routeEditor.id}`, "DELETE");
                  setRoute(null);
                  setRouteEditor(null);
                  await refresh();
                  notify("Parcours supprimé.");
                }
              : undefined
          }
        />
      )}{" "}
      {assign && (
        <Assignments id={assign} kind="route" onClose={() => setAssign(null)} />
      )}
    </div>
  );
}
function SpotDetails({
  point,
  route,
  onClose,
  onEdit,
  onChanged,
}: {
  point: any;
  route: Route | null;
  onClose: () => void;
  onEdit: () => void;
  onChanged: () => void;
}) {
  const { profile, notify } = useApp(),
    owns =
      profile?.role === "admin" ||
      point.authorId === profile?.id ||
      route?.authorId === profile?.id,
    [result, setResult] = useState<any>(null),
    [busy, setBusy] = useState(false),
    [photo, setPhoto] = useState<string | null>(null),
    [report, setReport] = useState(false),
    [street, setStreet] = useState(false);
  const quiz =
    point.quiz ||
    (point.validated
      ? { question: point.question, options: point.options }
      : null);
  async function answer(i: number) {
    setBusy(true);
    try {
      const r = await api(
        point.quiz
          ? `/v1/spots/${point.id}/quiz`
          : `/v1/routes/${route!.id}/quiz`,
        "POST",
        point.quiz
          ? {
              answer: i,
              attemptId: crypto.randomUUID(),
              version: point.quizVersion,
            }
          : { pointId: point.id, answer: i, attemptId: crypto.randomUUID() },
      );
      setResult(r);
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title={point.name} wide onClose={onClose}>
      <div className="stack">
        <div className="row">
          <Badge>{point.category}</Badge>
          {point.status === "published" && (
            <Badge color="green">Visible par les élèves</Badge>
          )}
        </div>
        <p>
          {point.note ||
            point.explanation ||
            "Consultez les photos et les indications de votre enseignant."}
        </p>
        <div className="photo-grid">
          {(point.photos || []).map((p: Photo) => (
            <button
              key={p.id}
              onClick={() => {
                setPhoto(p.dataUrl);
                if (point.authorId)
                  void api(`/v1/spots/${point.id}/activity`, "POST", {
                    eventId: crypto.randomUUID(),
                    kind: "photo_viewed",
                    photoId: p.id,
                  }).catch(() => {});
              }}
            >
              <img
                src={p.dataUrl}
                alt={p.caption || `Photo du repère ${point.name}`}
              />
            </button>
          ))}
        </div>
        {quiz && (
          <div className="callout blue">
            <h3>{quiz.question}</h3>
            <div className="stack">
              {quiz.options.map((o: string, i: number) => (
                <Button
                  key={i}
                  secondary
                  disabled={busy || !!result}
                  onClick={() => answer(i)}
                >
                  {o}
                </Button>
              ))}
            </div>
            {result && (
              <div role="status">
                <strong>
                  {result.correct ? "Bonne réponse !" : "Reprenons ce repère."}
                </strong>
                <p>{result.explanation}</p>
              </div>
            )}
          </div>
        )}
        <div className="row wrap">
          <Button secondary icon="eye" onClick={() => setStreet(true)}>
            Ouvrir Street View
          </Button>
          {owns && point.authorId && (
            <Button onClick={onEdit}>Modifier le repère</Button>
          )}
          <button className="text-btn" onClick={() => setReport(true)}>
            Signaler ce contenu
          </button>
        </div>
        {!owns && point.authorId && (
          <Button
            secondary
            onClick={async () => {
              try {
                await api(
                  `/v1/blocked-authors/${encodeURIComponent(point.authorId)}`,
                  "PUT",
                  { resourceId: point.id, kind: "spot" },
                );
                notify("Auteur bloqué.");
                onChanged();
              } catch (e) {
                notify((e as Error).message);
              }
            }}
          >
            Bloquer cet auteur
          </Button>
        )}
      </div>
      {photo && (
        <Modal
          title="Photographie du repère"
          wide
          onClose={() => setPhoto(null)}
        >
          <img className="full-photo" src={photo} alt={point.name} />
        </Modal>
      )}
      {report && (
        <Report
          kind={point.authorId ? "spot" : "route"}
          id={point.authorId ? point.id : route!.id}
          onClose={() => setReport(false)}
        />
      )}
      {street && <ReplayPlayer target={point} initialMode="street" MapView={MapCanvas} notify={notify} onClose={()=>setStreet(false)} />}
    </Modal>
  );
}
async function imagePhoto(file: File): Promise<Photo> {
  if (!/^image\//.test(file.type)) throw Error("Choisissez une photographie.");
  const url = URL.createObjectURL(file);
  try {
    const im = new Image();
    im.src = url;
    await im.decode();
    const ratio = Math.min(1, 1280 / Math.max(im.width, im.height)),
      canvas = document.createElement("canvas");
    canvas.width = Math.round(im.width * ratio);
    canvas.height = Math.round(im.height * ratio);
    canvas.getContext("2d")!.drawImage(im, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
    if (dataUrl.length > 1400000)
      throw Error(
        "Cette photo est trop volumineuse. Choisissez une image plus petite.",
      );
    return {
      id: crypto.randomUUID(),
      dataUrl,
      width: canvas.width,
      height: canvas.height,
      caption: file.name.slice(0, 300),
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}
function SpotEditor({
  initial,
  onClose,
  onSave,
}: {
  initial: MapSpot;
  onClose: () => void;
  onSave: (s: MapSpot) => Promise<void>;
}) {
  const [s, setS] = useState(initial),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [quiz, setQuiz] = useState(!!s.quiz);
  const patch = (p: Partial<MapSpot>) => setS((v) => ({ ...v, ...p }));
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSave({ ...s, quiz: quiz ? s.quiz : null });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={initial.name ? "Modifier le repère" : "Un nouveau repère"}
      wide
      onClose={onClose}
    >
      <form className="stack spot-editor-form" onSubmit={submit}>
        <Field label="Nom du repère">
          <input
            required
            maxLength={120}
            value={s.name}
            onChange={(e) => patch({ name: e.target.value })}
          />
        </Field>
        <div className="spot-location-row">
          <Field label="Catégorie">
            <select
              value={s.category}
              onChange={(e) => patch({ category: e.target.value as any })}
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Latitude">
            <input
              type="number"
              step="any"
              min="-90"
              max="90"
              required
              value={s.lat}
              onChange={(e) => patch({ lat: Number(e.target.value) })}
            />
          </Field>
          <Field label="Longitude">
            <input
              type="number"
              step="any"
              min="-180"
              max="180"
              required
              value={s.lng}
              onChange={(e) => patch({ lng: Number(e.target.value) })}
            />
          </Field>
        </div>
        <Field label="Explication pédagogique">
          <textarea
            maxLength={3000}
            rows={4}
            value={s.note}
            onChange={(e) => patch({ note: e.target.value })}
          />
        </Field>
        <div className="photo-grid">
          {s.photos?.map((p) => (
            <div key={p.id}>
              <img src={p.dataUrl} alt="Photo du repère" />
              <button
                type="button"
                className="text-btn"
                onClick={() =>
                  patch({ photos: s.photos!.filter((x) => x.id !== p.id) })
                }
              >
                Retirer
              </button>
            </div>
          ))}
        </div>
        <label className="btn secondary">
          <Icon name="plus" />
          Ajouter des photos · {s.photos?.length || 0}/6
          <input
            hidden
            type="file"
            accept="image/*"
            multiple
            onChange={async (e) => {
              try {
                const files = Array.from(e.target.files || []).slice(
                  0,
                  6 - (s.photos?.length || 0),
                );
                const photos = await Promise.all(files.map(imagePhoto));
                patch({ photos: [...(s.photos || []), ...photos] });
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          />
        </label>
        <label className="checkline">
          <input
            type="checkbox"
            checked={s.status === "published"}
            onChange={(e) =>
              patch({
                status: e.target.checked ? "published" : "private",
                shareWithStudents: e.target.checked,
              })
            }
          />
          <span>Publier · visible par les élèves</span>
        </label>
        <label className="checkline">
          <input
            type="checkbox"
            checked={quiz}
            onChange={(e) => {
              setQuiz(e.target.checked);
              if (!s.quiz)
                patch({
                  quiz: {
                    question: "",
                    options: ["", ""],
                    answer: 0,
                    explanation: "",
                  },
                });
            }}
          />
          Ajouter une question quiz
        </label>
        {quiz && s.quiz && (
          <div className="callout blue stack">
            <Field label="Question">
              <input
                required
                maxLength={1000}
                value={s.quiz.question}
                onChange={(e) =>
                  patch({ quiz: { ...s.quiz!, question: e.target.value } })
                }
              />
            </Field>
            {s.quiz.options.map((o, i) => (
              <Field key={i} label={`Réponse ${i + 1}`}>
                <input
                  required
                  maxLength={300}
                  value={o}
                  onChange={(e) =>
                    patch({
                      quiz: {
                        ...s.quiz!,
                        options: s.quiz!.options.map((x, j) =>
                          i === j ? e.target.value : x,
                        ),
                      },
                    })
                  }
                />
              </Field>
            ))}
            <Field label="Bonne réponse">
              <select
                value={s.quiz.answer || 0}
                onChange={(e) =>
                  patch({
                    quiz: { ...s.quiz!, answer: Number(e.target.value) },
                  })
                }
              >
                {s.quiz.options.map((o, i) => (
                  <option key={i} value={i}>
                    Réponse {i + 1}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Explication de la réponse">
              <textarea
                required
                maxLength={3000}
                value={s.quiz.explanation || ""}
                onChange={(e) =>
                  patch({ quiz: { ...s.quiz!, explanation: e.target.value } })
                }
              />
            </Field>
          </div>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <Button type="submit" disabled={busy}>
          {busy ? "Enregistrement…" : "Enregistrer le repère"}
        </Button>
        {initial.authorId && (
          <DeleteAction
            label="Archiver ce repère"
            description="Ce repère ne sera plus visible dans les parcours ni sur la carte des élèves."
            action={async () => {
              await api(`/v1/spots/${s.id}/archive`, "POST", {});
              onClose();
              location.reload();
            }}
          />
        )}
      </form>
    </Modal>
  );
}
function RouteEditor({
  initial,
  recovered,
  onClose,
  onSave,
  onDelete,
}: {
  initial: RouteInput;
  recovered?: boolean;
  onClose: () => void;
  onSave: (r: RouteInput) => Promise<any>;
  onDelete?: () => Promise<void>;
}) {
  const [r, setR] = useState(initial),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <Modal
      title={
        recovered
          ? "Reprendre le parcours sauvegardé"
          : "Enregistrer et publier le parcours"
      }
      onClose={onClose}
    >
      <form
        className="stack"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await onSave(r);
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <p className="muted">
          {km(totalDistance(r.fixes))} · {r.fixes.length} positions GPS ·{" "}
          {r.points.length} repères
        </p>
        <Field label="Nom du parcours">
          <input
            required
            maxLength={120}
            value={r.name}
            onChange={(e) => setR({ ...r, name: e.target.value })}
          />
        </Field>
        <Field label="Centre d’examen">
          <input
            maxLength={100}
            placeholder="Ex. : Gennevilliers"
            value={r.examCenter || ""}
            onChange={(e) => setR({ ...r, examCenter: e.target.value })}
          />
        </Field>
        <Field label="Description">
          <textarea
            rows={3}
            maxLength={3000}
            value={r.description}
            onChange={(e) => setR({ ...r, description: e.target.value })}
          />
        </Field>
        <Field label="Difficulté">
          <select
            value={r.difficulty}
            onChange={(e) => setR({ ...r, difficulty: e.target.value as any })}
          >
            {difficulties.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <label className="checkline">
          <input
            type="checkbox"
            checked={r.status === "published"}
            onChange={(e) =>
              setR({ ...r, status: e.target.checked ? "published" : "private" })
            }
          />
          Publier · visible par les élèves
        </label>
        <p className="caption">
          Un parcours privé est visible par son auteur, l’administrateur et les
          élèves auxquels il est attribué.
        </p>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <Button type="submit" disabled={busy} icon="check">
          {busy
            ? "Enregistrement…"
            : r.status === "published"
              ? "Enregistrer et publier"
              : "Enregistrer en privé"}
        </Button>
        {onDelete && (
          <DeleteAction
            label="Supprimer ce parcours"
            description="Ce parcours, ses repères associés et ses attributions seront supprimés pour tous les appareils."
            action={onDelete}
          />
        )}
      </form>
    </Modal>
  );
}
function Assignments({
  id,
  kind,
  onClose,
}: {
  id: string;
  kind: "route" | "video";
  onClose: () => void;
}) {
  const { notify } = useApp(),
    [students, setStudents] = useState<any[]>([]),
    [selected, setSelected] = useState<string[]>([]),
    [published, setPublished] = useState(false),
    [audience,setAudience] = useState<"private"|"all"|"selected">("private"),
    [busy, setBusy] = useState(true),
    [error, setError] = useState("");
  const path =
    kind === "route"
      ? `/v1/routes/${id}/assignments`
      : `/v1/videos/${id}/grants`;
  useEffect(() => {
    void Promise.all([api("/v1/students"), api(path)])
      .then(([s, g]) => {
        setStudents(s.students);
        setSelected(g.students);
        setPublished(!!g.published);
        setAudience(g.published ? (g.students.length===s.students.length && s.students.length ? "all" : "selected") : "private");
      })
      .catch((e) => setError(e.message))
      .finally(() => setBusy(false));
  }, []);
  return (
    <Modal
      title={
        kind === "route" ? "Attribuer ce parcours" : "Partager cette vidéo"
      }
      onClose={onClose}
    >
      <div className="stack">
        {kind === "video" ? <>
          <Field label="Qui peut voir cette vidéo ?"><select value={audience} disabled={busy} onChange={e=>{const a=e.target.value as typeof audience;setAudience(a);setPublished(a!=="private");}}>
            <option value="private">Privé · moi uniquement</option>
            <option value="all">Tous mes élèves actuels</option>
            <option value="selected">Élèves sélectionnés</option>
          </select></Field>
          <p className="caption">La publication donne accès aux élèves connectés. Vous pouvez retirer cet accès à tout moment.</p>
        </> : <p className="muted">Choisissez les élèves autorisés.</p>}
        {(kind === "route" || audience === "selected") && students.map((s) => (
          <label className="checkline" key={s.id}>
            <input
              type="checkbox"
              checked={selected.includes(s.id)}
              onChange={(e) =>
                setSelected(
                  e.target.checked
                    ? [...selected, s.id]
                    : selected.filter((x) => x !== s.id),
                )
              }
            />
            <span>
              <strong>{s.name}</strong>
              <small>{s.email}</small>
            </span>
          </label>
        ))}
        {!busy && !students.length && (
          <Empty title="Aucun élève lié">
            Créez une invitation depuis Mon espace.
          </Empty>
        )}
        {error && <p className="error">{error}</p>}
        <Button
          disabled={busy || !!error || (kind === "video" && audience === "selected" && !selected.length)}
          onClick={async () => {
            setBusy(true);
            try {
              await api(path, "PUT", {
                students: kind === "video" && audience === "all" ? students.map(s=>s.id) : selected,
                ...(kind === "video" ? { published } : {}),
              });
              notify("Accès enregistrés.");
              onClose();
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          Enregistrer les accès
        </Button>
      </div>
    </Modal>
  );
}

type Video = {
  id: string;
  author_id: string;
  author_name: string;
  title: string;
  state: string;
  visibility: string;
  bytes: number;
  route_name: string | null;
  route_id: string | null;
  live_status: string;
  created_at: string;
};
async function videoStore(
  mode: "readonly" | "readwrite",
  fn: (s: IDBObjectStore) => IDBRequest,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("repere-web-private", 1);
    req.onupgradeneeded = () =>
      req.result.createObjectStore("videos", { keyPath: "key" });
    req.onerror = () => reject(Error("Stockage local indisponible."));
    req.onsuccess = () => {
      const db = req.result,
        tx = db.transaction("videos", mode),
        r = fn(tx.objectStore("videos"));
      let value: any;
      r.onsuccess = () => {
        value = r.result;
      };
      tx.oncomplete = () => {
        db.close();
        resolve(value);
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    };
  });
}
async function localClip(owner: string, id: string) {
  return videoStore("readonly", (s) => s.get(`${owner}:${id}`));
}
function Videos() {
  const [livePublisher,setLivePublisher]=useState(false);
  const { profile, notify } = useApp(),
    writer = profile?.role !== "student",
    [videos, setVideos] = useState<Video[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [importing, setImporting] = useState(false),
    [capture, setCapture] = useState(false),
    [live, setLive] = useState<Video | null>(null),
    [newLive, setNewLive] = useState(false),
    [sharing, setSharing] = useState<string | null>(null),
    [player, setPlayer] = useState<{
      id: string;
      url: string;
      title: string;
      local?: boolean;
    } | null>(null),
    [progress, setProgress] = useState<Record<string, number>>({}),
    [config, setConfig] = useState<any>(null),
    [report, setReport] = useState<string | null>(null);
  const refreshingVideos=useRef(false), activePlayback=useRef(player), activeLive=useRef(live);
  activePlayback.current=player;activeLive.current=live;
  const refresh = useCallback(async () => {
    if(refreshingVideos.current)return;
    refreshingVideos.current=true;
    setError("");
    try {
      const [v, c] = await Promise.allSettled([api("/v1/videos"), api("/v1/videos/config")]);
      if (v.status === "fulfilled") {
        const available:Video[]=v.value.videos;
        setVideos(available);
        if(activePlayback.current && !available.some(v=>v.id===activePlayback.current?.id)) {
          if(activePlayback.current.local)URL.revokeObjectURL(activePlayback.current.url);
          setPlayer(null);notify("L’accès à cette vidéo a été retiré.");
        }
        if(activeLive.current && !available.some(v=>v.id===activeLive.current?.id))setLive(null);
      }
      if (c.status === "fulfilled") setConfig(c.value);
      const errors=[v,c].filter(x=>x.status === "rejected");
      if (errors.length) setError(errors.map(x=>(x as PromiseRejectedResult).reason.message).join(" "));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      refreshingVideos.current=false;
      setLoading(false);
    }
  }, []);
  useContentSync(refresh);
  useEffect(() => {
    void refresh();

  }, []);
  async function attach(file: File, title?: string) {
    setImporting(true);
    try {
      if (!/\.(mp4|mov|m4v)$/i.test(file.name))
        throw Error(
          "Le cloud accepte les vidéos MP4 et MOV. Téléchargez la capture WebM sur votre appareil si votre navigateur ne produit pas de MP4.",
        );
      if (!file.size) throw Error("Le fichier vidéo est vide.");
      const created = await api("/v1/videos", "POST", {
        title: title || file.name.replace(/\.[^.]+$/, "").slice(0, 120),
      });
      await videoStore("readwrite", (s) =>
        s.put({
          key: `${profile!.id}:${created.id}`,
          blob: file,
          name: file.name,
        }),
      );
      setCapture(false);
      await refresh();
      if(config?.uploadEnabled) await upload({...created,title:title||file.name} as Video);
      else notify("Vidéo conservée dans ce navigateur. Le stockage distant n’est pas encore disponible.");
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setImporting(false);
    }
  }
  async function play(v: Video) {
    try {
      const local = await localClip(profile!.id, v.id);
      if (local) {
        setPlayer({
          id: v.id,
          url: URL.createObjectURL(local.blob),
          title: v.title,
          local: true,
        });
        return;
      }
      const p = await api(`/v1/videos/${v.id}/playback`);
      setPlayer({ id:v.id, url: p.url, title: v.title });
    } catch (e) {
      notify((e as Error).message);
    }
  }
  async function upload(v: Video) {
    setProgress((p) => ({ ...p, [v.id]: 0 }));
    try {
      const local = await localClip(profile!.id, v.id);
      if (!local)
        throw Error(
          "La copie locale se trouve sur l’appareil qui a importé cette vidéo. Utilisez cet appareil ou importez un nouveau fichier.",
        );
      if (!config?.uploadEnabled)
        throw Error(config?.message || "Partage cloud indisponible.");
      if (local.blob.size > config.maxFileBytes)
        throw Error(
          "La limite cloud est de 500 Mio par vidéo. La copie locale est conservée.",
        );
      if (v.state === "uploading")
        await api(`/v1/videos/${v.id}/retry`, "POST", {});
      const mime = /\.mov$/i.test(local.name) ? "video/quicktime" : "video/mp4";
      const ticket = await api(`/v1/videos/${v.id}/upload`, "POST", {
        bytes: local.blob.size,
        mimeType: mime,
      });
      await new Promise<void>((resolve, reject) => {
        const x = new XMLHttpRequest();
        x.open("PUT", ticket.uploadUrl);
        Object.entries(ticket.headers as Record<string, string>).forEach(
          ([k, val]) => {
            if (!/^content-length$/i.test(k)) x.setRequestHeader(k, val);
          },
        );
        x.upload.onprogress = (e) => {
          if (e.lengthComputable)
            setProgress((p) => ({
              ...p,
              [v.id]: Math.round((e.loaded / e.total) * 95),
            }));
        };
        x.onload = () =>
          x.status >= 200 && x.status < 300
            ? resolve()
            : reject(
                Error(
                  `Envoi interrompu (${x.status}). La copie locale est conservée.`,
                ),
              );
        x.onerror = () =>
          reject(
            Error(
              "Envoi au stockage refusé ou interrompu. La copie reste dans ce navigateur.",
            ),
          );
        x.timeout = 600000;
        x.ontimeout = () =>
          reject(Error("Envoi trop long. La copie locale est conservée."));
        x.send(local.blob);
      });
      await api(`/v1/videos/${v.id}/complete`, "POST", {});
      notify("Vidéo envoyée. Choisissez maintenant qui peut la voir.");
      await refresh();
      setSharing(v.id);
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setProgress((p) => {
        const n = { ...p };
        delete n[v.id];
        return n;
      });
    }
  }
  return (
    <div className="page">
      <header className="page-heading">
        <div>
          <span className="eyebrow">REVOIR POUR MIEUX COMPRENDRE</span>
          <h1>
            Vidéos<span className="title-dot">.</span>
          </h1>
          <p>Vos parcours en images, et vos leçons en direct.</p>
        </div>
        <span className="header-icon">
          <Icon name="video" size={27} />
        </span>
      </header>
      {writer && (
        <section className="video-tools">
          <div>
            <Badge color="paper">VOTRE REGARD D’ENSEIGNANT</Badge>
            <h2>
              Le réel devient
              <br />
              un support de cours.
            </h2>
            <p>
              Capturez une situation, importez un parcours
              <br />
              ou partagez un direct avec vos élèves.
            </p>
          </div>
          <div className="stack">
            <Button icon="video" onClick={() => setCapture(true)}>
              Capturer une vidéo
            </Button>
            <label className="btn secondary">
              <Icon name="plus" />
              {importing ? "Import en cours…" : "Importer une vidéo"}
              <input
                disabled={importing}
                hidden
                type="file"
                accept="video/mp4,video/quicktime,.mov,.m4v"
                onChange={(e) => {
                  if (e.target.files?.[0]) void attach(e.target.files[0]);
                  e.target.value = "";
                }}
              />
            </label>
            <Button secondary icon="play" onClick={() => setNewLive(true)}>
              Lancer un direct
            </Button>
          </div>
        </section>
      )}
      {writer&&<MetaConnection/>}
      <div className="section-heading">
        <div>
          <h2>Votre vidéothèque</h2>
          <p>
            {videos.length} vidéo{videos.length > 1 ? "s" : ""} · Mise à jour automatique
          </p>
        </div>
        <button
          className="icon-btn"
          onClick={refresh}
          aria-label="Actualiser les vidéos"
        >
          <Icon name="refresh" />
        </button>
      </div>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="video-grid">
        {videos.map((v) => (
          <article key={v.id} className="video-card">
            <button
              className="video-cover"
              aria-label={`Lire ${v.title}`}
              onClick={() => {setLivePublisher(false);v.live_status === "live" ? setLive(v) : void play(v);}}
            >
              <span className="video-play">
                <Icon name="play" size={26} />
              </span>
              <span className="video-state">
                {v.live_status === "live" ? (
                  <Badge color="red">● EN DIRECT</Badge>
                ) : (
                  <Badge color="paper">
                    {v.state === "ready"
                      ? "Replay disponible"
                      : v.state === "uploading"
                        ? "Envoi à reprendre"
                        : "Copie sur l’appareil d’origine"}
                  </Badge>
                )}
              </span>
              <span className="video-lines" />
            </button>
            <div className="video-info">
              <h3>{v.title}</h3>
              <p>
                {v.route_name || "Séance pédagogique"} · {v.author_name}
              </p>
              <div className="spread">
                <small>
                  {new Date(v.created_at).toLocaleDateString("fr-FR")}
                </small>
                <Badge
                  color={v.visibility === "students" ? "green" : "neutral"}
                >
                  {v.visibility === "students" ? "Visible par les élèves autorisés" : "Privée"}
                </Badge>
              </div>
              {v.author_id === profile?.id && (
                <div className="row wrap video-controls">
                  {v.state !== "ready" && (
                    <Button
                      secondary
                      disabled={v.id in progress}
                      onClick={() => upload(v)}
                    >
                      {v.id in progress
                        ? `Envoi ${progress[v.id]} %`
                        : "Envoyer dans le cloud"}
                    </Button>
                  )}
                  {v.state === "ready" && (
                    <button
                      className="text-btn"
                      onClick={() => setSharing(v.id)}
                    >
                      {v.visibility === "students" ? "Modifier la visibilité" : "Publier pour les élèves"}
                    </button>
                  )}
                </div>
              )}
              {v.author_id === profile?.id && v.visibility === "students" && v.live_status !== "live" && <button className="text-btn" onClick={async()=>{
                try { const grants=await api(`/v1/videos/${v.id}/grants`);await api(`/v1/videos/${v.id}/grants`,"PUT",{students:grants.students,published:false});await refresh();notify("Vidéo passée en privé."); }
                catch(e){notify((e as Error).message);}
              }}>Passer en privé</button>}
              {v.author_id === profile?.id && v.live_status !== "live" && (
                <DeleteAction
                  label="Supprimer cette vidéo"
                  description="La vidéo et ses accès seront supprimés. La suppression s’applique aussi à l’application iPhone."
                  action={async () => {
                    await api(`/v1/videos/${v.id}`, "DELETE");
                    await videoStore("readwrite", (s) =>
                      s.delete(`${profile!.id}:${v.id}`),
                    );
                    await refresh();
                    notify("Vidéo supprimée.");
                  }}
                />
              )}
              <button className="text-btn" onClick={() => setReport(v.id)}>
                Signaler
              </button>
            </div>
          </article>
        ))}
      </div>
      {!videos.length && !error && (
        <Empty
          icon="video"
          title={
            loading
              ? "Chargement des vidéos…"
              : "Les images font aussi apprendre."
          }
        >
          {writer
            ? "Importez une première vidéo ou lancez un direct."
            : "Les vidéos et les directs partagés avec vous apparaîtront ici."}
        </Empty>
      )}
      <div className="callout neutral">
        <strong>Depuis vos lunettes Meta</strong>
        <p>
          Importez ici les vidéos exportées depuis l’application Meta AI. La
          connexion matérielle directe aux lunettes est disponible dans
          l’application iPhone. Les vidéos conservées uniquement sur un appareil
          doivent être envoyées dans le cloud pour être visibles sur les autres.
        </p>
      </div>
      {capture && <Capture onClose={() => setCapture(false)} onSave={attach} />}{" "}
      {player && (
        <Modal
          title={player.title}
          wide
          onClose={() => {
            if (player.local) URL.revokeObjectURL(player.url);
            setPlayer(null);
          }}
        >
          <VideoPlayer key={player.url} src={player.url} onError={()=>notify("Ce navigateur ne peut pas lire ce format vidéo. Essayez le MP4 H.264.")}/>
        </Modal>
      )}
      {sharing && (
        <Assignments
          kind="video"
          id={sharing}
          onClose={() => {setSharing(null);void refresh();}}
        />
      )}{" "}
      {newLive && (
        <NewLive
          onClose={() => setNewLive(false)}
          onStart={(v) => {
            setNewLive(false);
            setLivePublisher(true);
            setLive(v);
            void refresh();
          }}
        />
      )}
      {live && (
        <LivePlayer
          publish={livePublisher}
          video={live}
          onClose={() => {
            setLive(null);
            void refresh();
          }}
        />
      )}
      {report && (
        <Report kind="video" id={report} onClose={() => setReport(null)} />
      )}
    </div>
  );
}
function Capture({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (f: File, title?: string) => Promise<void>;
}) {
  const { notify } = useApp(),
    preview = useRef<HTMLVideoElement>(null),
    stream = useRef<MediaStream | null>(null),
    recorder = useRef<MediaRecorder | null>(null),
    chunks = useRef<Blob[]>([]),
    [state, setState] = useState("idle"),
    [clip, setClip] = useState<Blob | null>(null),
    [url, setUrl] = useState(""),
    [title, setTitle] = useState("Mon parcours filmé"),
    [error, setError] = useState("");
  useEffect(
    () => () => {
      stream.current?.getTracks().forEach((t) => t.stop());
      if (recorder.current?.state !== "inactive") recorder.current?.stop();
    },
    [],
  );
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  async function start() {
    try {
      if (
        !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === "undefined"
      )
        throw Error(
          "La capture vidéo n’est pas disponible ici. Importez une vidéo depuis votre appareil.",
        );
      const mime = [
        "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
        "video/mp4",
        "video/webm;codecs=vp8,opus",
        "video/webm",
      ].find((m) => MediaRecorder.isTypeSupported(m));
      if (!mime)
        throw Error(
          "Ce navigateur ne propose pas de format de capture compatible.",
        );
      stream.current = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });
      preview.current!.srcObject = stream.current;
      await preview.current!.play();
      chunks.current = [];
      const r = new MediaRecorder(stream.current, {
        mimeType: mime,
        videoBitsPerSecond: 2500000,
      });
      r.ondataavailable = (e) => {
        if (e.data.size) chunks.current.push(e.data);
      };
      r.onerror = () => {
        setError("La capture a été interrompue.");
        stream.current?.getTracks().forEach((t) => t.stop());
      };
      r.onstop = () => {
        const b = new Blob(chunks.current, { type: r.mimeType });
        setClip(b);
        setUrl(URL.createObjectURL(b));
        setState("ready");
        stream.current?.getTracks().forEach((t) => t.stop());
        if (preview.current) preview.current.srcObject = null;
      };
      recorder.current = r;
      r.start(1000);
      setState("recording");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Modal title="Capturer une vidéo" wide onClose={onClose}>
      <div className="stack">
        <Field label="Titre de la vidéo">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
          />
        </Field>
        <video
          ref={preview}
          className="video-player"
          muted
          autoPlay
          playsInline
          controls={state === "ready"}
          src={url || undefined}
        />
        {error && <p className="error">{error}</p>}
        {state === "idle" ? (
          <Button icon="video" onClick={start}>
            Activer la caméra et commencer
          </Button>
        ) : state === "recording" ? (
          <Button danger onClick={() => recorder.current?.stop()}>
            Terminer l’enregistrement
          </Button>
        ) : (
          <div className="row wrap">
            <Button
              secondary
              icon="download"
              onClick={() =>
                download(
                  `${title}.${clip!.type.includes("mp4") ? "mp4" : "webm"}`,
                  clip!,
                )
              }
            >
              Télécharger ma vidéo
            </Button>
            {clip?.type.includes("mp4") ? (
              <Button
                onClick={() =>
                  onSave(
                    new File([clip], `${title}.mp4`, { type: "video/mp4" }),
                    title,
                  )
                }
              >
                Conserver dans ma vidéothèque
              </Button>
            ) : (
              <p className="caption">
                Ce navigateur enregistre en WebM. Téléchargez votre vidéo puis
                convertissez-la en MP4 pour le partage cloud.
              </p>
            )}
          </div>
        )}
        <p className="caption">
          Gardez cet écran ouvert pendant la capture. La vidéo n’est envoyée à
          vos élèves que lorsque vous la partagez.
        </p>
      </div>
    </Modal>
  );
}
function NewLive({
  onClose,
  onStart,
}: {
  onClose: () => void;
  onStart: (v: Video) => void;
}) {
  const { notify } = useApp(),
    [students, setStudents] = useState<any[]>([]),
    [selected, setSelected] = useState<string[]>([]),
    [title, setTitle] = useState("Parcours en direct"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [enabled, setEnabled] = useState(false);
  useEffect(() => {
    void Promise.all([api("/v1/students"), api("/v1/webrtc/config")])
      .then(([s, c]) => {
        setStudents(s.students);
        setEnabled(c.enabled);
        if (!c.enabled) setError(c.message);
      })
      .catch((e) => setError(e.message));
  }, []);
  return (
    <Modal title="Un parcours en direct" onClose={onClose}>
      <form
        className="stack"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          let created: any;
          try {
            if (!navigator.mediaDevices?.getUserMedia)
              throw Error("Caméra indisponible sur ce navigateur.");
            const permission = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true,
            });
            permission.getTracks().forEach((t) => t.stop());
            created = await api("/v1/videos", "POST", { title });
            await api(`/v1/videos/${created.id}/webrtc/start`, "POST", {
              students: selected,
            });
            onStart({ ...created, title } as Video);
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field label="Titre du direct">
          <input
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <p className="muted">
          Jusqu’à 10 élèves liés à votre compte. Seuls les élèves sélectionnés
          pourront rejoindre le direct.
        </p>
        {students.length>0 && <button type="button" className="text-btn" onClick={()=>setSelected(students.slice(0,10).map(s=>s.id))}>Sélectionner les {Math.min(10,students.length)} élèves</button>}
        {students.map((s) => (
          <label className="checkline" key={s.id}>
            <input
              type="checkbox"
              disabled={!selected.includes(s.id) && selected.length >= 10}
              checked={selected.includes(s.id)}
              onChange={(e) =>
                setSelected(
                  e.target.checked
                    ? [...selected, s.id]
                    : selected.filter((x) => x !== s.id),
                )
              }
            />
            {s.name}
          </label>
        ))}
        {!students.length && (
          <p className="caption">
            Invitez d’abord vos élèves depuis Mon espace.
          </p>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <Button
          type="submit"
          disabled={busy || !enabled || !selected.length}
          icon="video"
        >
          {busy ? "Préparation du direct…" : "Démarrer le direct"}
        </Button>
      </form>
    </Modal>
  );
}
function LivePlayer({ video, onClose, publish=false }: { video: Video; onClose: () => void; publish?:boolean }) {
  const { notify } = useApp(),
    root = useRef<HTMLDivElement>(null),
    room = useRef<Room | null>(null),
    publisher = useRef(false),
    [status, setStatus] = useState("Connexion au direct…"),
    [error, setError] = useState("");
  useEffect(() => {
    let disposed = false,
      timer: any;
    const r = new Room({ adaptiveStream: true, dynacast: true });
    room.current = r;
    const attach = (track: any) => {
      const el = track.attach();
      el.autoplay = true;
      el.playsInline = true;
      if (publisher.current || track.kind === Track.Kind.Video) el.muted = true;
      if (track.kind === Track.Kind.Video) el.className = "video-player";
      root.current?.appendChild(el);
    };
    r.on(RoomEvent.TrackSubscribed, attach);
    r.on(RoomEvent.AudioPlaybackStatusChanged,()=>{if(!r.canPlaybackAudio)setStatus("Direct connecté · touchez Activer le son");});
    r.on(RoomEvent.Reconnecting,()=>setStatus("Reconnexion au direct…"));
    r.on(RoomEvent.Reconnected,()=>setStatus("Direct connecté"));
    r.on(RoomEvent.TrackUnsubscribed, (track) =>
      track.detach().forEach((e) => e.remove()),
    );
    r.on(RoomEvent.Disconnected, () => {
      if (!disposed) setStatus("Le direct est terminé.");
    });
    void (async () => {
      try {
        const t = await api(`/v1/videos/${video.id}/webrtc/join`, "POST", {mode:publish?"publish":"watch"});
        publisher.current = t.publisher;
        if (disposed) return;
        await r.connect(t.url, t.token);
        if (disposed) {
          await r.disconnect();
          return;
        }
        if (t.publisher) {
          await api(`/v1/videos/${video.id}/webrtc/heartbeat`, "POST", {});
        }
        let failures=0;
        timer=setInterval(()=>{
          void (t.publisher ? api(`/v1/videos/${video.id}/webrtc/heartbeat`,"POST",{}) : api(`/v1/videos/${video.id}/webrtc/status`))
            .then(s=>{failures=0;if(!t.publisher&&!s.active){void r.disconnect();setStatus("Le direct est terminé.");}})
            .catch(e=>{failures++;if([401,403,404,409].includes(e.status)||failures>=3){void r.disconnect();setStatus("Accès au direct terminé.");}else setStatus("Connexion instable · nouvelle tentative…");});
        },t.publisher?10000:5000);
        if (t.publisher) {
          await r.localParticipant.setCameraEnabled(true, {
            facingMode: "environment",
          });
          await r.localParticipant.setMicrophoneEnabled(true);
          r.localParticipant.videoTrackPublications.forEach((p) => {
            if (p.track) attach(p.track);
          });
        }
        setStatus(
          t.publisher ? "Vous êtes en direct" : "Direct privé · Connecté",
        );
      } catch (e) {
        clearInterval(timer);
        setError((e as Error).message);
        if (publisher.current)
          void api(`/v1/videos/${video.id}/webrtc/stop`, "POST", {}).catch(
            () => {},
          );
        r.disconnect();
      }
    })();
    return () => {
      disposed = true;
      clearInterval(timer);
      r.disconnect();
      if (publisher.current)
        void api(`/v1/videos/${video.id}/webrtc/stop`, "POST", {}).catch(
          () => {},
        );
      root.current?.replaceChildren();
    };
  }, []);
  return (
    <Modal title={video.title} wide onClose={onClose}>
      <div className="stack">
        <div className="row">
          <Badge color="red">● DIRECT PRIVÉ</Badge>
          <span role="status">{status}</span>
        </div>
        <div ref={root} className="live-container" />
        {error && <p className="error">{error}</p>}
        <Button
          secondary
          onClick={async () => {
            await room.current?.startAudio();
            notify("Son activé.");
          }}
        >
          Activer le son
        </Button>
        <Button danger onClick={onClose}>
          {publisher.current ? "Terminer le direct" : "Quitter le direct"}
        </Button>
        <p className="caption">
          La diffusion s’arrête lorsque vous quittez cet écran. Le direct n’est
          pas enregistré automatiquement.
        </p>
      </div>
    </Modal>
  );
}
function Report({
  kind,
  id,
  onClose,
}: {
  kind: string;
  id: string;
  onClose: () => void;
}) {
  const { notify } = useApp(),
    [reason, setReason] = useState("inappropriate"),
    [details, setDetails] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <Modal title="Signaler ce contenu" onClose={onClose}>
      <form
        className="stack"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await api("/v1/reports", "POST", {
              kind,
              resourceId: id,
              reason,
              details,
            });
            notify("Signalement transmis à l’administrateur.");
            onClose();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field label="Motif">
          <select value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="inappropriate">Contenu inapproprié</option>
            <option value="privacy">Vie privée</option>
            <option value="dangerous">Situation dangereuse</option>
            <option value="other">Autre</option>
          </select>
        </Field>
        <Field label="Précisions">
          <textarea
            maxLength={1000}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </Field>
        {error && <p className="error">{error}</p>}
        <Button type="submit" disabled={busy}>
          Envoyer le signalement
        </Button>
      </form>
    </Modal>
  );
}
function Account() {
  const { profile, notify, reload, logout } = useApp(),
    [name, setName] = useState(profile!.name),
    [users, setUsers] = useState<any[]>([]),
    [progress, setProgress] = useState<any[]>([]),
    [stats, setStats] = useState<any>(null),
    [blocked, setBlocked] = useState<any[]>([]),
    [reports, setReports] = useState<any[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [create, setCreate] = useState(false),
    [invite, setInvite] = useState(""),
    [code, setCode] = useState(""),
    [inspect, setInspect] = useState<any>(null);
  const [teachingView,setTeachingView]=useState("profile");
  const refreshing = useRef(false);
  async function refresh() {
    if (refreshing.current) return;
    refreshing.current=true;setError("");
    const tasks: [string, string, (value: any) => void][] = [
      ["Progression", "/v1/progress", value=>setProgress(value.progress)],
      ["Statistiques", "/v1/learning/stats", setStats],
      ["Blocages", "/v1/blocked-authors", value=>setBlocked(value.authors)],
    ];
    if (profile!.role !== "student") tasks.push(["Comptes", profile!.role === "admin" ? "/v1/users" : "/v1/students", value=>setUsers(value.students)]);
    if (profile!.role === "admin") tasks.push(["Signalements", "/v1/moderation/reports", value=>setReports(value.reports)]);
    try {
      const results=await Promise.allSettled(tasks.map(async ([,path,apply])=>apply(await api(path))));
      setError(results.flatMap((r,i)=>r.status === "rejected" ? [`${tasks[i][0]} : ${r.reason.message}`] : []).join(" "));
    } finally {refreshing.current=false;setLoading(false);}
  }
  useEffect(() => {
    void refresh();
    const resume=()=>{if(document.visibilityState === "visible")void refresh();};
    window.addEventListener("online",resume);document.addEventListener("visibilitychange",resume);
    return ()=>{window.removeEventListener("online",resume);document.removeEventListener("visibilitychange",resume);};
  }, [profile!.id,profile!.role]);
  async function run(fn: () => Promise<any>, message?: string) {
    setBusy(true);
    try {
      await fn();
      if (message) notify(message);
      await refresh();
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if(profile!.role!=="student"&&teachingView!=="profile")return <div className="page"><header className="page-heading"><div><span className="eyebrow">ESPACE ENSEIGNANT</span><h1>{teachingView==="students"?"Mes élèves":"Mon planning"}</h1></div></header><nav className="course-tabs" aria-label="Espace enseignant"><button onClick={()=>setTeachingView("profile")}>Mon espace</button><button aria-pressed={teachingView==="students"} onClick={()=>setTeachingView("students")}>Statistiques élèves</button><button aria-pressed={teachingView==="schedule"} onClick={()=>setTeachingView("schedule")}>Planning</button></nav>{teachingView==="students"?<StudentDashboard/>:<TeacherSchedule userId={profile!.id}/>}</div>;
  return (
    <div className="page">
      <header className="page-heading">
        <div>
          <span className="eyebrow">VOTRE ESPACE, VOTRE PROGRESSION</span>
          <h1>
            Mon espace<span className="title-dot">.</span>
          </h1>
          <p>Tout ce qui vous accompagne sur la route.</p>
        </div>
        <span className="header-icon">
          <Icon name="user" size={27} />
        </span>
      </header>
      {profile!.role!=="student"&&<nav className="course-tabs" aria-label="Administration et enseignement"><button onClick={()=>setTeachingView("students")}>Statistiques par élève</button><button onClick={()=>setTeachingView("schedule")}>Planning enseignant</button></nav>}
      <div className="account-grid">
        <section className="panel">
          <div className="row">
            <span className="avatar large">{profile!.name.charAt(0)}</span>
            <div>
              <h2>{profile!.name}</h2>
              <p>{profile!.email}</p>
              <Badge color="neutral">{roleLabel(profile!.role)}</Badge>
            </div>
          </div>
          <form
            className="stack"
            onSubmit={(e) => {
              e.preventDefault();
              void run(async () => {
                await api("/v1/me", "PATCH", { name });
                await reload();
              }, "Profil mis à jour.");
            }}
          >
            <Field label="Votre nom">
              <input
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Button secondary type="submit" disabled={busy}>
              Enregistrer mon profil
            </Button>
          </form>
          <div className="divider" />
          <div className="row wrap">
            <a
              className="text-btn"
              href="/privacy"
              target="_blank"
              rel="noreferrer"
            >
              Confidentialité
            </a>
            <a
              className="text-btn"
              href="/terms"
              target="_blank"
              rel="noreferrer"
            >
              Conditions
            </a>
            <a
              className="text-btn"
              href="/support"
              target="_blank"
              rel="noreferrer"
            >
              Assistance
            </a>
          </div>
          <Button
            secondary
            icon="logout"
            onClick={() => {
              void logout().catch((e) => notify(e.message));
            }}
          >
            Se déconnecter
          </Button>
          <p className="caption">
            Le site et l’application utilisent le même compte et les mêmes
            permissions.
          </p>
        </section>
        <section className="panel">
          <div className="spread">
            <h2>Mes repères acquis</h2>
            <Icon name="book" />
          </div>
          <p className="muted">Consultations et quiz · 30 derniers jours</p>
          {loading ? (
            <p>Chargement…</p>
          ) : (
            <>
              <div className="stat-grid">
                <div>
                  <strong>{Number(stats?.totals?.views || 0)}</strong>
                  <span>consultations</span>
                </div>
                <div>
                  <strong>{Number(stats?.totals?.attempts || 0)}</strong>
                  <span>réponses quiz</span>
                </div>
                <div>
                  <strong>{Number(stats?.totals?.firstCorrect || 0)}</strong>
                  <span>bonnes réponses</span>
                </div>
              </div>
              {progress.map((p) => (
                <div key={p.id} className="progress-item">
                  <strong>{p.name}</strong>
                  <progress value={p.fix_index + 1} max={p.fixes} />
                  <small>
                    {p.correct}/{p.attempts} réponses correctes
                  </small>
                </div>
              ))}
              {!progress.length && (
                <p className="caption">
                  Votre progression apparaîtra après la lecture de vos premiers
                  parcours.
                </p>
              )}
            </>
          )}
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
        </section>
      </div>
      {profile!.role === "student" ? (
        <section className="panel">
          <h2>Rejoindre mon enseignant</h2>
          <p className="muted">
            Saisissez le code d’invitation transmis par votre auto-école.
          </p>
          <form
            className="row wrap"
            onSubmit={(e) => {
              e.preventDefault();
              void run(async () => {
                await api("/v1/invitations/claim", "POST", { code });
                setCode("");
              }, "Votre compte est rattaché à votre enseignant.");
            }}
          >
            <input
              required
              minLength={12}
              maxLength={30}
              placeholder="Code d’invitation"
              aria-label="Code d’invitation"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
            <Button type="submit" disabled={busy}>
              Rejoindre
            </Button>
          </form>
        </section>
      ) : (
        <section className="panel">
          <div className="section-heading">
            <div>
              <h2>
                {profile!.role === "admin"
                  ? "Comptes et permissions"
                  : "Mes élèves"}
              </h2>
              <p>
                {users.length} compte{users.length > 1 ? "s" : ""}
              </p>
            </div>
            <div className="row wrap">
              <Button
                secondary
                onClick={() => {
                  void run(async () => {
                    const i = await api("/v1/invitations", "POST", {});
                    setInvite(i.code);
                  });
                }}
              >
                Créer une invitation
              </Button>
              <Button icon="plus" onClick={() => setCreate(true)}>
                Créer un compte
              </Button>
            </div>
          </div>
          {invite && (
            <div className="callout green">
              <strong>Code d’invitation</strong>
              <p className="invitation-code">{invite}</p>
              <p>
                Transmettez ce code à votre élève. Il le saisira dans son espace
                personnel.
              </p>
            </div>
          )}
          <div className="users-list">
            {users.map((u) => (
              <div className="user-row" key={u.id}>
                <span className="avatar">{u.name.charAt(0)}</span>
                <span className="grow">
                  <strong>{u.name}</strong>
                  <small>{u.email}</small>
                </span>
                {profile!.role === "admin" && u.id !== profile!.id ? (
                  <select
                    aria-label={`Rôle de ${u.name}`}
                    value={u.role}
                    disabled={busy}
                    onChange={(e) => {
                      const role = e.target.value;
                      void run(
                        () =>
                          api(
                            `/v1/users/${encodeURIComponent(u.id)}/role`,
                            "PATCH",
                            { role },
                          ),
                        "Rôle enregistré. Une reconnexion sera demandée à cet utilisateur.",
                      );
                    }}
                  >
                    <option value="student">Élève</option>
                    <option value="teacher">Enseignant</option>
                    <option value="admin">Administrateur</option>
                  </select>
                ) : (
                  <Badge color="neutral">{roleLabel(u.role)}</Badge>
                )}
              </div>
            ))}
          </div>
          {!users.length && (
            <Empty icon="user" title="Vos élèves vous attendent">
              Créez un compte ou partagez une invitation.
            </Empty>
          )}
        </section>
      )}
      {blocked.length > 0 && (
        <section className="panel">
          <h2>Auteurs bloqués</h2>
          {blocked.map((b) => (
            <div key={b.id} className="spread">
              <span>{b.name}</span>
              <button
                className="text-btn"
                onClick={() =>
                  run(
                    () =>
                      api(
                        `/v1/blocked-authors/${encodeURIComponent(b.id)}`,
                        "DELETE",
                      ),
                    "Auteur débloqué.",
                  )
                }
              >
                Débloquer
              </button>
            </div>
          ))}
        </section>
      )}
      {profile!.role === "admin" && (
        <section className="panel">
          <h2>Modération des contenus</h2>
          {reports.length ? (
            reports.map((r) => (
              <div className="report-row" key={r.id}>
                <Badge color="red">{r.kind}</Badge>
                <span className="grow">
                  {r.reason}
                  <small>{r.details}</small>
                </span>
                <button
                  className="text-btn"
                  onClick={() =>
                    run(async () =>
                      setInspect(
                        await api(`/v1/moderation/reports/${r.id}/content`),
                      ),
                    )
                  }
                >
                  Consulter
                </button>
                <button
                  className="text-btn"
                  disabled={busy}
                  onClick={() =>
                    run(
                      () =>
                        api(`/v1/moderation/reports/${r.id}/resolve`, "POST", {
                          action: "hide",
                        }),
                      "Contenu masqué.",
                    )
                  }
                >
                  Masquer
                </button>
                <button
                  className="text-btn"
                  disabled={busy}
                  onClick={() =>
                    run(
                      () =>
                        api(`/v1/moderation/reports/${r.id}/resolve`, "POST", {
                          action: "dismiss",
                        }),
                      "Signalement classé.",
                    )
                  }
                >
                  Classer
                </button>
              </div>
            ))
          ) : (
            <p className="muted">Aucun signalement en attente.</p>
          )}
        </section>
      )}
      <section className="panel discreet">
        <h3>Gérer mes données</h3>
        <p>
          La suppression du compte concerne aussi votre accès dans l’application
          iPhone.
        </p>
        <DeleteAction
          label="Supprimer mon compte"
          description="Votre compte et vos données applicatives seront supprimés. Cette action concerne également l’application iPhone et ne peut pas être annulée."
          confirmation
          action={async () => {
            await api("/v1/me", "DELETE", { confirmation: "SUPPRIMER" });
            localStorage.removeItem(`repere.gps.${profile!.id}`);
            localStorage.removeItem(`repere.reading.web.${profile!.id}`);
            const clips = await videoStore("readonly", (s) => s.getAll()).catch(
              () => [],
            );
            for (const clip of clips.filter((c: any) =>
              c.key.startsWith(profile!.id + ":"),
            ))
              await videoStore("readwrite", (s) => s.delete(clip.key));
            await logout();
          }}
        />
      </section>
      {create && (
        <CreateUser
          onClose={() => setCreate(false)}
          onSaved={() => {
            setCreate(false);
            void refresh();
          }}
        />
      )}
      {inspect && (
        <Modal title={inspect.title} wide onClose={() => setInspect(null)}>
          <p>{inspect.text}</p>
          {inspect.points?.map((p: any, i: number) => (
            <div key={i}>
              <h3>{p.name}</h3>
              <p>{p.explanation}</p>
            </div>
          ))}
          <div className="photo-grid">
            {inspect.photos?.map((p: any, i: number) => (
              <img key={i} src={p.dataUrl} alt="Contenu signalé" />
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
function CreateUser({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const { profile, notify } = useApp(),
    [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [role, setRole] = useState("student"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <Modal title="Créer un compte" onClose={onClose}>
      <form
        className="stack"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await api("/v1/users", "POST", { name, email, role });
            notify(
              "Espace créé. Cette personne doit maintenant s’inscrire avec cette même adresse pour activer son compte.",
            );
            onSaved();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field label="Nom">
          <input
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Adresse e-mail">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Rôle">
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">Élève</option>
            {profile!.role === "admin" && (
              <option value="teacher">Enseignant</option>
            )}
          </select>
        </Field>
        <p className="caption">
          Vous préparez son espace. L’utilisateur choisira son propre mot de
          passe lors de l’inscription.
        </p>
        {error && <p className="error">{error}</p>}
        <Button type="submit" disabled={busy}>
          Créer cet espace
        </Button>
      </form>
    </Modal>
  );
}
function DeleteAction({
  label,
  description,
  action,
  confirmation = false,
}: {
  label: string;
  description: string;
  action: () => Promise<void>;
  confirmation?: boolean;
}) {
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [text, setText] = useState(""),
    [error, setError] = useState("");
  return (
    <>
      <button
        className="text-btn delete-link"
        type="button"
        onClick={() => setOpen(true)}
      >
        {label}
      </button>
      {open && (
        <Modal
          title={label}
          onClose={() => {
            if (!busy) setOpen(false);
          }}
        >
          <div className="stack">
            <p>{description}</p>
            {confirmation && (
              <Field label="Écrivez SUPPRIMER pour confirmer">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  autoComplete="off"
                />
              </Field>
            )}
            {error && <p className="error">{error}</p>}
            <Button
              danger
              disabled={busy || (confirmation && text !== "SUPPRIMER")}
              onClick={async () => {
                setBusy(true);
                try {
                  await action();
                  setOpen(false);
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Suppression en cours…" : label}
            </Button>
            <Button secondary disabled={busy} onClick={() => setOpen(false)}>
              Annuler
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
class Boundary extends React.Component<
  { children: React.ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="page">
        <h1>Une interruption inattendue</h1>
        <p>
          Rechargez la page pour retrouver votre espace. Les enregistrements
          locaux sont conservés.
        </p>
        <Button onClick={() => location.reload()}>Recharger</Button>
      </div>
    ) : (
      this.props.children
    );
  }
}
createRoot(document.getElementById("root")!).render(
  <Boundary>
    <App />
  </Boundary>,
);
