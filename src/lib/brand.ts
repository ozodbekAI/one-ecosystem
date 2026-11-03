/**
 * ONE brand geometry and palettes — the single source for every logo on the
 * site and for downloadable SVG/PNG files. Geometry is taken from the approved
 * "ONE ekosistemasi · logotiplar" board (cap height = 89.4 units).
 */

export type RingStyle = "brand" | "plus";
export type LogoTone = "dark" | "light";

export const CAP = 89.4;
export const RING = { cx: 44.67, cy: 44.7, r: 34.42, stroke: 20.56 };
export const NE_PATH =
  "M104.52 89.4V0H118.8L159.12 53.16V0H177.72V89.4H163.32L123.12 35.04V89.4ZM192.36 89.4V0H252.48V16.2H210.96V36.48H250.08V52.68H210.96V73.2H252.48V89.4Z";
export const NE_WIDTH = 252.48;
/** Space between "ONE" and the product name, in cap-height units. */
export const NAME_GAP = 0.44 * CAP;
/** Plus Jakarta Sans cap height as a share of the font size. */
export const CAP_RATIO = 0.7;

export const COLORS = {
  deep: "#3B0A77",
  main: "#5B16B8",
  brand: "#7F22E8",
  accent: "#CB11AB",
  ink: "#1C1530",
  night: "#120B1F",
  white: "#FFFFFF",
  lavender: "#C39BFF",
  pink: "#F05BD7",
  iconAccent: "#F9A8EC",
} as const;

type Segment = { from: number; to: number; color: string };

/** Ring segments in degrees, 0° = 3 o'clock, clockwise. */
export function ringSegments(style: RingStyle, tone: LogoTone | "icon"): Segment[] {
  if (style === "plus") {
    const c: readonly [string, string, string, string] =
      tone === "light"
        ? (["#CB11AB", "#2F80ED", "#F5A700", "#0FB5AE"] as const)
        : (["#F05BD7", "#60A5FA", "#FACC15", "#2DD4BF"] as const);
    return [
      { from: -87.5, to: 65.9, color: c[0] },
      { from: 70.9, to: 148.6, color: c[1] },
      { from: 153.6, to: 184.65, color: c[2] },
      { from: 189.66, to: 267.55, color: c[3] },
    ];
  }
  const [accent, main] =
    tone === "light"
      ? [COLORS.accent, COLORS.main]
      : tone === "icon"
        ? [COLORS.iconAccent, COLORS.white]
        : [COLORS.pink, COLORS.lavender];
  return [
    { from: -87.5, to: -2.5, color: accent },
    { from: 2.5, to: 267.5, color: main },
  ];
}

export function arcPath(cx: number, cy: number, r: number, from: number, to: number) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const x1 = cx + r * Math.cos(rad(from));
  const y1 = cy + r * Math.sin(rad(from));
  const x2 = cx + r * Math.cos(rad(to));
  const y2 = cy + r * Math.sin(rad(to));
  const large = to - from > 180 ? 1 : 0;
  return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

export function wordColor(tone: LogoTone) {
  return tone === "light" ? COLORS.ink : COLORS.white;
}

export function nameColor(tone: LogoTone) {
  return tone === "light" ? COLORS.brand : COLORS.lavender;
}

export function ringSvgMarkup(style: RingStyle, tone: LogoTone | "icon", scale = 1, dx = 0, dy = 0) {
  return ringSegments(style, tone)
    .map(
      (s) =>
        `<path d="${arcPath(RING.cx * scale + dx, RING.cy * scale + dy, RING.r * scale, s.from, s.to)}" fill="none" stroke="${s.color}" stroke-width="${(RING.stroke * scale).toFixed(2)}"/>`,
    )
    .join("");
}

/** Full product wordmark as an SVG file. `nameWidth` is measured in the browser. */
export function wordmarkSvg(opts: {
  name?: string | undefined;
  ring: RingStyle;
  tone: LogoTone;
  nameWidth?: number;
  padding?: number;
  background?: boolean;
}) {
  const pad = opts.padding ?? 24;
  const hasName = Boolean(opts.name);
  const fontSize = CAP / CAP_RATIO;
  const nameW = hasName ? (opts.nameWidth ?? (opts.name!.length * fontSize * 0.58)) : 0;
  const width = NE_WIDTH + (hasName ? NAME_GAP + nameW : 0) + pad * 2;
  const height = CAP + pad * 2;
  const bg = opts.background
    ? `<rect width="${width.toFixed(1)}" height="${height}" rx="24" fill="${opts.tone === "light" ? COLORS.white : COLORS.night}"/>`
    : "";
  const text = hasName
    ? `<text x="${(pad + NE_WIDTH + NAME_GAP).toFixed(2)}" y="${pad + CAP}" font-family="Plus Jakarta Sans, Inter, Arial, sans-serif" font-weight="500" font-size="${fontSize.toFixed(2)}" fill="${nameColor(opts.tone)}">${escapeXml(opts.name!)}</text>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width.toFixed(1)} ${height}" width="${width.toFixed(1)}" height="${height}">${bg}${ringSvgMarkup(opts.ring, opts.tone, 1, pad, pad)}<path transform="translate(${pad} ${pad})" d="${NE_PATH}" fill="${wordColor(opts.tone)}"/>${text}</svg>`;
}

/** Square app icon (1024×1024) or bare mark (512×512). */
export function iconSvg(ring: RingStyle, kind: "app" | "mark", tone: LogoTone = "light") {
  if (kind === "app") {
    const s = 307.2 / RING.r;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024"><rect width="1024" height="1024" rx="228" fill="${COLORS.deep}"/>${ringSvgMarkup(ring, ring === "plus" ? "dark" : "icon", s, 512 - RING.cx * s, 512 - RING.cy * s)}</svg>`;
  }
  const s = 153.6 / RING.r;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">${ringSvgMarkup(ring, tone, s, 256 - RING.cx * s, 256 - RING.cy * s)}</svg>`;
}

function escapeXml(s: string) {
  return s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]!);
}

/** Lowercase URL slug from a product name ("Smart Pay" → "smart-pay"). */
export function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[‘’'`ʻʼ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
