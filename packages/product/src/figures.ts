/**
 * Schémas pédagogiques des fiches (panneaux, marquages, carrefours).
 * SVG statiques, sans script ni ressource externe : ils s'affichent en <img> sur le site
 * et dans une WebView sur iOS. Formes et couleurs suivent la signalisation française.
 */
export type LessonFigure = { svg: string; caption: string; alt: string };

const RED = "#C8102E", BLUE = "#1C4FA0", YEL = "#F5C400", INK = "#1E1E1E", GREY = "#6B6B6B", ROAD = "#4A4A4A", GREEN = "#2E9E4F", PAPER = "#FFFFFF";
const FONT = "font-family='-apple-system,Segoe UI,Helvetica,Arial,sans-serif'";

const label = (x: number, y: number, text: string, size = 11, color = INK, weight = 600) =>
  `<text x='${x}' y='${y}' ${FONT} font-size='${size}' font-weight='${weight}' fill='${color}' text-anchor='middle'>${text}</text>`;

/** Cadre commun : fond blanc arrondi, lisible en thème clair comme sombre. */
const frame = (w: number, h: number, body: string) =>
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}' width='${w}' height='${h}'><rect x='0.5' y='0.5' width='${w - 1}' height='${h - 1}' rx='14' fill='${PAPER}' stroke='#E3D9DB'/>${body}</svg>`;

/* ---------- Panneaux (centrés en cx,cy, taille ~56) ---------- */
type Sign = (cx: number, cy: number) => string;
const triUp = (inner: string): Sign => (cx, cy) =>
  `<g transform='translate(${cx},${cy})'><path d='M0,-30 L30,24 L-30,24 Z' fill='${PAPER}' stroke='${RED}' stroke-width='6' stroke-linejoin='round'/>${inner}</g>`;
const triDown: Sign = (cx, cy) =>
  `<g transform='translate(${cx},${cy})'><path d='M-30,-22 L30,-22 L0,30 Z' fill='${PAPER}' stroke='${RED}' stroke-width='6' stroke-linejoin='round'/></g>`;
const ban = (inner: string): Sign => (cx, cy) =>
  `<g transform='translate(${cx},${cy})'><circle r='27' fill='${PAPER}' stroke='${RED}' stroke-width='6'/>${inner}</g>`;
const must = (inner: string): Sign => (cx, cy) =>
  `<g transform='translate(${cx},${cy})'><circle r='28' fill='${BLUE}'/>${inner}</g>`;
const info = (inner: string, fill = BLUE): Sign => (cx, cy) =>
  `<g transform='translate(${cx},${cy})'><rect x='-27' y='-27' width='54' height='54' rx='5' fill='${fill}' stroke='${PAPER}' stroke-width='2'/>${inner}</g>`;
const endBan = (inner: string): Sign => (cx, cy) =>
  `<g transform='translate(${cx},${cy})'><circle r='27' fill='${PAPER}' stroke='${GREY}' stroke-width='2'/>${inner}<path d='M-19,19 L19,-19' stroke='${GREY}' stroke-width='5'/></g>`;

const arrow = (d: string, color = PAPER, w = 6) => `<path d='${d}' fill='none' stroke='${color}' stroke-width='${w}' stroke-linecap='round' stroke-linejoin='round'/>`;
const head = (x: number, y: number, rot: number, color = PAPER, s = 1) => `<path transform='translate(${x},${y}) rotate(${rot}) scale(${s})' d='M0,-9 L8,4 L-8,4 Z' fill='${color}'/>`;

