"use client";

import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
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
import { createBrowserSupabaseClient, isSupabaseConfigured } from "../lib/supabase-browser";

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
  lastVisit: string;
  recordCount: number;
}

interface DoctorRecord {
  id: string;
  patientId: string;
  fileName: string;
  category: HealthCategory;
  addedBy: string;
  hospitalName: string;
  uploadedAt: string;
  size: string;
}

interface PatientFeedback {
  id: string;
  patientId: string;
  title: string;
  doctor: string;
  hospital: string;
  score: string;
  summary: string;
}

interface UploadStep {
  label: string;
  stage: UploadStage;
}

interface ProfessionalAccountRow {
  id: string;
  full_name: string;
  role: "doctor" | "health_professional";
  email: string;
  demo_pin: string;
  license_id: string;
  organization_name: string;
  hospital_name: string | null;
  can_upload_medical_records: boolean;
}

interface PatientQueueRow {
  id: string;
  profile_id: string;
  full_name: string;
  age_years: number | null;
  emirates_id: string | null;
  passport_no: string | null;
  active_consultation_hospital: string | null;
  consultation_reason: string | null;
  last_visit: string | null;
  record_count: number | null;
}

interface ProfessionalRecordRow {
  id: string;
  patient_id: string;
  file_name: string;
  category: string;
  added_by: string | null;
  hospital_name: string | null;
  uploaded_at_label: string | null;
  size_label: string;
}

interface ProfessionalFeedbackRow {
  id: string;
  patient_id: string;
  title: string;
  doctor: string | null;
  hospital: string | null;
  score: string;
  summary: string;
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
  {
    id: "burjeel_ortho",
    name: "Dr. Faisal Rahman",
    role: "Doctor",
    email: "faisal.rahman@burjeel.example",
    pin: "440218",
    licenseId: "DHA-OR-11820",
    hospitalName: "Burjeel Hospital",
    canUploadMedicalRecords: true,
  },
  {
    id: "cleveland_physician",
    name: "Dr. Mariam Al Ketbi",
    role: "Doctor",
    email: "mariam.ketbi@cleveland.example",
    pin: "998201",
    licenseId: "DOH-IM-55210",
    hospitalName: "Cleveland Clinic Abu Dhabi",
    canUploadMedicalRecords: true,
  },
  {
    id: "mediclinic_radiology",
    name: "Dr. Omar Siddiqui",
    role: "Doctor",
    email: "omar.siddiqui@mediclinic.example",
    pin: "615804",
    licenseId: "DHA-RD-77105",
    hospitalName: "Mediclinic City Hospital",
    canUploadMedicalRecords: true,
  },
];

