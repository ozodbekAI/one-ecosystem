import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { ArrowRight, ArrowUpRight, BadgeCheck, ChevronLeft, ChevronRight, Layers, MapPin, Send, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { ContactBand } from "@/components/site/ContactBand";
import { EcosystemSlot, Kicker, ProductCard } from "@/components/site/ui";
import { SlideCarousel, SlideLightbox } from "@/components/site/SlideCarousel";
import { getLenis } from "@/lib/smooth-scroll";
import { OneRing3D, type OrbitNode } from "@/components/three/OneRing3D";
import { Aurora, Counter, Magnetic, Marquee, Reveal, ScrollWords, SplitReveal, TiltCard, TypeLoop } from "@/components/motion/primitives";
import { ProductLogo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { RING, arcPath, ringSegments, type RingStyle } from "@/lib/brand";
import { useI18n, type TKey } from "@/lib/i18n";
import { CONTACTS } from "@/lib/contacts";
import { findProduct, PRODUCTS, type Product } from "@/lib/products";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ONE Ecosystem — Barchasi biz bilan" },
      {
        name: "description",
        content: "ONE — marketpleys sotuvchilari va tadbirkorlar uchun bitta ekotizim: ONE Plus, ONE Agent, ONE Market, ONE CRM va boshqalar.",
      },
      { property: "og:title", content: "ONE Ecosystem — Barchasi biz bilan" },
      { property: "og:description", content: "Tadbirkorlar uchun bir-biriga ulangan xizmatlar oilasi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

/** Marketplaces ONE Plus connects to; dot colours follow the four-part Plus ring. */
const MARKETPLACES = [
  { name: "Uzum Market", color: "#F05BD7" },
  { name: "Ozon", color: "#60A5FA" },
  { name: "Wildberries", color: "#FACC15" },
  { name: "Yandex Market", color: "#2DD4BF" },
];

const WHY: { icon: typeof Layers; t: TKey; d: TKey; span: string }[] = [
  { icon: Layers, t: "home.why.1.t", d: "home.why.1.d", span: "md:col-span-4" },
  { icon: MapPin, t: "home.why.2.t", d: "home.why.2.d", span: "md:col-span-2" },
  { icon: BadgeCheck, t: "home.why.3.t", d: "home.why.3.d", span: "md:col-span-2" },
  { icon: Sparkles, t: "home.why.4.t", d: "home.why.4.d", span: "md:col-span-4" },
];

function Home() {
  const plus = findProduct("plus");
  return (
    <SiteShell>
      <Hero />
      <Manifesto />
      <Products />
      {plus && plus.gallery.length > 0 ? <PlusShowcase product={plus} /> : null}
      <Why />
      <LogoStory />
      <ContactBand />
    </SiteShell>
  );
}

/* ── Hero: the 3D ring assembles, products orbit it ────────────────────── */

function Hero() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const titleB = t("home.title.b");

  const nodes: OrbitNode[] = PRODUCTS.map((p) => ({
    key: p.slug,
    live: p.status === "live",
    content: (
      <Link
        to="/products/$slug"
        params={{ slug: p.slug }}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-night/85 px-3 py-1.5 whitespace-nowrap shadow-[0_8px_30px_-8px_rgba(0,0,0,0.6)] transition-colors duration-300 hover:border-lavender/50 hover:bg-night/85"
      >
        <ProductLogo name={p.name} ring={p.ring} className="text-[15px]" />
        <span className={cn("h-1.5 w-1.5 rounded-full", p.status === "live" ? "bg-success shadow-[0_0_8px_1px] shadow-success/70" : "bg-pink/70")} />
      </Link>
    ),
  }));

  return (
    <section ref={ref} className="relative isolate h-[100svh] min-h-[680px] overflow-hidden bg-night">
      <Aurora intensity={0.8} />
      <div aria-hidden="true" className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_68%_45%,#000_5%,transparent_60%)]" />
      <OneRing3D className="absolute inset-0" ring="brand" layout="hero" nodes={nodes} progress={scrollYProgress} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-night to-transparent" />

      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="pointer-events-none relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-36 md:justify-center md:px-8 md:pb-10"
      >
        <div className="pointer-events-auto max-w-2xl">
          <Reveal y={16} delay={0.3}>
            <Kicker>{t("home.kicker")}</Kicker>
          </Reveal>
          <h1 className="tracking-display mt-7 text-[clamp(3.5rem,9.5vw,9rem)] leading-[0.88] font-extrabold">
            <span className="sr-only">{[t("home.title.a"), t("home.title.hi"), titleB].filter(Boolean).join(" ")}</span>
            {/* "Barchasi" stays; "biz bilan" keeps typing itself out and back. */}
            <span aria-hidden="true" className="block">
              <SplitReveal parts={t("home.title.a")} delay={0.45} />
            </span>
            <span aria-hidden="true" className="block pb-[0.06em]">
              <TypeLoop text={[t("home.title.hi"), titleB].filter(Boolean).join(" ")} className="text-gradient" startDelay={1150} />
            </span>
          </h1>
          <Reveal delay={1.0}>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-muted-foreground md:text-xl">{t("footer.tagline")}</p>
          </Reveal>
          <Reveal delay={1.15} className="mt-10 flex flex-wrap gap-3">
            <Magnetic>
              <Button asChild variant="hero" size="xl" className="h-14 px-8 text-base">
                <Link to="/products">
                  {t("cta.explore")} <ArrowRight />
                </Link>
              </Button>
            </Magnetic>
            <Magnetic>
              <Button asChild variant="glass" size="xl" className="h-14 px-7 text-base">
                <a href={CONTACTS.telegramHref} target="_blank" rel="noreferrer">
                  <Send /> {t("cta.telegram")}
                </a>
              </Button>
            </Magnetic>
          </Reveal>
        </div>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto hidden max-w-7xl items-end justify-between gap-6 px-5 pb-6 md:flex md:px-8">
          <div className="flex items-center gap-3 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            <span className="scroll-cue relative h-10 w-[2px] overflow-hidden rounded-full bg-white/10" />
            {t("home.scroll")}
          </div>
          <p className="max-w-[240px] text-right text-xs leading-relaxed text-muted-foreground">{t("home.ring")}</p>
        </div>
        <div className="border-t border-white/[0.06] bg-night/70 py-4">
          <Marquee speed={36}>
            {[0, 1, 2].map((k) =>
              MARKETPLACES.map((m) => (
                <span key={`${k}-${m.name}`} className="mx-7 flex items-center gap-3 text-sm font-semibold tracking-[0.12em] whitespace-nowrap text-muted-foreground uppercase md:mx-10">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: m.color, boxShadow: `0 0 12px 2px ${m.color}80` }} />
                  {m.name}
                </span>
              )),
            )}
          </Marquee>
        </div>
      </div>
    </section>
  );
}

