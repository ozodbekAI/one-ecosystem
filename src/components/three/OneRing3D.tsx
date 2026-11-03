import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion, type MotionValue } from "motion/react";
import { Ring3DCss } from "@/components/motion/primitives";
import type { RingStyle } from "@/lib/brand";
import { isLiteDevice } from "@/lib/device";
import { cn } from "@/lib/utils";
import type { RingScene } from "./ring-scene";
import type { EcoCanvas } from "./eco-canvas";

export type OrbitNode = { key: string; live: boolean; content: ReactNode };

/**
 * The 3D ONE ring (see ring-scene.ts). three.js is loaded only in the browser,
 * after mount. Orbit labels are plain HTML pinned to the satellites every
 * frame, so they stay real, focusable links. Without a GPU the hero gets the
 * 2D ecosystem animation (products fly in and assemble the logo) and other
 * places the lightweight CSS ring.
 */
export function OneRing3D({
  ring = "brand",
  layout = "hero",
  nodes = [],
  progress,
  className,
}: {
  ring?: RingStyle;
  layout?: "hero" | "focus";
  nodes?: OrbitNode[];
  /** Scroll progress (0 → 1 as the section leaves the screen). */
  progress?: MotionValue<number>;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sceneRef = useRef<RingScene | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const reduced = useReducedMotion() ?? false;
  const liveKey = nodes.map((n) => `${n.key}:${n.live ? 1 : 0}`).join(",");

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    if (isLiteDevice()) {
      setState("failed");
      return;
    }
    let cancelled = false;
    let cleanup = () => {};

    import("./ring-scene")
      .then(({ createRingScene }) => {
        if (cancelled) return;
        let scene: RingScene;
        try {
          scene = createRingScene({
            canvas,
            ring,
            layout,
            reducedMotion: reduced,
            nodes: nodes.map((n) => ({ live: n.live })),
            onFrame: (pts) => {
              pts.forEach((p, i) => {
                const el = labelRefs.current[i];
                if (!el) return;
                el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) translate(-50%, -150%) scale(${p.front ? 1 : 0.86})`;
                el.style.opacity = p.alpha.toFixed(3);
                el.style.zIndex = p.front ? "3" : "1";
                el.style.pointerEvents = p.alpha > 0.3 ? "auto" : "none";
              });
            },
          });
        } catch {
          setState("failed");
          return;
        }
        sceneRef.current = scene;

        const ro = new ResizeObserver(([entry]) => {
          if (entry) scene.resize(entry.contentRect.width, entry.contentRect.height);
        });
        ro.observe(wrap);
        const io = new IntersectionObserver(([entry]) => scene.setActive(Boolean(entry?.isIntersecting)), { rootMargin: "100px" });
        io.observe(wrap);
        const onPointer = (e: PointerEvent) => {
          scene.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
        };
        window.addEventListener("pointermove", onPointer, { passive: true });
        const unsub = progress?.on("change", (v) => scene.setProgress(v));
        if (progress) scene.setProgress(progress.get());
        setState("ready");

        cleanup = () => {
          ro.disconnect();
          io.disconnect();
          window.removeEventListener("pointermove", onPointer);
          unsub?.();
          scene.dispose();
          sceneRef.current = null;
        };
      })
      .catch(() => setState("failed"));

    return () => {
      cancelled = true;
      cleanup();
    };
    // Rebuild only when what the scene draws changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ring, layout, reduced, liveKey]);

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={cn(
          "absolute inset-0 h-full w-full transition-opacity duration-1000",
          state === "ready" ? "opacity-100" : "opacity-0",
          // A boxed canvas fades out at its edges so the glow never shows a hard border.
          layout === "focus" && "[mask-image:radial-gradient(closest-side,#000_78%,transparent)]",
        )}
      />
      {state === "failed" && layout === "hero" && nodes.length > 0 ? <EcoRing2D nodes={nodes} progress={progress} /> : null}
      {state === "failed" && !(layout === "hero" && nodes.length > 0) ? (
        <Ring3DCss
          ring={ring}
          className={cn(
            "absolute",
            layout === "hero"
              ? "top-[9%] left-1/2 w-[58vw] max-w-[340px] -translate-x-1/2 md:top-1/2 md:right-[7%] md:left-auto md:w-[min(29vw,410px)] md:max-w-none md:translate-x-0 md:-translate-y-1/2"
              : "inset-[12%]",
          )}
        />
      ) : null}
      {state === "ready"
        ? nodes.map((n, i) => (
            <div
              key={n.key}
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              className="absolute top-0 left-0 opacity-0 will-change-transform"
              style={{ transform: "translate3d(-9999px,0,0)" }}
              onPointerEnter={() => sceneRef.current?.setHover(true)}
              onPointerLeave={() => sceneRef.current?.setHover(false)}
              onFocus={() => sceneRef.current?.setHover(true)}
              onBlur={() => sceneRef.current?.setHover(false)}
            >
              {n.content}
            </div>
          ))
        : null}
    </div>
  );
}

/**
 * Hero ecosystem animation on a 2D canvas (see eco-canvas.ts): the products
 * orbit, dive in one by one and assemble the ONE logo. Names follow their
 * comet, then sit next to their piece of the ring.
 */
function EcoRing2D({ nodes, progress }: { nodes: OrbitNode[]; progress?: MotionValue<number> | undefined }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = useReducedMotion() ?? false;
  const liveKey = nodes.map((n) => `${n.key}:${n.live ? 1 : 0}`).join(",");

  useEffect(() => {
    const box = boxRef.current;
    const tilt = tiltRef.current;
    const canvas = canvasRef.current;
    if (!box || !tilt || !canvas) return;
    let cancelled = false;
    let cleanup = () => {};

    import("./eco-canvas")
      .then(({ createEcoCanvas }) => {
        if (cancelled) return;
        let eco: EcoCanvas;
        try {
          eco = createEcoCanvas({
            canvas,
            items: nodes.map((n) => ({ live: n.live })),
            reducedMotion: reduced,
            onFrame: (labels) =>
              labels.forEach((l, i) => {
                const el = labelRefs.current[i];
                if (!el) return;
                el.style.transform = `translate3d(${l.x.toFixed(1)}px, ${l.y.toFixed(1)}px, 0) translate(-50%, -135%)`;
                el.style.opacity = l.alpha.toFixed(3);
              }),
            onTilt: (rx, ry) => {
              tilt.style.transform = `perspective(1100px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
            },
          });
        } catch {
          return;
        }
        const ro = new ResizeObserver(([entry]) => {
          if (entry) eco.resize(entry.contentRect.width, entry.contentRect.height);
        });
        ro.observe(box);
        const io = new IntersectionObserver(([entry]) => eco.setActive(Boolean(entry?.isIntersecting)), { rootMargin: "80px" });
        io.observe(box);
        const onPointer = (e: PointerEvent) => eco.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
        window.addEventListener("pointermove", onPointer, { passive: true });
        // Fade and lift away as the hero scrolls out.
        const onProgress = (v: number) => {
          box.style.opacity = String(Math.max(0, 1 - v * 1.3));
          eco.setActive(v < 0.95);
        };
        const unsub = progress?.on("change", onProgress);
        if (progress) onProgress(progress.get());
        cleanup = () => {
          ro.disconnect();
          io.disconnect();
          window.removeEventListener("pointermove", onPointer);
          unsub?.();
          eco.dispose();
        };
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      cleanup();
    };
    // Rebuild only when the set of products changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, liveKey]);

  return (
    <div
      ref={boxRef}
      className="absolute top-[-20px] left-1/2 aspect-square w-[min(115vw,450px)] -translate-x-1/2 md:top-1/2 md:left-[74%] md:w-[min(60vw,840px)] md:-translate-y-1/2"
    >
      <div ref={tiltRef} className="absolute inset-0 will-change-transform">
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
        {nodes.map((n, i) => (
          <div
            key={n.key}
            ref={(el) => {
              labelRefs.current[i] = el;
            }}
            className="absolute top-0 left-0 opacity-0"
            style={{ transform: "translate3d(-9999px,0,0)" }}
          >
            {n.content}
          </div>
        ))}
      </div>
    </div>
  );
}
