"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Clock3,
  FileHeart,
  KeyRound,
  LogOut,
  LockKeyhole,
  ShieldCheck,
  TimerReset,
} from "lucide-react";
import { AnimatedWords, GlassPanel, KineticMarquee } from "../components/reactbits-inspired";

interface PatientMetadata {
  profileId: string;
  name: string;
  age: number;
  weightKg: number;
  countryOfOrigin: string;
  emiratesId: string;
  passportNo: string;
  authorizedRecords: number;
  accessMode: "Read-only";
}

interface LabMetric {
  label: string;
  value: string;
  range: string;
  status: "Normal" | "Review" | "Elevated";
}

interface DemoShareGrant {
  token: string;
  doctorEmail: string;
  expiresIn: string;
  recordIds: string[];
  url: string;
  status: string;
}

const patientMetadata: PatientMetadata = {
  profileId: "BL-PROFILE-UAE-000001",
  name: "Amina M.",
  age: 42,
  weightKg: 68.4,
  countryOfOrigin: "UAE",
  emiratesId: "784-1984-1234567-1",
  passportNo: "P7842190",
  authorizedRecords: 4,
  accessMode: "Read-only",
};

const labMetrics: LabMetric[] = [
  { label: "Hemoglobin", value: "13.7 g/dL", range: "12.0 - 15.5", status: "Normal" },
  { label: "White Blood Cells", value: "7.4 x10^9/L", range: "4.0 - 11.0", status: "Normal" },
  { label: "LDL Cholesterol", value: "121 mg/dL", range: "< 100", status: "Review" },
  { label: "C-Reactive Protein", value: "4.8 mg/L", range: "< 3.0", status: "Elevated" },
  { label: "Creatinine", value: "0.82 mg/dL", range: "0.59 - 1.04", status: "Normal" },
  { label: "HbA1c", value: "5.6%", range: "4.0 - 5.6", status: "Normal" },
];

function formatRemainingTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

function getStatusClass(status: LabMetric["status"]) {
  if (status === "Normal") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (status === "Review") return "bg-amber-50 text-amber-700 ring-amber-100";
  return "bg-rose-50 text-rose-700 ring-rose-100";
}

