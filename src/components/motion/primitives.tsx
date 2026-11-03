/**
 * Motion building blocks shared by every page. All of them respect
 * prefers-reduced-motion through <MotionConfig reducedMotion="user"> in the
 * root plus their own checks where motion is driven by hand.
 */
import { Fragment, useEffect, useId, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { animate, motion, useInView, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { CAP, RING, arcPath, ringSegments, type RingStyle } from "@/lib/brand";
import { cn } from "@/lib/utils";

export const EASE = [0.16, 1, 0.3, 1] as const;

/** Fades content up into place when it enters the viewport. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 36,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 1.1, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

export type TitlePart = string | { hi: string };

/**
 * Headline whose words rise out of a mask one after another. `{ hi }` parts get
 * the brand gradient. Screen readers get the sentence once, as plain text.
 */
export function SplitReveal({
  parts,
  className,
  delay = 0,
  stagger = 0.075,
  inView = false,
}: {
  parts: TitlePart[] | string;
  className?: string;
  delay?: number;
  stagger?: number;
  inView?: boolean;
}) {
  const list = typeof parts === "string" ? [parts] : parts;
  const words = list.flatMap((p) => {
    const hi = typeof p !== "string";
    return (hi ? p.hi : p)
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => ({ w, hi }));
  });
  const full = words.map((w) => w.w).join(" ");
  const trigger = inView ? { whileInView: "show", viewport: { once: true, margin: "0px 0px -10% 0px" } } : { animate: "show" };
  return (
    <motion.span
      key={full}
      className={cn("inline", className)}
      initial="hidden"
      {...trigger}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      <span className="sr-only">{full}</span>
      {words.map((x, i) => (
        <Fragment key={`${x.w}-${i}`}>
          <span aria-hidden="true" className="-mb-[0.24em] inline-block overflow-hidden pb-[0.24em] align-bottom">
            <motion.span
              // background-clip:text only paints inside the box, so give descenders room.
              className={cn("inline-block origin-bottom-left", x.hi && "text-gradient -mb-[0.2em] pb-[0.2em]")}
              variants={{
                hidden: { y: "110%", rotate: 5 },
                show: { y: "0%", rotate: 0, transition: { duration: 1.15, ease: EASE } },
              }}
            >
              {x.w}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </motion.span>
  );
}

/**
 * Text that types itself, holds, erases and types again, with a glowing caret.
 * The finished text reserves its space from the start, so nothing below jumps
 * while letters come and go (also when it wraps onto two lines).
 * Static with reduced motion. Hide it from screen readers and give them the
 * sentence once elsewhere.
 */
export function TypeLoop({ text, className, startDelay = 1000 }: { text: string; className?: string; startDelay?: number }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(text);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (reduced) {
      setShown(text);
      setReady(true);
      return;
    }
    const chars = Array.from(text);
    let n = 0;
    let timer = 0;
    setShown("");
    setReady(true);
    const type = () => {
      n++;
      setShown(chars.slice(0, n).join(""));
      setBusy(true);
      if (n < chars.length) timer = window.setTimeout(type, 65 + Math.random() * 75);
      else {
        setBusy(false);
        timer = window.setTimeout(erase, 2600);
      }
    };
    const erase = () => {
      n--;
      setShown(chars.slice(0, n).join(""));
      setBusy(true);
      if (n > 0) timer = window.setTimeout(erase, 38);
      else {
        setBusy(false);
        timer = window.setTimeout(type, 600);
      }
    };
    timer = window.setTimeout(type, startDelay);
    return () => window.clearTimeout(timer);
  }, [text, reduced, startDelay]);

  return (
    <span className="inline-grid align-bottom" style={{ opacity: ready ? 1 : 0 }}>
      <span className={cn("invisible col-start-1 row-start-1", className)}>{text}</span>
      <span className="col-start-1 row-start-1">
        <span className={cn("whitespace-pre-wrap", className)}>{shown}</span>
        {reduced ? null : <span className={cn("type-caret", !busy && "type-caret-blink")} />}
      </span>
    </span>
  );
}

/** Paragraph whose words light up one by one as it scrolls through the screen. */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <p ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          <ScrollWord progress={scrollYProgress} range={[i / words.length, Math.min(1, (i + 2) / words.length)]}>
            {w}
          </ScrollWord>{" "}
        </Fragment>
      ))}
    </p>
  );
}

function ScrollWord({ progress, range, children }: { progress: MotionValue<number>; range: [number, number]; children: string }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span aria-hidden="true" style={{ opacity }}>
      {children}
    </motion.span>
  );
}

function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setFine(mq.matches);
    const on = () => setFine(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return fine;
}

/**
 * Card that tilts toward the pointer in 3D and carries a light that follows
 * it (`--mx`/`--my`, used by the .glow-card border and .spotlight layer).
 */
