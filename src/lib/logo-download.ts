import {
  CAP,
  CAP_RATIO,
  COLORS,
  NAME_GAP,
  NE_PATH,
  NE_WIDTH,
  RING,
  arcPath,
  iconSvg,
  nameColor,
  ringSegments,
  wordColor,
  wordmarkSvg,
  type LogoTone,
  type RingStyle,
} from "@/lib/brand";

const FONT = (size: number) => `500 ${size}px "Plus Jakarta Sans", Inter, Arial, sans-serif`;

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function measureName(name: string) {
  const size = CAP / CAP_RATIO;
  await document.fonts.load(FONT(size));
  const ctx = document.createElement("canvas").getContext("2d")!;
  ctx.font = FONT(size);
  return ctx.measureText(name).width;
}

function drawRing(ctx: CanvasRenderingContext2D, style: RingStyle, tone: LogoTone | "icon", s: number, dx: number, dy: number) {
  for (const seg of ringSegments(style, tone)) {
    ctx.strokeStyle = seg.color;
    ctx.lineWidth = RING.stroke * s;
    ctx.stroke(new Path2D(arcPath(RING.cx * s + dx, RING.cy * s + dy, RING.r * s, seg.from, seg.to)));
  }
}

export async function downloadWordmark(opts: { name?: string | undefined; ring: RingStyle; tone: LogoTone; format: "svg" | "png"; file: string }) {
  const nameWidth = opts.name ? await measureName(opts.name) : 0;
  if (opts.format === "svg") {
    save(new Blob([wordmarkSvg({ ...opts, nameWidth })], { type: "image/svg+xml" }), `${opts.file}.svg`);
    return;
  }
  const pad = 24;
  const scale = 4;
  const width = NE_WIDTH + (opts.name ? NAME_GAP + nameWidth : 0) + pad * 2;
  const height = CAP + pad * 2;
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * scale);
  canvas.height = Math.ceil(height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);
  drawRing(ctx, opts.ring, opts.tone, 1, pad, pad);
  ctx.save();
  ctx.translate(pad, pad);
  ctx.fillStyle = wordColor(opts.tone);
  ctx.fill(new Path2D(NE_PATH));
  ctx.restore();
  if (opts.name) {
    ctx.font = FONT(CAP / CAP_RATIO);
    ctx.fillStyle = nameColor(opts.tone);
    ctx.textBaseline = "alphabetic";
    ctx.fillText(opts.name, pad + NE_WIDTH + NAME_GAP, pad + CAP);
  }
  canvas.toBlob((b) => b && save(b, `${opts.file}.png`), "image/png");
}

export function downloadIcon(opts: { ring: RingStyle; kind: "app" | "mark"; format: "svg" | "png"; file: string }) {
  const svg = iconSvg(opts.ring, opts.kind);
  if (opts.format === "svg") {
    save(new Blob([svg], { type: "image/svg+xml" }), `${opts.file}.svg`);
    return;
  }
  const size = opts.kind === "app" ? 1024 : 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  if (opts.kind === "app") {
    ctx.fillStyle = COLORS.deep;
    ctx.beginPath();
    ctx.roundRect(0, 0, 1024, 1024, 228);
    ctx.fill();
    const s = 307.2 / RING.r;
    drawRing(ctx, opts.ring, opts.ring === "plus" ? "dark" : "icon", s, 512 - RING.cx * s, 512 - RING.cy * s);
  } else {
    const s = 153.6 / RING.r;
    drawRing(ctx, opts.ring, "light", s, 256 - RING.cx * s, 256 - RING.cy * s);
  }
  canvas.toBlob((b) => b && save(b, `${opts.file}.png`), "image/png");
}
