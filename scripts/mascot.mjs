// The profile stage: a small code bot walks in, raises an arm and snaps.
// Plays once from page load and holds its last frame. Replaces the original
// third-party mascot with a self-contained SVG character.

const FONT = `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif`;
export const T = { walk: 1.0, arrive: 4.0, speak: 4.5, raise: 5.9, charge: 6.4, snap: 7.6, dust: 7.75, gap: 0.45, end: 12 };

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
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
	const stops = ['0%{opacity:0}'];
	for (const [a, b] of spans) {
		stops.push(`${pct(a)}{opacity:1}`);
		stops.push(b < T.end ? `${pct(b)}{opacity:0}` : '100%{opacity:1}');
	}
	return `@keyframes ${name}{${stops.join('')}}`;
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
	const X1 = 540;
	const Y = 215;
	const headX = X1 + 55;
	const headY = Y + 45;

	const style = `
.mascot { animation: walkx ${T.end}s linear forwards; }
@keyframes walkx { 0% { transform: translate(${X0}px, ${Y}px); } ${pct(T.walk)} { transform: translate(${X0}px, ${Y}px); } ${pct(T.arrive)} { transform: translate(${X1}px, ${Y}px); } 100% { transform: translate(${X1}px, ${Y}px); } }
.bob { animation: bob 0.4s ease-in-out 10 forwards; }
@keyframes bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
.armR { animation: raise 0.5s ease-out ${T.raise}s forwards; }
@keyframes raise { from { transform: rotate(0deg); } to { transform: rotate(-110deg); } }
.legL { animation: legL 0.4s ease-in-out 10 forwards; transform-box: fill-box; transform-origin: 50% 0%; }
.legR { animation: legR 0.4s ease-in-out 10 forwards; transform-box: fill-box; transform-origin: 50% 0%; }
@keyframes legL { 0% { transform: rotate(-20deg); } 50% { transform: rotate(20deg); } 100% { transform: rotate(-20deg); } }
@keyframes legR { 0% { transform: rotate(20deg); } 50% { transform: rotate(-20deg); } 100% { transform: rotate(20deg); } }
${windows('bubble', [[T.speak, T.raise]])}.bubble{animation-name:bubble;opacity:0}
@keyframes word{0%{opacity:0;transform:scale(.4)}${pct(T.snap)}{opacity:0;transform:scale(.4)}${pct(T.snap + 0.2)}{opacity:1;transform:scale(1.1)}${pct(T.snap + 1.1)}{opacity:1;transform:scale(1)}${pct(T.snap + 1.6)}{opacity:0;transform:scale(1)}100%{opacity:0}}
.word{animation-name:word;animation-timing-function:ease-out;transform-box:fill-box;transform-origin:center;opacity:0}
@keyframes flash{0%{opacity:0}${pct(T.snap)}{opacity:0}${pct(T.snap + 0.08)}{opacity:${theme.flashPeak}}${pct(T.snap + 0.7)}{opacity:0}100%{opacity:0}}
.flash{animation-name:flash;animation-timing-function:ease-out;opacity:0}
@keyframes caption{0%{opacity:0}${pct(T.dust + 2.6)}{opacity:0}${pct(T.dust + 3.2)}{opacity:1}100%{opacity:1}}
.caption{animation-name:caption;animation-timing-function:ease-in-out;opacity:0}
.armR { transform-box: fill-box; transform-origin: 6px 0px; }
@media (prefers-reduced-motion: reduce){*{animation:none!important}.mascot{transform:translate(${X1}px,${Y}px)!important}.caption{opacity:1}.word,.flash,.bubble{opacity:0}}
`;

	const body = `
<text x="0" y="44" font-size="34" font-weight="800" fill="${theme.text}">Hi, I'm Nikodem</text>
<text x="0" y="74" font-size="15" fill="${theme.muted}">Web apps, APIs, automation</text>
<text x="0" y="98" font-size="13" fill="${theme.muted}">React · TypeScript · Python · FastAPI</text>
<g class="mascot">
  <g class="bob">
    <rect x="15" y="95" width="80" height="90" rx="16" fill="${theme.card}" stroke="${theme.border}"/>
    <rect x="27" y="108" width="56" height="34" rx="6" fill="${theme.bg}" stroke="${theme.border}"/>
    <text x="55" y="130" text-anchor="middle" font-size="12" font-weight="700" fill="${theme.accent}">&lt;/&gt;</text>
    <rect x="0" y="0" width="110" height="90" rx="18" fill="${theme.card}" stroke="${theme.border}"/>
    <rect x="12" y="22" width="86" height="40" rx="10" fill="${theme.bg}" stroke="${theme.border}"/>
    <circle cx="38" cy="42" r="6" fill="${theme.accent}"/>
    <circle cx="72" cy="42" r="6" fill="${theme.accent}"/>
    <rect x="34" y="52" width="42" height="6" rx="3" fill="${theme.accent}"/>
    <line x1="55" y1="0" x2="55" y2="-18" stroke="${theme.border}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="55" cy="-22" r="6" fill="${theme.accent}"/>
    <g transform="translate(15,100)">
      <g class="armL" style="transform-box:fill-box;transform-origin:6px 0px;">
        <rect x="0" y="0" width="12" height="50" rx="6" fill="${theme.card}" stroke="${theme.border}"/>
      </g>
    </g>
    <g transform="translate(95,100)">
      <g class="armR">
        <rect x="0" y="0" width="12" height="50" rx="6" fill="${theme.card}" stroke="${theme.border}"/>
      </g>
    </g>
    <g transform="translate(28,185)">
      <g class="legL">
        <rect x="0" y="0" width="16" height="45" rx="8" fill="${theme.card}" stroke="${theme.border}"/>
      </g>
    </g>
    <g transform="translate(66,185)">
      <g class="legR">
        <rect x="0" y="0" width="16" height="45" rx="8" fill="${theme.card}" stroke="${theme.border}"/>
      </g>
    </g>
  </g>
</g>
<g class="bubble">
  <rect x="${headX - 250}" y="${headY - 92}" width="170" height="40" rx="14" fill="${theme.card}" stroke="${theme.border}"/>
  <path d="M${headX - 81} ${headY - 76} l16 6 l-16 6 z" fill="${theme.card}" stroke="${theme.border}"/>
  <text x="${headX - 165}" y="${headY - 66}" text-anchor="middle" font-size="15" font-weight="700" fill="${theme.text}">Hold my coffee.</text>
</g>
<text class="word" x="${X1 + 130}" y="${Y + 120}" text-anchor="middle" font-size="44" font-weight="900" font-style="italic" fill="#ffd23f" stroke="#9c6a10" stroke-width="1.5">SNAP</text>
<text class="caption" x="${W}" y="${H - 16}" text-anchor="end" font-size="15" font-style="italic" fill="${theme.muted}">Less noise, more signal.</text>
<rect class="flash" width="${W}" height="${H}" fill="${theme.flash}"/>`;

	return svg(W, H, "Nikodem's profile: a code bot walks in and snaps", style, body);
}
