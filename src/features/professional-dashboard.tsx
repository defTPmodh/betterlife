"use client";

import type { ChangeEvent } from "react";
import { useMemo, useState } from "react";
import {
  Activity,
  BadgeCheck,
  Building2,
  Check,
  CloudUpload,
  FileHeart,
  FileText,
  Fingerprint,
  HeartPulse,
  KeyRound,
  LogOut,
  Loader2,
  LockKeyhole,
  Microscope,
  ScanLine,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { AnimatedWords, GlassPanel, KineticMarquee, LensCard, MotionStat, ProfilePlacard, SpotlightCard } from "../components/reactbits-inspired";

type ProfessionalRole = "Doctor" | "Health Professional";
type HealthCategory = "Blood Metrics" | "Radiology Scans" | "Clinical Notes" | "Cardiology";
type UploadStage = "idle" | "uploading" | "scanning" | "classifying" | "secured";

interface ProfessionalAccount {
  id: string;
  name: string;
  role: ProfessionalRole;
  email: string;
  pin: string;
  licenseId: string;
  hospitalName: string;
  canUploadMedicalRecords: boolean;
}

interface PatientSummary {
  id: string;
  profileId: string;
  name: string;
  age: number;
  emiratesId: string;
  passportNo: string;
  activeConsultationHospital: string;
  consultationReason: string;
}

interface DoctorRecord {
  id: string;
  fileName: string;
  category: HealthCategory;
  addedBy: string;
  hospitalName: string;
  uploadedAt: string;
  size: string;
}

interface UploadStep {
  label: string;
  stage: UploadStage;
}

const professionalAccounts: ProfessionalAccount[] = [
  {
    id: "burjeel_doctor",
    name: "Dr. Layla Hassan",
    role: "Doctor",
    email: "layla.hassan@burjeel.example",
    pin: "731942",
    licenseId: "DHA-CL-20491",
    hospitalName: "Burjeel Hospital",
    canUploadMedicalRecords: true,
  },
  {
    id: "care_coordinator",
    name: "Omar Al Nuaimi",
    role: "Health Professional",
    email: "omar.nuaimi@betterlife.health",
    pin: "208614",
    licenseId: "HP-REG-88420",
    hospitalName: "Better Life Care Operations",
    canUploadMedicalRecords: false,
  },
];

const selectedPatient: PatientSummary = {
  id: "00000000-0000-0000-0000-000000000001",
  profileId: "BL-PROFILE-UAE-000001",
  name: "Amina Mansoor",
  age: 42,
  emiratesId: "784-1984-1234567-1",
  passportNo: "P7842190",
  activeConsultationHospital: "Burjeel Hospital",
  consultationReason: "Cardiology consultation and diagnostic follow-up",
};

const initialRecords: DoctorRecord[] = [
  {
    id: "rec_001",
    fileName: "Complete Blood Count - Emirates Hospital.pdf",
    category: "Blood Metrics",
    addedBy: "Dr. Layla Hassan",
    hospitalName: "Burjeel Hospital",
    uploadedAt: "May 18, 2026",
    size: "842 KB",
  },
  {
    id: "rec_002",
    fileName: "Chest CT Scan - Diagnostic Series.dcm",
    category: "Radiology Scans",
    addedBy: "Dr. Layla Hassan",
    hospitalName: "Burjeel Hospital",
    uploadedAt: "May 12, 2026",
    size: "12.8 MB",
  },
];

const uploadSteps: UploadStep[] = [
  { label: "Encrypted hospital upload", stage: "uploading" },
  { label: "Clinical document scan", stage: "scanning" },
  { label: "Doctor attribution and classification", stage: "classifying" },
  { label: "Patient profile sealed", stage: "secured" },
];

function inferCategory(fileName: string): HealthCategory {
  const normalized = fileName.toLowerCase();
  if (normalized.includes("ct") || normalized.includes("scan") || normalized.includes("mri") || normalized.includes("xray")) return "Radiology Scans";
  if (normalized.includes("card") || normalized.includes("ecg") || normalized.includes("heart")) return "Cardiology";
  if (normalized.includes("blood") || normalized.includes("lab") || normalized.includes("cbc")) return "Blood Metrics";
  return "Clinical Notes";
}

function getRecordIcon(category: HealthCategory) {
  if (category === "Radiology Scans") return <ScanLine className="h-4 w-4 text-violet-600" />;
  if (category === "Blood Metrics") return <Activity className="h-4 w-4 text-sky-600" />;
  if (category === "Cardiology") return <HeartPulse className="h-4 w-4 text-rose-600" />;
  return <FileHeart className="h-4 w-4 text-amber-600" />;
}

export default function DoctorLoginPage() {
  const [selectedAccountId, setSelectedAccountId] = useState(professionalAccounts[0].id);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [records, setRecords] = useState<DoctorRecord[]>(initialRecords);
  const [uploadStage, setUploadStage] = useState<UploadStage>("idle");
  const [activeFileName, setActiveFileName] = useState("");

  const selectedAccount = useMemo(
    () => professionalAccounts.find((account) => account.id === selectedAccountId) ?? professionalAccounts[0],
    [selectedAccountId],
  );

  const hasHospitalConsultAccess =
    selectedAccount.role === "Doctor" &&
    selectedAccount.canUploadMedicalRecords &&
    selectedAccount.hospitalName === selectedPatient.activeConsultationHospital;

  function authenticate() {
    if (pin === selectedAccount.pin) {
      setIsAuthenticated(true);
      setError("");
      return;
    }

    setError("That PIN does not match the selected professional profile.");
  }

  function simulateDoctorUpload(file: File) {
    if (!hasHospitalConsultAccess) return;

    setActiveFileName(file.name);
    setUploadStage("uploading");
    window.setTimeout(() => setUploadStage("scanning"), 850);
    window.setTimeout(() => setUploadStage("classifying"), 1800);
    window.setTimeout(() => {
      setRecords((current) => [
        {
          id: crypto.randomUUID(),
          fileName: file.name,
          category: inferCategory(file.name),
          addedBy: selectedAccount.name,
          hospitalName: selectedAccount.hospitalName,
          uploadedAt: "May 21, 2026",
          size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
        },
        ...current,
      ]);
      setUploadStage("secured");
    }, 2900);
    window.setTimeout(() => {
      setUploadStage("idle");
      setActiveFileName("");
    }, 5200);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || uploadStage !== "idle") return;
    simulateDoctorUpload(file);
    event.target.value = "";
  }

  function logoutProfessional() {
    setIsAuthenticated(false);
    setPin("");
    setError("");
    setUploadStage("idle");
    setActiveFileName("");
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-white text-slate-950 page-enter">
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12 advanced-health-bg">
          <GlassPanel className="relative grid w-full max-w-5xl lg:grid-cols-[0.9fr_1.1fr]" strong>
            <div className="border-b border-slate-100 bg-slate-950 p-8 text-white lg:border-b-0 lg:border-r lg:border-slate-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                <LockKeyhole className="h-5 w-5 text-emerald-300" />
              </div>
              <h1 className="mt-8 text-3xl font-semibold tracking-tight">
                <AnimatedWords text="Hospital professional access" />
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Only verified doctors attached to the patient consultation hospital can upload medical information to the profile.
              </p>
              <div className="mt-6 rounded-[1.25rem] border border-white/10 bg-white/5 p-2">
                <KineticMarquee items={["Different PINs", "Doctor-only uploads", "Hospital-scoped access", "Patient view-only"]} />
              </div>

              <div className="mt-8 space-y-3">
                {professionalAccounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => {
                      setSelectedAccountId(account.id);
                      setPin("");
                      setError("");
                    }}
                    className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
                      selectedAccountId === account.id
                        ? "border-emerald-300 bg-white text-slate-950"
                        : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{account.name}</p>
                        <p className={`mt-1 text-xs ${selectedAccountId === account.id ? "text-slate-500" : "text-slate-400"}`}>
                          {account.role} · {account.hospitalName}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        PIN {account.pin}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8">
              <div className="mb-8">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-100">
                  <KeyRound className="h-3.5 w-3.5" />
                  Distinct professional PIN required
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Sign in as {selectedAccount.role}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{selectedAccount.email}</p>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">6-digit professional PIN</span>
                <input
                  value={pin}
                  onChange={(event) => {
                    setPin(event.target.value.replace(/\D/g, "").slice(0, 6));
                    setError("");
                  }}
                  inputMode="numeric"
                  placeholder="Enter PIN"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg font-semibold tracking-[0.3em] text-slate-950 outline-none transition-all duration-200 placeholder:tracking-normal placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </label>

              {error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}

              <button
                onClick={authenticate}
                disabled={pin.length < 6}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                <ShieldCheck className="h-4 w-4" />
                Unlock Hospital Dashboard
              </button>
            </div>
          </GlassPanel>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen advanced-health-bg text-slate-950 page-enter">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/85 backdrop-blur-md">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
              <Stethoscope className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-slate-950">better life hospital dashboard</p>
              <p className="text-xs font-medium text-slate-400">Doctor-authored records for selected patient profiles</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 ring-1 ring-emerald-100 sm:flex">
              <BadgeCheck className="h-4 w-4" />
              {selectedAccount.name}
            </div>
            <button
              onClick={logoutProfessional}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              type="button"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </nav>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="mb-8 grid gap-4 lg:grid-cols-[0.9fr_2.1fr]">
          <aside className="space-y-4">
            <SpotlightCard className="p-5">
              <LensCard>
                <ProfilePlacard
                  accent="indigo"
                  eyebrow="Selected patient"
                  initials="AM"
                  name={selectedPatient.name}
                  detail="Identity-linked profile currently assigned to the active hospital consultation."
                  meta={selectedPatient.profileId}
                  className="bg-white/88 shadow-none backdrop-blur-md"
                />
              </LensCard>
              <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
                <MetaRow label="Age" value={`${selectedPatient.age}`} />
                <MetaRow label="Emirates ID" value={selectedPatient.emiratesId} />
                <MetaRow label="Passport No." value={selectedPatient.passportNo} />
              </div>
            </SpotlightCard>

            <div className="rounded-3xl border border-indigo-100 bg-indigo-600 p-5 text-white shadow-xl shadow-indigo-200">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium text-indigo-100">
                <Building2 className="h-4 w-4" />
                Active consultation
              </div>
              <p className="text-xl font-semibold">{selectedPatient.activeConsultationHospital}</p>
              <p className="mt-2 text-sm leading-6 text-indigo-100">{selectedPatient.consultationReason}</p>
            </div>
          </aside>

          <div className="space-y-4">
            <SpotlightCard className="p-6">
              <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {hasHospitalConsultAccess ? "Doctor upload permitted" : "Upload restricted"}
                  </div>
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                    <AnimatedWords text="Medical Record Authoring" />
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                    Uploads are attributed to the signed-in doctor and hospital, then sealed into the patient profile for patient view-only access.
                  </p>
                </div>
                <MotionStat label="Hospital" value={selectedAccount.hospitalName === "Burjeel Hospital" ? "Burjeel" : "Ops"} tone="emerald" />
              </div>

              {hasHospitalConsultAccess ? (
                <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-indigo-200 bg-indigo-50/50 px-6 py-10 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-white hover:shadow-xl hover:shadow-indigo-100">
                    <input className="sr-only" disabled={uploadStage !== "idle"} onChange={handleFileChange} type="file" accept=".pdf,.png,.jpg,.jpeg,.dcm,.doc,.docx" />
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100">
                      {uploadStage !== "idle" ? <Loader2 className="h-7 w-7 animate-spin" /> : <CloudUpload className="h-7 w-7" />}
                    </div>
                    <p className="mt-4 text-sm font-semibold text-slate-950">
                      {uploadStage !== "idle" ? "Processing doctor-authored upload..." : "Upload document to selected patient"}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">PDF, image, DICOM, DOCX</p>
                  </label>

                  <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-slate-950 p-5 text-white scanline-sweep">
                    <div className="relative z-10">
                      <div className="mb-5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                          <Microscope className="h-4 w-4 text-emerald-300" />
                          Hospital intake scanner
                        </div>
                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-slate-200">{uploadStage === "idle" ? "Ready" : uploadStage}</span>
                      </div>
                      <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 shimmer-pass">
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Active file</p>
                        <p className="mt-2 truncate text-sm font-semibold text-white">{activeFileName || "No document selected"}</p>
                      </div>
                      <div className="space-y-3">
                        {uploadSteps.map((step) => {
                          const active = uploadStage === step.stage;
                          const done =
                            uploadStage === "secured" ||
                            uploadSteps.findIndex((item) => item.stage === step.stage) < uploadSteps.findIndex((item) => item.stage === uploadStage);
                          return (
                            <div key={step.stage} className={`flex items-center gap-3 rounded-2xl border p-3 ${active ? "border-emerald-300/60 bg-emerald-300/10" : done ? "border-white/10 bg-white/[0.06]" : "border-white/10"}`}>
                              <div className={`flex h-7 w-7 items-center justify-center rounded-full ${done ? "bg-emerald-400 text-slate-950" : active ? "bg-indigo-400 text-white" : "bg-white/10 text-slate-400"}`}>
                                {active ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : done ? <Check className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                              </div>
                              <p className="text-sm font-semibold text-white">{step.label}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-amber-100 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
                  This professional can view operational context, but cannot upload medical documents. Only doctors attached to {selectedPatient.activeConsultationHospital} for this consultation may add files.
                </div>
              )}
            </SpotlightCard>

            <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.05)]">
              <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-4">
                <p className="text-sm font-semibold text-slate-950">Patient medical files</p>
                <p className="mt-1 text-xs text-slate-500">Records here are visible to the patient, but authored by verified doctors.</p>
              </div>
              <div className="divide-y divide-slate-100">
                {records.map((record) => (
                  <div key={record.id} className="grid gap-4 px-5 py-5 transition-all duration-200 hover:bg-slate-50/80 md:grid-cols-[1.2fr_0.7fr_0.8fr_0.6fr] md:items-center">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white shadow-sm">{getRecordIcon(record.category)}</div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">{record.fileName}</p>
                        <p className="mt-1 text-xs text-slate-500">{record.size} · {record.category}</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-600">{record.addedBy}</p>
                    <p className="text-sm text-slate-500">{record.hospitalName}</p>
                    <p className="text-sm text-slate-500">{record.uploadedAt}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

interface MetaRowProps {
  label: string;
  value: string;
}

function MetaRow({ label, value }: MetaRowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-medium text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-950">{value}</span>
    </div>
  );
}