const patientQueue: PatientSummary[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    profileId: "BL-PROFILE-UAE-000001",
    name: "Amina Mansoor",
    age: 42,
    emiratesId: "784-1984-1234567-1",
    passportNo: "P7842190",
    activeConsultationHospital: "Burjeel Hospital",
    consultationReason: "Cardiology consultation and diagnostic follow-up",
    lastVisit: "May 18, 2026",
    recordCount: 4,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    profileId: "BL-PROFILE-UAE-000002",
    name: "Khalid Al Mazrouei",
    age: 36,
    emiratesId: "784-1990-2233445-8",
    passportNo: "P8821043",
    activeConsultationHospital: "Burjeel Hospital",
    consultationReason: "Orthopedic imaging review",
    lastVisit: "May 16, 2026",
    recordCount: 3,
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    profileId: "BL-PROFILE-UAE-000003",
    name: "Sara Al Falasi",
    age: 29,
    emiratesId: "784-1997-4455667-2",
    passportNo: "P4478109",
    activeConsultationHospital: "Burjeel Hospital",
    consultationReason: "Endocrinology lab follow-up",
    lastVisit: "May 14, 2026",
    recordCount: 5,
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    profileId: "BL-PROFILE-UAE-000004",
    name: "Mariam Al Hammadi",
    age: 51,
    emiratesId: "784-1975-7788990-4",
    passportNo: "P3309821",
    activeConsultationHospital: "Cleveland Clinic Abu Dhabi",
    consultationReason: "Internal medicine medication reconciliation",
    lastVisit: "May 12, 2026",
    recordCount: 6,
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    profileId: "BL-PROFILE-UAE-000005",
    name: "Yousef Al Nuaimi",
    age: 63,
    emiratesId: "784-1963-9900112-6",
    passportNo: "P2190047",
    activeConsultationHospital: "Mediclinic City Hospital",
    consultationReason: "Radiology second opinion for abdominal CT",
    lastVisit: "May 10, 2026",
    recordCount: 7,
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    profileId: "BL-PROFILE-UAE-000006",
    name: "Leila Haddad",
    age: 34,
    emiratesId: "784-1992-1011121-9",
    passportNo: "P5527812",
    activeConsultationHospital: "Saudi German Hospital Dubai",
    consultationReason: "Neurology review and migraine treatment plan",
    lastVisit: "May 08, 2026",
    recordCount: 4,
  },
  {
    id: "00000000-0000-0000-0000-000000000007",
    profileId: "BL-PROFILE-UAE-000007",
    name: "Hamdan Al Suwaidi",
    age: 47,
    emiratesId: "784-1979-1314151-3",
    passportNo: "P7782301",
    activeConsultationHospital: "NMC Royal Hospital",
    consultationReason: "Post-surgical orthopedic follow-up",
    lastVisit: "May 06, 2026",
    recordCount: 8,
  },
];

const initialRecords: DoctorRecord[] = [
  {
    id: "rec_001",
    patientId: "00000000-0000-0000-0000-000000000001",
    fileName: "Complete Blood Count - Emirates Hospital.pdf",
    category: "Blood Metrics",
    addedBy: "Dr. Layla Hassan",
    hospitalName: "Burjeel Hospital",
    uploadedAt: "May 18, 2026",
    size: "842 KB",
  },
  {
    id: "rec_002",
    patientId: "00000000-0000-0000-0000-000000000001",
    fileName: "Chest CT Scan - Diagnostic Series.dcm",
    category: "Radiology Scans",
    addedBy: "Dr. Layla Hassan",
    hospitalName: "Burjeel Hospital",
    uploadedAt: "May 12, 2026",
    size: "12.8 MB",
  },
  {
    id: "rec_003",
    patientId: "00000000-0000-0000-0000-000000000002",
    fileName: "Right Knee MRI - Orthopedic Review.dcm",
    category: "Radiology Scans",
    addedBy: "Dr. Faisal Rahman",
    hospitalName: "Burjeel Hospital",
    uploadedAt: "May 16, 2026",
    size: "18.4 MB",
  },
  {
    id: "rec_004",
    patientId: "00000000-0000-0000-0000-000000000003",
    fileName: "Endocrine Lab Panel.pdf",
    category: "Blood Metrics",
    addedBy: "Dr. Noura Al Hameli",
    hospitalName: "Sheikh Shakhbout Medical City",
    uploadedAt: "May 14, 2026",
    size: "704 KB",
  },
  {
    id: "rec_005",
    patientId: "00000000-0000-0000-0000-000000000004",
    fileName: "Medication Reconciliation Notes.pdf",
    category: "Clinical Notes",
    addedBy: "Dr. Mariam Al Ketbi",
    hospitalName: "Cleveland Clinic Abu Dhabi",
    uploadedAt: "May 12, 2026",
    size: "412 KB",
  },
  {
    id: "rec_006",
    patientId: "00000000-0000-0000-0000-000000000005",
    fileName: "Abdominal CT Second Opinion.dcm",
    category: "Radiology Scans",
    addedBy: "Dr. Omar Siddiqui",
    hospitalName: "Mediclinic City Hospital",
    uploadedAt: "May 10, 2026",
    size: "21.6 MB",
  },
];

