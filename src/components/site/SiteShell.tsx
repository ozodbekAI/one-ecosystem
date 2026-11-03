import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { ArrowUpRight, Menu, Phone, Send, X } from "lucide-react";
import { ProductLogo } from "@/components/brand/Logo";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { getLenis } from "@/lib/smooth-scroll";
import { EASE, Magnetic } from "@/components/motion/primitives";
import { Button } from "@/components/ui/button";
import { NE_PATH, NE_WIDTH, CAP, RING, arcPath, ringSegments } from "@/lib/brand";
import { useI18n, type TKey } from "@/lib/i18n";
import { CONTACTS } from "@/lib/contacts";
import { PRODUCTS } from "@/lib/products";
import { cn } from "@/lib/utils";

const NAV: { to: "/products" | "/about" | "/brand" | "/contact"; key: TKey }[] = [
  { to: "/products", key: "nav.products" },
  { to: "/about", key: "nav.about" },
  { to: "/brand", key: "nav.brand" },
  { to: "/contact", key: "nav.contact" },
];

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-night text-foreground">
      <SiteHeader />
      <motion.main className="flex-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, ease: EASE }}>
        {children}
      </motion.main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, mass: 0.3 });

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 200);
    setScrolled(y > 30);
  });

  useEffect(() => {
    const lenis = getLenis();
    if (open) lenis?.stop();
    else lenis?.start();
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
      getLenis()?.start();
    };
  }, [open]);

  return (
    <>
      <motion.div aria-hidden="true" style={{ scaleX: progress }} className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-brand via-pink to-lavender" />
      <motion.header
        initial={false}
        animate={{ y: hidden && !open ? "-140%" : "0%" }}
        transition={{ duration: 0.5, ease: EASE }}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-5 md:pt-4"
      >
        <div
          className={cn(
            "mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 rounded-full border pr-2 pl-5 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500",
            scrolled || open
              ? "border-white/10 bg-night/80 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)] backdrop-blur-md"
              : "border-transparent bg-transparent",
          )}
        >
          <Link to="/" className="relative z-10 text-[26px]" aria-label="ONE Ecosystem" onClick={() => setOpen(false)}>
            <ProductLogo />
          </Link>

          <nav className="hidden items-center md:flex" onPointerLeave={() => setHovered(null)}>
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onPointerEnter={() => setHovered(n.to)}
                className="relative rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {({ isActive }) => (
                  <>
                    {hovered === n.to ? (
                      <motion.span layoutId="nav-hover" className="absolute inset-0 rounded-full bg-white/[0.07]" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                    ) : null}
                    {isActive ? <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-pink shadow-[0_0_10px_2px] shadow-pink/60" /> : null}
                    <span className="relative">{t(n.key)}</span>
                  </>
                )}
              </Link>
            ))}
          </nav>

          <div className="relative z-10 flex items-center gap-2">
            <LanguageSwitcher className="hidden sm:flex" />
            <Magnetic strength={0.25} className="hidden sm:inline-flex">
              <Button asChild variant="hero" size="sm" className="h-10 px-5">
                <a href={CONTACTS.telegramHref} target="_blank" rel="noreferrer">
                  {t("cta.contact")}
                </a>
              </Button>
            </Magnetic>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={t("nav.menu")}
              aria-expanded={open}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={open ? "x" : "m"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="menu"
            initial={{ clipPath: "circle(0% at calc(100% - 44px) 44px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 44px) 44px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 44px) 44px)" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="fixed inset-0 z-40 flex flex-col justify-between overflow-hidden bg-night px-6 pt-28 pb-10 md:hidden"
          >
            <div aria-hidden="true" className="bg-spot absolute -top-40 -right-40 h-[480px] w-[480px] opacity-70" />
            <nav className="relative flex flex-col gap-1">
              {[{ to: "/" as const, key: "nav.home" as TKey }, ...NAV].map((n, i) => (
                <motion.div key={n.to} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 + i * 0.06, duration: 0.7, ease: EASE }}>
                  <Link
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className="tracking-display flex items-center justify-between border-b border-white/[0.06] py-4 text-4xl font-extrabold text-muted-foreground"
                    activeProps={{ className: "text-foreground" }}
                    activeOptions={{ exact: n.to === "/" }}
                  >
                    {t(n.key)}
                    <ArrowUpRight className="h-6 w-6 opacity-40" />
                  </Link>
                </motion.div>
              ))}
            </nav>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="relative space-y-5">
              <LanguageSwitcher />
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <a href={CONTACTS.phoneHref}>{CONTACTS.phoneDisplay}</a>
                <a href={CONTACTS.telegramHref} target="_blank" rel="noreferrer">
                  {CONTACTS.telegramHandle}
                </a>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

/** Giant "ONE" outline that rises from the bottom of the footer. */
function GiantWordmark() {
  const segs = ringSegments("brand", "dark");
  return (
    <motion.svg
      viewBox={`-12 -12 ${NE_WIDTH + 24} ${CAP + 24}`}
      className="block w-full"
      aria-hidden="true"
      initial={{ y: "35%", opacity: 0 }}
      whileInView={{ y: "0%", opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -5% 0px" }}
      transition={{ duration: 1.6, ease: EASE }}
    >
      <defs>
        <linearGradient id="giant-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C39BFF" stopOpacity="0.22" />
          <stop offset="0.85" stopColor="#C39BFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="giant-stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F05BD7" stopOpacity="0.7" />
          <stop offset="0.6" stopColor="#C39BFF" stopOpacity="0.25" />
          <stop offset="1" stopColor="#C39BFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      {segs.map((s) => (
        <path key={s.from} d={arcPath(RING.cx, RING.cy, RING.r, s.from, s.to)} fill="none" stroke="url(#giant-fill)" strokeWidth={RING.stroke} />
      ))}
      <path d={NE_PATH} fill="url(#giant-fill)" stroke="url(#giant-stroke)" strokeWidth="0.35" />
    </motion.svg>
  );
}

