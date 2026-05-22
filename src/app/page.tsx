import { ArrowRight, BadgeCheck, FileLock2, Fingerprint, Hospital, KeyRound, ShieldCheck, Sparkles, Stethoscope, TimerReset } from "lucide-react";
import { AnimatedWords, FisheyeDock, FlowPill, GlassPanel, KineticMarquee, LensCard, MotionStat, ProfilePlacard, ScanFrame, SpotlightCard } from "../components/reactbits-inspired";

interface TimelineStep {
  title: string;
  body: string;
  icon: JSX.Element;
}

const timelineSteps: TimelineStep[] = [
  {
    title: "Identity check",
    body: "Patient profile is bound to Emirates ID, passport, email, and a verified access PIN.",
    icon: <Fingerprint className="h-4 w-4" />,
  },
  {
    title: "Hospital scope",
    body: "Doctors can add records only when the consultation and hospital relationship are active.",
    icon: <Hospital className="h-4 w-4" />,
  },
  {
    title: "Temporary release",
    body: "Patients share selected records through expiring, read-only secure links.",
    icon: <TimerReset className="h-4 w-4" />,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950 page-enter">
      <section className="relative min-h-screen advanced-health-bg px-5 py-5 sm:px-6">
        <nav className="glass-panel mx-auto flex max-w-7xl items-center justify-between rounded-full px-4 py-3 sm:px-5">
          <a href="/" className="flex items-center gap-2 text-sm font-bold tracking-tight text-slate-950">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-[11px] font-bold text-white">bl</span>
            better life
          </a>
          <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100 sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Sovereign health node online
          </div>
          <a
            href="/professional"
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-600"
          >
            Professional access
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </nav>

        <div className="mx-auto grid min-h-[calc(100vh-92px)] max-w-7xl items-center gap-12 py-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/82 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Premium health identity and record exchange
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-tight text-slate-950 sm:text-7xl">
              <AnimatedWords text="Secure medical profiles for global care." />
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              A high-trust patient vault where hospitals author medical records, patients control sharing, and foreign doctors receive temporary read-only access.
            </p>
            <GlassPanel className="mt-7 max-w-2xl p-2">
              <KineticMarquee
                items={[
                  "Emirates ID linked",
                  "Doctor-only uploads",
                  "Demo OTP enabled",
                  "Read-only secure viewer",
                  "Burjeel consultation scoped",
                ]}
              />
            </GlassPanel>
            <FisheyeDock className="mt-9 flex-col sm:flex-row">
              <a
                href="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-300 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-600"
              >
                Create Secure Account
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/auth?mode=signin&role=patient&next=/patient/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-indigo-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-700"
              >
                Open Patient Vault
                <FileLock2 className="h-4 w-4" />
              </a>
              <a
                href="/professional"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/88 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-white"
              >
                Hospital Dashboard
                <Stethoscope className="h-4 w-4" />
              </a>
            </FisheyeDock>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <MotionStat label="Verified profiles" value="128k" tone="indigo" />
              <MotionStat label="Hospital nodes" value="42" tone="emerald" />
              <MotionStat label="Link expiry" value="1h" tone="slate" />
            </div>
          </div>

          <div className="relative">
            <div className="grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
              <div className="space-y-4 lg:pt-16">
                <LensCard>
                  <ProfilePlacard
                    accent="indigo"
                    eyebrow="Patient"
                    initials="AM"
                    name="Amina Mansoor"
                    detail="UAE patient profile with Emirates ID, passport, vitals, and view-only records."
                    meta="BL-UAE-000001"
                    className="bg-white/88 backdrop-blur-md"
                  />
                </LensCard>
                <LensCard className="lg:translate-x-7">
                  <ProfilePlacard
                    accent="emerald"
                    eyebrow="Doctor"
                    initials="LH"
                    name="Dr. Layla Hassan"
                    detail="Burjeel consultant with active upload permissions during consultation."
                    meta="DHA-CL-20491"
                    className="bg-white/88 backdrop-blur-md"
                  />
                </LensCard>
              </div>

              <GlassPanel className="p-4" strong>
                <div className="rounded-[1.5rem] border border-slate-100 bg-slate-950 p-5 text-white">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Live care graph</p>
                      <p className="mt-1 text-xl font-semibold">Burjeel Hospital Consultation</p>
                    </div>
                    <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-300/20">
                      Doctor verified
                    </span>
                  </div>

                  <div className="relative mb-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 scanline-sweep">
                    <div className="grid gap-3">
                      <FlowPill label="Author" value="Hospital doctor" icon={<BadgeCheck className="h-4 w-4" />} />
                      <FlowPill label="Vault" value="Patient read-only" icon={<ShieldCheck className="h-4 w-4" />} />
                      <FlowPill label="Gateway" value="Foreign doctor OTP" icon={<KeyRound className="h-4 w-4" />} />
                    </div>
                    <div className="mt-5 space-y-2">
                      <div className="signal-line h-1 rounded-full bg-indigo-400/70" />
                      <div className="signal-line h-1 w-4/5 rounded-full bg-emerald-300/70 [animation-delay:160ms]" />
                      <div className="signal-line h-1 w-2/3 rounded-full bg-sky-300/70 [animation-delay:320ms]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <DarkMetric label="Records" value="26" />
                    <DarkMetric label="Vitals" value="8" />
                    <DarkMetric label="Status" value="Live" />
                  </div>
                </div>
              </GlassPanel>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-white px-5 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <ScanFrame className="mb-16 p-6 lg:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Advanced access choreography</p>
                <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
                  Every record moves through a visible trust path.
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-500">
                  The interface makes the relationship obvious: patient identity, hospital authorization, doctor authorship, temporary viewer access, and audit monitoring.
                </p>
              </div>
              <div className="relative h-72 rounded-[1.5rem] border border-slate-100 bg-slate-950 p-5 text-white">
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 720 280" preserveAspectRatio="none">
                  <path className="draw-line" d="M56 210 C160 80 260 80 360 150 S570 248 666 70" fill="none" stroke="#10B981" strokeLinecap="round" strokeWidth="4" />
                  <path className="draw-line [animation-delay:240ms]" d="M48 78 C160 180 260 192 366 112 S540 54 668 188" fill="none" stroke="#818CF8" strokeLinecap="round" strokeWidth="3" />
                </svg>
                <div className="relative z-10 grid h-full grid-cols-2 gap-3">
                  <FlowPill label="Patient" value="Owns sharing" icon={<Fingerprint className="h-4 w-4" />} />
                  <FlowPill label="Doctor" value="Authors files" icon={<Stethoscope className="h-4 w-4" />} />
                  <FlowPill label="Hospital" value="Scopes access" icon={<Hospital className="h-4 w-4" />} />
                  <FlowPill label="Viewer" value="Expires safely" icon={<TimerReset className="h-4 w-4" />} />
                </div>
              </div>
            </div>
          </ScanFrame>

          <div className="grid gap-10 lg:grid-cols-[0.75fr_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Designed for high-trust care</p>
              <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Profile-led medical infrastructure with controlled clinical authoring.
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {timelineSteps.map((step, index) => (
                <SpotlightCard className="animated-border p-5" key={step.title}>
                  <div
                    className="profile-placard rounded-2xl border border-slate-100 bg-white p-5 shadow-none"
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">{step.icon}</div>
                    <p className="mt-5 text-base font-semibold text-slate-950">{step.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{step.body}</p>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

interface DarkMetricProps {
  label: string;
  value: string;
}

function DarkMetric({ label, value }: DarkMetricProps) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
