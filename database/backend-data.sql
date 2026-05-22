-- Better Life backend data expansion.
-- Run this after database/schema.sql in Supabase SQL Editor.
-- It moves the richer demo network out of the frontend and into database tables/views.

create table if not exists hospital_facilities (
  id uuid primary key,
  hospital_id uuid not null references hospitals(id) on delete cascade,
  label text not null,
  detail text not null,
  icon_key text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (hospital_id, label)
);

create table if not exists connected_health_apps (
  id uuid primary key,
  name text not null unique,
  status text not null,
  signal text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists appointment_doctors (
  id uuid primary key,
  professional_id uuid references professional_accounts(id) on delete set null,
  full_name text not null,
  specialty text not null,
  hospital_id uuid not null references hospitals(id) on delete cascade,
  next_slot_label text not null,
  rating numeric(2,1) not null check (rating >= 0 and rating <= 5),
  consultation_fee_aed integer not null check (consultation_fee_aed >= 0),
  accepting_appointments boolean not null default true,
  created_at timestamptz not null default now(),
  unique (full_name, hospital_id, specialty)
);

create table if not exists patient_feedback_reports (
  id uuid primary key,
  patient_id uuid not null references patients(id) on delete cascade,
  professional_id uuid references professional_accounts(id) on delete set null,
  hospital_id uuid references hospitals(id) on delete set null,
  title text not null,
  score_percent integer not null check (score_percent between 0 and 100),
  summary text not null,
  actions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

insert into hospitals (id, name, country)
values
  ('00000000-0000-0000-0000-000000000202', 'Cleveland Clinic Abu Dhabi', 'UAE'),
  ('00000000-0000-0000-0000-000000000203', 'Mediclinic City Hospital', 'UAE'),
  ('00000000-0000-0000-0000-000000000204', 'Sheikh Shakhbout Medical City', 'UAE'),
  ('00000000-0000-0000-0000-000000000205', 'NMC Royal Hospital', 'UAE'),
  ('00000000-0000-0000-0000-000000000206', 'Saudi German Hospital Dubai', 'UAE')
on conflict (id) do nothing;

insert into professional_accounts (id, full_name, role, email, pin_hash, license_id, organization_name, hospital_id, can_upload_medical_records)
values
  ('00000000-0000-0000-0000-000000000103', 'Dr. Faisal Rahman', 'doctor', 'faisal.rahman@burjeel.example', 'demo-hash-440218-replace-in-production', 'DHA-OR-11820', 'Burjeel Hospital', '00000000-0000-0000-0000-000000000201', true),
  ('00000000-0000-0000-0000-000000000104', 'Dr. Mariam Al Ketbi', 'doctor', 'mariam.ketbi@cleveland.example', 'demo-hash-998201-replace-in-production', 'DOH-IM-55210', 'Cleveland Clinic Abu Dhabi', '00000000-0000-0000-0000-000000000202', true),
  ('00000000-0000-0000-0000-000000000105', 'Dr. Omar Siddiqui', 'doctor', 'omar.siddiqui@mediclinic.example', 'demo-hash-615804-replace-in-production', 'DHA-RD-77105', 'Mediclinic City Hospital', '00000000-0000-0000-0000-000000000203', true),
  ('00000000-0000-0000-0000-000000000106', 'Dr. Noura Al Hameli', 'doctor', 'noura.hameli@ssmc.example', 'demo-hash-337109-replace-in-production', 'DOH-EN-44819', 'Sheikh Shakhbout Medical City', '00000000-0000-0000-0000-000000000204', true),
  ('00000000-0000-0000-0000-000000000107', 'Dr. Elena Petrova', 'doctor', 'elena.petrova@sgh.example', 'demo-hash-872330-replace-in-production', 'DHA-NE-55901', 'Saudi German Hospital Dubai', '00000000-0000-0000-0000-000000000206', true)
on conflict (id) do nothing;

insert into patients (id, profile_id, full_name, date_of_birth, age_years, weight_kg, country_of_origin, email)
values
  ('00000000-0000-0000-0000-000000000002', 'BL-PROFILE-UAE-000002', 'Khalid Al Mazrouei', '1990-08-03', 36, 83.20, 'UAE', 'khalid@example.com'),
  ('00000000-0000-0000-0000-000000000003', 'BL-PROFILE-UAE-000003', 'Sara Al Falasi', '1997-03-18', 29, 61.70, 'UAE', 'sara@example.com'),
  ('00000000-0000-0000-0000-000000000004', 'BL-PROFILE-UAE-000004', 'Mariam Al Hammadi', '1975-11-09', 51, 72.10, 'UAE', 'mariam@example.com'),
  ('00000000-0000-0000-0000-000000000005', 'BL-PROFILE-UAE-000005', 'Yousef Al Nuaimi', '1963-01-22', 63, 77.90, 'UAE', 'yousef@example.com'),
  ('00000000-0000-0000-0000-000000000006', 'BL-PROFILE-UAE-000006', 'Leila Haddad', '1992-07-12', 34, 58.40, 'UAE', 'leila@example.com'),
  ('00000000-0000-0000-0000-000000000007', 'BL-PROFILE-UAE-000007', 'Hamdan Al Suwaidi', '1979-04-30', 47, 86.00, 'UAE', 'hamdan@example.com')
on conflict (id) do nothing;

insert into patient_identity_documents (id, patient_id, profile_id, document_type, document_number, issuing_country, verified_at)
values
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000002', 'BL-PROFILE-UAE-000002', 'emirates_id', '784-1990-2233445-8', 'UAE', '2026-05-16 10:00:00+04'),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000002', 'BL-PROFILE-UAE-000002', 'passport', 'P8821043', 'UAE', '2026-05-16 10:00:00+04'),
  ('00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000003', 'BL-PROFILE-UAE-000003', 'emirates_id', '784-1997-4455667-2', 'UAE', '2026-05-14 10:00:00+04'),
  ('00000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000003', 'BL-PROFILE-UAE-000003', 'passport', 'P4478109', 'UAE', '2026-05-14 10:00:00+04'),
  ('00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000004', 'BL-PROFILE-UAE-000004', 'emirates_id', '784-1975-7788990-4', 'UAE', '2026-05-12 10:00:00+04'),
  ('00000000-0000-0000-0000-000000000042', '00000000-0000-0000-0000-000000000004', 'BL-PROFILE-UAE-000004', 'passport', 'P3309821', 'UAE', '2026-05-12 10:00:00+04'),
  ('00000000-0000-0000-0000-000000000051', '00000000-0000-0000-0000-000000000005', 'BL-PROFILE-UAE-000005', 'emirates_id', '784-1963-9900112-6', 'UAE', '2026-05-10 10:00:00+04'),
  ('00000000-0000-0000-0000-000000000052', '00000000-0000-0000-0000-000000000005', 'BL-PROFILE-UAE-000005', 'passport', 'P2190047', 'UAE', '2026-05-10 10:00:00+04'),
  ('00000000-0000-0000-0000-000000000061', '00000000-0000-0000-0000-000000000006', 'BL-PROFILE-UAE-000006', 'emirates_id', '784-1992-1011121-9', 'UAE', '2026-05-08 10:00:00+04'),
  ('00000000-0000-0000-0000-000000000062', '00000000-0000-0000-0000-000000000006', 'BL-PROFILE-UAE-000006', 'passport', 'P5527812', 'UAE', '2026-05-08 10:00:00+04'),
  ('00000000-0000-0000-0000-000000000071', '00000000-0000-0000-0000-000000000007', 'BL-PROFILE-UAE-000007', 'emirates_id', '784-1979-1314151-3', 'UAE', '2026-05-06 10:00:00+04'),
  ('00000000-0000-0000-0000-000000000072', '00000000-0000-0000-0000-000000000007', 'BL-PROFILE-UAE-000007', 'passport', 'P7782301', 'UAE', '2026-05-06 10:00:00+04')
on conflict (patient_id, document_type) do nothing;

insert into appointment_doctors (id, professional_id, full_name, specialty, hospital_id, next_slot_label, rating, consultation_fee_aed)
values
  ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000101', 'Dr. Layla Hassan', 'Consultant Cardiologist', '00000000-0000-0000-0000-000000000201', 'Today, 6:30 PM', 4.9, 450),
  ('00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000104', 'Dr. Mariam Al Ketbi', 'Internal Medicine', '00000000-0000-0000-0000-000000000202', 'Tomorrow, 10:15 AM', 4.8, 390),
  ('00000000-0000-0000-0000-000000000703', '00000000-0000-0000-0000-000000000105', 'Dr. Omar Siddiqui', 'Radiology Review', '00000000-0000-0000-0000-000000000203', 'Fri, 2:00 PM', 4.7, 320),
  ('00000000-0000-0000-0000-000000000704', '00000000-0000-0000-0000-000000000106', 'Dr. Noura Al Hameli', 'Endocrinology', '00000000-0000-0000-0000-000000000204', 'Sat, 11:45 AM', 4.9, 410),
  ('00000000-0000-0000-0000-000000000705', '00000000-0000-0000-0000-000000000103', 'Dr. Faisal Rahman', 'Orthopedic Surgery', '00000000-0000-0000-0000-000000000205', 'Mon, 9:00 AM', 4.6, 360),
  ('00000000-0000-0000-0000-000000000706', '00000000-0000-0000-0000-000000000107', 'Dr. Elena Petrova', 'Neurology', '00000000-0000-0000-0000-000000000206', 'Tue, 4:20 PM', 4.8, 520)
on conflict (full_name, hospital_id, specialty) do nothing;

insert into hospital_facilities (id, hospital_id, label, detail, icon_key, sort_order)
values
  ('00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000201', 'Cardiology wing', 'ECG, stress test, echo lab', 'heart', 1),
  ('00000000-0000-0000-0000-000000000802', '00000000-0000-0000-0000-000000000201', 'Radiology center', 'CT, MRI, ultrasound, DICOM exports', 'scan', 2),
  ('00000000-0000-0000-0000-000000000803', '00000000-0000-0000-0000-000000000201', 'Lab diagnostics', 'CBC, lipid panel, HbA1c, CRP', 'lab', 3),
  ('00000000-0000-0000-0000-000000000804', '00000000-0000-0000-0000-000000000201', 'Rehab support', 'Physio and wellness follow-up', 'rehab', 4),
  ('00000000-0000-0000-0000-000000000805', '00000000-0000-0000-0000-000000000201', 'Emergency care', '24/7 triage, trauma, urgent imaging', 'shield', 5),
  ('00000000-0000-0000-0000-000000000806', '00000000-0000-0000-0000-000000000201', 'Telehealth suites', 'Remote specialist consultations', 'phone', 6)
on conflict (hospital_id, label) do nothing;

insert into connected_health_apps (id, name, status, signal, sort_order)
values
  ('00000000-0000-0000-0000-000000000901', 'Apple Health', 'Ready to sync', 'Vitals and steps', 1),
  ('00000000-0000-0000-0000-000000000902', 'Google Fit', 'Available', 'Activity timeline', 2),
  ('00000000-0000-0000-0000-000000000903', 'Hospital HIS', 'Connected', 'Doctor-authored files', 3),
  ('00000000-0000-0000-0000-000000000904', 'Samsung Health', 'Available', 'Wearable vitals', 4),
  ('00000000-0000-0000-0000-000000000905', 'DHA systems', 'Planned', 'Regional health identity', 5)
on conflict (name) do nothing;

insert into patient_feedback_reports (id, patient_id, professional_id, hospital_id, title, score_percent, summary, actions)
values (
  '00000000-0000-0000-0000-000000000951',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000201',
  'Cardiology consultation feedback',
  94,
  'Patient record quality is strong. LDL requires follow-up, vitals are stable, and diagnostic documents are complete enough for a second opinion.',
  '["Repeat lipid profile in 30 days", "Book cardiology follow-up", "Share CT scan only if requested by specialist"]'::jsonb
)
on conflict (id) do nothing;

create or replace view better_life_appointment_doctors as
select
  ad.id,
  ad.full_name,
  ad.specialty,
  h.name as hospital,
  ad.next_slot_label,
  ad.rating::text as rating,
  'AED ' || ad.consultation_fee_aed::text as consultation_fee,
  ad.accepting_appointments
from appointment_doctors ad
join hospitals h on h.id = ad.hospital_id
where ad.accepting_appointments = true
order by ad.rating desc, ad.next_slot_label asc;

create or replace view better_life_hospital_facilities as
select
  hf.id,
  h.name as hospital,
  hf.label,
  hf.detail,
  hf.icon_key,
  hf.sort_order
from hospital_facilities hf
join hospitals h on h.id = hf.hospital_id
order by hf.sort_order asc, hf.label asc;

create or replace view better_life_connected_apps as
select id, name, status, signal, sort_order
from connected_health_apps
order by sort_order asc, name asc;

create or replace view better_life_patient_feedback_reports as
select
  pfr.id,
  pfr.patient_id,
  pfr.title,
  pa.full_name as doctor,
  h.name as hospital,
  pfr.score_percent::text || '%' as score,
  pfr.summary,
  pfr.actions,
  pfr.created_at
from patient_feedback_reports pfr
left join professional_accounts pa on pa.id = pfr.professional_id
left join hospitals h on h.id = pfr.hospital_id
order by pfr.created_at desc;

create or replace view better_life_professional_accounts as
select
  pa.id,
  pa.full_name,
  pa.role,
  pa.email,
  coalesce(substring(pa.pin_hash from 'demo-hash-([0-9]+)-'), '') as demo_pin,
  pa.license_id,
  pa.organization_name,
  h.name as hospital_name,
  pa.can_upload_medical_records
from professional_accounts pa
left join hospitals h on h.id = pa.hospital_id
order by pa.role asc, pa.full_name asc;

create or replace view better_life_professional_patient_queue as
select
  p.id,
  p.profile_id,
  p.full_name,
  p.age_years,
  emirates.document_number as emirates_id,
  passport.document_number as passport_no,
  h.name as active_consultation_hospital,
  pc.reason as consultation_reason,
  to_char(pc.starts_at, 'Mon DD, YYYY') as last_visit,
  count(mr.id)::integer as record_count
from patients p
left join patient_identity_documents emirates
  on emirates.patient_id = p.id and emirates.document_type = 'emirates_id'
left join patient_identity_documents passport
  on passport.patient_id = p.id and passport.document_type = 'passport'
left join patient_consultations pc
  on pc.patient_id = p.id and pc.status = 'active'
left join hospitals h
  on h.id = pc.hospital_id
left join medical_records mr
  on mr.patient_id = p.id
group by p.id, p.profile_id, p.full_name, p.age_years, emirates.document_number, passport.document_number, h.name, pc.reason, pc.starts_at
order by pc.starts_at desc nulls last, p.profile_id asc;
