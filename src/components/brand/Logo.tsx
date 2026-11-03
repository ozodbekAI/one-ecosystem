import { cn } from "@/lib/utils";
import {
  CAP,
  NE_PATH,
  NE_WIDTH,
  RING,
  arcPath,
  nameColor,
  ringSegments,
  wordColor,
  type LogoTone,
  type RingStyle,
} from "@/lib/brand";

function RingPaths({ style, tone }: { style: RingStyle; tone: LogoTone | "icon" }) {
  return (
    <>
      {ringSegments(style, tone).map((s) => (
        <path
          key={s.from}
          d={arcPath(RING.cx, RING.cy, RING.r, s.from, s.to)}
          fill="none"
          stroke={s.color}
          strokeWidth={RING.stroke}
        />
      ))}
    </>
  );
}

/** The ring "O" on its own. */
export function OneMark({
  ring = "brand",
  tone = "dark",
  className,
  title,
}: {
  ring?: RingStyle;
  tone?: LogoTone;
  className?: string;
  title?: string;
}) {
  return (
    <svg viewBox={`0 0 ${CAP} ${CAP}`} className={cn("block", className)} role="img" aria-label={title ?? "ONE"}>
      <RingPaths style={ring} tone={tone} />
    </svg>
  );
}

/**
 * "ONE" + optional product name. Size it with a font-size class on the wrapper
 * (e.g. text-3xl): the ONE letters match the cap height of the product name.
 */
export function ProductLogo({
  name,
  ring = "brand",
  tone = "dark",
  className,
}: {
  name?: string | null | undefined;
  ring?: RingStyle;
  tone?: LogoTone;
  className?: string;
}) {
  const label = name ? `ONE ${name}` : "ONE";
  return (
    <span className={cn("inline-flex items-baseline whitespace-nowrap leading-none", className)} aria-label={label} role="img">
      <svg
        viewBox={`0 0 ${NE_WIDTH} ${CAP}`}
        style={{ height: "0.7em", width: `${(0.7 * NE_WIDTH) / CAP}em` }}
        className="shrink-0 overflow-visible"
        aria-hidden="true"
      >
        <RingPaths style={ring} tone={tone} />
        <path d={NE_PATH} fill={wordColor(tone)} />
      </svg>
      {name ? (
        <span aria-hidden="true" className="font-medium tracking-tight" style={{ marginLeft: "0.31em", color: nameColor(tone) }}>
          {name}
        </span>
      ) : null}
    </span>
  );
}

/** Rounded square app icon. */
export function AppIcon({ ring = "brand", className }: { ring?: RingStyle; className?: string }) {
  const s = 307.2 / RING.r;
  return (
    <svg viewBox="0 0 1024 1024" className={cn("block", className)} role="img" aria-label="ONE">
      <rect width="1024" height="1024" rx="228" fill="#3B0A77" />
      <g transform={`translate(${512 - RING.cx * s} ${512 - RING.cy * s}) scale(${s})`}>
        <RingPaths style={ring} tone={ring === "plus" ? "dark" : "icon"} />
      </g>
    </svg>
  );
}
