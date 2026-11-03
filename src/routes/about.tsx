import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Power, Target, Gauge, Sparkle, Link2 } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Kicker, PageHero, StatusBadge } from "@/components/site/ui";
import { Aurora, Reveal, SplitReveal, TiltCard } from "@/components/motion/primitives";
import { ContactBand } from "@/components/site/ContactBand";
import { ProductLogo } from "@/components/brand/Logo";
import { pick, useI18n, type TKey } from "@/lib/i18n";
import { PRODUCTS as products } from "@/lib/products";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Biz haqimizda — ONE Ecosystem" },
      { name: "description", content: "ONE tadbirkorlar uchun bitta ekotizim quradi: aniq raqamlar, sodda ekranlar va bir-biriga ulangan mahsulotlar." },
      { property: "og:title", content: "ONE haqida — tadbirkorlar uchun bitta ekotizim" },
      { property: "og:description", content: "Maqsadimiz, nomimiz ma’nosi va tamoyillarimiz." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const PRINCIPLES: { icon: typeof Gauge; t: TKey; d: TKey }[] = [
  { icon: Gauge, t: "about.p1.t", d: "about.p1.d" },
  { icon: Sparkle, t: "about.p2.t", d: "about.p2.d" },
  { icon: Link2, t: "about.p3.t", d: "about.p3.d" },
];

function AboutPage() {
  const { t, lang } = useI18n();
  return (
    <SiteShell>
      <PageHero kicker={t("about.kicker")} title={[t("about.title.a"), { hi: t("about.title.hi") }, t("about.title.b")]} lead={t("about.lead")} />

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-24 md:grid-cols-2 md:px-8 md:py-32">
        <Reveal className="h-full">
          <TiltCard max={4} className="h-full rounded-[2rem]">
            <div className="relative h-full overflow-hidden rounded-[2rem] border border-white/[0.07] bg-gradient-card p-8 shadow-card md:p-12">
              <span className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow">
                <Target className="h-6 w-6 text-primary-foreground" />
              </span>
              <h2 className="tracking-display mb-4 text-3xl font-extrabold md:text-4xl">{t("about.mission.t")}</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">{t("about.mission.d")}</p>
            </div>
          </TiltCard>
        </Reveal>
        <Reveal delay={0.12} className="h-full">
          <TiltCard max={4} className="h-full rounded-[2rem]">
            <div className="relative h-full overflow-hidden rounded-[2rem] border border-white/[0.07] bg-surface p-8 md:p-12">
              <div aria-hidden="true" className="bg-spot absolute -top-24 -right-24 h-80 w-80 opacity-70" />
              <span className="relative mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <Power className="h-6 w-6 text-lavender" />
              </span>
              <h2 className="tracking-display relative mb-4 text-3xl font-extrabold md:text-4xl">{t("about.name.t")}</h2>
              <p className="relative text-lg leading-relaxed text-muted-foreground">{t("about.name.d")}</p>
              <ProductLogo className="relative mt-10 text-7xl" />
            </div>
          </TiltCard>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 md:px-8 md:pb-32">
        <h2 className="tracking-display mb-12 text-[clamp(2.2rem,5vw,4.5rem)] leading-[1] font-extrabold">
          <SplitReveal parts={t("about.principles")} inView />
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {PRINCIPLES.map(({ icon: Icon, t: tk, d }, i) => (
            <Reveal key={tk} delay={i * 0.12} className="h-full">
              <TiltCard className="h-full rounded-[1.75rem]">
                <div className="relative flex h-full min-h-[300px] flex-col justify-between overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-gradient-card p-8 shadow-card">
                  <div className="flex items-start justify-between">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow transition-transform duration-700 group-hover/tilt:rotate-[8deg]">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </span>
                    <span className="text-stroke text-7xl leading-none font-extrabold">0{i + 1}</span>
                  </div>
                  <div className="mt-12">
                    <h3 className="text-2xl font-bold">{t(tk)}</h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">{t(d)}</p>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative isolate overflow-hidden border-t border-white/[0.06] bg-night">
        <div className="relative mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
          <Reveal y={16}>
            <Kicker className="mb-10">{t("about.roadmap")}</Kicker>
          </Reveal>
          <ol className="border-t border-white/[0.08]">
            {products.map((p, i) => (
              <li key={p.slug}>
                <Reveal delay={i * 0.08} y={24}>
                  <Link
                    to="/products/$slug"
                    params={{ slug: p.slug }}
                    className="group relative flex flex-col gap-4 overflow-hidden border-b border-white/[0.08] py-7 md:flex-row md:items-center md:justify-between md:py-9"
                  >
                    <span aria-hidden="true" className="absolute inset-0 origin-bottom scale-y-0 bg-gradient-to-r from-brand/15 via-pink/10 to-transparent transition-transform duration-500 ease-out group-hover:scale-y-100" />
                    <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:gap-10">
                      <span className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                      <ProductLogo name={p.name} ring={p.ring} className="w-60 text-3xl transition-transform duration-500 group-hover:translate-x-2" />
                      <span className="text-muted-foreground transition-colors group-hover:text-foreground">{pick(p.tagline, lang)}</span>
                    </div>
                    <div className="relative flex items-center gap-4">
                      <StatusBadge status={p.status} />
                      <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-all duration-500 group-hover:rotate-45 group-hover:text-foreground" />
                    </div>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ContactBand />
    </SiteShell>
  );
}