export const signs: Record<string, Sign> = {
  virage: triUp(`${arrow("M-4,14 L-4,0 Q-4,-8 6,-12", INK, 4)}${head(7, -12, 70, INK, 0.7)}`),
  pietons: triUp(`<circle cx='0' cy='-9' r='3.5' fill='${INK}'/>${arrow("M0,-4 L0,7 M0,7 L-6,16 M0,7 L6,16 M-7,1 L7,1", INK, 3)}`),
  cassis: triUp(`<path d='M-17,15 L-8,15 Q0,0 8,15 L17,15' fill='none' stroke='${INK}' stroke-width='4'/>`),
  tram: triUp(`<rect x='-11' y='-8' width='22' height='18' rx='3' fill='${INK}'/><rect x='-7' y='-4' width='14' height='6' fill='${PAPER}'/>${arrow("M-6,-14 L6,-14 M0,-14 L0,-8", INK, 2)}`),
  enfants: triUp(`<circle cx='-6' cy='-8' r='3' fill='${INK}'/><circle cx='7' cy='-4' r='2.6' fill='${INK}'/>${arrow("M-6,-4 L-6,6 L-10,14 M-6,6 L-2,14 M7,0 L7,8 L4,14 M7,8 L10,14", INK, 2.6)}`),
  intersection: triUp(`${arrow("M0,16 L0,-14 M-12,2 L12,2", INK, 5)}`),
  pn: triUp(`<path d='M-14,14 L-6,-8 L6,-8 L14,14' fill='none' stroke='${INK}' stroke-width='3'/><rect x='-10' y='-14' width='20' height='6' fill='${INK}'/>`),
  descente: triUp(`<path d='M-18,16 L18,16 L-18,-4 Z' fill='${INK}'/>${label(4, 12, "10%", 9, PAPER, 700)}`),
  cedez: triDown,
  stop: (cx, cy) =>
    `<g transform='translate(${cx},${cy})'><path d='M-12,-29 L12,-29 L29,-12 L29,12 L12,29 L-12,29 L-29,12 L-29,-12 Z' fill='${RED}' stroke='${PAPER}' stroke-width='2'/>${label(0, 6, "STOP", 15, PAPER, 800)}</g>`,
  prioritaire: (cx, cy) =>
    `<g transform='translate(${cx},${cy})'><rect x='-20' y='-20' width='40' height='40' transform='rotate(45)' fill='${PAPER}' stroke='${INK}' stroke-width='1.5'/><rect x='-13' y='-13' width='26' height='26' transform='rotate(45)' fill='${YEL}'/></g>`,
  finPrioritaire: (cx, cy) =>
    `<g transform='translate(${cx},${cy})'><rect x='-20' y='-20' width='40' height='40' transform='rotate(45)' fill='${PAPER}' stroke='${INK}' stroke-width='1.5'/><rect x='-13' y='-13' width='26' height='26' transform='rotate(45)' fill='${YEL}'/><path d='M-17,17 L17,-17' stroke='${INK}' stroke-width='4'/></g>`,
  priorPonctuelle: triUp(`${arrow("M0,16 L0,-14", INK, 6)}${arrow("M-13,2 L13,2", INK, 3)}`),
  sensInterdit: (cx, cy) => `<g transform='translate(${cx},${cy})'><circle r='28' fill='${RED}'/><rect x='-18' y='-5' width='36' height='10' fill='${PAPER}'/></g>`,
  limite30: ban(label(0, 8, "30", 22, INK, 800)),
  limite50: ban(label(0, 8, "50", 22, INK, 800)),
  limite70: ban(label(0, 8, "70", 22, INK, 800)),
  interditGauche: ban(`${arrow("M4,14 L4,-2 Q4,-8 -4,-8 L-12,-8", INK, 4)}${head(-13, -8, -90, INK, 0.8)}<path d='M-17,17 L17,-17' stroke='${RED}' stroke-width='5'/>`),
  interditDepasser: ban(`<rect x='-17' y='-8' width='13' height='16' rx='3' fill='${RED}'/><rect x='4' y='-8' width='13' height='16' rx='3' fill='${INK}'/>`),
  stationnementInterdit: (cx, cy) => `<g transform='translate(${cx},${cy})'><circle r='27' fill='${BLUE}' stroke='${RED}' stroke-width='6'/><path d='M-17,-17 L17,17' stroke='${RED}' stroke-width='6'/></g>`,
  arretInterdit: (cx, cy) => `<g transform='translate(${cx},${cy})'><circle r='27' fill='${BLUE}' stroke='${RED}' stroke-width='6'/><path d='M-17,-17 L17,17 M17,-17 L-17,17' stroke='${RED}' stroke-width='6'/></g>`,
  finInterdiction: endBan(""),
  fin50: endBan(label(0, 8, "50", 20, GREY, 800)),
  tourneDroite: must(`${arrow("M-6,16 L-6,0 Q-6,-8 4,-8 L10,-8")}${head(12, -8, 90)}`),
  toutDroit: must(`${arrow("M0,16 L0,-8")}${head(0, -12, 0)}`),
  giratoire: must(`<circle r='12' fill='none' stroke='${PAPER}' stroke-width='4'/>${head(12, 0, 180)}${head(-6, 10, -60)}${head(-6, -10, 60)}`),
  pisteCyclable: must(`<circle cx='-9' cy='7' r='7' fill='none' stroke='${PAPER}' stroke-width='2.5'/><circle cx='9' cy='7' r='7' fill='none' stroke='${PAPER}' stroke-width='2.5'/>${arrow("M-9,7 L-2,-6 L6,-6 L9,7 M-2,-6 L0,7", PAPER, 2.5)}`),
  chainesNeige: must(`<circle cx='0' cy='0' r='13' fill='none' stroke='${PAPER}' stroke-width='3' stroke-dasharray='4 3'/>`),
  impasse: info(`${arrow("M0,18 L0,-6", PAPER, 7)}<rect x='-10' y='-14' width='20' height='8' fill='${RED}'/>`),
  zone30: (cx, cy) => `<g transform='translate(${cx},${cy})'><rect x='-27' y='-30' width='54' height='60' rx='5' fill='${PAPER}' stroke='${INK}' stroke-width='1.5'/><circle cy='-5' r='17' fill='${PAPER}' stroke='${RED}' stroke-width='4'/>${label(0, 1, "30", 15, INK, 800)}${label(0, 25, "ZONE", 9, INK, 800)}</g>`,
  zoneRencontre: (cx, cy) => `<g transform='translate(${cx},${cy})'><rect x='-27' y='-30' width='54' height='60' rx='5' fill='${PAPER}' stroke='${INK}' stroke-width='1.5'/><rect x='-22' y='-25' width='44' height='26' rx='3' fill='${BLUE}'/><circle cx='-10' cy='-17' r='3' fill='${PAPER}'/><rect x='2' y='-14' width='14' height='8' rx='2' fill='${PAPER}'/><circle cy='15' r='10' fill='${PAPER}' stroke='${RED}' stroke-width='3'/>${label(0, 19, "20", 10, INK, 800)}</g>`,
  tunnel: info(`<path d='M-18,18 L-18,0 Q0,-24 18,0 L18,18' fill='none' stroke='${PAPER}' stroke-width='4'/>`),
  voieDetresse: info(`${arrow("M-12,18 L-12,-6 Q-12,-12 -4,-14 L14,-16", PAPER, 4)}<path d='M2,-22 L18,-16 L4,-10' fill='${PAPER}'/>`),
  autoroute: info(`<path d='M-6,16 L-2,-14 M6,16 L2,-14' stroke='${PAPER}' stroke-width='3'/><path d='M-16,0 Q0,-6 16,0' fill='none' stroke='${PAPER}' stroke-width='3'/>`),
  stationnement: info(label(0, 10, "P", 30, PAPER, 800)),
  passagePietons: info(`<path d='M0,-24 L22,18 L-22,18 Z' fill='${PAPER}'/><circle cx='0' cy='-3' r='3' fill='${INK}'/>${arrow("M0,1 L0,9 L-5,15 M0,9 L5,15", INK, 2.4)}`),
  priorityFace: (cx, cy) => `<g transform='translate(${cx},${cy})'><rect x='-27' y='-27' width='54' height='54' rx='5' fill='${BLUE}'/>${arrow("M-8,18 L-8,-8", PAPER, 5)}${head(-8, -14, 0)}${arrow("M9,-18 L9,8", RED, 5)}${head(9, 14, 180, RED)}</g>`,
  cedeFace: ban(`${arrow("M-8,18 L-8,-8", RED, 5)}${head(-8, -14, 0, RED)}${arrow("M9,-18 L9,8", INK, 5)}${head(9, 14, 180, INK)}`),
  pmv: (cx, cy) => `<g transform='translate(${cx},${cy})'><rect x='-30' y='-18' width='60' height='36' rx='4' fill='${INK}'/>${label(0, -2, "BOUCHON", 8, "#FFB000", 700)}${label(0, 10, "À 2 KM", 8, "#FFB000", 700)}</g>`,
  feuJaune: (cx, cy) => `<g transform='translate(${cx},${cy})'><rect x='-11' y='-28' width='22' height='56' rx='6' fill='${INK}'/><circle cy='0' r='8' fill='${YEL}'/><circle cy='0' r='13' fill='none' stroke='${YEL}' stroke-width='2' stroke-dasharray='3 3'/></g>`,
  feuRougeClignotant: (cx, cy) => `<g transform='translate(${cx},${cy})'><rect x='-26' y='-14' width='52' height='28' rx='6' fill='${INK}'/><circle cx='-12' r='8' fill='${RED}'/><circle cx='12' r='8' fill='#5A1A1A'/></g>`,
  balise: (cx, cy) => `<g transform='translate(${cx},${cy})'><rect x='-8' y='-28' width='16' height='56' rx='3' fill='${PAPER}' stroke='${INK}' stroke-width='1.5'/><rect x='-8' y='-22' width='16' height='10' fill='${RED}'/></g>`,
  baliseVirage: (cx, cy) => `<g transform='translate(${cx},${cy})'><rect x='-28' y='-16' width='56' height='32' rx='3' fill='${PAPER}' stroke='${INK}' stroke-width='1.5'/><path d='M-20,-10 L-6,0 L-20,10 M-2,-10 L12,0 L-2,10' fill='none' stroke='${RED}' stroke-width='5'/></g>`,
  musoir: (cx, cy) => `<g transform='translate(${cx},${cy})'><rect x='-24' y='-24' width='48' height='48' rx='4' fill='${PAPER}' stroke='${INK}' stroke-width='1.5'/><path d='M-16,16 L0,-14 L16,16 M-8,16 L0,0 L8,16' fill='none' stroke='${RED}' stroke-width='4'/></g>`,
};

