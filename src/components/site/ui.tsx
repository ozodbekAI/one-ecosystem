import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { OneMark, ProductLogo } from "@/components/brand/Logo";
import { Aurora, Reveal, Ring3DCss, SplitReveal, TiltCard, type TitlePart } from "@/components/motion/primitives";
import type { RingStyle } from "@/lib/brand";
import { pick, useI18n } from "@/lib/i18n";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase",
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink opacity-70" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-pink" />
      </span>
      {children}
    </span>
  );
}

/** Top of every inner page: mask-revealed headline over drifting light and a tumbling 3D ring. */
export function PageHero({
  kicker,
  title,
  lead,
  ring = "brand",
  children,
}: {
  kicker: string;
  title: TitlePart[];
  lead?: string;
  ring?: RingStyle;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-night pt-36 pb-20 md:pt-48 md:pb-28">
      <Aurora />
      <div aria-hidden="true" className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_25%_20%,#000,transparent_70%)]" />
      <Ring3DCss ring={ring} className="absolute top-1/2 right-[-6rem] hidden w-[min(33vw,460px)] -translate-y-1/2 opacity-90 lg:block" />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <Reveal y={16}>
          <Kicker>{kicker}</Kicker>
        </Reveal>
        <h1 className="tracking-display mt-7 max-w-4xl text-[clamp(2.6rem,7vw,6.25rem)] leading-[0.98] font-extrabold">
          <SplitReveal parts={title} delay={0.1} />
        </h1>
        {lead ? (
          <Reveal delay={0.45}>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">{lead}</p>
          </Reveal>
        ) : null}
        {children}
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-night to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}

export function StatusBadge({ status, className }: { status: Product["status"]; className?: string }) {
  const { t } = useI18n();
  const live = status === "live";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold tracking-[0.14em] uppercase",
        live ? "bg-success/15 text-success ring-1 ring-success/25" : "bg-white/[0.04] text-muted-foreground ring-1 ring-white/10",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", live ? "animate-pulse bg-success" : "bg-pink")} />
      {live ? t("status.live") : t("status.soon")}
    </span>
  );
}

/** Fills a free grid cell: the ecosystem keeps a seat open for the next product. */
export function EcosystemSlot({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div
      className={cn(
        "relative flex h-full min-h-[280px] flex-col items-center justify-center gap-6 overflow-hidden rounded-[1.75rem] border border-dashed border-white/[0.12] p-8 text-center",
        className,
      )}
    >
      <div className="relative h-20 w-20">
        <OneMark className="animate-spin-slow h-full w-full opacity-40" />
        <span className="absolute inset-0 flex items-center justify-center text-2xl font-light text-lavender">+</span>
      </div>
      <p className="max-w-[15rem] text-sm leading-relaxed text-muted-foreground">{t("home.ring")}</p>
    </div>
  );
}

/** Product tile: tilts in 3D, light follows the pointer, the ring turns on hover. */
export function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const { lang, t } = useI18n();
  const shot = featured ? product.gallery[0] : undefined;
  return (
    <TiltCard max={featured ? 4 : 7} className={cn("h-full rounded-[1.75rem]", featured && "md:col-span-2")}>
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className={cn(
          "relative flex h-full overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-gradient-card shadow-card transition-colors duration-500 hover:border-white/15",
          shot ? "flex-col md:flex-row" : "flex-col",
        )}
      >
        <OneMark
          ring={product.ring}
          className="pointer-events-none absolute -right-14 -bottom-14 h-60 w-60 opacity-[0.06] transition-all duration-[1400ms] ease-out group-hover/tilt:rotate-[100deg] group-hover/tilt:opacity-[0.18]"
        />
        <div className={cn("relative flex flex-1 flex-col justify-between p-7 md:p-9", shot && "md:max-w-[55%]")}>
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <ProductLogo name={product.name} ring={product.ring} className={featured ? "text-4xl md:text-5xl" : "text-3xl"} />
              <StatusBadge status={product.status} />
            </div>
            <p className={cn("leading-snug font-semibold text-foreground", featured ? "text-xl md:text-2xl" : "text-lg")}>{pick(product.tagline, lang)}</p>
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{pick(product.description, lang)}</p>
          </div>
          <span className="mt-10 inline-flex items-center gap-3 text-sm font-semibold text-foreground">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition-all duration-500 group-hover/tilt:border-transparent group-hover/tilt:bg-gradient-brand group-hover/tilt:shadow-glow">
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover/tilt:rotate-45" />
            </span>
            {t("cta.more")}
          </span>
        </div>
        {shot ? (
          <div className="relative min-h-64 flex-1 overflow-hidden md:min-h-0">
            <img
              src={shot}
              alt={`ONE ${product.name}`}
              loading="lazy"
              className="absolute top-8 left-6 w-[88%] rotate-[-4deg] rounded-2xl border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] transition-transform duration-[1200ms] ease-out group-hover/tilt:translate-y-[-14px] group-hover/tilt:rotate-[-1deg] md:top-10 md:left-2"
            />
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-surface to-transparent" />
          </div>
        ) : null}
      </Link>
    </TiltCard>
  );
}
