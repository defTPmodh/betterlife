"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Check,
  Clipboard,
  Fingerprint,
  FileHeart,
  FileText,
  FlaskConical,
  HeartPulse,
  LogOut,
  LockKeyhole,
  Scale,
  ScanLine,
  ShieldCheck,
  Thermometer,
  UserRound,
  X,
} from "lucide-react";
import { AnimatedWords, GlassPanel, KineticMarquee, LensCard, MotionStat, SpotlightCard } from "../../../components/reactbits-inspired";
import { createBrowserSupabaseClient, isSupabaseConfigured } from "../../../lib/supabase-browser";

type HealthCategory = "Blood Metrics" | "Radiology Scans" | "Clinical Notes" | "Cardiology";
type ExpirationOption = "1 Hour" | "24 Hours" | "7 Days";
type ShareGrantStatus = "active" | "copied";

interface HealthRecord {
  id: string;
  fileName: string;
  category: HealthCategory;
  uploadDate: string;
  fileType: "pdf" | "scan" | "lab" | "note";
  source: string;
  size: string;
  integrity: "Verified" | "Pending";
  aiSummary: string;
}

interface CategoryStyle {
  label: HealthCategory;
  className: string;
}

interface PatientIdentity {
  profileId: string;
  name: string;
  age: number;
  weightKg: number;
  emiratesId: string;
  passportNo: string;
  countryOfOrigin: string;
  lastChecked: string;
}

interface VitalMetric {
  label: string;
  value: string;
  status: "Optimal" | "Stable" | "Review";
  icon: ReactNode;
}

interface ShareGrant {
  id: string;
  token: string;
  doctorEmail: string;
  expiresIn: ExpirationOption;
  recordIds: string[];
  url: string;
  status: ShareGrantStatus;
}

const patientIdentity: PatientIdentity = {
  profileId: "BL-PROFILE-UAE-000001",
  name: "Amina Mansoor",
  age: 42,
  weightKg: 68.4,
  emiratesId: "784-1984-1234567-1",
  passportNo: "P7842190",
  countryOfOrigin: "UAE",
  lastChecked: "May 18, 2026, 09:42 GST",
};

const vitalMetrics: VitalMetric[] = [
  { label: "Blood Pressure", value: "118/76 mmHg", status: "Optimal", icon: <HeartPulse className="h-4 w-4" /> },
  { label: "Heart Rate", value: "72 bpm", status: "Stable", icon: <Activity className="h-4 w-4" /> },
  { label: "Temperature", value: "36.8 C", status: "Stable", icon: <Thermometer className="h-4 w-4" /> },
  { label: "SpO2", value: "98%", status: "Optimal", icon: <ShieldCheck className="h-4 w-4" /> },
  { label: "Weight", value: "68.4 kg", status: "Stable", icon: <Scale className="h-4 w-4" /> },
  { label: "Glucose", value: "92 mg/dL", status: "Optimal", icon: <FlaskConical className="h-4 w-4" /> },
];

const healthRecords: HealthRecord[] = [
  {
    id: "rec_001",
    fileName: "Complete Blood Count - Emirates Hospital.pdf",
    category: "Blood Metrics",
    uploadDate: "May 18, 2026",
    fileType: "lab",
    source: "Emirates Hospital",
    size: "842 KB",
    integrity: "Verified",
    aiSummary: "CBC markers normalized, mild lipid follow-up retained.",
  },
  {
    id: "rec_002",
    fileName: "Chest CT Scan - Diagnostic Series.dcm",
    category: "Radiology Scans",
    uploadDate: "May 12, 2026",
    fileType: "scan",
    source: "Dubai Radiology Center",
    size: "12.8 MB",
    integrity: "Verified",
    aiSummary: "Chest CT series indexed with diagnostic image preview.",
  },
  {
    id: "rec_003",
    fileName: "Cardiac Stress Test Summary.pdf",
    category: "Cardiology",
    uploadDate: "Apr 29, 2026",
    fileType: "pdf",
    source: "Better Life Cardiology",
    size: "624 KB",
    integrity: "Verified",
    aiSummary: "Stress-test summary tagged for cardiovascular review.",
  },
  {
    id: "rec_004",
    fileName: "Primary Care Consultation Notes.pdf",
    category: "Clinical Notes",
    uploadDate: "Apr 21, 2026",
    fileType: "note",
    source: "Primary Care Clinic",
    size: "318 KB",
    integrity: "Verified",
    aiSummary: "Consultation notes parsed into timeline-ready narrative.",
  },
];

