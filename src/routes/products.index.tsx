import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { EcosystemSlot, PageHero, ProductCard } from "@/components/site/ui";
import { Reveal } from "@/components/motion/primitives";
import { cn } from "@/lib/utils";
import { ContactBand } from "@/components/site/ContactBand";
import { useI18n } from "@/lib/i18n";
import { PRODUCTS as products } from "@/lib/products";

export const Route = createFileRoute("/products/")({
  head: () => ({
    meta: [
      { title: "Mahsulotlar — ONE Ecosystem" },
      { name: "description", content: "ONE ekotizimidagi barcha mahsulotlar: ONE Plus, ONE Agent, ONE Market, ONE CRM va boshqalar." },
      { property: "og:title", content: "ONE mahsulotlari" },
      { property: "og:description", content: "Bitta ekotizimdagi barcha xizmatlar — yangilari doimiy qo‘shilib boradi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { t } = useI18n();
  const featured = products[0]?.status === "live";
  const cells = products.length + (featured ? 1 : 0);
  return (
    <SiteShell>
      <PageHero kicker={t("products.kicker")} title={[{ hi: t("products.title") }]} lead={t("products.lead")} />
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => {
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
      </section>
      <ContactBand />
    </SiteShell>
  );
}