/* ── Manifesto: words light up as they scroll by ───────────────────────── */

function Manifesto() {
  const { t, lang } = useI18n();
  return (
    <section className="relative bg-night py-32 md:py-48">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal y={16}>
          <Kicker>{t("home.manifesto")}</Kicker>
        </Reveal>
        <ScrollWords key={lang} text={t("home.lead")} className="tracking-display mt-10 text-[clamp(1.85rem,4.3vw,3.9rem)] leading-[1.14] font-bold" />
      </div>
    </section>
  );
}

/* ── Products grid ─────────────────────────────────────────────────────── */

function Products() {
  const { t } = useI18n();
  const featured = PRODUCTS[0]?.status === "live";
  const cells = PRODUCTS.length + (featured ? 1 : 0);
  return (
    <section className="relative bg-night pb-28 md:pb-40">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <Reveal y={16}>
              <Kicker>{t("products.kicker")}</Kicker>
            </Reveal>
            <h2 className="tracking-display mt-6 text-[clamp(2.3rem,5.2vw,4.75rem)] leading-[1] font-extrabold">
              <SplitReveal parts={t("home.products.title")} inView />
            </h2>
            <Reveal delay={0.2}>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">{t("home.products.lead")}</p>
            </Reveal>
          </div>
          <Reveal delay={0.3}>
            <Link to="/products" className="group inline-flex items-center gap-3 text-sm font-semibold">
              {t("cta.all")}
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 transition-all duration-500 group-hover:border-transparent group-hover:bg-gradient-brand">
                <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
              </span>
            </Link>
          </Reveal>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p, i) => {
            const big = i === 0 && featured;
            return (
              <Reveal key={p.slug} delay={(i % 3) * 0.1} className={cn("h-full", big && "md:col-span-2")}>
                <ProductCard product={p} featured={big} />
              </Reveal>
            );
          })}
          {cells % 3 !== 0 ? (
            <Reveal delay={0.2} className="hidden h-full lg:block">
              <EcosystemSlot />
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ── ONE Plus: pinned horizontal run through the real slides ───────────── */

function PlusIntro({ product, className }: { product: Product; className?: string }) {
  const { t } = useI18n();
  return (
    <div className={className}>
      <Reveal y={16}>
        <Kicker>{t("home.plus.kicker")}</Kicker>
      </Reveal>
      <Reveal delay={0.1}>
        <ProductLogo name={product.name} ring={product.ring} className="mt-8 text-5xl md:text-6xl" />
      </Reveal>
      <h2 className="tracking-display mt-6 text-[clamp(2.1rem,3.8vw,3.6rem)] leading-[1.03] font-extrabold">
        <SplitReveal parts={[t("home.plus.title.a"), { hi: t("home.plus.title.hi") }]} inView />
      </h2>
      <Reveal delay={0.2}>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">{t("home.plus.lead")}</p>
      </Reveal>
      <Reveal delay={0.3}>
        <dl className="mt-9 grid max-w-md grid-cols-3 gap-3">
          {(
            [
              ["4", t("home.plus.stat1")],
              ["1", t("home.plus.stat2")],
              ["100%", t("home.plus.stat3")],
            ] as const
          ).map(([v, l]) => (
            <div key={l} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <dt className="text-gradient text-2xl font-extrabold sm:text-3xl">
                <Counter value={v} />
              </dt>
              <dd className="mt-1 text-xs leading-snug text-muted-foreground">{l}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
      <Reveal delay={0.4} className="mt-10">
        <Magnetic>
          <Button asChild variant="hero" size="xl" className="h-14 px-8 text-base">
            <Link to="/products/$slug" params={{ slug: product.slug }}>
              {t("cta.more")} <ArrowRight />
            </Link>
          </Button>
        </Magnetic>
      </Reveal>
    </div>
  );
}

function PlusShowcase({ product }: { product: Product }) {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dist = useMotionValue(0);
  const n = product.gallery.length;
  // Height = one screen + how far the track travels. Pure CSS, so the page is
  // already its full length on the server (scroll restoration lands right).
  // Mirrors the track below: left pad + intro + n × (slide + gap) + right pad.
  const height = `calc(100vh + ${n} * (0.8 * min(72vh, 640px) + 2.5rem) + min(34rem, 40vw) + max(2rem, (100vw - 80rem) / 2 + 2rem) + 12vw - 100vw)`;

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => dist.set(Math.max(0, el.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [dist]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform([scrollYProgress, dist], ([v, d]: number[]) => -(v ?? 0) * (d ?? 0));
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });
  const [open, setOpen] = useState<number | null>(null);
  const { t } = useI18n();

  /** Arrow buttons move the pinned run by one slide (it is driven by page scroll). */
  function stepRun(dir: 1 | -1) {
    const sec = ref.current;
    if (!sec) return;
    const top = sec.getBoundingClientRect().top + window.scrollY;
    const travel = sec.offsetHeight - window.innerHeight;
    const per = travel / n;
    const idx = Math.round((window.scrollY - top) / per);
    const target = top + Math.min(travel, Math.max(0, (idx + dir) * per));
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(target, { duration: 1.1 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  }

  return (
    <>
      <section ref={ref} className="relative hidden bg-night md:block" style={{ height }}>
        <div className="sticky top-0 flex h-screen items-center overflow-hidden border-y border-white/[0.06]">
          <motion.div ref={trackRef} style={{ x }} className="relative flex w-max shrink-0 items-center gap-10 pr-[12vw] pl-[max(2rem,calc((100vw-80rem)/2+2rem))]">
            <PlusIntro product={product} className="w-[min(34rem,40vw)] shrink-0 pr-6" />
            {product.gallery.map((src, i) => (
              <SlideCard key={src} src={src} index={i} total={product.gallery.length} name={product.name} progress={scrollYProgress} onOpen={() => setOpen(i)} />
            ))}
          </motion.div>
          <div className="absolute bottom-7 left-1/2 flex w-[min(34rem,60vw)] -translate-x-1/2 items-center gap-4 text-[11px] font-semibold tracking-[0.2em] text-muted-foreground">
            <button type="button" onClick={() => stepRun(-1)} aria-label={t("slides.prev")} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-foreground transition-all duration-300 hover:border-transparent hover:bg-gradient-brand">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span>01</span>
            <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-white/10">
              <motion.div style={{ scaleX: bar }} className="h-full origin-left rounded-full bg-gradient-to-r from-pink to-lavender" />
            </div>
            <span>{String(product.gallery.length).padStart(2, "0")}</span>
            <button type="button" onClick={() => stepRun(1)} aria-label={t("slides.next")} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-foreground transition-all duration-300 hover:border-transparent hover:bg-gradient-brand">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-white/[0.06] bg-night py-24 md:hidden">
        <PlusIntro product={product} className="relative px-5" />
        <SlideCarousel slides={product.gallery} name={product.name} className="relative mt-12" itemClassName="w-[78vw] max-w-sm" controlsClassName="px-5" onOpen={setOpen} />
      </section>

      <SlideLightbox slides={product.gallery} name={product.name} index={open} onIndex={setOpen} />
    </>
  );
}

function SlideCard({
  src,
  index,
  total,
  name,
  progress,
  onOpen,
}: {
  src: string;
  index: number;
  total: number;
  name: string;
  progress: MotionValue<number>;
  onOpen: () => void;
}) {
  // Each slide straightens and lifts as it passes the middle of the run.
  const center = (index + 0.5) / total;
  const rotateY = useTransform(progress, [center - 0.5, center, center + 0.5], [-14, 0, 14]);
  const scale = useTransform(progress, [center - 0.45, center, center + 0.45], [0.9, 1, 0.9]);
  return (
    <motion.figure style={{ rotateY, scale, transformPerspective: 1200 }} className={cn("relative shrink-0", index % 2 === 1 && "translate-y-10")}>
      <TiltCard max={5} className="rounded-[1.75rem]">
        <button type="button" onClick={onOpen} className="block cursor-zoom-in rounded-[1.75rem]" aria-label={`ONE ${name} — ${index + 1}`}>
          <img
            src={src}
            alt={`ONE ${name} — ${index + 1}`}
            loading="lazy"
            decoding="async"
            width={1080}
            height={1350}
            className="block aspect-[4/5] h-[min(72vh,640px)] w-auto rounded-[1.75rem] border border-white/10 object-cover shadow-[0_50px_100px_-30px_rgba(0,0,0,0.9)]"
          />
        </button>
      </TiltCard>
      <figcaption className="mt-4 text-[11px] font-semibold tracking-[0.2em] text-muted-foreground">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </figcaption>
    </motion.figure>
  );
}

/* ── Why ONE: bento grid ───────────────────────────────────────────────── */

function Why() {
  const { t } = useI18n();
  return (
    <section className="relative bg-night py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <h2 className="tracking-display mb-14 max-w-3xl text-[clamp(2.3rem,5.2vw,4.75rem)] leading-[1] font-extrabold">
          <SplitReveal parts={t("home.why.title")} inView />
        </h2>
        <div className="grid gap-4 md:grid-cols-6">
          {WHY.map(({ icon: Icon, t: tk, d, span }, i) => (
            <Reveal key={tk} delay={(i % 2) * 0.12} className={cn("h-full", span)}>
              <TiltCard max={4} className="h-full rounded-[1.75rem]">
                <div className="relative flex h-full min-h-[280px] flex-col justify-between overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-gradient-card p-8 shadow-card md:p-10">
                  <div className="flex items-start justify-between">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow transition-transform duration-700 group-hover/tilt:scale-110 group-hover/tilt:rotate-[8deg]">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </span>
                    <span className="text-stroke text-6xl leading-none font-extrabold md:text-7xl">0{i + 1}</span>
                  </div>
                  <div className="mt-12">
                    <h3 className="text-2xl font-bold">{t(tk)}</h3>
                    <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">{t(d)}</p>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Logo story: the rings assemble as the section scrolls in ──────────── */

function AssemblingSegment({ d, color, mid, index, progress }: { d: string; color: string; mid: number; index: number; progress: MotionValue<number> }) {
  const rad = (mid * Math.PI) / 180;
  const spread = 26 + index * 6;
  const x = useTransform(progress, [0, 1], [Math.cos(rad) * spread, 0]);
  const y = useTransform(progress, [0, 1], [Math.sin(rad) * spread, 0]);
  const rotate = useTransform(progress, [0, 1], [index % 2 === 0 ? -50 : 40, 0]);
  const opacity = useTransform(progress, [0, 0.35], [0.15, 1]);
  return <motion.path d={d} fill="none" stroke={color} strokeWidth={RING.stroke} style={{ x, y, rotate, opacity }} />;
}

function AssemblingRing({ ring, progress, className }: { ring: RingStyle; progress: MotionValue<number>; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <div aria-hidden="true" className="bg-spot absolute -inset-1/3 opacity-70" />
      <svg viewBox="-20 -20 129.4 129.4" className="relative block h-full w-full overflow-visible" role="img" aria-label={ring === "plus" ? "ONE Plus" : "ONE"}>
        {ringSegments(ring, "dark").map((s, i) => (
          <AssemblingSegment key={s.from} d={arcPath(RING.cx, RING.cy, RING.r, s.from, s.to)} color={s.color} mid={(s.from + s.to) / 2} index={i} progress={progress} />
        ))}
      </svg>
    </div>
  );
}

function LogoStory() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center 0.55"] });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });
  return (
    <section ref={ref} className="relative overflow-hidden border-t border-white/[0.06] bg-night py-28 md:py-40">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 md:px-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex items-center justify-center gap-8 md:gap-14">
          <AssemblingRing ring="brand" progress={progress} className="h-36 w-36 md:h-60 md:w-60" />
          <AssemblingRing ring="plus" progress={progress} className="h-36 w-36 md:h-60 md:w-60" />
        </div>
        <div>
          <Reveal y={16}>
            <Kicker>{t("home.logo.kicker")}</Kicker>
          </Reveal>
          <h2 className="tracking-display mt-6 text-[clamp(2rem,4.2vw,3.75rem)] leading-[1.04] font-extrabold">
            <SplitReveal parts={t("home.logo.title")} inView />
          </h2>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{t("home.logo.text")}</p>
          </Reveal>
          <Reveal delay={0.3}>
            <Link to="/brand" className="group mt-9 inline-flex items-center gap-3 text-sm font-semibold">
              {t("nav.brand")}
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 transition-all duration-500 group-hover:border-transparent group-hover:bg-gradient-brand">
                <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
