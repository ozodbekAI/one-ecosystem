import { LANGS, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div
      className={cn("flex items-center rounded-full border border-white/10 bg-white/[0.04] p-1 text-[11px] font-semibold", className)}
      role="group"
      aria-label="Language"
    >
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
          title={l.label}
          className={cn(
            "rounded-full px-2.5 py-1.5 transition-all duration-300",
            lang === l.code ? "bg-foreground text-brand-deep shadow-[0_0_20px_-4px] shadow-lavender/60" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}
