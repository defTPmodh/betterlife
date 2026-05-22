import type { ReactNode } from "react";

interface AnimatedWordsProps {
  text: string;
  className?: string;
  wordClassName?: string;
}

export function AnimatedWords({ text, className = "", wordClassName = "" }: AnimatedWordsProps) {
  return (
    <span className={`animated-words ${className}`} aria-label={text}>
      {text.split(" ").map((word, index) => (
        <span
          aria-hidden="true"
          className={`animated-word ${wordClassName}`}
          key={`${word}-${index}`}
          style={{ animationDelay: `${index * 70}ms` }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  tone?: "light" | "dark";
}

export function SpotlightCard({ children, className = "", tone = "light" }: SpotlightCardProps) {
  const toneClass =
    tone === "dark"
      ? "border-white/10 bg-slate-950 text-white shadow-[0_34px_120px_rgba(15,23,42,0.26)]"
      : "border-white/80 bg-white/85 text-slate-950 shadow-[0_26px_100px_rgba(15,23,42,0.1)]";

  return (
    <div className={`spotlight-card relative overflow-hidden rounded-[2rem] border backdrop-blur-md ${toneClass} ${className}`}>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

interface ProfilePlacardProps {
  eyebrow: string;
  name: string;
  detail: string;
  meta: string;
  initials: string;
  accent?: "indigo" | "emerald" | "sky" | "violet";
  className?: string;
}

const accentMap: Record<NonNullable<ProfilePlacardProps["accent"]>, string> = {
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  sky: "bg-sky-50 text-sky-700 ring-sky-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
};

export function ProfilePlacard({
  eyebrow,
  name,
  detail,
  meta,
  initials,
  accent = "indigo",
  className = "",
}: ProfilePlacardProps) {
  return (
    <div className={`profile-placard group rounded-[1.75rem] border border-slate-100 bg-white p-4 shadow-[0_18px_70px_rgba(15,23,42,0.08)] ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ring-1 ${accentMap[accent]}`}>
          {initials}
        </div>
        <span className="rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
          {eyebrow}
        </span>
      </div>
      <div className="mt-5">
        <p className="text-base font-semibold tracking-tight text-slate-950">{name}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{detail}</p>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Profile ID</span>
        <span className="font-mono text-xs font-semibold text-slate-700">{meta}</span>
      </div>
    </div>
  );
}

interface FlowPillProps {
  label: string;
  value: string;
  icon: ReactNode;
}

export function FlowPill({ label, value, icon }: FlowPillProps) {
  return (
    <div className="flow-pill flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/90 p-3 shadow-sm backdrop-blur">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-slate-950">{value}</p>
      </div>
    </div>
  );
}

interface KineticMarqueeProps {
  items: string[];
  className?: string;
}

export function KineticMarquee({ items, className = "" }: KineticMarqueeProps) {
  const repeatedItems = [...items, ...items];

  return (
    <div className={`kinetic-marquee overflow-hidden whitespace-nowrap ${className}`}>
      <div className="kinetic-marquee-track inline-flex items-center gap-3">
        {repeatedItems.map((item, index) => (
          <span
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur"
            key={`${item}-${index}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

interface MotionStatProps {
  label: string;
  value: string;
  tone?: "indigo" | "emerald" | "slate";
}

const statToneMap: Record<NonNullable<MotionStatProps["tone"]>, string> = {
  indigo: "from-indigo-50 text-indigo-700 ring-indigo-100",
  emerald: "from-emerald-50 text-emerald-700 ring-emerald-100",
  slate: "from-slate-50 text-slate-700 ring-slate-100",
};

export function MotionStat({ label, value, tone = "slate" }: MotionStatProps) {
  return (
    <div className={`motion-stat rounded-2xl bg-gradient-to-br ${statToneMap[tone]} to-white p-4 ring-1`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

interface ScanFrameProps {
  children: ReactNode;
  className?: string;
}

export function ScanFrame({ children, className = "" }: ScanFrameProps) {
  return (
    <div className={`scan-frame relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white ${className}`}>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  strong?: boolean;
}

export function GlassPanel({ children, className = "", strong = false }: GlassPanelProps) {
  return (
    <div className={`relative overflow-hidden rounded-[2rem] ${strong ? "glass-panel-strong" : "glass-panel"} ${className}`}>
      {children}
    </div>
  );
}

interface FisheyeDockProps {
  children: ReactNode;
  className?: string;
}

export function FisheyeDock({ children, className = "" }: FisheyeDockProps) {
  return <div className={`fisheye-dock ${className}`}>{children}</div>;
}

interface LensCardProps {
  children: ReactNode;
  className?: string;
}

export function LensCard({ children, className = "" }: LensCardProps) {
  return (
    <div className={`fisheye-lens fisheye-card rounded-[2rem] ${className}`}>
      {children}
    </div>
  );
}