/** Rangée de panneaux avec leur légende. */
export function signRow(items: [keyof typeof signs, string][], title?: string): string {
  const cell = 104, w = Math.max(320, items.length * cell + 16), top = title ? 26 : 0, h = 128 + top;
  const start = (w - items.length * cell) / 2 + cell / 2;
  const body = (title ? label(w / 2, 20, title, 12, GREY, 700) : "") +
    items.map(([k, text], i) => {
      const x = start + i * cell;
      const lines = text.split("|");
      return signs[k](x, top + 46) + lines.map((l, j) => label(x, top + 98 + j * 13, l, 10.5)).join("");
    }).join("");
  return frame(w, h, body);
}

/* ---------- Marquages au sol (vue de dessus, une chaussée par ligne) ---------- */
type Mark = "continue" | "discontinue" | "dissuasion" | "avertissement" | "mixte" | "rive" | "jauneContinue" | "jauneDiscontinue" | "large";
export function markings(items: [Mark, string][]): string {
  const rowH = 46, w = 340, h = items.length * rowH + 14;
  const body = items.map(([type, text], i) => {
    const y = 10 + i * rowH, mid = y + 18;
    let line = "";
    const dash = (len: number, gap: number, color = PAPER, width = 4, yy = mid) => {
      let s = ""; for (let x = 14; x < 214; x += len + gap) s += `<rect x='${x}' y='${yy - width / 2}' width='${Math.min(len, 214 - x)}' height='${width}' fill='${color}'/>`; return s;
    };
    if (type === "continue") line = `<rect x='14' y='${mid - 2}' width='200' height='4' fill='${PAPER}'/>`;
    if (type === "discontinue") line = dash(30, 40);
    if (type === "dissuasion") line = dash(30, 13);
    if (type === "avertissement") line = dash(30, 13) + [60, 120, 180].map(x => `<path d='M${x},${mid + 14} L${x + 14},${mid + 9} L${x},${mid + 4}' fill='none' stroke='${PAPER}' stroke-width='2.5'/>`).join("");
    if (type === "mixte") line = `<rect x='14' y='${mid - 5}' width='200' height='3' fill='${PAPER}'/>` + dash(30, 40, PAPER, 3, mid + 4);
    if (type === "rive") line = dash(20, 14, PAPER, 6, y + 4) + `<rect x='14' y='${mid - 2}' width='200' height='4' fill='${PAPER}' opacity='0.35'/>`;
    if (type === "large") line = dash(30, 13, PAPER, 8);
    if (type === "jauneContinue") line = `<rect x='14' y='${mid - 2}' width='200' height='4' fill='${YEL}'/>`;
    if (type === "jauneDiscontinue") line = dash(12, 10, YEL);
    const road = `<rect x='14' y='${y}' width='200' height='36' rx='4' fill='${ROAD}'/>`;
    const lines = text.split("|");
    return road + line + lines.map((l, j) => `<text x='226' y='${mid + 4 - (lines.length - 1) * 6 + j * 13}' ${FONT} font-size='11' font-weight='${j ? 400 : 700}' fill='${j ? GREY : INK}'>${l}</text>`).join("");
  }).join("");
  return frame(w, h, body);
}

