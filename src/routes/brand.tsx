import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHero } from "@/components/site/ui";
import { Reveal } from "@/components/motion/primitives";
import { AppIcon, OneMark, ProductLogo } from "@/components/brand/Logo";
import { useI18n } from "@/lib/i18n";
import { PRODUCTS as products } from "@/lib/products";
import { COLORS, type LogoTone, type RingStyle } from "@/lib/brand";
import { downloadIcon, downloadWordmark } from "@/lib/logo-download";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/brand")({
  head: () => ({
    meta: [
      { title: "Brend va logotiplar — ONE Ecosystem" },
      { name: "description", content: "ONE ekotizimining rasmiy logotiplari, ranglari va shrifti. SVG va PNG formatida yuklab oling." },
      { property: "og:title", content: "ONE brendi: logotiplar va ranglar" },
      { property: "og:description", content: "ONE, ONE Plus va barcha mahsulot logotiplarini yuklab oling." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BrandPage,
});

const PALETTE = [
  { name: "Chuqur binafsha", hex: COLORS.deep },
  { name: "Asosiy binafsha", hex: COLORS.main },
  { name: "Brend", hex: COLORS.brand },
  { name: "Aksent", hex: COLORS.accent },
  { name: "Lavanda", hex: COLORS.lavender },
  { name: "Matn", hex: COLORS.ink },
  { name: "Tungi fon", hex: COLORS.night },
];

function DownloadButtons({ onSvg, onPng }: { onSvg: () => void; onPng: () => void }) {
  return (
    <div className="flex gap-2">
      {[
        ["SVG", onSvg],
        ["PNG", onPng],
      ].map(([label, fn]) => (
        <button
          key={label as string}
          type="button"
          onClick={fn as () => void}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-lavender/50 hover:text-foreground"
        >
          <Download className="h-3.5 w-3.5" /> {label as string}
        </button>
      ))}
    </div>
  );
}

function WordmarkTile({ name, ring, tone, label }: { name?: string | undefined; ring: RingStyle; tone: LogoTone; label: string }) {
  const file = `one${name ? "-" + name.toLowerCase().replace(/\s+/g, "-") : ""}-${tone === "light" ? "light" : "dark"}`;
  return (
    <figure className="space-y-3">
      <div
        className={cn(
          "flex min-h-44 items-center justify-center rounded-3xl border p-8",
          tone === "light" ? "border-transparent bg-foreground" : "border-border bg-night",
        )}
      >
        <ProductLogo name={name} ring={ring} tone={tone} className="text-4xl md:text-5xl" />
      </div>
      <figcaption className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        {label}
        <DownloadButtons
          onSvg={() => downloadWordmark({ name, ring, tone, format: "svg", file })}
          onPng={() => downloadWordmark({ name, ring, tone, format: "png", file })}
        />
      </figcaption>
    </figure>
  );
}

function BrandPage() {
  const { t } = useI18n();

  return (
    <SiteShell>
      <PageHero kicker={t("brand.kicker")} title={[{ hi: t("brand.title") }]} lead={t("brand.lead")} />

      <section className="mx-auto max-w-7xl space-y-8 px-5 py-16 md:px-8 md:py-20">
        <h2 className="text-2xl font-extrabold md:text-3xl">1 · {t("brand.main")}</h2>
        <Reveal className="grid gap-5 lg:grid-cols-[2fr_2fr_1fr_1fr]">
          <WordmarkTile ring="brand" tone="light" label={t("brand.onLight")} />
          <WordmarkTile ring="brand" tone="dark" label={t("brand.onDark")} />
          <figure className="space-y-3">
            <div className="flex min-h-44 items-center justify-center rounded-3xl border border-border bg-surface p-6">
              <AppIcon className="h-28 w-28" />
            </div>
            <figcaption className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
              {t("brand.appIcon")}
              <DownloadButtons
                onSvg={() => downloadIcon({ ring: "brand", kind: "app", format: "svg", file: "one-app-icon" })}
                onPng={() => downloadIcon({ ring: "brand", kind: "app", format: "png", file: "one-app-icon" })}
              />
            </figcaption>
          </figure>
          <figure className="space-y-3">
            <div className="flex min-h-44 items-center justify-center rounded-3xl bg-foreground p-6">
              <OneMark tone="light" className="h-24 w-24" />
            </div>
            <figcaption className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
              {t("brand.mark")}
              <DownloadButtons
                onSvg={() => downloadIcon({ ring: "brand", kind: "mark", format: "svg", file: "one-mark" })}
                onPng={() => downloadIcon({ ring: "brand", kind: "mark", format: "png", file: "one-mark" })}
              />
            </figcaption>
          </figure>
        </Reveal>
        <Reveal delay={0.1} className="grid gap-5 md:grid-cols-2">
          <WordmarkTile name="Ecosystem" ring="brand" tone="light" label={`ONE Ecosystem · ${t("brand.onLight")}`} />
          <WordmarkTile name="Ecosystem" ring="brand" tone="dark" label={`ONE Ecosystem · ${t("brand.onDark")}`} />
        </Reveal>
      </section>

      <section className="border-y border-white/[0.06] bg-surface/30">
        <div className="mx-auto max-w-7xl space-y-8 px-5 py-16 md:px-8 md:py-20">
          <div className="space-y-3">
            <h2 className="text-2xl font-extrabold md:text-3xl">2 · {t("brand.products")}</h2>
            <p className="max-w-3xl text-muted-foreground">{t("brand.rule")}</p>
          </div>
          {products.map((p) => (
            <Reveal key={p.slug} className="grid gap-5 lg:grid-cols-[2fr_2fr_1fr]">
              <WordmarkTile name={p.name} ring={p.ring} tone="light" label={`ONE ${p.name} · ${t("brand.onLight")}`} />
              <WordmarkTile name={p.name} ring={p.ring} tone="dark" label={`ONE ${p.name} · ${t("brand.onDark")}`} />
              <figure className="space-y-3">
                <div className="flex min-h-44 items-center justify-center rounded-3xl border border-border bg-surface p-6">
                  <AppIcon ring={p.ring} className="h-28 w-28" />
                </div>
                <figcaption className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                  {t("brand.appIcon")}
                  <DownloadButtons
                    onSvg={() => downloadIcon({ ring: p.ring, kind: "app", format: "svg", file: `one-${p.slug}-app-icon` })}
                    onPng={() => downloadIcon({ ring: p.ring, kind: "app", format: "png", file: `one-${p.slug}-app-icon` })}
                  />
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:px-8 md:py-20 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <h2 className="text-2xl font-extrabold md:text-3xl">3 · {t("brand.colors")}</h2>
          <Reveal className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {PALETTE.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(c.hex);
                  toast.success(`${c.hex} — ${t("brand.copied")}`);
                }}
                className="group text-left"
              >
                <span
                  className="block h-24 rounded-2xl border border-border transition-transform group-hover:-translate-y-1"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="mt-2 block text-sm font-bold">{c.name}</span>
                <span className="font-mono text-xs text-muted-foreground">{c.hex}</span>
              </button>
            ))}
          </Reveal>
        </div>
        <div className="space-y-6">
          <h2 className="text-2xl font-extrabold md:text-3xl">4 · {t("brand.type")}</h2>
          <Reveal delay={0.1} className="rounded-3xl border border-white/[0.07] bg-gradient-card p-8 shadow-card">
            <p className="text-gradient text-7xl font-extrabold">Aa</p>
            <p className="mt-4 text-xl font-bold">Plus Jakarta Sans</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("brand.typeNote")}</p>
            <div className="mt-6 space-y-1 text-muted-foreground">
              <p className="font-normal">Regular 400</p>
              <p className="font-medium">Medium 500</p>
              <p className="font-bold text-foreground">Bold 700</p>
              <p className="font-extrabold text-foreground">ExtraBold 800</p>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