export function TiltCard({ children, className, max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const rx = useSpring(0, { stiffness: 180, damping: 18, mass: 0.6 });
  const ry = useSpring(0, { stiffness: 180, damping: 18, mass: 0.6 });
  const tilt = fine && !reduced;

  function onMove(e: PointerEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    if (!tilt) return;
    ry.set((x / r.width - 0.5) * max * 2);
    rx.set(-(y / r.height - 0.5) * max * 2);
  }
  function onLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      className={cn("glow-card group/tilt relative", className)}
    >
      <div aria-hidden="true" className="spotlight pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/tilt:opacity-100" />
      {children}
    </motion.div>
  );
}

/** Pulls its child toward the pointer while hovered. */
export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const x = useSpring(0, { stiffness: 160, damping: 14, mass: 0.2 });
  const y = useSpring(0, { stiffness: 160, damping: 14, mass: 0.2 });
  return (
    <motion.div
      className={cn("inline-flex", className)}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (!fine || reduced) return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** "100%" counts up from 0 once it scrolls into view. */
export function Counter({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const match = /^(\d+)(.*)$/.exec(value);
  const target = match ? Number(match[1]) : 0;
  const suffix = match ? (match[2] ?? "") : value;
  const [n, setN] = useState(target);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!match || reduced) return;
    if (!inView) {
      setN(0);
      return;
    }
    const controls = animate(0, target, { duration: 1.8, ease: EASE, onUpdate: (v) => setN(Math.round(v)) });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, target, reduced]);

  if (!match) return <span className={className}>{value}</span>;
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {n}
      {suffix}
    </span>
  );
}

/** Endless horizontal strip. Content is rendered twice for a seamless loop. */
export function Marquee({ children, className, speed = 40, reverse = false }: { children: ReactNode; className?: string; speed?: number; reverse?: boolean }) {
  return (
    <div className={cn("mask-fade-x flex overflow-hidden", className)}>
      {[0, 1].map((k) => (
        <div
          key={k}
          aria-hidden={k === 1 ? "true" : undefined}
          className="marquee-track flex shrink-0 items-center"
          style={{ animationDuration: `${speed}s`, animationDirection: reverse ? "reverse" : "normal" }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}

/** Mixes a #rrggbb colour toward black (k = 0 → black, 1 → unchanged). */
function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${Math.round(((n >> 16) & 255) * k)} ${Math.round(((n >> 8) & 255) * k)} ${Math.round((n & 255) * k)})`;
}

/**
 * The ONE ring as a thick CSS-3D object: stacked SVG layers give it depth and
 * the stack sways slowly. Edge layers get pre-darkened colours instead of CSS
 * filters, so the browser composites one cheap transform per frame.
 */
export function Ring3DCss({ ring = "brand", className, layers = 10, duration = 9 }: { ring?: RingStyle; className?: string; layers?: number; duration?: number }) {
  const segs = ringSegments(ring, "dark");
  const gloss = `ring-gloss-${useId().replace(/:/g, "")}`;
  return (
    <div aria-hidden="true" className={cn("ring3d pointer-events-none", className)}>
      <div className="ring3d-spin" style={{ animationDuration: `${duration}s` }}>
        {Array.from({ length: layers }, (_, i) => {
          const front = i === layers - 1;
          const k = 0.3 + (i / layers) * 0.4;
          return (
            <svg key={i} viewBox={`0 0 ${CAP} ${CAP}`} className="ring3d-layer" style={{ transform: `translateZ(${((i - (layers - 1) / 2) * 2.4).toFixed(1)}px)` }}>
              {segs.map((sg) => (
                <path key={sg.from} d={arcPath(RING.cx, RING.cy, RING.r, sg.from, sg.to)} fill="none" stroke={front ? sg.color : shade(sg.color, k)} strokeWidth={RING.stroke} />
              ))}
              {front ? (
                <>
                  {/* Light from the top-left, shade toward the bottom-right: reads as a glossy solid. */}
                  <defs>
                    <linearGradient id={gloss} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={CAP} y2={CAP}>
                      <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
                      <stop offset="0.42" stopColor="#fff" stopOpacity="0.06" />
                      <stop offset="0.7" stopColor="#000" stopOpacity="0.08" />
                      <stop offset="1" stopColor="#000" stopOpacity="0.35" />
                    </linearGradient>
                  </defs>
                  {segs.map((sg) => (
                    <path key={`g${sg.from}`} d={arcPath(RING.cx, RING.cy, RING.r, sg.from, sg.to)} fill="none" stroke={`url(#${gloss})`} strokeWidth={RING.stroke} />
                  ))}
                </>
              ) : null}
            </svg>
          );
        })}
      </div>
    </div>
  );
}

/** Slow-drifting light behind a section. */
export function Aurora({ className, intensity = 1 }: { className?: string; intensity?: number }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} style={{ opacity: intensity }}>
      <div className="aurora aurora-a" />
      <div className="aurora aurora-b" />
    </div>
  );
}