export default function DoctorSecureGatewayPage() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(59 * 60 + 42);
  const [shareGrant, setShareGrant] = useState<DemoShareGrant | null>(null);

  const otpValue = useMemo(() => otp.join(""), [otp]);

  useEffect(() => {
    const token = window.location.pathname.split("/").filter(Boolean).at(-1);
    if (!token) return;

    const storedGrant = window.localStorage.getItem(`better-life-share-${token}`);
    if (!storedGrant) return;

    try {
      setShareGrant(JSON.parse(storedGrant) as DemoShareGrant);
    } catch {
      setShareGrant(null);
    }
  }, []);

  useEffect(() => {
    if (!isUnlocked) return;

    const interval = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isUnlocked]);

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp((current) => current.map((item, itemIndex) => (itemIndex === index ? digit : item)));

    if (digit) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  }

  function unlockRecords() {
    setIsUnlocked(true);
  }

  function closeSecureSession() {
    setIsUnlocked(false);
    setOtp(["", "", "", "", "", ""]);
    setRemainingSeconds(59 * 60 + 42);
  }

  if (!isUnlocked) {
    return (
      <main className="min-h-screen bg-white text-slate-900 page-enter">
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
          <div className="absolute inset-0 advanced-health-bg" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />

          <GlassPanel className="relative w-full max-w-md p-8 text-center" strong>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
              <KeyRound className="h-7 w-7" />
            </div>
            <h1 className="mt-7 text-2xl font-semibold tracking-tight text-slate-950">
              <AnimatedWords text="Better Life Secure Health Node" />
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Accessing authorized patient data records requires instant verification.
            </p>
            <div className="mt-5 rounded-[1.25rem] border border-slate-100 bg-slate-50/70 p-2">
              <KineticMarquee items={["OTP gate", "Read-only canvas", "Selection blocked", "Audit monitoring"]} />
            </div>
            {shareGrant && (
              <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-left">
                <p className="text-sm font-semibold text-emerald-800">Authorized share detected</p>
                <p className="mt-1 text-xs leading-5 text-emerald-700">
                  {shareGrant.recordIds.length} records granted to {shareGrant.doctorEmail} for {shareGrant.expiresIn}.
                </p>
              </div>
            )}

            <div className="mt-8 grid grid-cols-6 gap-2">
              {otp.map((digit, index) => (
                <input
                  aria-label={`OTP digit ${index + 1}`}
                  className="h-14 rounded-2xl border border-slate-200 bg-white text-center text-lg font-semibold text-slate-950 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  id={`otp-${index}`}
                  inputMode="numeric"
                  key={index}
                  maxLength={1}
                  onChange={(event) => handleOtpChange(index, event.target.value)}
                  value={digit}
                />
              ))}
            </div>

            <button
              onClick={unlockRecords}
              disabled={otpValue.length < 6}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              <LockKeyhole className="h-4 w-4" />
              Unlock Encrypted Medical Records
            </button>
          </GlassPanel>
        </section>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen select-none bg-white text-slate-900 page-enter"
      onContextMenu={(event) => event.preventDefault()}
      style={{
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        userSelect: "none",
      }}
    >
      <div className="flex min-h-screen flex-col lg:flex-row">
        <section className="w-full border-r border-slate-100 bg-slate-50/50 p-4 lg:w-3/4 lg:p-8">
          <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Verified clinical session
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Read-Only Clinical Workspace</h1>
              {shareGrant && (
                <p className="mt-2 text-sm text-slate-500">
                  Share token authorizes {shareGrant.recordIds.length} selected records for {shareGrant.doctorEmail}.
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Replication monitoring active
              </div>
              <button
                onClick={closeSecureSession}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                type="button"
              >
                <LogOut className="h-4 w-4" />
                End session
              </button>
            </div>
          </header>

          <div className="glass-panel-strong relative overflow-hidden rounded-3xl p-6 lg:p-8">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  className="absolute left-[-20%] w-[140%] -rotate-12 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.36em] text-slate-900/5"
                  key={index}
                  style={{ top: `${index * 14 + 2}%` }}
                >
                  BETTER LIFE SECURE EYE - FOR AUTHORIZED CLINICAL USE ONLY - REPLICATION DETECTED & LOGGED
                </div>
              ))}
            </div>

            <div className="relative z-10">
              <div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-start">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                    <FileHeart className="h-4 w-4 text-indigo-600" />
                    Emirates Integrated Lab Report
                  </div>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Comprehensive Metabolic & Hematology Panel</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Collected May 18, 2026 at 09:42 GST. Verified by Better Life secure transfer.</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-right">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Record ID</p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">BL-UAE-9442</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Risk Signal</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">Low</p>
                  <p className="mt-1 text-sm text-slate-500">No acute abnormality detected.</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Integrity Hash</p>
                  <p className="mt-2 truncate text-sm font-semibold text-slate-950">9AF3-E72B-01C8</p>
                  <p className="mt-1 text-sm text-slate-500">Source object unmodified.</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Access Policy</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">View</p>
                  <p className="mt-1 text-sm text-slate-500">Download and copy disabled.</p>
                </div>
              </div>

              <div className="mt-8 overflow-hidden rounded-2xl border border-slate-100">
                <div className="grid grid-cols-[1.2fr_0.7fr_0.8fr_0.6fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 max-sm:grid-cols-1 max-sm:gap-1">
                  <div>Marker</div>
                  <div>Result</div>
                  <div>Reference Range</div>
                  <div>Status</div>
                </div>
                <div className="divide-y divide-slate-100 bg-white">
                  {labMetrics.map((metric) => (
                    <div
                      className="grid grid-cols-[1.2fr_0.7fr_0.8fr_0.6fr] items-center px-4 py-4 text-sm max-sm:grid-cols-1 max-sm:gap-2"
                      key={metric.label}
                    >
                      <div className="font-medium text-slate-950">{metric.label}</div>
                      <div className="font-semibold text-slate-900">{metric.value}</div>
                      <div className="text-slate-500">{metric.range}</div>
                      <div>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${getStatusClass(metric.status)}`}>
                          {metric.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 grid gap-5 xl:grid-cols-[1fr_320px]">
                <div className="rounded-2xl border border-slate-100 bg-slate-950 p-5 text-white">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                      <Activity className="h-4 w-4 text-emerald-300" />
                      Diagnostic signal preview
                    </div>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-200">ECG Lead II</span>
                  </div>
                  <div className="relative h-44 overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:28px_28px]">
                    <div className="absolute inset-x-0 top-1/2 h-px bg-emerald-300/25" />
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 700 180" preserveAspectRatio="none">
                      <polyline
                        fill="none"
                        points="0,92 42,92 54,78 66,116 80,92 128,92 140,84 152,102 164,92 222,92 238,52 250,136 266,92 320,92 334,82 348,101 366,92 424,92 438,76 452,118 468,92 526,92 542,50 554,138 570,92 630,92 642,82 654,100 700,92"
                        stroke="#10B981"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                      />
                    </svg>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-950">Clinical Notes</p>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Lipid marker requires follow-up. No contraindication flags found in the authorized record set. Recommend comparison with previous panel where available.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="w-full bg-white p-4 lg:w-1/4 lg:p-6">
          <div className="sticky top-6 space-y-5">
            <div className="glass-panel rounded-3xl p-5">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-100">
                  AM
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">{patientMetadata.name}</p>
                  <p className="text-xs font-normal text-slate-500">Authorized patient profile</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                  <span className="font-medium text-slate-500">Profile ID</span>
                  <span className="font-semibold text-slate-950">{patientMetadata.profileId}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                  <span className="font-medium text-slate-500">Age</span>
                  <span className="font-semibold text-slate-950">{patientMetadata.age}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                  <span className="font-medium text-slate-500">Weight</span>
                  <span className="font-semibold text-slate-950">{patientMetadata.weightKg} kg</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                  <span className="font-medium text-slate-500">Country of Origin</span>
                  <span className="font-semibold text-slate-950">{patientMetadata.countryOfOrigin}</span>
                </div>
                <div className="border-t border-slate-100 pt-3 text-sm">
                  <span className="font-medium text-slate-500">Emirates ID</span>
                  <p className="mt-1 font-semibold text-slate-950">{patientMetadata.emiratesId}</p>
                </div>
                <div className="border-t border-slate-100 pt-3 text-sm">
                  <span className="font-medium text-slate-500">Passport No.</span>
                  <p className="mt-1 font-semibold text-slate-950">{patientMetadata.passportNo}</p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                  <span className="font-medium text-slate-500">Records</span>
                  <span className="font-semibold text-slate-950">{patientMetadata.authorizedRecords}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                  <span className="font-medium text-slate-500">Mode</span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                    {patientMetadata.accessMode}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-indigo-100 bg-indigo-600 p-5 text-white shadow-xl shadow-indigo-200">
              <div className="flex items-center gap-2 text-sm font-medium text-indigo-100">
                <Clock3 className="h-4 w-4" />
                Session expires in
              </div>
              <p className="mt-3 text-4xl font-semibold tracking-tight">{formatRemainingTime(remainingSeconds)}</p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all duration-1000"
                  style={{ width: `${Math.max(4, (remainingSeconds / (59 * 60 + 42)) * 100)}%` }}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Sovereignty controls active</p>
                  <p className="mt-2 text-sm leading-6 text-amber-800/80">
                    Text selection, right-click actions, replication, and local extraction are blocked and logged.
                  </p>
                </div>
              </div>
            </div>

            <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50">
              <TimerReset className="h-4 w-4" />
              Request Session Extension
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