function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] bg-night">
      <div aria-hidden="true" className="bg-spot absolute -bottom-1/2 left-1/2 h-[700px] w-[1100px] -translate-x-1/2 opacity-40" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pt-20 pb-10 md:grid-cols-[1.5fr_1fr_1fr_1.2fr] md:px-8">
        <div className="space-y-5">
          <ProductLogo name="Ecosystem" className="text-3xl" />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{t("footer.tagline")}</p>
          <p className="text-gradient text-xl font-bold">{t("slogan")}</p>
        </div>
        <div>
          <h3 className="mb-5 text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">{t("footer.products")}</h3>
          <ul className="space-y-3 text-sm">
            {PRODUCTS.map((p) => (
              <li key={p.slug}>
                <Link to="/products/$slug" params={{ slug: p.slug }} className="group inline-flex items-center gap-2 transition-colors hover:text-lavender">
                  ONE {p.name}
                  {p.status === "live" ? <span className="h-1.5 w-1.5 rounded-full bg-success" /> : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-5 text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">{t("footer.company")}</h3>
          <ul className="space-y-3 text-sm">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="transition-colors hover:text-lavender">
                  {t(n.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3 text-sm">
          <a href={CONTACTS.phoneHref} className="group flex items-center gap-3 transition-colors hover:text-lavender">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition-colors group-hover:border-lavender/40">
              <Phone className="h-4 w-4" />
            </span>
            {CONTACTS.phoneDisplay}
          </a>
          <a href={CONTACTS.telegramHref} target="_blank" rel="noreferrer" className="group flex items-center gap-3 transition-colors hover:text-lavender">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition-colors group-hover:border-lavender/40">
              <Send className="h-4 w-4" />
            </span>
            {CONTACTS.telegramHandle}
          </a>
        </div>
      </div>
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <GiantWordmark />
      </div>
      <div className="relative border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between md:px-8">
          <span>
            © {new Date().getFullYear()} ONE Ecosystem. {t("footer.rights")}
          </span>
          <span>{t("slogan")}</span>
        </div>
      </div>
    </footer>
  );
}
