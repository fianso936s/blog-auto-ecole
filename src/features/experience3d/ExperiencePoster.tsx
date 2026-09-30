type PosterVariant = "desktop" | "mobile";

function PosterArtwork({ variant }: { variant: PosterVariant }) {
  const mobile = variant === "mobile";
  return <svg
    className="wd-experience-poster-art"
    viewBox={mobile ? "0 0 640 800" : "0 0 900 760"}
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient id={`wd-poster-bg-${variant}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#153D58" />
        <stop offset=".72" stopColor="#0B2A3D" />
        <stop offset="1" stopColor="#092435" />
      </linearGradient>
      <linearGradient id={`wd-poster-road-${variant}`} x1=".15" y1="0" x2=".85" y2="1">
        <stop offset="0" stopColor="#657986" />
        <stop offset=".5" stopColor="#516675" />
        <stop offset="1" stopColor="#394F5E" />
      </linearGradient>
      <linearGradient id={`wd-poster-body-${variant}`} x1=".15" y1="0" x2=".85" y2="1">
        <stop offset="0" stopColor="#2A5B78" />
        <stop offset=".35" stopColor="#153D58" />
        <stop offset=".78" stopColor="#0F3046" />
        <stop offset="1" stopColor="#244D66" />
      </linearGradient>
      <linearGradient id={`wd-poster-glass-${variant}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#405C6C" />
        <stop offset=".55" stopColor="#243844" />
        <stop offset="1" stopColor="#101F28" />
      </linearGradient>
      <radialGradient id={`wd-poster-light-${variant}`} cx=".34" cy=".23" r=".72">
        <stop offset="0" stopColor="#F6F3ED" stopOpacity=".34" />
        <stop offset=".38" stopColor="#D7B98E" stopOpacity=".08" />
        <stop offset="1" stopColor="#D7B98E" stopOpacity="0" />
      </radialGradient>
      <filter id={`wd-poster-shadow-${variant}`} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation={mobile ? "14" : "18"} />
      </filter>
    </defs>

    <rect width="100%" height="100%" rx={mobile ? "28" : "32"} fill={`url(#wd-poster-bg-${variant})`} />
    <rect width="100%" height="100%" rx={mobile ? "28" : "32"} fill={`url(#wd-poster-light-${variant})`} />

    <g opacity=".26" stroke="#B4C7D2" fill="none">
      <circle cx={mobile ? "522" : "720"} cy={mobile ? "120" : "138"} r={mobile ? "78" : "96"} />
      <circle cx={mobile ? "522" : "720"} cy={mobile ? "120" : "138"} r={mobile ? "122" : "148"} />
      <circle cx={mobile ? "522" : "720"} cy={mobile ? "120" : "138"} r={mobile ? "166" : "202"} />
    </g>

    <path
      d={mobile
        ? "M-70 710 C 110 670, 96 460, 250 430 S 520 455, 704 190"
        : "M-80 690 C 170 720, 160 425, 350 390 S 660 465, 980 110"}
      stroke="#061B29"
      strokeOpacity=".54"
      strokeWidth={mobile ? "132" : "156"}
      fill="none"
      strokeLinecap="round"
    />
    <path
      d={mobile
        ? "M-70 690 C 110 650, 96 440, 250 410 S 520 435, 704 170"
        : "M-80 670 C 170 700, 160 405, 350 370 S 660 445, 980 90"}
      stroke={`url(#wd-poster-road-${variant})`}
      strokeWidth={mobile ? "122" : "146"}
      fill="none"
      strokeLinecap="round"
    />
    <path
      d={mobile
        ? "M-70 690 C 110 650, 96 440, 250 410 S 520 435, 704 170"
        : "M-80 670 C 170 700, 160 405, 350 370 S 660 445, 980 90"}
      stroke="#D7B98E"
      strokeOpacity=".74"
      strokeWidth="3"
      strokeDasharray={mobile ? "14 22" : "18 26"}
      fill="none"
      strokeLinecap="round"
    />

    <g fill="#D7B98E">
      <circle cx={mobile ? "134" : "216"} cy={mobile ? "552" : "542"} r="7" />
      <circle cx={mobile ? "486" : "642"} cy={mobile ? "356" : "338"} r="7" />
    </g>
    <g fill="none" stroke="#D7B98E" opacity=".32">
      <circle cx={mobile ? "134" : "216"} cy={mobile ? "552" : "542"} r="18" />
      <circle cx={mobile ? "486" : "642"} cy={mobile ? "356" : "338"} r="18" />
    </g>

    <g transform={mobile ? "translate(324 485) rotate(-28)" : "translate(464 452) rotate(-22)"}>
      <ellipse cx="0" cy="34" rx={mobile ? "116" : "134"} ry={mobile ? "54" : "62"} fill="#05151F" opacity=".64" filter={`url(#wd-poster-shadow-${variant})`} />
      <g fill="#171E22">
        <rect x="-102" y="-52" width="24" height="60" rx="10" />
        <rect x="78" y="-52" width="24" height="60" rx="10" />
        <rect x="-102" y="56" width="24" height="60" rx="10" />
        <rect x="78" y="56" width="24" height="60" rx="10" />
      </g>
      <path d="M-92 78 L-84-54 Q-72-100 -30-116 L30-116 Q72-100 84-54 L92 78 Q80 114 46 126 L-46 126 Q-80 114-92 78Z" fill={`url(#wd-poster-body-${variant})`} stroke="#5F7A8B" strokeWidth="2" />
      <path d="M-58-54 Q-44-82 0-88 Q44-82 58-54 L48-10 H-48Z" fill={`url(#wd-poster-glass-${variant})`} />
      <path d="M-48 10 H48 L56 60 Q32 78 0 80 Q-32 78-56 60Z" fill={`url(#wd-poster-glass-${variant})`} />
      <path d="M-72-72 Q0-104 72-72" fill="none" stroke="#6E8A9A" strokeWidth="2" />
      <path d="M-72 88 Q0 112 72 88" fill="none" stroke="#0B293A" strokeWidth="3" />
      <path d="M-69-68 L-51-74 M69-68 L51-74" stroke="#F6F3ED" strokeWidth="7" strokeLinecap="round" />
      <path d="M-68 102 H-45 M45 102 H68" stroke="#D7B98E" strokeWidth="6" strokeLinecap="round" />
      <path d="M-80-20 L-106-13 V4 L-80-2 M80-20 L106-13 V4 L80-2" fill="#284B61" />
      <path d="M0-101 V-74" stroke="#B4C7D2" strokeOpacity=".72" strokeWidth="2" />
    </g>

    <g fill="#F6F3ED" opacity=".16">
      <rect x={mobile ? "36" : "48"} y={mobile ? "40" : "48"} width={mobile ? "112" : "138"} height="2" rx="1" />
      <rect x={mobile ? "36" : "48"} y={mobile ? "54" : "62"} width={mobile ? "68" : "82"} height="2" rx="1" />
    </g>
  </svg>;
}

export default function ExperiencePoster({ variant = "desktop" }: { variant?: PosterVariant }) {
  return <figure className={`wd-experience-poster wd-experience-poster--${variant}`}>
    <PosterArtwork variant={variant} />
    <figcaption>Illustration du parcours — véhicule non contractuel.</figcaption>
  </figure>;
}
