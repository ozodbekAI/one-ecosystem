import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Phone, Send } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHero } from "@/components/site/ui";
import { OneMark } from "@/components/brand/Logo";
import { Reveal, TiltCard } from "@/components/motion/primitives";
import { useI18n } from "@/lib/i18n";
import { CONTACTS } from "@/lib/contacts";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Aloqa — ONE Ecosystem" },
      {
        name: "description",
        content:
          "ONE bilan bog‘laning: telefon +998 99 261 37 77, Telegram @Asrorkhan_Obidovv.",
      },
      { property: "og:title", content: "ONE Ecosystem bilan bog‘lanish" },
      {
        property: "og:description",
        content:
          "Savol, hamkorlik yoki mahsulotga ulanish bo‘yicha yozing yoki qo‘ng‘iroq qiling.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { t } = useI18n();
  const cards = [
    {
      icon: Send,
      label: t("contact.telegram"),
      value: CONTACTS.telegramHandle,
      href: CONTACTS.telegramHref,
      cta: t("cta.telegram"),
      external: true,
    },
    {
      icon: Phone,
      label: t("contact.phone"),
      value: CONTACTS.phoneDisplay,
      href: CONTACTS.phoneHref,
      cta: t("cta.call"),
      external: false,
    },
  ];
  return (
    <SiteShell>
      <PageHero kicker={t("contact.kicker")} title={[{ hi: t("contact.title") }]} lead={t("contact.lead")} />
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-5 md:grid-cols-2">
          {cards.map(({ icon: Icon, label, value, href, cta, external }, i) => (
            <Reveal key={label} delay={i * 0.12} className="h-full">
              <TiltCard max={5} className="h-full rounded-[2rem]">
                <a
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                  className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/[0.07] bg-gradient-card p-8 shadow-card md:p-12"
                >
                  <div aria-hidden="true" className="bg-spot absolute -top-32 -right-32 h-80 w-80 opacity-0 transition-opacity duration-700 group-hover/tilt:opacity-100" />
                  <span className="relative mb-14 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow transition-transform duration-700 group-hover/tilt:scale-110 group-hover/tilt:-rotate-[8deg]">
                    <Icon className="h-7 w-7 text-primary-foreground" />
                  </span>
                  <p className="relative text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">{label}</p>
                  <p className="tracking-display relative mt-3 text-3xl font-extrabold break-all md:text-5xl">{value}</p>
                  <span className="relative mt-10 inline-flex items-center gap-3 font-semibold">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 transition-all duration-500 group-hover/tilt:border-transparent group-hover/tilt:bg-gradient-brand">
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover/tilt:rotate-45" />
                    </span>
                    {cta}
                  </span>
                </a>
              </TiltCard>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <div className="mt-6 flex items-center gap-5 rounded-3xl border border-white/[0.07] bg-white/[0.03] p-6">
            <OneMark className="animate-spin-slow h-10 w-10 shrink-0" />
            <p className="text-muted-foreground">{t("contact.reply")}</p>
          </div>
        </Reveal>
      </section>
    </SiteShell>
  );
}