const initialFeedback: PatientFeedback[] = [
  {
    id: "fb_001",
    patientId: "00000000-0000-0000-0000-000000000001",
    title: "Cardiology consultation feedback",
    doctor: "Dr. Layla Hassan",
    hospital: "Burjeel Hospital",
    score: "94%",
    summary: "LDL requires follow-up, vitals are stable, and diagnostic documents are complete enough for a second opinion.",
  },
  {
    id: "fb_002",
    patientId: "00000000-0000-0000-0000-000000000002",
    title: "Orthopedic imaging feedback",
    doctor: "Dr. Faisal Rahman",
    hospital: "Burjeel Hospital",
    score: "88%",
    summary: "MRI is ready for surgical review. Recommend physiotherapy evaluation before invasive treatment decisions.",
  },
  {
    id: "fb_003",
    patientId: "00000000-0000-0000-0000-000000000005",
    title: "Radiology second opinion feedback",
    doctor: "Dr. Omar Siddiqui",
    hospital: "Mediclinic City Hospital",
    score: "91%",
    summary: "Abdominal CT is complete. Follow-up contrast comparison is recommended if symptoms persist.",
  },
];

const uploadSteps: UploadStep[] = [
  { label: "Encrypted hospital upload", stage: "uploading" },
  { label: "Clinical document scan", stage: "scanning" },
  { label: "Doctor attribution and classification", stage: "classifying" },
  { label: "Patient profile sealed", stage: "secured" },
];

