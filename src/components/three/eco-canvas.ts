/**
 * 2D canvas renderer of the hero ecosystem animation (see eco-timeline.ts).
 * Used where WebGL would run without a GPU: one canvas, pre-rendered glow
 * sprites and conic-gradient light trails keep it smooth on the CPU.
 * Stateless per frame — comet trails are re-sampled from the timeline.
 */
import { ORBIT_RADIUS, RING_WIDTH, easeInOut, easeOut, ecoSegments, ecoState, type EcoSegment, type EcoState, type Polar } from "./eco-timeline";

export type LabelScreen = { x: number; y: number; alpha: number };

export type EcoCanvas = {
  resize(width: number, height: number): void;
  setActive(on: boolean): void;
  /** Pointer, -1..1; the renderer reports a smoothed tilt back through onTilt. */
  setPointer(x: number, y: number): void;
  dispose(): void;
};

const TAU = Math.PI * 2;
const LAVENDER = "#C39BFF";
const PINK = "#F05BD7";
const TRAIL_STEPS = 14;
const TRAIL_DT = 0.022;

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(a: string, b: string, t: number) {
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
}
function rgba(hex: string, a: number) {
  const [r, g, b] = rgb(hex);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
}
/** Tiny deterministic hash → 0..1 (spark spread). */
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export function createEcoCanvas(o: {
  canvas: HTMLCanvasElement;
  items: { live: boolean }[];
  reducedMotion: boolean;
  onFrame?: (labels: LabelScreen[]) => void;
  onTilt?: (rx: number, ry: number) => void;
}): EcoCanvas {
  const maybeCtx = o.canvas.getContext("2d");
  if (!maybeCtx) throw new Error("2D canvas unavailable");
  const ctx: CanvasRenderingContext2D = maybeCtx;
  const segs: EcoSegment[] = ecoSegments(o.items);
  const sprites = new Map<string, HTMLCanvasElement>();
  const supportsConic = typeof ctx.createConicGradient === "function";

  function sprite(color: string) {
    let c = sprites.get(color);
    if (c) return c;
    c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, rgba(color, 1));
    grd.addColorStop(0.22, rgba(color, 0.55));
    grd.addColorStop(0.6, rgba(color, 0.1));
    grd.addColorStop(1, rgba(color, 0));
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    sprites.set(color, c);
    return c;
  }
  const glow = (color: string, x: number, y: number, size: number, alpha: number) => {
    if (alpha <= 0.003 || size <= 0) return;
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.drawImage(sprite(color), x - size / 2, y - size / 2, size, size);
    ctx.globalAlpha = 1;
  };

  let W = 1;
  let H = 1;
  let dpr = 1;
  let cx = 0;
  let cy = 0;
  let R = 1;
  let lw = 1;
  let gloss: CanvasGradient | null = null;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let active = false;
  let raf = 0;
  let last = 0;
  let elapsed = 0;

  const at = (p: Polar) => [cx + Math.cos(p.angle) * p.radius * R, cy + Math.sin(p.angle) * p.radius * R] as const;

  function arc(radius: number, a0: number, a1: number, width: number, style: string | CanvasGradient, dy = 0) {
    ctx.beginPath();
    ctx.arc(cx, cy + dy, radius, a0, a1);
    ctx.lineWidth = width;
    ctx.strokeStyle = style;
    ctx.stroke();
  }

  /** A light running along the ring that fades out behind its head. */
  function lightTrail(head: number, length: number, width: number, alpha: number, color = "#ffffff") {
    if (!supportsConic || alpha <= 0.01) return;
    const g = ctx.createConicGradient(head - length, cx, cy);
    const f = length / TAU;
    g.addColorStop(0, rgba(color, 0));
    g.addColorStop(f * 0.75, rgba(color, alpha * 0.55));
    g.addColorStop(f, rgba(color, alpha));
    g.addColorStop(Math.min(1, f + 0.002), rgba(color, 0));
    g.addColorStop(1, rgba(color, 0));
    ctx.globalCompositeOperation = "lighter";
    arc(R, head - length, head, width, g);
    ctx.globalCompositeOperation = "source-over";
  }

  function draw(t: number) {
    const st: EcoState = ecoState(t, segs, o.reducedMotion);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = "butt";

    const breathe = o.reducedMotion ? 1 : 0.86 + 0.14 * Math.sin(t * 1.25);
    glow("#7F22E8", cx, cy, R * 4.6, (0.38 + st.merge * 0.3) * breathe);
    glow(PINK, cx + R * 0.55, cy - R * 0.55, R * 2.2, 0.12 + st.merge * 0.18);

    // Orbit path and the empty ring waiting for its pieces.
    const track = 1 - st.merge;
    if (track > 0.01) {
      ctx.save();
      ctx.setLineDash([2, 8]);
      ctx.globalAlpha = 0.3 * track;
      arc(ORBIT_RADIUS * R, 0, TAU, 1, LAVENDER);
      ctx.restore();
    }
    arc(R, 0, TAU, lw, rgba(LAVENDER, 0.05 + 0.05 * track));
    arc(R - lw / 2, 0, TAU, 1, rgba(LAVENDER, 0.14 * track + 0.03));
    arc(R + lw / 2, 0, TAU, 1, rgba(LAVENDER, 0.14 * track + 0.03));

    // The pieces: soft shadow, colour, gloss and rim light.
    const open = (3.4 * Math.PI) / 180 * (1 - st.merge);
    st.items.forEach((it, i) => {
      if (it.fill <= 0.001) return;
      const s = segs[i]!;
      const lo = s.from + open;
      const hi = s.to - open;
      const mid = (lo + hi) / 2;
      const half = ((hi - lo) / 2) * it.fill;
      const a0 = mid - half;
      const a1 = mid + half;
      const color = mix(s.color, s.brand, st.merge);
      arc(R, a0, a1, lw, "rgba(8,3,20,0.45)", R * 0.07);
      arc(R, a0, a1, lw, color);
      if (gloss) arc(R, a0, a1, lw, gloss);
      arc(R + lw / 2 - 1, a0, a1, 1.5, "rgba(255,255,255,0.28)");
      if (it.flash > 0) {
        ctx.globalCompositeOperation = "lighter";
        arc(R, a0, a1, lw * (1 + 0.18 * it.flash), `rgba(255,255,255,${(0.55 * it.flash).toFixed(3)})`);
        ctx.globalCompositeOperation = "source-over";
      }
    });

    // Arrival: shock ring and sparks.
    ctx.globalCompositeOperation = "lighter";
    st.items.forEach((it, i) => {
      if (it.since < 0 || it.since > 1) return;
      const s = segs[i]!;
      const k = it.since;
      arc(R * (1 + 0.85 * easeOut(k)), 0, TAU, Math.max(0.5, 3 * (1 - k)), rgba(s.color, 0.55 * (1 - k)));
      const [px, py] = at({ angle: s.mid, radius: 1 });
      for (let j = 0; j < 16; j++) {
        const h = hash(i * 31 + j);
        const dir = s.mid + (j / 16 - 0.5) * Math.PI * 1.5 + (h - 0.5) * 0.4;
        const dist = R * (0.12 + 0.6 * easeOut(k)) * (0.55 + 0.45 * h);
        glow(j % 3 === 0 ? "#ffffff" : s.color, px + Math.cos(dir) * dist, py + Math.sin(dir) * dist, lw * (0.9 - 0.6 * k), 1 - k);
      }
    });

    // Merge: one light lap around the united ring, a wide shock ring, a core flash.
    if (st.sinceMerge >= 0 && st.sinceMerge < 1.6) {
      const k = st.sinceMerge / 1.6;
      const fade = Math.sin(Math.PI * Math.min(1, k * 1.15));
      lightTrail(-Math.PI / 2 + easeInOut(k) * TAU, 2.4, lw * 1.05, 0.95 * fade);
      arc(R * (1 + 1.4 * easeOut(k)), 0, TAU, Math.max(0.5, lw * 0.25 * (1 - k)), rgba(PINK, 0.45 * (1 - k)));
      glow("#ffffff", cx, cy, R * 2.4, 0.35 * (1 - k));
    }
    // Hold: energy keeps flowing around the logo.
    if (st.merge > 0.6 && st.release === 0 && !o.reducedMotion) {
      const a = (st.merge - 0.6) / 0.4;
      lightTrail(t * 1.25, 1.1, lw * 0.5, 0.55 * a);
      lightTrail(t * 0.8 + 2.4, 0.8, lw * 0.35, 0.4 * a, "#F9A8EC");
      lightTrail(-t * 0.6 + 4.1, 0.6, lw * 0.25, 0.3 * a, LAVENDER);
    }
    ctx.globalCompositeOperation = "source-over";

    // Product comets with trails.
    if (!o.reducedMotion) {
      const past: EcoState[] = [];
      for (let j = 1; j <= TRAIL_STEPS; j++) past.push(ecoState(t - j * TRAIL_DT, segs, false));
      ctx.globalCompositeOperation = "lighter";
      st.items.forEach((it, i) => {
        const vis = 1 - it.sat.absorbed;
        if (vis <= 0.01) return;
        const color = segs[i]!.color;
        past.forEach((p, j) => {
          const q = p.items[i]!.sat;
          if (q.absorbed >= 1) return;
          const [x, y] = at(q);
          const f = 1 - (j + 1) / (TRAIL_STEPS + 1);
          glow(color, x, y, lw * (0.25 + 0.75 * f), 0.55 * f * vis);
        });
        const [x, y] = at(it.sat);
        glow(color, x, y, lw * 2.3, 0.95 * vis);
        glow("#ffffff", x, y, lw * 0.7, vis);
      });
      ctx.globalCompositeOperation = "source-over";
    }

    o.onFrame?.(
      st.items.map((it) => {
        const [x, y] = at(it.label);
        return { x, y, alpha: 1 };
      }),
    );
  }

  function frame(now: number) {
    if (active && !o.reducedMotion) raf = requestAnimationFrame(frame);
    if (last && now - last < 15) return;
    const dt = Math.min((now - (last || now)) / 1000, 0.1);
    last = now;
    elapsed += dt;
    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 4);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 4);
    o.onTilt?.(-pointer.y * 9, pointer.x * 12);
    draw(elapsed);
  }

  function start() {
    cancelAnimationFrame(raf);
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  const onVisibility = () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else if (active) start();
  };
  document.addEventListener("visibilitychange", onVisibility);

  return {
    resize(w, h) {
      W = Math.max(1, w);
      H = Math.max(1, h);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      o.canvas.width = Math.round(W * dpr);
      o.canvas.height = Math.round(H * dpr);
      cx = W / 2;
      cy = H / 2;
      // Leave room around the ring: the farthest glow (comet on its orbit,
      // merge shock ring) reaches ~2.5 R, and nothing may touch the canvas edge
      // or it shows as a hard line.
      R = Math.min(W, H) * 0.19;
      lw = R * RING_WIDTH;
      gloss = ctx.createLinearGradient(cx - R * 1.3, cy - R * 1.3, cx + R * 1.3, cy + R * 1.3);
      gloss.addColorStop(0, "rgba(255,255,255,0.42)");
      gloss.addColorStop(0.42, "rgba(255,255,255,0.05)");
      gloss.addColorStop(0.68, "rgba(0,0,0,0.05)");
      gloss.addColorStop(1, "rgba(0,0,0,0.34)");
      if (!active || o.reducedMotion) draw(elapsed);
    },
    setActive(on) {
      if (on === active) return;
      active = on;
      if (on && !o.reducedMotion) start();
      else cancelAnimationFrame(raf);
    },
    setPointer(x, y) {
      if (o.reducedMotion) return;
      pointer.tx = x;
      pointer.ty = y;
    },
    dispose() {
      active = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      sprites.clear();
    },
  };
}