/* ---------- Scènes de circulation vue de dessus ---------- */
const car = (x: number, y: number, rot: number, color: string, tag?: string) =>
  `<g transform='translate(${x},${y}) rotate(${rot})'><rect x='-9' y='-15' width='18' height='30' rx='5' fill='${color}' stroke='${INK}' stroke-width='1'/><rect x='-7' y='-9' width='14' height='6' rx='2' fill='#CFE3F5'/></g>${tag ? label(x + 0, y + 4, tag, 9, PAPER, 800) : ""}`;
const path = (d: string, color = RED) => `<path d='${d}' fill='none' stroke='${color}' stroke-width='3' stroke-dasharray='6 4' stroke-linecap='round'/>`;
const tip = (x: number, y: number, rot: number, color = RED) => `<path transform='translate(${x},${y}) rotate(${rot})' d='M0,-7 L6,4 L-6,4 Z' fill='${color}'/>`;
const cross = (cx: number, cy: number, half: number, arm: number) =>
  `<rect x='${cx - half}' y='${cy - arm}' width='${half * 2}' height='${arm * 2}' fill='${ROAD}'/><rect x='${cx - arm}' y='${cy - half}' width='${arm * 2}' height='${half * 2}' fill='${ROAD}'/>`;
const caption = (w: number, h: number, text: string) => label(w / 2, h - 12, text, 10, GREY, 600);

