import { ArrowUpRight, Phone, Send } from "lucide-react";
import { Aurora, Magnetic, Reveal, Ring3DCss, SplitReveal } from "@/components/motion/primitives";
import { Kicker } from "@/components/site/ui";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { CONTACTS } from "@/lib/contacts";

/** Closing call to action on every page. */
export function ContactBand() {
  const { t } = useI18n();
  return (
    <section className="relative isolate overflow-hidden border-t border-white/[0.06] bg-night">
      <Aurora intensity={0.9} />
      <div aria-hidden="true" className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,#000,transparent_65%)]" />
      <Ring3DCss className="absolute top-1/2 left-1/2 w-[min(92vw,760px)] -translate-x-1/2 -translate-y-1/2 opacity-[0.16]" duration={14} />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-5 py-28 text-center md:py-44">
        <Reveal y={16}>
          <Kicker>ONE Ecosystem</Kicker>
        </Reveal>
        <h2 className="tracking-display mt-8 text-[clamp(2.4rem,6.5vw,5.75rem)] leading-[1] font-extrabold">
          <SplitReveal parts={t("home.cta.title")} inView />
        </h2>
        <Reveal delay={0.3}>
          <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">{t("home.cta.lead")}</p>
        </Reveal>
        <Reveal delay={0.45} className="mt-11 flex flex-wrap justify-center gap-3">
          <Magnetic>
            <Button asChild variant="light" size="xl" className="h-14 px-8 text-base">
              <a href={CONTACTS.telegramHref} target="_blank" rel="noreferrer">
                <Send /> {t("cta.telegram")} <ArrowUpRight />
              </a>
            </Button>
          </Magnetic>
          <Magnetic>
            <Button asChild variant="glass" size="xl" className="h-14 px-8 text-base">
              <a href={CONTACTS.phoneHref}>
                <Phone /> {CONTACTS.phoneDisplay}
              </a>
            </Button>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}
