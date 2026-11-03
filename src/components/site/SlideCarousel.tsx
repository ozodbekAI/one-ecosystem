import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 3800;
/** After the visitor swipes, clicks or scrolls the strip, autoplay waits this long. */
const IDLE_AFTER_TOUCH_MS = 7000;

function ArrowButton({ dir, label, onClick }: { dir: "prev" | "next"; label: string; onClick: () => void }) {
  const Icon = dir === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-foreground transition-all duration-300 hover:border-transparent hover:bg-gradient-brand hover:shadow-glow"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

/**
 * Swipeable strip of slides that also advances on its own every few seconds
 * (paused while hovered, focused, just touched, off screen, or with reduced
 * motion). Arrows and dots switch slides with a mouse; clicking a slide opens it.
 */
export function SlideCarousel({
  slides,
  name,
  className,
  itemClassName,
  padClassName = "px-5 scroll-px-5",
  controlsClassName,
  onOpen,
}: {
  slides: string[];
  name: string;
  className?: string;
  itemClassName?: string;
  /** Inline padding of the strip; pair each px-* with the same scroll-px-* so slides snap in line. */
  padClassName?: string;
  controlsClassName?: string;
  onOpen?: (index: number) => void;
}) {
  const { t } = useI18n();
  const reduced = useReducedMotion() ?? false;
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const paused = useRef(false);
  const visible = useRef(false);
  const touchedAt = useRef(0);

  const go = useCallback(
    (i: number) => {
      const el = scroller.current;
      if (!el) return;
      const items = Array.from(el.children) as HTMLElement[];
      const n = items.length;
      if (!n) return;
      const idx = ((i % n) + n) % n;
      const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      const max = el.scrollWidth - el.clientWidth;
      el.scrollTo({ left: Math.min(max, Math.max(0, items[idx]!.offsetLeft - pad)), behavior: reduced ? "auto" : "smooth" });
    },
    [reduced],
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      const el = scroller.current;
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      // Wrap around at both ends.
      if (dir === 1 && el.scrollLeft >= max - 4) go(0);
      else if (dir === -1 && el.scrollLeft <= 4) go(slides.length - 1);
      else go(activeRef.current + dir);
    },
    [go, slides.length],
  );

  const sync = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const items = Array.from(el.children) as HTMLElement[];
    const max = el.scrollWidth - el.clientWidth;
    let best = 0;
    if (el.scrollLeft >= max - 4) best = items.length - 1;
    else {
      const x = el.scrollLeft + (parseFloat(getComputedStyle(el).paddingLeft) || 0);
      let bestD = Infinity;
      items.forEach((it, i) => {
        const d = Math.abs(it.offsetLeft - x);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
    }
    activeRef.current = best;
    setActive(best);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(([e]) => (visible.current = Boolean(e?.isIntersecting)), { threshold: 0.35 });
    io.observe(el);
    const id = window.setInterval(() => {
      if (!visible.current || paused.current || document.hidden || Date.now() - touchedAt.current < IDLE_AFTER_TOUCH_MS) return;
      step(1);
    }, AUTOPLAY_MS);
    return () => {
      io.disconnect();
      window.clearInterval(id);
    };
  }, [reduced, step]);

  const touch = () => {
    touchedAt.current = Date.now();
  };

  return (
    <div
      className={cn("relative", className)}
      onPointerEnter={(e) => e.pointerType === "mouse" && (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocusCapture={() => (paused.current = true)}
      onBlurCapture={() => (paused.current = false)}
    >
      <div
        ref={scroller}
        onScroll={sync}
        onPointerDown={touch}
        onWheel={touch}
        className={cn("relative flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] md:gap-6 [&::-webkit-scrollbar]:hidden", padClassName)}
      >
        {slides.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => onOpen?.(i)}
            aria-label={`ONE ${name} — ${t("slides.slide")} ${i + 1}`}
            className={cn(
              "shrink-0 snap-start overflow-hidden rounded-3xl border border-white/10 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.85)] transition-[transform,border-color] duration-500 hover:-translate-y-1 hover:border-white/25",
              itemClassName,
            )}
          >
            <img src={src} alt={`ONE ${name} — ${i + 1}`} width={1080} height={1350} loading="lazy" decoding="async" className="block aspect-[4/5] w-full object-cover" />
          </button>
        ))}
      </div>
      <div className={cn("mt-6 flex items-center justify-between gap-4", controlsClassName)}>
        <div className="flex items-center">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                touch();
                go(i);
              }}
              aria-label={`${t("slides.slide")} ${i + 1}`}
              aria-current={i === active ? "true" : undefined}
              className="group p-1.5"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-all duration-500",
                  i === active ? "w-8 bg-gradient-to-r from-pink to-lavender" : "w-1.5 bg-white/25 group-hover:bg-white/50",
                )}
              />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <ArrowButton
            dir="prev"
            label={t("slides.prev")}
            onClick={() => {
              touch();
              step(-1);
            }}
          />
          <ArrowButton
            dir="next"
            label={t("slides.next")}
            onClick={() => {
              touch();
              step(1);
            }}
          />
        </div>
      </div>
    </div>
  );
}

/** Full-size view of one slide with previous / next (buttons and arrow keys). */
export function SlideLightbox({ slides, name, index, onIndex }: { slides: string[]; name: string; index: number | null; onIndex: (i: number | null) => void }) {
  const { t } = useI18n();
  const n = slides.length;
  const move = (d: number) => {
    if (index !== null) onIndex((index + d + n) % n);
  };
  return (
    <Dialog open={index !== null} onOpenChange={(o) => !o && onIndex(null)}>
      <DialogContent
        className="w-auto max-w-[94vw] gap-2 border-white/10 bg-surface p-2"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") move(1);
          if (e.key === "ArrowLeft") move(-1);
        }}
      >
        <DialogTitle className="sr-only">ONE {name}</DialogTitle>
        {index !== null ? (
          <img
            key={index}
            src={slides[index]}
            alt={`ONE ${name} — ${index + 1}`}
            className="animate-in fade-in mx-auto block max-h-[78vh] w-auto max-w-full rounded-xl duration-300"
          />
        ) : null}
        <div className="flex items-center justify-between gap-4 px-1 pb-1">
          <ArrowButton dir="prev" label={t("slides.prev")} onClick={() => move(-1)} />
          <span className="text-xs font-semibold tracking-[0.2em] text-muted-foreground tabular-nums">
            {String((index ?? 0) + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <ArrowButton dir="next" label={t("slides.next")} onClick={() => move(1)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
