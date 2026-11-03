/**
 * Choreography of the hero "ecosystem" animation, shared by the 2D canvas and
 * the WebGL renderers so both tell the same story:
 *
 *   1. orbit   – every product circles the empty ring as a glowing comet;
 *   2. dive    – one by one they spiral in; each lights up its own piece of the
 *                ring (drawn from the middle outward, with a flash and sparks);
 *   3. merge   – when all are in, the seams close and the colours turn into the
 *                ONE logo: the flagship becomes the pink accent, the others the
 *                lavender body. A light runs once around the whole ring;
 *   4. hold    – energy flows around the united ring, names sit at their piece;
 *   5. release – the pieces let go, the comets return to orbit, and it repeats.
 *
 * Geometry is in "ring units" (ring radius = 1). Angles are radians in screen
 * convention (0 = 3 o'clock, clockwise, y down), like the SVG logo.
 */
import { RING } from "@/lib/brand";

export type EcoSegment = {
  /** Merged arc, radians. */
  from: number;
  to: number;
  mid: number;
  /** Product identity colour before the merge. */
  color: string;
  /** Colour once merged into the ONE ring. */
  brand: string;
  /** Inner seams of the lavender body, which close on merge. */
  seamStart: boolean;
  seamEnd: boolean;
};

export type Polar = { angle: number; radius: number };

export type EcoItemState = {
  /** The product comet; `absorbed` goes 0 → 1 as it dissolves into its piece. */
  sat: Polar & { absorbed: number };
  /** Share of its piece that is drawn (from the middle outward). */
  fill: number;
  /** Arrival flash, 1 → 0. */
  flash: number;
  /** Seconds since arrival (negative before). */
  since: number;
  /** Where the product's name sits. */
  label: Polar;
};

export type EcoState = {
  items: EcoItemState[];
  /** 0 → 1: seams close and colours turn into the logo. */
  merge: number;
  /** Seconds since the merge started (drives the one-off light sweep), or -1. */
  sinceMerge: number;
  /** 0 → 1 while the pieces let go at the end of a cycle. */
  release: number;
};

export const RING_WIDTH = RING.stroke / RING.r; // ≈ 0.6 ring units
export const ORBIT_RADIUS = 1.78;
export const DOCK_RADIUS = 1.66;

const ACCENT = "#F05BD7";
const BODY = "#C39BFF";
const PRODUCT_COLORS = ["#F05BD7", "#60A5FA", "#FACC15", "#2DD4BF", "#FB923C", "#A78BFA", "#34D399"];
const LOGO_GAP = 2.5; // degrees, as in the logo
const SEAM = 1.1; // degrees left between body pieces once merged

const T = { orbit: 1.1, flight: 1.3, stagger: 0.85, ignite: 0.6, mergeDelay: 0.3, merge: 1.2, hold: 6.5, release: 1.5 };
const ORBIT_SPEED = 0.42; // rad/s
const TAU = Math.PI * 2;

const deg = (d: number) => (d * Math.PI) / 180;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const wrap = (a: number) => ((a % TAU) + TAU) % TAU;
/** Signed shortest turn from a to b, in (-π, π]. */
const turn = (a: number, b: number) => wrap(b - a + Math.PI) - Math.PI;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Splits the ring into one piece per product; merged, the pieces form the ONE logo. */
export function ecoSegments(items: { live: boolean }[]): EcoSegment[] {
  const n = items.length;
  if (n === 0) return [];
  const colorOf = (i: number) => PRODUCT_COLORS[i % PRODUCT_COLORS.length]!;
  const mk = (a: number, b: number, i: number, brand: string, seamStart: boolean, seamEnd: boolean): EcoSegment => ({
    from: deg(a),
    to: deg(b),
    mid: deg((a + b) / 2),
    color: colorOf(i),
    brand,
    seamStart,
    seamEnd,
  });
  // The flagship (first live product) becomes the pink accent piece.
  const lead = Math.max(0, items.findIndex((i) => i.live));
  const rest = items.map((_, i) => i).filter((i) => i !== lead);
  const out: EcoSegment[] = new Array(n);
  if (rest.length === 0) {
    out[lead] = mk(-87.5, 267.5 - LOGO_GAP * 2, lead, ACCENT, false, false);
    return out;
  }
  out[lead] = mk(-87.5, -2.5, lead, ACCENT, false, false);
  const span = 265 / rest.length;
  rest.forEach((idx, j) => {
    const first = j === 0;
    const last = j === rest.length - 1;
    out[idx] = mk(2.5 + j * span + (first ? 0 : SEAM / 2), 2.5 + (j + 1) * span - (last ? 0 : SEAM / 2), idx, BODY, !first, !last);
  });
  return out;
}

