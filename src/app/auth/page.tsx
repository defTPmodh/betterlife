"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Building2, Fingerprint, KeyRound, LockKeyhole, Mail, ShieldCheck, Stethoscope, UserRound } from "lucide-react";
import { AnimatedWords, GlassPanel, KineticMarquee, LensCard, ProfilePlacard, SpotlightCard } from "../../components/reactbits-inspired";
import { createBrowserSupabaseClient, isSupabaseConfigured } from "../../lib/supabase-browser";

type AuthMode = "signup" | "signin";
type AccountRole = "patient" | "doctor";
type OtpState = "idle" | "sent" | "verified";

interface AuthForm {
  fullName: string;
  emiratesId: string;
  email: string;
  password: string;
  role: AccountRole;
  doctorLicenseId: string;
  hospitalName: string;
}

const initialForm: AuthForm = {
  fullName: "",
  emiratesId: "",
  email: "",
  password: "",
  role: "patient",
  doctorLicenseId: "",
  hospitalName: "",
};

const demoOtpCode = "246810";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [form, setForm] = useState<AuthForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [otpState, setOtpState] = useState<OtpState>("idle");
  const [otpCode, setOtpCode] = useState("");

  const configured = isSupabaseConfigured();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedMode = params.get("mode");
    const requestedRole = params.get("role");

    if (requestedMode === "signin" || requestedMode === "signup") {
      setMode(requestedMode);
    }

    if (requestedRole === "patient" || requestedRole === "doctor") {
      setForm((current) => ({ ...current, role: requestedRole }));
    }
  }, []);

  const helperText = useMemo(() => {
    if (mode === "signup") {
      return "Register first with Emirates ID, then sign in with your verified email and password.";
    }

    return "Use the email and password you registered after Emirates ID enrollment.";
  }, [mode]);

  function updateField<K extends keyof AuthForm>(field: K, value: AuthForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setMessage("");
    if (field === "email" || field === "emiratesId") {
      setOtpState("idle");
      setOtpCode("");
    }
  }

  function sendDemoOtp() {
    setError("");
    setMessage("");

    if (mode === "signup" && !form.emiratesId) {
      setError("Enter Emirates ID before requesting the demo OTP.");
      return;
    }

    if (!form.email) {
      setError("Enter your email before requesting the demo OTP.");
      return;
    }

    setOtpState("sent");
    setMessage(`Demo OTP sent. Use ${demoOtpCode} to continue.`);
  }

  function verifyDemoOtp() {
    setError("");
    setMessage("");

    if (otpCode !== demoOtpCode) {
      setError("Invalid demo OTP. Use 246810 for now.");
      return;
    }

    setOtpState("verified");
    setMessage("Demo OTP verified. You can continue securely.");
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      if (!configured) {
        setError("Supabase is not fully configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables, then redeploy.");
        return;
      }

      if (otpState !== "verified") {
        setError("Verify the demo OTP before continuing.");
        return;
      }

      const supabase = createBrowserSupabaseClient();

      if (mode === "signup") {
        if (!form.emiratesId || !form.email || !form.password || !form.fullName) {
          setError("Full name, Emirates ID, email, and password are required to register.");
          return;
        }

        if (form.role === "doctor" && (!form.doctorLicenseId || !form.hospitalName)) {
          setError("Doctor registration requires license ID and hospital name.");
          return;
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              full_name: form.fullName,
              emirates_id: form.emiratesId,
              role: form.role,
              doctor_license_id: form.role === "doctor" ? form.doctorLicenseId : null,
              hospital_name: form.role === "doctor" ? form.hospitalName : null,
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        if (data.user && data.session) {
          const { error: profileError } = await supabase.from("app_user_accounts").upsert({
            id: data.user.id,
            email: form.email,
            full_name: form.fullName,
            role: form.role,
            emirates_id: form.emiratesId,
            doctor_license_id: form.role === "doctor" ? form.doctorLicenseId : null,
            hospital_name: form.role === "doctor" ? form.hospitalName : null,
          });

          if (profileError) {
            setError(profileError.message);
            return;
          }
        }

        setMessage("Registration submitted. Check your email if Supabase email confirmation is enabled, then sign in.");
        setMode("signin");
        return;
      }

      if (!form.email || !form.password) {
        setError("Email and password are required to sign in.");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      setMessage("Signed in successfully. Opening your secure workspace...");
      const params = new URLSearchParams(window.location.search);
      const nextPath = params.get("next") || (form.role === "doctor" ? "/professional" : "/patient/dashboard");
      window.setTimeout(() => {
        window.location.href = nextPath;
      }, 500);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen advanced-health-bg px-6 py-8 text-slate-950 page-enter">
      <section className="mx-auto grid min-h-[calc(100vh-64px)] max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100 backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5" />
            Identity-first access
          </div>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-tight text-slate-950 sm:text-6xl">
            <AnimatedWords text="Register with Emirates ID. Sign in with verified email." />
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
            Better Life separates patient access from doctor authoring. Patients can view and share records, while verified doctors can add medical information during active consultations.
          </p>
          <GlassPanel className="mt-6 max-w-xl p-2">
            <KineticMarquee items={["Emirates ID first", "Demo OTP 246810", "Patient and doctor roles", "Supabase ready"]} />
          </GlassPanel>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <LensCard>
              <ProfilePlacard
                accent="sky"
                eyebrow="Patient"
                initials="ID"
                name="Emirates ID bound"
                detail="Each patient account starts with identity enrollment before email sign-in."
                meta="784-****"
                className="bg-white/88 backdrop-blur-md"
              />
            </LensCard>
            <LensCard>
              <ProfilePlacard
                accent="emerald"
                eyebrow="Doctor"
                initials="DR"
                name="Hospital scoped"
                detail="Doctors register with license, hospital context, and a separate access PIN."
                meta="DHA-CL"
                className="bg-white/88 backdrop-blur-md"
              />
            </LensCard>
          </div>
        </div>

        <SpotlightCard className="p-6">
          <div className="mb-6 flex rounded-2xl bg-slate-100 p-1">
            {(["signup", "signin"] as AuthMode[]).map((item) => (
              <button
                key={item}
                onClick={() => {
                  setMode(item);
                  setError("");
                  setMessage("");
                  setOtpState("idle");
                  setOtpCode("");
                }}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  mode === item ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {item === "signup" ? "Create account" : "Sign in"}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{mode === "signup" ? "Secure registration" : "Welcome back"}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{helperText}</p>
          </div>

          {!configured && (
            <div className="mb-5 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel Environment Variables, then redeploy to activate live Supabase signup and sign-in.
            </div>
          )}

          <div className="space-y-4">
            {mode === "signup" && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <RoleButton active={form.role === "patient"} label="Patient" onClick={() => updateField("role", "patient")} icon={<UserRound className="h-4 w-4" />} />
                  <RoleButton active={form.role === "doctor"} label="Doctor" onClick={() => updateField("role", "doctor")} icon={<Stethoscope className="h-4 w-4" />} />
                </div>
                <AuthInput label="Full Name" value={form.fullName} onChange={(value) => updateField("fullName", value)} icon={<UserRound className="h-4 w-4" />} placeholder="Amina Mansoor" />
                <AuthInput label="Emirates ID" value={form.emiratesId} onChange={(value) => updateField("emiratesId", value)} icon={<Fingerprint className="h-4 w-4" />} placeholder="784-1984-1234567-1" />
              </>
            )}

            <AuthInput label="Email" value={form.email} onChange={(value) => updateField("email", value)} icon={<Mail className="h-4 w-4" />} placeholder="you@example.com" type="email" />
            <AuthInput label="Password" value={form.password} onChange={(value) => updateField("password", value)} icon={<LockKeyhole className="h-4 w-4" />} placeholder="Minimum 6 characters" type="password" />

            <div className="rounded-3xl border border-indigo-100 bg-indigo-50/60 p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
                    <KeyRound className="h-4 w-4 text-indigo-600" />
                    Demo OTP verification
                  </div>
                  <p className="mt-1 text-xs leading-5 text-indigo-700">
                    For now, the one-time code is <span className="font-bold">{demoOtpCode}</span>. Later this can be sent by SMS or email.
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  otpState === "verified" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-white text-indigo-700 ring-1 ring-indigo-100"
                }`}>
                  {otpState === "verified" ? "Verified" : otpState === "sent" ? "Sent" : "Required"}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                <input
                  value={otpCode}
                  onChange={(event) => {
                    setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                    setError("");
                    if (otpState === "verified") setOtpState("sent");
                  }}
                  inputMode="numeric"
                  placeholder="Enter 6-digit OTP"
                  className="rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-sm font-semibold tracking-[0.25em] text-slate-950 outline-none transition-all duration-200 placeholder:tracking-normal placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={sendDemoOtp}
                  type="button"
                  className="rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-sm font-semibold text-indigo-700 transition-all duration-200 hover:bg-indigo-50"
                >
                  Send OTP
                </button>
                <button
                  onClick={verifyDemoOtp}
                  type="button"
                  className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-indigo-600"
                >
                  Verify
                </button>
              </div>
            </div>

            {mode === "signup" && form.role === "doctor" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <AuthInput label="Doctor License ID" value={form.doctorLicenseId} onChange={(value) => updateField("doctorLicenseId", value)} icon={<BadgeCheck className="h-4 w-4" />} placeholder="DHA-CL-20491" />
                <AuthInput label="Hospital Name" value={form.hospitalName} onChange={(value) => updateField("hospitalName", value)} icon={<Building2 className="h-4 w-4" />} placeholder="Burjeel Hospital" />
              </div>
            )}

            {error && <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</div>}
            {message && <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">{message}</div>}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-200 transition-all duration-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              {isSubmitting ? "Working..." : mode === "signup" ? "Register Identity" : "Sign In Securely"}
            </button>

            <div className="grid gap-3 sm:grid-cols-2">
              <a href="/auth?mode=signin&role=patient&next=/patient/dashboard" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Patient dashboard
              </a>
              <a href="/professional" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Doctor dashboard
              </a>
            </div>
          </div>
        </SpotlightCard>
      </section>
    </main>
  );
}

interface AuthInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: ReactNode;
  placeholder: string;
  type?: string;
}

function AuthInput({ label, value, onChange, icon, placeholder, type = "text" }: AuthInputProps) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
        <span className="text-indigo-600">{icon}</span>
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-950 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
      />
    </label>
  );
}

interface RoleButtonProps {
  active: boolean;
  label: string;
  onClick: () => void;
  icon: ReactNode;
}

function RoleButton({ active, label, onClick, icon }: RoleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
        active ? "border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
