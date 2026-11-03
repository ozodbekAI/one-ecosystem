/**
 * WebGL scene: the ONE ring logo as a glossy 3D object.
 *
 * The ring is built from the same segment data as the SVG logo (lib/brand.ts),
 * so the 3D ring is the logo — pink accent + lavender body for ONE, four
 * colours for ONE Plus. On start the segments fly in from all sides and close
 * into one ring ("bo'laklar bitta butunga yopiladi"); then it floats, turns
 * toward the pointer, and comes apart again as the visitor scrolls away.
 * In the hero, the products assemble the ring instead (eco-scene.ts): their
 * name positions are reported every frame so the page can pin HTML labels
 * (real links) to them.
 *
 * Loaded with a dynamic import so three.js never lands in the main bundle.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RING, ringSegments, type RingStyle } from "@/lib/brand";
import { createEcoScene } from "./eco-scene";

export type NodeScreen = { x: number; y: number; alpha: number; front: boolean };

export type RingSceneOptions = {
  canvas: HTMLCanvasElement;
  ring: RingStyle;
  /** Products that assemble the ring in the hero (one piece each); the first live one becomes the accent. */
  nodes: { live: boolean }[];
  /** "hero": ring sits right on wide screens, top-centre on narrow ones. "focus": centred. */
  layout: "hero" | "focus";
  reducedMotion: boolean;
  onFrame?: (nodes: NodeScreen[]) => void;
};

export type RingScene = {
  /** Pointer position, -1..1 on both axes. */
  setPointer(x: number, y: number): void;
  /** 0 = in view, 1 = scrolled away: the ring tilts back and comes apart. */
  setProgress(p: number): void;
  /** Slows the orbit while a label is hovered so links are easy to hit. */
  setHover(on: boolean): void;
  resize(width: number, height: number): void;
  setActive(on: boolean): void;
  dispose(): void;
};

