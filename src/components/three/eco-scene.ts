/**
 * WebGL version of the hero ecosystem animation (choreography in
 * eco-timeline.ts): glossy 3D ring pieces, one per product. Each product
 * circles as a comet, dives in, and its piece pops out of the arrival point;
 * merged, the pieces take the ONE logo colours and light runs around them.
 */
import * as THREE from "three";
import { ORBIT_RADIUS, easeInOut, easeOut, ecoSegments, ecoState, type EcoState, type Polar } from "./eco-timeline";

export type EcoScreen = { x: number; y: number; alpha: number; front: boolean };

type Ctx = {
  ring: THREE.Group;
  glowTex: THREE.Texture;
  R: number;
  rIn: number;
  rOut: number;
  depth: number;
  software: boolean;
  reducedMotion: boolean;
};

const TAU = Math.PI * 2;
const TRAIL = 9;
const TRAIL_DT = 0.03;
const SPARKS = 12;
const LAVENDER = "#C39BFF";
const PINK = "#F05BD7";
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export function createEcoScene(c: Ctx, items: { live: boolean }[]) {
  const segs = ecoSegments(items);
  const white = new THREE.Color("#ffffff");
  const frontZ = c.depth * 0.75;

  /** Ring-unit polar (screen convention) → ring-local position. */
  const place = (v: THREE.Vector3, p: Polar, z = 0) => v.set(Math.cos(-p.angle) * p.radius * c.R, Math.sin(-p.angle) * p.radius * c.R, z);

  const sprite = (color: THREE.ColorRepresentation, scale: number) => {
    const s = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: c.glowTex, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }),
    );
    s.scale.setScalar(scale);
    c.ring.add(s);
    return s;
  };

  // Empty slots the pieces fill, and the orbit path.
  const track = new THREE.Mesh(
    new THREE.RingGeometry(c.rIn, c.rOut, 160),
    new THREE.MeshBasicMaterial({ color: LAVENDER, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide }),
  );
  track.position.z = -c.depth / 2;
  c.ring.add(track);
  const orbitPts: THREE.Vector3[] = [];
  for (let k = 0; k <= 200; k++) orbitPts.push(new THREE.Vector3(Math.cos((k / 200) * TAU) * ORBIT_RADIUS * c.R, Math.sin((k / 200) * TAU) * ORBIT_RADIUS * c.R, 0));
  const orbit = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(orbitPts),
    new THREE.LineDashedMaterial({ color: LAVENDER, dashSize: 0.05, gapSize: 0.16, transparent: true, opacity: 0.3, depthWrite: false }),
  );
  orbit.computeLineDistances();
  c.ring.add(orbit);

  const pieces = segs.map((s, i) => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, c.rOut, -s.to, -s.from, false);
    shape.absarc(0, 0, c.rIn, -s.from, -s.to, true);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: c.depth,
      curveSegments: 40,
      bevelEnabled: true,
      bevelThickness: 0.14,
      bevelSize: 0.07,
      bevelOffset: -0.07,
      bevelSegments: 4,
    });
    geo.translate(0, 0, -c.depth / 2);
    const color = new THREE.Color(s.color);
    const brand = new THREE.Color(s.brand);
    const mat = c.software
      ? new THREE.MeshStandardMaterial({ color, roughness: 0.24, metalness: 0, emissive: color, emissiveIntensity: 0.1, envMapIntensity: 0.9 })
      : new THREE.MeshPhysicalMaterial({ color, roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, emissive: color, emissiveIntensity: 0.1, envMapIntensity: 0.75 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.visible = false;
    c.ring.add(mesh);
    const mid = place(new THREE.Vector3(), { angle: s.mid, radius: 1 });
    const shock = new THREE.Mesh(
      new THREE.RingGeometry(0.985, 1, 160),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
    );
    c.ring.add(shock);
    return {
      mesh,
      mat,
      color,
      brand,
      mid,
      dir: mid.clone().normalize(),
      shock,
      head: sprite(color, c.R * 0.62),
      core: sprite(white, c.R * 0.16),
      trail: Array.from({ length: TRAIL }, () => sprite(color, c.R * 0.3)),
      sparks: Array.from({ length: SPARKS }, (_, j) => sprite(j % 3 === 0 ? white : color, c.R * 0.12)),
      seed: i * 31,
    };
  });

  // Light that runs around the ring: one long sweep on merge, three while holding.
  const runners = Array.from({ length: 4 }, (_, r) => ({
    sprites: Array.from({ length: r === 0 ? 22 : 10 }, () => sprite(r === 2 ? "#F9A8EC" : r === 3 ? LAVENDER : white, c.R * (r === 0 ? 0.42 : 0.26))),
  }));
  const mergeShock = new THREE.Mesh(
    new THREE.RingGeometry(0.97, 1, 160),
    new THREE.MeshBasicMaterial({ color: PINK, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
  );
  c.ring.add(mergeShock);
  const coreFlash = sprite(white, c.R * 2.4);

  const labels: Polar[] = segs.map((s) => ({ angle: s.mid, radius: 1.66 }));

  function runner(sprites: THREE.Sprite[], head: number, spacing: number, alpha: number) {
    sprites.forEach((sp, j) => {
      const f = 1 - j / sprites.length;
      place(sp.position, { angle: head - j * spacing, radius: 1 }, frontZ);
      sp.material.opacity = alpha * f;
    });
  }

  return {
    /** Advances the animation; returns the label positions in ring-local space. */
    update(t: number, explode: number): Polar[] {
      const st: EcoState = ecoState(t, segs, c.reducedMotion);
      const past = c.reducedMotion ? [] : Array.from({ length: TRAIL }, (_, j) => ecoState(t - (j + 1) * TRAIL_DT, segs, false));
      const open = 0.08 * c.R * (1 - st.merge);

      pieces.forEach((p, i) => {
        const it = st.items[i]!;
        // The piece pops out of its arrival point and grows into place.
        const s = it.fill;
        p.mesh.visible = s > 0.002;
        if (p.mesh.visible) {
          p.mesh.scale.setScalar(Math.max(0.001, s));
          p.mesh.position.copy(p.mid).multiplyScalar(1 - s).addScaledVector(p.dir, open + explode * 1.1);
          p.mesh.position.z = explode * (p.dir.x > 0 ? 0.8 : -0.8);
          p.mat.color.copy(p.color).lerp(p.brand, st.merge);
          p.mat.emissive.copy(p.mat.color);
          p.mat.emissiveIntensity = 0.1 + it.flash * 1.3;
        }

        // Comet with its trail.
        const vis = 1 - it.sat.absorbed;
        place(p.head.position, it.sat, frontZ);
        p.core.position.copy(p.head.position);
        p.head.material.opacity = 0.95 * vis;
        p.core.material.opacity = vis;
        p.trail.forEach((sp, j) => {
          const q = past[j]?.items[i]?.sat;
          if (!q || q.absorbed >= 1) {
            sp.material.opacity = 0;
            return;
          }
          place(sp.position, q, frontZ);
          const f = 1 - (j + 1) / (TRAIL + 1);
          sp.material.opacity = 0.6 * f * vis;
          sp.scale.setScalar(c.R * (0.12 + 0.3 * f));
        });

        // Arrival shock ring and sparks.
        const k = it.since;
        const on = k >= 0 && k <= 1;
        p.shock.visible = on;
        if (on) {
          p.shock.scale.setScalar(c.R * (1 + 0.85 * easeOut(k)));
          p.shock.material.opacity = 0.6 * (1 - k);
        }
        p.sparks.forEach((sp, j) => {
          if (!on) {
            sp.material.opacity = 0;
            return;
          }
          const h = hash(p.seed + j);
          const s0 = segs[i]!;
          const dirA = s0.mid + (j / SPARKS - 0.5) * Math.PI * 1.5 + (h - 0.5) * 0.4;
          const dist = (0.12 + 0.6 * easeOut(k)) * (0.55 + 0.45 * h) * c.R;
          sp.position.set(p.mid.x + Math.cos(-dirA) * dist, p.mid.y + Math.sin(-dirA) * dist, frontZ + (h - 0.5) * 0.6);
          sp.material.opacity = 1 - k;
        });
        labels[i] = it.label;
      });

      track.material.opacity = 0.04 + 0.07 * (1 - st.merge);
      orbit.material.opacity = 0.3 * (1 - st.merge);

      // Merge: one lap of light, a wide shock ring and a flash at the core.
      const m = st.sinceMerge;
      const sweeping = m >= 0 && m < 1.6;
      const km = sweeping ? m / 1.6 : 1;
      runner(runners[0]!.sprites, -Math.PI / 2 + easeInOut(km) * TAU, 0.09, sweeping ? Math.sin(Math.PI * Math.min(1, km * 1.15)) : 0);
      mergeShock.visible = sweeping;
      if (sweeping) {
        mergeShock.scale.setScalar(c.R * (1 + 1.4 * easeOut(km)));
        mergeShock.material.opacity = 0.45 * (1 - km);
      }
      coreFlash.material.opacity = sweeping ? 0.35 * (1 - km) : 0;

      // Hold: energy keeps flowing around the logo.
      const flow = st.merge > 0.6 && st.release === 0 && !c.reducedMotion ? (st.merge - 0.6) / 0.4 : 0;
      runner(runners[1]!.sprites, t * 1.25, 0.1, 0.6 * flow);
      runner(runners[2]!.sprites, t * 0.8 + 2.4, 0.08, 0.45 * flow);
      runner(runners[3]!.sprites, -t * 0.6 + 4.1, -0.07, 0.35 * flow);
      return labels;
    },
  };
}