export const scenes = {
  stopLigne: () => frame(320, 240, `${cross(160, 110, 30, 110)}<rect x='130' y='146' width='30' height='5' fill='${PAPER}'/>${signs.stop(205, 175)}${car(145, 172, 0, "#8E2B3E", "")}${car(60, 95, 90, GREY)}${car(260, 125, -90, GREY)}${path("M145,150 L145,140")}${caption(320, 240, "Arrêt complet à la ligne, puis regarde des deux côtés")}`),
  cedezLigne: () => frame(320, 240, `${cross(160, 110, 30, 110)}${[130, 140, 150].map(x => `<rect x='${x}' y='147' width='6' height='4' fill='${PAPER}'/>`).join("")}${signs.cedez(205, 175)}${car(145, 178, 0, "#8E2B3E")}${car(80, 95, 90, GREY)}${path("M145,160 L145,120 Q145,95 175,95 L230,95")}${tip(232, 95, 90)}${caption(320, 240, "Ralentis et cède : l’arrêt n’est pas obligatoire")}`),
  prioriteDroite: () => frame(320, 240, `${cross(160, 110, 30, 110)}${car(145, 180, 0, "#8E2B3E", "")}${car(232, 125, -90, BLUE)}${path("M216,125 L120,125")}${tip(118, 125, -90, BLUE)}${label(262, 158, "prioritaire", 10, BLUE)}${label(90, 190, "toi : tu cèdes", 10, "#8E2B3E")}${caption(320, 240, "Sans panneau : celui qui vient de ta droite passe")}`),
  giratoire: () => {
    const c = `<circle cx='160' cy='112' r='82' fill='${ROAD}'/><circle cx='160' cy='112' r='34' fill='#8BC48A'/><circle cx='160' cy='112' r='58' fill='none' stroke='${PAPER}' stroke-width='2' stroke-dasharray='10 8'/>`;
    const arms = `<rect x='140' y='190' width='40' height='40' fill='${ROAD}'/><rect x='140' y='0' width='40' height='34' fill='${ROAD}'/><rect x='0' y='92' width='82' height='40' fill='${ROAD}'/><rect x='238' y='92' width='82' height='40' fill='${ROAD}'/>`;
    return frame(320, 250, `${arms}${c}${path("M166,200 Q178,160 202,138 Q216,112 200,82 Q170,56 132,70 Q110,82 96,104 L70,104", "#8E2B3E")}${tip(66, 104, -90, "#8E2B3E")}${path("M174,200 Q182,160 214,134 L242,128", GREEN)}${tip(246, 128, 75, GREEN)}${label(270, 160, "vers la droite :", 10, GREEN)}${label(270, 173, "reste à droite", 10, GREEN)}${label(55, 66, "vers la gauche :", 10, "#8E2B3E")}${label(55, 79, "voie de gauche", 10, "#8E2B3E")}${caption(320, 250, "Priorité aux véhicules déjà engagés dans l’anneau")}`);
  },
  tournerGauche: () => frame(320, 240, `${cross(160, 110, 34, 110)}<rect x='158' y='0' width='4' height='76' fill='${YEL}' opacity='0.0'/>${[0, 1, 2, 3].map(i => `<rect x='158' y='${150 + i * 22}' width='4' height='12' fill='${PAPER}'/>`).join("")}${car(172, 186, 0, "#8E2B3E")}${path("M168,168 L164,130 Q160,100 120,96 L40,96")}${tip(38, 96, -90)}${car(146, 40, 180, GREY)}${path("M146,58 L146,70", GREY)}${label(255, 190, "près de l’axe", 10, "#8E2B3E")}${caption(320, 240, "Cède à ceux d’en face, puis tourne")}`),
  voies: () => frame(320, 230, `<rect x='60' y='10' width='200' height='190' fill='${ROAD}'/>${[0, 1, 2, 3, 4].map(i => `<rect x='125' y='${16 + i * 38}' width='4' height='22' fill='${PAPER}'/><rect x='191' y='${16 + i * 38}' width='4' height='22' fill='${PAPER}'/>`).join("")}<path d='M92,60 L92,30 M86,38 L92,28 L98,38' stroke='${PAPER}' stroke-width='3' fill='none'/><path d='M160,60 L160,30 M154,38 L160,28 L166,38' stroke='${PAPER}' stroke-width='3' fill='none'/><path d='M226,60 L226,40 Q226,30 238,30 M232,24 L240,30 L232,36' stroke='${PAPER}' stroke-width='3' fill='none'/>${car(226, 160, 0, "#8E2B3E")}${car(92, 130, 0, GREY)}${label(226, 196, "à droite", 10, PAPER)}${label(92, 196, "à gauche", 10, PAPER)}${caption(320, 230, "Choisis ta voie d’après les flèches, tôt et en sécurité")}`),
  creneau: () => frame(320, 230, `<rect x='0' y='20' width='320' height='130' fill='${ROAD}'/><rect x='0' y='150' width='320' height='16' fill='#BDB6AE'/>${car(70, 125, 90, GREY)}${car(250, 125, 90, GREY)}${car(240, 75, 90, "#8E2B3E")}${path("M228,80 Q170,82 160,108 Q150,128 112,128")}${tip(108, 128, -90)}<circle cx='204' cy='92' r='5' fill='${YEL}'/>${label(204, 112, "1 braque", 10, PAPER)}<circle cx='150' cy='120' r='5' fill='${YEL}'/>${label(150, 104, "2 contre", 10, PAPER)}${caption(320, 230, "Recule, braque à fond côté trottoir, puis contre-braque")}`),
  bataille: () => frame(320, 230, `<rect x='0' y='20' width='320' height='80' fill='${ROAD}'/><rect x='0' y='100' width='320' height='90' fill='#5B5B5B'/>${[60, 110, 160, 210, 260].map(x => `<rect x='${x}' y='100' width='3' height='90' fill='${PAPER}'/>`).join("")}${car(85, 150, 0, GREY)}${car(235, 150, 0, GREY)}${car(250, 55, 90, "#8E2B3E")}${path("M234,58 Q190,60 186,96 L186,150")}${tip(186, 154, 180)}${label(150, 214, "", 1)}${caption(320, 225, "Bataille arrière : recule en vision directe, place dans l’axe")}`),
  epi: () => frame(320, 230, `<rect x='0' y='20' width='320' height='80' fill='${ROAD}'/><rect x='0' y='100' width='320' height='90' fill='#5B5B5B'/>${[50, 110, 170, 230, 290].map(x => `<path d='M${x},100 L${x - 40},190' stroke='${PAPER}' stroke-width='3'/>`).join("")}${car(240, 60, 90, "#8E2B3E")}${path("M224,62 Q170,64 160,100 L140,146")}${tip(138, 150, 200)}${caption(320, 225, "Épi : entre en avant, dans l’angle des lignes")}`),
  distance: () => frame(320, 200, `<rect x='0' y='40' width='320' height='70' fill='${ROAD}'/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x='${10 + i * 56}' y='73' width='30' height='4' fill='${PAPER}'/>`).join("")}${car(70, 92, 90, "#8E2B3E")}${car(250, 92, 90, GREY)}<path d='M84,128 L236,128' stroke='${INK}' stroke-width='2'/><path d='M84,122 L84,134 M236,122 L236,134' stroke='${INK}' stroke-width='2'/>${label(160, 148, "au moins 2 secondes", 12, INK, 700)}${label(160, 166, "à 80 km/h : 8 × 3 = 24 m, × 2 = 48 m", 11, GREY)}<rect x='242' y='14' width='5' height='26' fill='${GREY}'/>${label(244, 12, "repère", 9, GREY)}${caption(320, 200, "Compte à partir du repère : « un, deux »")}`),
  depassement: () => frame(320, 210, `<rect x='0' y='30' width='320' height='110' fill='${ROAD}'/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x='${10 + i * 56}' y='83' width='30' height='4' fill='${PAPER}'/>`).join("")}${car(40, 115, 90, "#8E2B3E")}${car(160, 115, 90, GREY)}${path("M58,112 Q90,110 105,62 L215,58 Q240,60 260,110")}${tip(264, 114, 160)}${label(70, 160, "1 contrôle", 10, INK)}${label(160, 160, "2 dépasse vite", 10, INK)}${label(262, 160, "3 rabats-toi", 10, INK)}${label(160, 178, "quand le véhicule dépassé est entier dans le rétro", 10, GREY, 500)}`),
  insertion: () => frame(320, 210, `<rect x='0' y='20' width='320' height='90' fill='${ROAD}'/><path d='M0,150 L210,110 L320,110 L320,130 L210,130 L0,175 Z' fill='${ROAD}'/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x='${10 + i * 56}' y='63' width='30' height='4' fill='${PAPER}'/>`).join("")}${[0, 1, 2, 3].map(i => `<rect x='${200 + i * 30}' y='108' width='18' height='4' fill='${PAPER}'/>`).join("")}${car(60, 158, 80, "#8E2B3E")}${path("M80,154 L200,122 Q250,112 290,90")}${tip(294, 88, 60)}${car(170, 88, 90, GREY)}${caption(320, 205, "Accélère sur la voie d’insertion, puis insère-toi")}`),
  interfiles: () => frame(320, 230, `<rect x='40' y='10' width='240' height='190' fill='${ROAD}'/>${[0, 1, 2, 3, 4].map(i => `<rect x='118' y='${16 + i * 38}' width='4' height='22' fill='${PAPER}'/><rect x='198' y='${16 + i * 38}' width='4' height='22' fill='${PAPER}'/>`).join("")}<rect x='40' y='10' width='4' height='190' fill='${YEL}'/>${car(80, 60, 0, GREY)}${car(80, 150, 0, GREY)}${car(160, 50, 0, GREY)}${car(160, 140, 0, "#8E2B3E")}${car(240, 90, 0, GREY)}<rect x='115' y='95' width='10' height='22' rx='4' fill='${YEL}' stroke='${INK}'/>${path("M120,120 L120,40", YEL)}${tip(120, 36, 0, YEL)}${label(120, 214, "", 1)}${caption(320, 225, "Moto entre les 2 voies de gauche, 50 km/h max")}`),
  feux: () => frame(320, 170, `${[["route", "route sombre et personne en face", 0], ["croisement", "usager en face ou ville éclairée", 1], ["brouillard AR", "brouillard ou neige uniquement", 2]].map(([t, d, i]) => {
    const y = 30 + (i as number) * 44; const beam = i === 0 ? `<path d='M48,${y} L120,${y - 14} L120,${y + 14} Z' fill='${YEL}' opacity='0.6'/>` : i === 1 ? `<path d='M48,${y} L100,${y + 2} L100,${y + 14} Z' fill='${YEL}' opacity='0.6'/>` : `<circle cx='60' cy='${y}' r='9' fill='${RED}'/>`;
    return `<circle cx='40' cy='${y}' r='9' fill='${i === 2 ? INK : YEL}' stroke='${INK}'/>${beam}<text x='134' y='${y - 2}' ${FONT} font-size='12' font-weight='700' fill='${INK}'>${t}</text><text x='134' y='${y + 12}' ${FONT} font-size='10' fill='${GREY}'>${d}</text>`;
  }).join("")}`),
  agents: () => frame(320, 170, `${[["Bras levé", "arrêt pour tous", 0], ["Bras tendus", "arrêt face et dos", 1], ["Bras qui balance", "passe dans ce sens", 2]].map(([t, d, i]) => {
    const x = 55 + (i as number) * 105; const body = `<circle cx='${x}' cy='40' r='9' fill='${INK}'/><path d='M${x},50 L${x},92 M${x},92 L${x - 9},120 M${x},92 L${x + 9},120' stroke='${INK}' stroke-width='5' stroke-linecap='round'/>`;
    const armsD = i === 0 ? `M${x},58 L${x + 6},20 M${x},58 L${x - 12},80` : i === 1 ? `M${x - 30},58 L${x + 30},58` : `M${x},58 L${x + 26},48 M${x},58 L${x - 12},80`;
    return body + `<path d='${armsD}' stroke='${INK}' stroke-width='5' stroke-linecap='round'/>` + label(x, 140, t as string, 10.5) + label(x, 154, d as string, 9, GREY, 500);
  }).join("")}`),
  virage: () => frame(320, 220, `<path d='M30,210 L30,120 Q30,40 140,40 L320,40 L320,90 L140,90 Q80,90 80,140 L80,210 Z' fill='${ROAD}'/>${signs.virage(240, 150)}${label(200, 200, "50 m avant en ville · 150 m hors agglo", 9.5, GREY)}${path("M55,205 L55,140", "#8E2B3E")}${path("M55,138 Q55,66 140,64 L300,64", GREEN)}${tip(304, 64, 90, GREEN)}${label(200, 24, "regarde la sortie, puis réaccélère", 10, GREEN)}${label(120, 150, "freine avant", 10, "#8E2B3E")}`),
  pn: () => frame(320, 210, `<rect x='130' y='0' width='60' height='210' fill='${ROAD}'/><rect x='0' y='80' width='320' height='36' fill='#8A7F75'/>${[0, 1].map(i => `<rect x='0' y='${86 + i * 20}' width='320' height='4' fill='#2A2A2A'/>`).join("")}<rect x='70' y='130' width='70' height='6' fill='${RED}'/><rect x='182' y='60' width='70' height='6' fill='${RED}'/>${car(160, 158, 0, "#8E2B3E")}${signs.feuRougeClignotant(250, 160)}${caption(320, 205, "Ne t’engage que si tu peux dégager la voie ferrée")}`),
};

/** Ratio largeur/hauteur lu dans le viewBox, pour dimensionner le rendu iOS. */
export function figureRatio(svg: string): number {
  const m = /viewBox='0 0 ([\d.]+) ([\d.]+)'/.exec(svg);
  return m ? Number(m[1]) / Number(m[2]) : 4 / 3;
}
export const figureDataUri = (svg: string) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