const LAVENDER = "#C39BFF";
const PINK = "#F05BD7";
const VIOLET = "#7F22E8";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeOutBack = (t: number) => {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/** Small deterministic PRNG so the intro looks the same on every visit. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function glowTexture() {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.2, "rgba(255,255,255,0.5)");
  grd.addColorStop(0.55, "rgba(255,255,255,0.09)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const STAR_VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float twinkle = 0.55 + 0.45 * sin(uTime * (0.5 + aSeed * 1.6) + aSeed * 61.0);
    gl_PointSize = aSize * uPixelRatio * (14.0 / -mv.z);
    vColor = aColor;
    vAlpha = twinkle * uOpacity;
  }
`;

const STAR_FRAGMENT = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor, a * a * vAlpha);
    #include <colorspace_fragment>
  }
`;

type Segment = {
  mesh: THREE.Mesh<THREE.ExtrudeGeometry, THREE.MeshStandardMaterial>;
  dir: THREE.Vector3;
  fromPos: THREE.Vector3;
  fromRot: THREE.Euler;
  delay: number;
};

export function createRingScene(o: RingSceneOptions): RingScene {
  const dpr = window.devicePixelRatio || 1;
  const small = Math.min(window.innerWidth, window.innerHeight) < 640;
  // MSAA is wasted work on dense screens; the pixel ratio already smooths edges there.
  const renderer = new THREE.WebGLRenderer({
    canvas: o.canvas,
    antialias: dpr < 1.5,
    alpha: true,
    powerPreference: "high-performance",
  });
  // No GPU (Chrome on many Linux setups, VMs): WebGL runs on the CPU, so draw
  // fewer pixels, at 30 fps, with a cheaper material.
  const gl = renderer.getContext();
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const gpuName = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
  const software = /swiftshader|llvmpipe|softpipe|software/i.test(gpuName);
  const minPixelRatio = software ? 0.5 : 0.75;
  const frameMs = software ? 32 : 15;
  let pixelRatio = software ? Math.min(dpr, 0.75) : Math.min(dpr, small ? 1.25 : 1.5);
  renderer.setPixelRatio(pixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envTex = pmrem.fromScene(room, 0.04).texture;
  scene.environment = envTex;
  room.dispose();

  // ── Lights: two coloured lights sweep across the glossy faces ────────────
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(-3, 4, 6);
  scene.add(key);
  const pinkLight = new THREE.PointLight(PINK, 40, 20, 2);
  const violetLight = new THREE.PointLight(VIOLET, 55, 22, 2);
  scene.add(pinkLight, violetLight);

  // rig: pointer + scroll rotation.  ring: the logo itself.
  const rig = new THREE.Group();
  const ring = new THREE.Group();
  rig.add(ring);
  scene.add(rig);

  // ── The ring, segment by segment ─────────────────────────────────────────
  const R = 1.7;
  const W = R * (RING.stroke / RING.r);
  const rIn = R - W / 2;
  const rOut = R + W / 2;
  const DEPTH = 0.55;
  const rand = rng(o.ring === "plus" ? 11 : 7);
  // Hero with products: the ecosystem animation (eco-scene.ts) builds its own
  // pieces. Elsewhere: the logo ring flies together once.
  const eco = o.layout === "hero" && o.nodes.length > 0;

  const segments: Segment[] = (eco ? [] : ringSegments(o.ring, "dark")).map((s, i) => {
    // SVG angles run clockwise with y down; three.js runs counter-clockwise with y up.
    const a0 = THREE.MathUtils.degToRad(-s.to);
    const a1 = THREE.MathUtils.degToRad(-s.from);
    const shape = new THREE.Shape();
    shape.absarc(0, 0, rOut, a0, a1, false);
    shape.absarc(0, 0, rIn, a1, a0, true);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: DEPTH,
      curveSegments: 48,
      bevelEnabled: true,
      bevelThickness: 0.14,
      bevelSize: 0.07,
      bevelOffset: -0.07,
      bevelSegments: 5,
    });
    geo.translate(0, 0, -DEPTH / 2);
    const color = new THREE.Color(s.color);
    const mat = software
      ? new THREE.MeshStandardMaterial({ color, roughness: 0.24, metalness: 0, emissive: color, emissiveIntensity: 0.1, envMapIntensity: 0.9 })
      : new THREE.MeshPhysicalMaterial({
          color,
          roughness: 0.3,
          metalness: 0.0,
          clearcoat: 1,
          clearcoatRoughness: 0.05,
          emissive: color,
          emissiveIntensity: 0.1,
          envMapIntensity: 0.75,
        });
    const mesh = new THREE.Mesh(geo, mat);
    const mid = THREE.MathUtils.degToRad(-(s.from + s.to) / 2);
    const dir = new THREE.Vector3(Math.cos(mid), Math.sin(mid), 0);
    const fromPos = dir
      .clone()
      .multiplyScalar(5.5 + rand() * 2.5)
      .add(new THREE.Vector3((rand() - 0.5) * 2, (rand() - 0.5) * 2, -5 + rand() * 7));
    const fromRot = new THREE.Euler((rand() - 0.5) * 5, (rand() - 0.5) * 5, (rand() - 0.5) * 3);
    ring.add(mesh);
    return { mesh, dir, fromPos, fromRot, delay: 0.1 + i * 0.16 };
  });

  // ── Soft light behind the ring (additive sprites, no post-processing) ────
  const glowTex = glowTexture();
  const glowMain = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glowTex, color: VIOLET, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }),
  );
  glowMain.scale.setScalar(o.layout === "focus" ? 6 : 10);
  glowMain.position.z = -1.4;
  const accentColor = ringSegments(o.ring, "dark")[0]?.color ?? PINK;
  const glowAccent = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: glowTex, color: accentColor, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }),
  );
  glowAccent.scale.setScalar(o.layout === "focus" ? 3.2 : 4.6);
  glowAccent.position.set(1.15, 1.2, -0.9);
  rig.add(glowMain, glowAccent);

  // ── Star dust ─────────────────────────────────────────────────────────────
  const starCount = Math.round((o.layout === "hero" ? (small ? 380 : 850) : small ? 140 : 280) * (software ? 0.5 : 1));
  const starPos = new Float32Array(starCount * 3);
  const starCol = new Float32Array(starCount * 3);
  const starSize = new Float32Array(starCount);
  const starSeed = new Float32Array(starCount);
  const palette = [new THREE.Color(LAVENDER), new THREE.Color(PINK), new THREE.Color("#ffffff"), new THREE.Color("#60A5FA")];
  const starRand = rng(3);
  for (let i = 0; i < starCount; i++) {
    const r = 2.8 + Math.pow(starRand(), 0.7) * 12;
    const theta = starRand() * Math.PI * 2;
    const phi = Math.acos(2 * starRand() - 1);
    starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta) * 1.3;
    starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.75;
    starPos[i * 3 + 2] = r * Math.cos(phi) - 4;
    const pickN = starRand();
    const c = palette[pickN < 0.5 ? 0 : pickN < 0.72 ? 2 : pickN < 0.93 ? 1 : 3]!;
    starCol[i * 3] = c.r;
    starCol[i * 3 + 1] = c.g;
    starCol[i * 3 + 2] = c.b;
    starSize[i] = 0.6 + Math.pow(starRand(), 3) * 3.2;
    starSeed[i] = starRand();
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute("aColor", new THREE.BufferAttribute(starCol, 3));
  starGeo.setAttribute("aSize", new THREE.BufferAttribute(starSize, 1));
  starGeo.setAttribute("aSeed", new THREE.BufferAttribute(starSeed, 1));
  const starMat = new THREE.ShaderMaterial({
    vertexShader: STAR_VERTEX,
    fragmentShader: STAR_FRAGMENT,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uOpacity: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  const ecoScene = eco ? createEcoScene({ ring, glowTex, R, rIn, rOut, depth: DEPTH, software, reducedMotion: o.reducedMotion }, o.nodes) : null;

  // ── State ─────────────────────────────────────────────────────────────────
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let progress = 0;
  let progressTarget = 0;
  let hover = false;
  let timeScale = 1;
  let ecoTime = 0;
  let width = 1;
  let height = 1;
  let baseX = 0;
  let baseY = 0;
  let baseScale = 1;
  let active = false;
  let raf = 0;
  let last = 0;
  let elapsed = o.reducedMotion ? 100 : 0;
  const tmp = new THREE.Vector3();
  const ringWorld = new THREE.Vector3();
  const screens: NodeScreen[] = o.nodes.map(() => ({ x: -9999, y: -9999, alpha: 0, front: true }));

  function layout() {
    const visH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const visW = visH * camera.aspect;
    const extent = eco ? 7.0 : 5.9; // ring (+ orbits), in world units
    if (o.layout === "hero" && camera.aspect >= 1.05) {
      baseScale = Math.min(visH / extent, (visW * 0.5) / extent) * 0.92;
      baseX = visW * 0.23;
      baseY = -visH * 0.02;
    } else if (o.layout === "hero") {
      baseScale = Math.min(visW / extent, (visH * 0.42) / extent) * 0.98;
      baseX = 0;
      baseY = visH * 0.255;
    } else {
      baseScale = Math.min(visW, visH) / extent;
      baseX = 0;
      baseY = 0;
    }
  }

  // Adaptive quality: if frames keep running slow, render fewer pixels.
  let sampled = 0;
  let slow = 0;
  let lastAdjust = 0;
  function adapt(dt: number, now: number) {
    sampled++;
    if (dt > (software ? 0.045 : 0.028)) slow++;
    if (sampled < 45) return;
    if (slow > 18 && pixelRatio > minPixelRatio && now - lastAdjust > 1500) {
      pixelRatio = Math.max(minPixelRatio, pixelRatio - 0.25);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      starMat.uniforms["uPixelRatio"]!.value = pixelRatio;
      lastAdjust = now;
    }
    sampled = 0;
    slow = 0;
  }

  function frame(now: number) {
    if (active && !o.reducedMotion) raf = requestAnimationFrame(frame);
    // Cap at ~60 fps (30 without a GPU) so fast screens do not render more often than needed.
    if (last && now - last < frameMs) return;
    const dt = Math.min((now - (last || now)) / 1000, 0.1);
    last = now;
    if (!o.reducedMotion) elapsed += dt;
    const t = elapsed;

    // Smooth inputs
    pointer.x = THREE.MathUtils.damp(pointer.x, pointer.tx, 3.2, dt);
    pointer.y = THREE.MathUtils.damp(pointer.y, pointer.ty, 3.2, dt);
    progress = THREE.MathUtils.damp(progress, progressTarget, 6, dt);
    // Hovering a product name slows the story down so the link is easy to hit.
    timeScale = THREE.MathUtils.damp(timeScale, hover ? 0.12 : 1, 4, dt);
    // Scrolled away: nothing visible to draw.
    if (progress > 0.985 && progressTarget > 0.985) return;

    // Intro: segments close into one ring
    for (const s of segments) {
      const k = o.reducedMotion ? 1 : clamp01((t - s.delay) / 1.5);
      const e = easeOutExpo(k);
      const b = easeOutBack(Math.min(1, k * 1.05));
      const explode = progress * 1.1;
      s.mesh.position.copy(s.fromPos).lerp(tmp.set(0, 0, 0), e);
      s.mesh.position.addScaledVector(s.dir, explode);
      s.mesh.position.z += progress * (s.dir.x > 0 ? 0.8 : -0.8);
      s.mesh.rotation.set(s.fromRot.x * (1 - e), s.fromRot.y * (1 - e) + progress * s.dir.y * 0.8, s.fromRot.z * (1 - e));
      s.mesh.scale.setScalar(0.35 + 0.65 * b);
      s.mesh.material.emissiveIntensity = 0.1 + (1 - e) * 0.9;
    }
    const intro = o.reducedMotion ? 1 : clamp01((t - 0.2) / 2.2);
    const settle = easeOutExpo(intro);

    // Rig: pointer, idle float, scroll tilt
    const float = o.reducedMotion ? 0 : Math.sin(t * 0.9) * 0.09;
    rig.position.set(baseX + pointer.x * 0.15, baseY + float + progress * 0.8, -progress * 1.5);
    rig.scale.setScalar(baseScale * (0.86 + 0.14 * settle) * (1 + progress * 0.12));
    // Rest at a three-quarter angle so the depth and bevels read as 3D.
    rig.rotation.x = 0.2 - pointer.y * 0.3 + progress * 1.05 + (1 - settle) * 0.5;
    rig.rotation.y = -0.42 + pointer.x * 0.5 + (1 - settle) * -1.1;
    ring.rotation.z = o.reducedMotion ? 0 : Math.sin(t * 0.27) * 0.07;

    // Lights orbit for moving highlights
    pinkLight.position.set(Math.cos(t * 0.55) * 4.2 + baseX, Math.sin(t * 0.8) * 2.6 + baseY, 3.2);
    violetLight.position.set(Math.cos(t * 0.4 + 2.4) * 4.6 + baseX, Math.sin(t * 0.33 + 1) * 3.2 + baseY, 2.4);

    glowMain.material.opacity = 0.75 * settle * (1 - progress * 0.6);
    glowAccent.material.opacity = 0.42 * settle * (1 - progress * 0.6);

    // Stars
    starMat.uniforms["uTime"]!.value = t;
    starMat.uniforms["uOpacity"]!.value = clamp01(t / 1.6) * (1 - progress * 0.5);
    stars.rotation.y = t * 0.012 + pointer.x * 0.06;
    stars.rotation.x = pointer.y * 0.04;
    stars.position.y = progress * 1.2;

    // Ecosystem pieces, comets, and where the product names go.
    rig.updateMatrixWorld();
    ring.getWorldPosition(ringWorld);
    ringWorld.project(camera);
    if (ecoScene) {
      if (!o.reducedMotion) ecoTime += dt * timeScale;
      const fadeIn = o.reducedMotion ? 1 : clamp01(t / 0.8);
      ecoScene.update(ecoTime, progress).forEach((p, i) => {
        tmp.set(Math.cos(-p.angle) * p.radius * R, Math.sin(-p.angle) * p.radius * R, 0);
        ring.localToWorld(tmp);
        tmp.project(camera);
        const sc = screens[i]!;
        sc.x = (tmp.x * 0.5 + 0.5) * width;
        sc.y = (-tmp.y * 0.5 + 0.5) * height;
        sc.front = tmp.z <= ringWorld.z + 0.002;
        sc.alpha = fadeIn * (1 - progress);
      });
    }
    o.onFrame?.(screens);

    renderer.render(scene, camera);
    if (dt > 0) adapt(dt, now);
  }

  function start() {
    if (raf) cancelAnimationFrame(raf);
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  function onVisibility() {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (active) start();
  }
  document.addEventListener("visibilitychange", onVisibility);

  return {
    setPointer(x, y) {
      if (o.reducedMotion) return;
      pointer.tx = x;
      pointer.ty = y;
    },
    setProgress(p) {
      progressTarget = clamp01(p);
      if (o.reducedMotion) {
        progress = progressTarget;
        start();
      }
    },
    setHover(on) {
      hover = on;
    },
    resize(w, h) {
      width = Math.max(1, w);
      height = Math.max(1, h);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      layout();
      if (!active || o.reducedMotion) start();
    },
    setActive(on) {
      if (on === active) return;
      active = on;
      if (on) start();
      else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    dispose() {
      active = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = (mesh as { material?: THREE.Material | THREE.Material[] }).material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      });
      glowTex.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