export function ecoCycleLength(n: number) {
  return T.orbit + Math.max(0, n - 1) * T.stagger + T.flight + T.ignite + T.mergeDelay + T.merge + T.hold + T.release;
}

const orbitAngle = (i: number, n: number, t: number) => (i / Math.max(n, 1)) * TAU - Math.PI / 2 + t * ORBIT_SPEED;

/** State at time `t` (seconds; loops). `still` (reduced motion) gives the merged logo. */
export function ecoState(t: number, segs: EcoSegment[], still: boolean): EcoState {
  const n = segs.length;
  if (still) {
    return {
      items: segs.map((s) => ({ sat: { angle: s.mid, radius: 1, absorbed: 1 }, fill: 1, flash: 0, since: 99, label: { angle: s.mid, radius: DOCK_RADIUS } })),
      merge: 1,
      sinceMerge: 99,
      release: 0,
    };
  }
  const cycle = ecoCycleLength(n);
  const tc = ((t % cycle) + cycle) % cycle;
  const lastArrive = T.orbit + Math.max(0, n - 1) * T.stagger + T.flight;
  const mergeStart = lastArrive + T.ignite + T.mergeDelay;
  const releaseStart = mergeStart + T.merge + T.hold;
  const release = clamp01((tc - releaseStart) / T.release);
  const r = easeInOut(release);
  const merge = easeInOut(clamp01((tc - mergeStart) / T.merge)) * (1 - easeOut(release));

  const items = segs.map((s, i): EcoItemState => {
    const launch = T.orbit + i * T.stagger;
    const arrive = launch + T.flight;
    const since = tc - arrive;
    const orbiting: Polar = { angle: orbitAngle(i, n, tc), radius: ORBIT_RADIUS };

    if (release > 0) {
      // Back out to where the next cycle's orbit begins, so the loop is seamless.
      const home = orbitAngle(i, n, 0);
      const pos: Polar = { angle: s.mid + turn(s.mid, home) * r, radius: 1 + (ORBIT_RADIUS - 1) * r };
      return {
        sat: { ...pos, absorbed: 1 - Math.min(1, r * 3) },
        fill: 1 - r,
        flash: 0,
        since,
        label: { angle: pos.angle, radius: DOCK_RADIUS + (ORBIT_RADIUS - DOCK_RADIUS) * r },
      };
    }
    if (tc < launch) return { sat: { ...orbiting, absorbed: 0 }, fill: 0, flash: 0, since, label: orbiting };

    // Spiral in, carrying on in the orbit's (clockwise) direction.
    const a0 = orbitAngle(i, n, launch);
    let sweep = wrap(s.mid - a0);
    if (sweep < Math.PI * 0.35) sweep += TAU;
    const k = clamp01((tc - launch) / T.flight);
    const e = easeInOut(k);
    const sat =
      k < 1
        ? { angle: a0 + sweep * e, radius: ORBIT_RADIUS + (1 - ORBIT_RADIUS) * e, absorbed: 0 }
        : { angle: s.mid, radius: 1, absorbed: clamp01(since / 0.25) };
    return {
      sat,
      fill: since < 0 ? 0 : easeOut(clamp01(since / T.ignite)),
      flash: since < 0 ? 0 : Math.max(0, 1 - since / 0.9),
      since,
      label: { angle: a0 + turn(a0, s.mid) * e, radius: ORBIT_RADIUS + (DOCK_RADIUS - ORBIT_RADIUS) * e },
    };
  });

  return { items, merge, sinceMerge: tc >= mergeStart && release === 0 ? tc - mergeStart : -1, release };
}