const doctorViewNotes = [
  "Search and select by Emirates ID first to avoid patient name clashes.",
  "Doctor uploads are only enabled when hospital and consultation match.",
  "Patients can view and share records, but cannot edit doctor-authored files.",
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

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function DoctorLoginPage() {
  const [accounts, setAccounts] = useState<ProfessionalAccount[]>(professionalAccounts);
  const [patients, setPatients] = useState<PatientSummary[]>(patientQueue);
  const [selectedAccountId, setSelectedAccountId] = useState(professionalAccounts[0].id);
  const [selectedPatientId, setSelectedPatientId] = useState(patientQueue[0].id);
  const [patientLookup, setPatientLookup] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [records, setRecords] = useState<DoctorRecord[]>(initialRecords);
  const [feedbackReports, setFeedbackReports] = useState<PatientFeedback[]>(initialFeedback);
  const [uploadStage, setUploadStage] = useState<UploadStage>("idle");
  const [activeFileName, setActiveFileName] = useState("");

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === selectedAccountId) ?? accounts[0] ?? professionalAccounts[0],
    [accounts, selectedAccountId],
  );

  const patientsForSelectedAccount = useMemo(() => {
    if (selectedAccount.role !== "Doctor") return patients;
    return patients.filter((patient) => patient.activeConsultationHospital === selectedAccount.hospitalName);
  }, [patients, selectedAccount.hospitalName, selectedAccount.role]);

  const filteredPatients = useMemo(() => {
    const normalizedLookup = patientLookup.replace(/\s/g, "").toLowerCase();
    if (!normalizedLookup) return patientsForSelectedAccount;

    return patientsForSelectedAccount.filter((patient) =>
      patient.emiratesId.replace(/\s/g, "").toLowerCase().includes(normalizedLookup) ||
      patient.profileId.toLowerCase().includes(normalizedLookup) ||
      patient.passportNo.toLowerCase().includes(normalizedLookup),
    );
  }, [patientLookup, patientsForSelectedAccount]);

  const selectedPatient = useMemo(
    () => patientsForSelectedAccount.find((patient) => patient.id === selectedPatientId) ?? patientsForSelectedAccount[0] ?? patientQueue[0],
    [patientsForSelectedAccount, selectedPatientId],
  );

  const selectedPatientRecords = useMemo(
    () => records.filter((record) => record.patientId === selectedPatient.id),
    [records, selectedPatient.id],
  );

  const selectedPatientFeedback = useMemo(
    () => feedbackReports.filter((report) => report.patientId === selectedPatient.id),
    [feedbackReports, selectedPatient.id],
  );

  const hasHospitalConsultAccess =
    selectedAccount.role === "Doctor" &&
    selectedAccount.canUploadMedicalRecords &&
    selectedAccount.hospitalName === selectedPatient.activeConsultationHospital;

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    async function loadBackendProfessionalData() {
      const supabase = createBrowserSupabaseClient();
      const [accountsResult, patientsResult, recordsResult, feedbackResult] = await Promise.all([
        supabase.from("better_life_professional_accounts").select("*").limit(25),
        supabase.from("better_life_professional_patient_queue").select("*").limit(50),
        supabase.from("better_life_professional_medical_records").select("*").limit(100),
        supabase.from("better_life_patient_feedback_reports").select("*").limit(50),
      ]);

      const accountRows = (accountsResult.data ?? []) as ProfessionalAccountRow[];
      const patientRows = (patientsResult.data ?? []) as PatientQueueRow[];
      const recordRows = (recordsResult.data ?? []) as ProfessionalRecordRow[];
      const feedbackRows = (feedbackResult.data ?? []) as ProfessionalFeedbackRow[];

      if (accountRows.length > 0) {
        const nextAccounts = accountRows.map((account) => ({
          id: account.id,
          name: account.full_name,
          role: account.role === "doctor" ? "Doctor" : "Health Professional",
          email: account.email,
          pin: account.demo_pin || "000000",
          licenseId: account.license_id,
          hospitalName: account.hospital_name ?? account.organization_name,
          canUploadMedicalRecords: account.can_upload_medical_records,
        })) satisfies ProfessionalAccount[];

        setAccounts(nextAccounts);
        setSelectedAccountId((current) => (nextAccounts.some((account) => account.id === current) ? current : nextAccounts[0].id));
      }

      if (patientRows.length > 0) {
        const nextPatients = patientRows.map((patient) => ({
          id: patient.id,
          profileId: patient.profile_id,
          name: patient.full_name,
          age: patient.age_years ?? 0,
          emiratesId: patient.emirates_id ?? "Pending Emirates ID",
          passportNo: patient.passport_no ?? "Pending passport",
          activeConsultationHospital: patient.active_consultation_hospital ?? "Unassigned hospital",
          consultationReason: patient.consultation_reason ?? "No active consultation reason",
          lastVisit: patient.last_visit ?? "No visit recorded",
          recordCount: patient.record_count ?? 0,
        })) satisfies PatientSummary[];

        setPatients(nextPatients);
        setSelectedPatientId((current) => (nextPatients.some((patient) => patient.id === current) ? current : nextPatients[0].id));
      }

      if (recordRows.length > 0) {
        setRecords(
          recordRows.map((record) => ({
            id: record.id,
            patientId: record.patient_id,
            fileName: record.file_name,
            category: record.category === "radiology_scans" ? "Radiology Scans" : record.category === "clinical_notes" ? "Clinical Notes" : record.category === "cardiology" ? "Cardiology" : "Blood Metrics",
            addedBy: record.added_by ?? "Assigned doctor",
            hospitalName: record.hospital_name ?? "Assigned hospital",
            uploadedAt: record.uploaded_at_label ?? "Recently",
            size: record.size_label,
          })),
        );
      }

      if (feedbackRows.length > 0) {
        setFeedbackReports(
          feedbackRows.map((report) => ({
            id: report.id,
            patientId: report.patient_id,
            title: report.title,
            doctor: report.doctor ?? "Assigned doctor",
            hospital: report.hospital ?? "Assigned hospital",
            score: report.score,
            summary: report.summary,
          })),
        );
      }
    }

    loadBackendProfessionalData();
  }, []);

  useEffect(() => {
    if (patientsForSelectedAccount.length === 0) return;
    if (!patientsForSelectedAccount.some((patient) => patient.id === selectedPatientId)) {
      setSelectedPatientId(patientsForSelectedAccount[0].id);
    }
  }, [patientsForSelectedAccount, selectedPatientId]);

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
          patientId: selectedPatient.id,
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
                {accounts.map((account) => (
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
              <div className="mb-4">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
                  <Fingerprint className="h-3.5 w-3.5" />
                  Emirates ID first lookup
                </div>
                <input
                  value={patientLookup}
                  onChange={(event) => setPatientLookup(event.target.value)}
                  placeholder="Search Emirates ID, profile ID, passport"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition-all duration-200 placeholder:font-medium placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="mb-4 space-y-2">
                {filteredPatients.map((patient) => {
                  const active = selectedPatient.id === patient.id;
                  return (
                    <button
                      key={patient.id}
                      onClick={() => setSelectedPatientId(patient.id)}
                      className={`w-full rounded-2xl border p-3 text-left transition-all duration-200 ${
                        active ? "border-indigo-200 bg-indigo-50 text-indigo-900" : "border-slate-100 bg-white/80 text-slate-700 hover:bg-slate-50"
                      }`}
                      type="button"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-xs font-semibold">{patient.emiratesId}</span>
                        <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-100">
                          {patient.recordCount} records
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-500">{patient.profileId} · {patient.lastVisit}</p>
                    </button>
                  );
                })}
                {filteredPatients.length === 0 && (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                    No patient found. Search by full or partial Emirates ID, profile ID, or passport number.
                  </div>
                )}
              </div>
              <LensCard>
                <ProfilePlacard
                  accent="indigo"
                  eyebrow="Selected patient"
                  initials={getInitials(selectedPatient.name)}
                  name={selectedPatient.emiratesId}
                  detail="Patient is selected by Emirates ID first to avoid name collisions. Name is revealed only after selection."
                  meta={selectedPatient.profileId}
                  className="bg-white/88 shadow-none backdrop-blur-md"
                />
              </LensCard>
              <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
                <MetaRow label="Name" value={selectedPatient.name} />
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

            <GlassPanel className="p-5">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                <ShieldCheck className="h-3.5 w-3.5" />
                Doctor view explained
              </div>
              <div className="space-y-2">
                {doctorViewNotes.map((note) => (
                  <div key={note} className="flex gap-2 rounded-2xl border border-slate-100 bg-white/80 p-3 text-sm leading-6 text-slate-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {note}
                  </div>
                ))}
              </div>
            </GlassPanel>
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
                <MotionStat label="Hospital" value={selectedAccount.hospitalName === "Burjeel Hospital" ? "Burjeel" : selectedAccount.hospitalName.split(" ")[0]} tone="emerald" />
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
                <p className="text-sm font-semibold text-slate-950">Previous feedback</p>
                <p className="mt-1 text-xs text-slate-500">Feedback reports update when a different Emirates ID is selected.</p>
              </div>
              <div className="divide-y divide-slate-100">
                {selectedPatientFeedback.length > 0 ? (
                  selectedPatientFeedback.map((report) => (
                    <div key={report.id} className="grid gap-3 px-5 py-5 md:grid-cols-[1fr_auto] md:items-start">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{report.title}</p>
                        <p className="mt-1 text-xs font-medium text-slate-500">{report.doctor} · {report.hospital}</p>
                        <p className="mt-3 text-sm leading-6 text-slate-600">{report.summary}</p>
                      </div>
                      <span className="w-fit rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">
                        {report.score}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-5 text-sm leading-6 text-slate-500">
                    No previous feedback reports have been authored for this patient yet.
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.05)]">
              <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-4">
                <p className="text-sm font-semibold text-slate-950">Patient medical files</p>
                <p className="mt-1 text-xs text-slate-500">Records here are visible to the patient, but authored by verified doctors.</p>
              </div>
              <div className="divide-y divide-slate-100">
                {selectedPatientRecords.length > 0 ? selectedPatientRecords.map((record) => (
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
                )) : (
                  <div className="px-5 py-5 text-sm leading-6 text-slate-500">
                    No medical records have been uploaded for this selected Emirates ID yet.
                  </div>
                )}
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
