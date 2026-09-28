/** Decorative, self-contained road illustration. No external image or tracking request. */
export default function DriveVisual({ paused }: { paused: boolean }) {
  return <div className="wd-drive-art" data-paused={paused} aria-hidden="true">
    <div className="wd-art-orbit wd-art-orbit-one" /><div className="wd-art-orbit wd-art-orbit-two" />
    <div className="wd-art-heading"><span>LE SENS DU PARCOURS</span><strong>Un cap.<br />Votre autonomie.</strong></div>
    <svg className="wd-route-art" viewBox="0 0 600 620" fill="none" focusable="false">
      <defs>
        <linearGradient id="wd-road-surface" x1="130" y1="90" x2="480" y2="610" gradientUnits="userSpaceOnUse"><stop stopColor="#2A4B60" /><stop offset="1" stopColor="#102B3E" /></linearGradient>
        <linearGradient id="wd-car-metal" x1="-37" y1="-75" x2="40" y2="70" gradientUnits="userSpaceOnUse"><stop stopColor="#F6F3ED" /><stop offset=".35" stopColor="#CED9DE" /><stop offset=".68" stopColor="#8198A6" /><stop offset="1" stopColor="#E3EBEC" /></linearGradient>
        <linearGradient id="wd-car-glass" x1="-25" y1="-30" x2="28" y2="40" gradientUnits="userSpaceOnUse"><stop stopColor="#173D54" /><stop offset="1" stopColor="#071B29" /></linearGradient>
      </defs>
      <path d="M490 680V482c0-58-41-89-102-89H242c-81 0-139-55-139-132 0-79 62-139 141-139h51c53 0 84-40 84-91V-50" stroke="#041825" strokeWidth="112" opacity=".4" transform="translate(0 18)" />
      <path d="M490 680V482c0-58-41-89-102-89H242c-81 0-139-55-139-132 0-79 62-139 141-139h51c53 0 84-40 84-91V-50" stroke="#486476" strokeWidth="106" />
      <path d="M490 680V482c0-58-41-89-102-89H242c-81 0-139-55-139-132 0-79 62-139 141-139h51c53 0 84-40 84-89V-50" stroke="url(#wd-road-surface)" strokeWidth="102" />
      <path className="wd-road-markers" d="M490 680V482c0-58-41-89-102-89H242c-81 0-139-55-139-132 0-79 62-139 141-139h51c53 0 84-40 84-91V-50" stroke="#D7B98E" strokeWidth="2" strokeDasharray="13 18" opacity=".68" />
      <g transform="translate(251 388) rotate(90)">
        <ellipse cy="11" rx="44" ry="81" fill="#03131E" opacity=".6" />
        <rect x="-40" y="-46" width="11" height="29" rx="4" fill="#071B29" /><rect x="29" y="-46" width="11" height="29" rx="4" fill="#071B29" />
        <rect x="-40" y="32" width="11" height="29" rx="4" fill="#071B29" /><rect x="29" y="32" width="11" height="29" rx="4" fill="#071B29" />
        <path d="M-32-61Q-27-76 0-77 27-76 32-61L36 43Q35 65 23 72H-23Q-35 65-36 43Z" fill="url(#wd-car-metal)" stroke="#E9EEEC" strokeWidth="1.1" />
        <path d="M-25-25Q0-38 25-25L29-4H-29Z" fill="url(#wd-car-glass)" /><path d="M-24 7H24L25 38Q0 48-25 38Z" fill="url(#wd-car-glass)" />
        <path d="M-20-55Q0-61 20-55M-27 47Q0 58 27 47" stroke="#8CA2AE" strokeWidth="1.3" />
        <path d="M-27-57L-29-44M27-57L29-44" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M-28 61H-16M16 61H28" stroke="#D7B98E" strokeWidth="3" strokeLinecap="round" />
        <path d="M-32-14L-41-11V-3L-32-5M32-14L41-11V-3L32-5" fill="#CAD7DC" /><path d="M0-67V-42" stroke="#FFFFFF" opacity=".5" />
      </g>
      <circle cx="380" cy="45" r="8" fill="#D7B98E" /><circle cx="380" cy="45" r="17" stroke="#D7B98E" opacity=".35" />
    </svg>
    <div className="wd-art-note"><span className="wd-art-dot" /><div><small>À CHAQUE ÉTAPE</small><strong>Vous savez où vous allez.</strong></div></div>
    <div className="wd-art-bottom"><span>WEBEDRIVE / AUTO-ÉCOLE</span><span>ASNIÈRES-SUR-SEINE</span></div>
  </div>;
}
