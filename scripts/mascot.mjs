// The profile stage: an abstract geometric mark walks in and snaps.
// Plays once from page load and holds its last frame.

const FONT = `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif`;
export const T = {
  walk: 1.0,
  arrive: 4.0,
  speak: 4.5,
  raise: 5.9,
  charge: 6.4,
  snap: 7.6,
  dust: 7.75,
  gap: 0.45,
  end: 12,
};

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const pct = (t) => `${Math.min(100, (t / T.end) * 100).toFixed(3)}%`;

/** Deterministic noise, so a given seed always lays the dust out the same way. */
export function random(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Keyframes that show something only inside the given [from, to) windows. */
function windows(name, spans) {
  const stops = ["0%{opacity:0}"];
  for (const [a, b] of spans) {
    stops.push(`${pct(a)}{opacity:1}`);
    stops.push(b < T.end ? `${pct(b)}{opacity:0}` : "100%{opacity:1}");
  }
  return `@keyframes ${name}{${stops.join("")}}`;
}

const svg = (w, h, title, style, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="${FONT}">
<title>${esc(title)}</title>
<style>${style}</style>
${body}
</svg>
`;

export function stageSvg(theme) {
  const W = 860;
  const H = 440;
  const X0 = 860;
  const X1 = 560;
  const Y = 180;
  const markCx = X1 + 80;
  const markCy = Y + 80;

  const style = `
.mark { animation: walkx ${T.end}s linear forwards; }
@keyframes walkx { 0% { transform: translate(${X0}px, ${Y}px); } ${pct(T.walk)} { transform: translate(${X0}px, ${Y}px); } ${pct(T.arrive)} { transform: translate(${X1}px, ${Y}px); } 100% { transform: translate(${X1}px, ${Y}px); } }
.bob { animation: bob 0.4s ease-in-out 10 forwards; }
@keyframes bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
.core { animation: pulse 0.6s ease-out ${T.raise}s forwards; transform-box: fill-box; transform-origin: center; }
@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.25); } 100% { transform: scale(1); } }
${windows("bubble", [[T.speak, T.raise]])}.bubble{animation-name:bubble;opacity:0}
@keyframes word{0%{opacity:0;transform:scale(.4)}${pct(T.snap)}{opacity:0;transform:scale(.4)}${pct(T.snap + 0.2)}{opacity:1;transform:scale(1.1)}${pct(T.snap + 1.1)}{opacity:1;transform:scale(1)}${pct(T.snap + 1.6)}{opacity:0;transform:scale(1)}100%{opacity:0}}
.word{animation-name:word;animation-timing-function:ease-out;transform-box:fill-box;transform-origin:center;opacity:0}
@keyframes flash{0%{opacity:0}${pct(T.snap)}{opacity:0}${pct(T.snap + 0.08)}{opacity:${theme.flashPeak}}${pct(T.snap + 0.7)}{opacity:0}100%{opacity:0}}
.flash{animation-name:flash;animation-timing-function:ease-out;opacity:0}
@keyframes caption{0%{opacity:0}${pct(T.dust + 2.6)}{opacity:0}${pct(T.dust + 3.2)}{opacity:1}100%{opacity:1}}
.caption{animation-name:caption;animation-timing-function:ease-in-out;opacity:0}
@media (prefers-reduced-motion: reduce){*{animation:none!important}.mark{transform:translate(${X1}px,${Y}px)!important}.caption{opacity:1}.word,.flash,.bubble{opacity:0}}
`;

  const body = `
<defs>
  <linearGradient id="hexGrad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${theme.accent}"/>
    <stop offset="1" stop-color="${theme.card}"/>
  </linearGradient>
  <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
    <stop offset="0" stop-color="${theme.flash}"/>
    <stop offset="1" stop-color="${theme.accent}"/>
  </radialGradient>
</defs>
<text x="0" y="44" font-size="34" font-weight="800" fill="${theme.text}">Hi, I'm Nikodem</text>
<text x="0" y="74" font-size="15" fill="${theme.muted}">Web apps, APIs, automation</text>
<text x="0" y="98" font-size="13" fill="${theme.muted}">React · TypeScript · Python · FastAPI</text>
<g class="mark">
  <g class="bob">
    <circle cx="80" cy="80" r="74" fill="none" stroke="${theme.accent}" stroke-width="1.5" opacity="0.35"/>
    <polygon points="80,8 144,44 144,116 80,152 16,116 16,44" fill="url(#hexGrad)" stroke="${theme.border}" stroke-width="1.5"/>
    <circle class="core" cx="80" cy="80" r="26" fill="url(#coreGrad)"/>
    <text x="80" y="94" text-anchor="middle" font-size="34" font-weight="900" fill="${theme.bg}">N</text>
  </g>
</g>
<g class="bubble">
  <rect x="${markCx - 250}" y="${markCy - 92}" width="170" height="40" rx="14" fill="${theme.card}" stroke="${theme.border}"/>
  <path d="M${markCx - 81} ${markCy - 76} l16 6 l-16 6 z" fill="${theme.card}" stroke="${theme.border}"/>
  <text x="${markCx - 165}" y="${markCy - 66}" text-anchor="middle" font-size="15" font-weight="700" fill="${theme.text}">Ship it.</text>
</g>
<text class="word" x="${X1 + 90}" y="${Y + 90}" text-anchor="middle" font-size="44" font-weight="900" font-style="italic" fill="#ffd23f" stroke="#9c6a10" stroke-width="1.5">SNAP</text>
<text class="caption" x="${W}" y="${H - 16}" text-anchor="end" font-size="15" font-style="italic" fill="${theme.muted}">Less noise, more signal.</text>
<rect class="flash" width="${W}" height="${H}" fill="${theme.flash}"/>`;

  return svg(
    W,
    H,
    "Nikodem's profile: a geometric mark walks in and snaps",
    style,
    body,
  );
}
