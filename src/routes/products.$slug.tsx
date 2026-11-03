import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, Phone, Send } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Kicker, ProductCard, StatusBadge } from "@/components/site/ui";
import { ContactBand } from "@/components/site/ContactBand";
import { ProductLogo } from "@/components/brand/Logo";
import { OneRing3D } from "@/components/three/OneRing3D";
import { Aurora, Magnetic, Reveal, SplitReveal, TiltCard } from "@/components/motion/primitives";
import { Button } from "@/components/ui/button";
import { SlideCarousel, SlideLightbox } from "@/components/site/SlideCarousel";
import { pick, useI18n } from "@/lib/i18n";
import { findProduct, PRODUCTS } from "@/lib/products";
import { CONTACTS } from "@/lib/contacts";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => {
    const product = findProduct(params.slug);
    if (!product) throw notFound();
    return { name: product.name, tagline: product.tagline.uz ?? "", description: product.description.uz ?? "" };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Mahsulot — ONE Ecosystem" }, { name: "robots", content: "noindex" }] };
    const title = `ONE ${loaderData.name} — ${loaderData.tagline}`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.description },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: ProductNotFound,
});

function ProductNotFound() {
  const { t } = useI18n();
  return (
    <SiteShell>
      <section className="relative isolate flex min-h-[80vh] items-center overflow-hidden">
        <Aurora />
        <div className="relative mx-auto flex max-w-xl flex-col items-center gap-6 px-5 pt-24 text-center">
          <p className="text-gradient tracking-display text-8xl font-extrabold">404</p>
          <h1 className="text-3xl font-extrabold">{t("product.notFound")}</h1>
          <p className="text-muted-foreground">{t("product.notFoundLead")}</p>
          <Button asChild variant="hero" size="xl">
            <Link to="/products">{t("cta.all")}</Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}

function ProductPage() {
  const { slug } = Route.useParams();
  const { t, lang } = useI18n();
  const product = findProduct(slug);
  const [open, setOpen] = useState<number | null>(null);
  if (!product) return <ProductNotFound />;

  const features = pick(product.features, lang) ?? [];
  const others = PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 3);
  const live = product.status === "live";

  return (
    <SiteShell>
      <section className="relative isolate overflow-hidden bg-night pt-32 pb-16 md:pt-40 md:pb-24">
        <Aurora />
        <div aria-hidden="true" className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_40%,#000,transparent_65%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-night to-transparent" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-5 md:px-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          <div className="order-2 space-y-7 lg:order-1">
            <Reveal y={12}>
              <Link to="/products" className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> {t("cta.all")}
              </Link>
            </Reveal>
            <Reveal delay={0.1} className="flex flex-wrap items-center gap-4">
              <ProductLogo name={product.name} ring={product.ring} className="text-5xl md:text-7xl" />
              <StatusBadge status={product.status} />
            </Reveal>
            <h1 className="tracking-display text-[clamp(2.1rem,4.6vw,4rem)] leading-[1.04] font-extrabold">
              <SplitReveal key={lang} parts={[{ hi: pick(product.tagline, lang) ?? "" }]} delay={0.25} />
            </h1>
            <Reveal delay={0.45}>
              <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">{pick(product.description, lang)}</p>
            </Reveal>
            <Reveal delay={0.55} className="flex flex-wrap gap-3">
              <Magnetic>
                {live && product.url ? (
                  <Button asChild variant="hero" size="xl" className="h-14 px-8 text-base">
                    <a href={product.url} target="_blank" rel="noreferrer">
                      {t("cta.open")} <ArrowUpRight />
                    </a>
                  </Button>
                ) : (
                  <Button asChild variant="hero" size="xl" className="h-14 px-8 text-base">
                    <a href={CONTACTS.telegramHref} target="_blank" rel="noreferrer">
                      <Send /> {live ? t("cta.connect") : t("cta.notify")}
                    </a>
                  </Button>
                )}
              </Magnetic>
              <Magnetic>
                <Button asChild variant="glass" size="xl" className="h-14 px-7 text-base">
                  <a href={CONTACTS.phoneHref}>
                    <Phone /> {CONTACTS.phoneDisplay}
                  </a>
                </Button>
              </Magnetic>
            </Reveal>
            {!live ? (
              <Reveal delay={0.65}>
                <p className="max-w-xl text-sm text-muted-foreground">{t("product.soon")}</p>
              </Reveal>
            ) : null}
          </div>
          <OneRing3D ring={product.ring} layout="focus" className="order-1 mx-auto aspect-square w-full max-w-[300px] sm:max-w-[420px] lg:order-2 lg:max-w-[560px]" />
        </div>
      </section>

      {features.length > 0 ? (
        <section className="relative bg-night py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <Reveal y={16}>
              <Kicker>{t("product.features")}</Kicker>
            </Reveal>
            <ul className="mt-12 grid gap-4 md:grid-cols-2">
              {features.map((f, i) => (
                <li key={`${lang}-${i}`} className="h-full">
                  <Reveal delay={(i % 2) * 0.1} className="h-full">
                    <TiltCard max={3} className="h-full rounded-3xl">
                      <div className="flex h-full gap-5 rounded-3xl border border-white/[0.07] bg-gradient-card p-6 shadow-card md:p-7">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow">
                          <Check className="h-5 w-5 text-primary-foreground" />
                        </span>
                        <div>
                          <span className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                          <p className="mt-1 text-lg leading-relaxed">{f}</p>
                        </div>
                      </div>
                    </TiltCard>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {product.gallery.length > 0 ? (
        <section className="relative isolate overflow-hidden border-y border-white/[0.06] bg-night py-24 md:py-32">
          <div className="relative mx-auto max-w-7xl px-5 md:px-8">
            <h2 className="tracking-display mb-12 text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.02] font-extrabold">
              <SplitReveal parts={t("product.gallery")} inView />
            </h2>
          </div>
          <Reveal>
            <SlideCarousel
              slides={product.gallery}
              name={product.name}
              itemClassName="w-[78vw] sm:w-[44vw] lg:w-[min(30vw,400px)]"
              padClassName="px-5 scroll-px-5 md:px-[max(2rem,calc((100vw-80rem)/2+2rem))] md:scroll-px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
              controlsClassName="px-5 md:px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
              onOpen={setOpen}
            />
          </Reveal>
          <SlideLightbox slides={product.gallery} name={product.name} index={open} onIndex={setOpen} />
        </section>
      ) : null}

      {others.length > 0 ? (
        <section className="relative bg-night py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <h2 className="tracking-display mb-12 text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.02] font-extrabold">
              <SplitReveal parts={t("product.others")} inView />
            </h2>
            <div className="grid gap-5 md:grid-cols-3">
              {others.map((p, i) => (
                <Reveal key={p.slug} delay={i * 0.1} className="h-full">
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <ContactBand />
    </SiteShell>
  );
}