const categoryStyles: Record<HealthCategory, CategoryStyle> = {
  "Blood Metrics": {
    label: "Blood Metrics",
    className: "bg-sky-50 text-sky-700 ring-sky-100",
  },
  "Radiology Scans": {
    label: "Radiology Scans",
    className: "bg-violet-50 text-violet-700 ring-violet-100",
  },
  "Clinical Notes": {
    label: "Clinical Notes",
    className: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  Cardiology: {
    label: "Cardiology",
    className: "bg-rose-50 text-rose-700 ring-rose-100",
  },
};

const expirationOptions: ExpirationOption[] = ["1 Hour", "24 Hours", "7 Days"];

function getRecordIcon(fileType: HealthRecord["fileType"]) {
  if (fileType === "scan") return <ScanLine className="h-4 w-4 text-violet-600" />;
  if (fileType === "lab") return <FlaskConical className="h-4 w-4 text-sky-600" />;
  if (fileType === "note") return <FileHeart className="h-4 w-4 text-amber-600" />;
  return <FileText className="h-4 w-4 text-indigo-600" />;
}

export default function PatientDashboardPage() {
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doctorEmail, setDoctorEmail] = useState("");
  const [expiration, setExpiration] = useState<ExpirationOption>("24 Hours");
  const [secureLink, setSecureLink] = useState("");
  const [shareGrant, setShareGrant] = useState<ShareGrant | null>(null);
  const [copyLabel, setCopyLabel] = useState("Copy");
  const [records] = useState<HealthRecord[]>(healthRecords);
  const [authStatus, setAuthStatus] = useState<"checking" | "authenticated">("checking");

  const allSelected = selectedRecords.length === records.length;

  const selectedCountLabel = useMemo(() => {
    const suffix = selectedRecords.length === 1 ? "Record" : "Records";
    return `Share Selected ${selectedRecords.length} ${suffix}`;
  }, [selectedRecords.length]);

  useEffect(() => {
    let active = true;

    async function checkPatientSession() {
      if (!isSupabaseConfigured()) {
        window.location.href = "/auth?mode=signin&role=patient&next=/patient/dashboard";
        return;
      }

      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase.auth.getSession();

      if (!active) return;

      if (!data.session) {
        window.location.href = "/auth?mode=signin&role=patient&next=/patient/dashboard";
        return;
      }

      setAuthStatus("authenticated");
    }

    checkPatientSession();

    return () => {
      active = false;
    };
  }, []);

  function toggleRecord(recordId: string) {
    setSecureLink("");
    setShareGrant(null);
    setCopyLabel("Copy");
    setSelectedRecords((current) =>
      current.includes(recordId) ? current.filter((id) => id !== recordId) : [...current, recordId],
    );
  }

  function toggleAllRecords() {
    setSecureLink("");
    setShareGrant(null);
    setCopyLabel("Copy");
    setSelectedRecords(allSelected ? [] : records.map((record) => record.id));
  }

  function authorizeAccess() {
    if (!doctorEmail || selectedRecords.length === 0) return;

    const token = crypto.randomUUID().replaceAll("-", "").slice(0, 18);
    const origin = window.location.origin;
    const url = `${origin}/secure-view/${token}`;
    const grant: ShareGrant = {
      id: crypto.randomUUID(),
      token,
      doctorEmail,
      expiresIn: expiration,
      recordIds: selectedRecords,
      url,
      status: "active",
    };

    window.localStorage.setItem(`better-life-share-${token}`, JSON.stringify(grant));
    setShareGrant(grant);
    setSecureLink(url);
    setCopyLabel("Copy");
  }

  async function copySecureLink() {
    if (!secureLink) return;
    try {
      await navigator.clipboard.writeText(secureLink);
      setCopyLabel("Copied");
      setShareGrant((current) => (current ? { ...current, status: "copied" } : current));
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = secureLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopyLabel("Copied");
    }
  }

  async function signOutPatient() {
    if (isSupabaseConfigured()) {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
    }

    window.location.href = "/auth?mode=signin&role=patient&next=/patient/dashboard";
  }

  if (authStatus === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center advanced-health-bg px-6 text-slate-950 page-enter">
        <GlassPanel className="w-full max-w-md p-8 text-center" strong>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
            <ShieldCheck className="h-6 w-6 animate-pulse" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">Checking secure session</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">You’ll be sent to sign in before the patient vault opens.</p>
        </GlassPanel>
      </main>
    );
  }

  return (
    <main className="min-h-screen advanced-health-bg text-slate-900 page-enter">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/85 backdrop-blur-md">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-200">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-950">better life</span>
          </div>

          <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 ring-1 ring-emerald-100 sm:flex">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            End-to-End Encrypted Node
          </div>

          <div className="flex items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50">
              AM
            </button>
            <button
              onClick={signOutPatient}
              className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 sm:flex"
              type="button"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </nav>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600">
              <Activity className="h-3.5 w-3.5 text-indigo-600" />
              Global patient vault
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              <AnimatedWords text="Unified Health Repository" />
            </h1>
            <p className="mt-3 max-w-2xl text-base font-normal leading-7 text-slate-500">
              Manage your medical files globally. Select records to securely provision access.
            </p>
            <GlassPanel className="mt-5 max-w-2xl p-2">
              <KineticMarquee items={["View-only vault", "Doctor-authored files", "Temporary share links", "OTP doctor viewer"]} />
            </GlassPanel>
          </div>

          <MotionStat label="Records secured" value={`${records.length}`} tone="indigo" />
        </div>

        <SpotlightCard className="mb-8 p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                <ShieldCheck className="h-3.5 w-3.5" />
                Patient view-only repository
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Medical records are added only by authorized doctors</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                During a consultation, doctors from the active hospital care team can upload clinical documents to this profile.
                Patients can review records and provision read-only access, but cannot alter the medical source of truth.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-400">Indexed records</p>
                <p className="mt-1 text-3xl font-semibold text-slate-950">{records.length}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                <p className="text-xs font-medium text-emerald-700">Integrity coverage</p>
                <p className="mt-1 text-3xl font-semibold text-emerald-700">100%</p>
              </div>
            </div>
          </div>
        </SpotlightCard>

        <div className="mb-8 grid gap-4 lg:grid-cols-[1.1fr_1.9fr]">
          <LensCard className="rounded-3xl">
          <div className="rounded-3xl border border-slate-100 bg-white/88 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.04)] backdrop-blur-md">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">{patientIdentity.name}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{patientIdentity.countryOfOrigin} patient profile</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                Verified
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                <p className="text-xs font-medium text-slate-400">Age</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{patientIdentity.age}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                <p className="text-xs font-medium text-slate-400">Weight</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{patientIdentity.weightKg} kg</p>
              </div>
            </div>

            <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-500">Profile ID</span>
                <span className="font-semibold text-slate-950">{patientIdentity.profileId}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-sm">
                <span className="flex items-center gap-2 font-medium text-slate-500">
                  <Fingerprint className="h-4 w-4 text-indigo-500" />
                  Emirates ID
                </span>
                <span className="font-semibold text-slate-950">{patientIdentity.emiratesId}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-500">Passport No.</span>
                <span className="font-semibold text-slate-950">{patientIdentity.passportNo}</span>
              </div>
            </div>
          </div>
          </LensCard>

          <GlassPanel className="p-5" strong>
            <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold text-slate-950">Core vitals from last check</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{patientIdentity.lastChecked}</p>
              </div>
              <span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
                Clinically synchronized
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {vitalMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-slate-200/60"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-indigo-600 ring-1 ring-slate-100">
                      {metric.icon}
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                      {metric.status}
                    </span>
                  </div>
                  <p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">{metric.label}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">{metric.value}</p>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.04)]">
          <div className="grid grid-cols-[48px_minmax(260px,1.5fr)_minmax(160px,0.8fr)_minmax(140px,0.6fr)_80px] border-b border-slate-100 bg-slate-50/60 px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 max-md:hidden">
            <div>
              <input
                aria-label="Select all records"
                checked={allSelected}
                onChange={toggleAllRecords}
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>File Name</div>
            <div>Category</div>
            <div>Upload Date</div>
            <div className="text-right">Action</div>
          </div>

          <div className="divide-y divide-slate-100">
            {records.map((record) => {
              const category = categoryStyles[record.category];
              const isSelected = selectedRecords.includes(record.id);

              return (
                <div
                  key={record.id}
                  className="grid grid-cols-[48px_minmax(260px,1.5fr)_minmax(160px,0.8fr)_minmax(140px,0.6fr)_80px] items-center px-5 py-5 transition-all duration-200 hover:bg-slate-50/80 max-md:grid-cols-[36px_1fr] max-md:gap-y-3"
                >
                  <div>
                    <input
                      aria-label={`Select ${record.fileName}`}
                      checked={isSelected}
                      onChange={() => toggleRecord(record.id)}
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white shadow-sm">
                      {getRecordIcon(record.fileType)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-950">{record.fileName}</p>
                      <p className="mt-1 text-xs font-normal text-slate-400">
                        {record.source} · {record.size} · {record.aiSummary}
                      </p>
                    </div>
                  </div>

                  <div className="max-md:col-start-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${category.className}`}
                    >
                      {category.label}
                    </span>
                  </div>

                  <div className="text-sm font-normal text-slate-500 max-md:col-start-2">{record.uploadDate}</div>

                  <div className="text-right max-md:col-start-2 max-md:text-left">
                    <button className="text-sm font-medium text-indigo-600 transition-colors duration-200 hover:text-indigo-700">
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {selectedRecords.length > 0 && (
        <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center gap-3 rounded-full border border-slate-200 bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-2xl shadow-slate-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-600"
          >
            <LockKeyhole className="h-4 w-4 text-emerald-300 transition-transform duration-300 group-hover:scale-110" />
            {selectedCountLabel}
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-5 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-white/70 bg-white p-6 shadow-[0_30px_100px_rgba(15,23,42,0.25)]">
            <div className="mb-6 flex items-start justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-slate-950">Zero-Trust Provisioning</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Issue a temporary, read-only clinical session for {selectedRecords.length} selected records.
                  </p>
                </div>
              </div>
              <button
                aria-label="Close provisioning modal"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-slate-400 transition-colors duration-200 hover:bg-slate-50 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Recipient Doctor Email</span>
                <input
                  value={doctorEmail}
                  onChange={(event) => {
                    setDoctorEmail(event.target.value);
                    setSecureLink("");
                  }}
                  placeholder="doctor@clinic.example"
                  type="email"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal text-slate-950 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </label>

              <div>
                <p className="text-sm font-medium text-slate-700">Access Expiration</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {expirationOptions.map((option) => {
                    const active = expiration === option;
                    return (
                      <button
                        key={option}
                        onClick={() => {
                          setExpiration(option);
                          setSecureLink("");
                        }}
                        className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                          active
                            ? "border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={authorizeAccess}
                disabled={!doctorEmail || selectedRecords.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                <ShieldCheck className="h-4 w-4" />
                Authorize & Generate Secure Link
              </button>

              {secureLink && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    <Check className="h-4 w-4" />
                    Temporary access link generated
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-white p-2">
                    <code className="min-w-0 flex-1 truncate px-2 text-xs font-medium text-slate-700">{secureLink}</code>
                    <button
                      aria-label="Copy secure link"
                      onClick={copySecureLink}
                      className="flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 text-xs font-semibold text-white transition-colors duration-200 hover:bg-indigo-600"
                    >
                      <Clipboard className="h-4 w-4" />
                      {copyLabel}
                    </button>
                  </div>
                  <a
                    href={secureLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 flex w-full items-center justify-center rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 transition-all duration-200 hover:bg-emerald-50"
                  >
                    Open Secure Doctor View
                  </a>
                  {shareGrant && (
                    <div className="mt-3 rounded-xl bg-white/80 p-3 text-xs leading-5 text-slate-600 ring-1 ring-emerald-100">
                      Granted {shareGrant.recordIds.length} read-only records to{" "}
                      <span className="font-semibold text-slate-900">{shareGrant.doctorEmail}</span> for{" "}
                      <span className="font-semibold text-slate-900">{shareGrant.expiresIn}</span>.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
