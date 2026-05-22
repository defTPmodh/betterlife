-- Better Life database schema for PostgreSQL 15+
-- Run once per environment before connecting the Next.js app to live data.
-- This version avoids CREATE EXTENSION so it can run in restricted hosted SQL editors.

create type record_category as enum (
  'blood_metrics',
  'radiology_scans',
  'clinical_notes',
  'cardiology',
  'other'
);

create type record_file_type as enum (
  'pdf',
  'scan',
  'lab',
  'note',
  'image',
  'dicom'
);

create type medical_record_processing_status as enum (
  'uploaded',
  'scanning',
  'classified',
  'secured',
  'failed'
);

create type access_grant_status as enum (
  'active',
  'expired',
  'revoked'
);

create type patient_identity_document_type as enum (
  'emirates_id',
  'passport'
);

create table patients (
  id uuid primary key,
  profile_id text not null unique,
  full_name text not null,
  date_of_birth date,
  age_years integer check (age_years is null or age_years >= 0),
  weight_kg numeric(5,2) check (weight_kg is null or weight_kg > 0),
  country_of_origin text not null,
  email text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, profile_id)
);

create table patient_identity_documents (
  id uuid primary key,
  patient_id uuid not null,
  profile_id text not null,
  document_type patient_identity_document_type not null,
  document_number text not null,
  issuing_country text not null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (patient_id, document_type),
  unique (document_type, document_number),
  foreign key (patient_id, profile_id) references patients(id, profile_id) on update cascade on delete cascade
);

create table app_user_accounts (
  id uuid primary key,
  email text not null unique,
  full_name text not null,
  role text not null check (role in ('patient', 'doctor')),
  emirates_id text not null unique,
  doctor_license_id text,
  hospital_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint app_user_accounts_doctor_fields check (
    role = 'patient'
    or (doctor_license_id is not null and hospital_name is not null)
  )
);

create table demo_otp_challenges (
  id uuid primary key,
  email text not null,
  emirates_id text,
  purpose text not null check (purpose in ('signup', 'signin')),
  otp_code text not null,
  verified_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table app_user_accounts enable row level security;

create policy app_user_accounts_select_own
on app_user_accounts
for select
using (auth.uid() = id);

create policy app_user_accounts_insert_own
on app_user_accounts
for insert
with check (auth.uid() = id);

create policy app_user_accounts_update_own
on app_user_accounts
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create table doctors (
  id uuid primary key,
  full_name text,
  email text not null unique,
  organization_name text,
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table hospitals (
  id uuid primary key,
  name text not null unique,
  country text not null,
  created_at timestamptz not null default now()
);

create table professional_accounts (
  id uuid primary key,
  full_name text not null,
  role text not null check (role in ('doctor', 'health_professional')),
  email text not null unique,
  pin_hash text not null,
  license_id text not null unique,
  organization_name text not null,
  hospital_id uuid references hospitals(id) on delete set null,
  can_edit_patient_profile boolean not null default true,
  can_upload_medical_records boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table patient_consultations (
  id uuid primary key,
  patient_id uuid not null references patients(id) on delete cascade,
  hospital_id uuid not null references hospitals(id) on delete cascade,
  primary_doctor_id uuid references professional_accounts(id) on delete set null,
  reason text not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table patient_vital_snapshots (
  id uuid primary key,
  patient_id uuid not null references patients(id) on delete cascade,
  checked_at timestamptz not null,
  blood_pressure text,
  heart_rate_bpm integer check (heart_rate_bpm is null or heart_rate_bpm > 0),
  temperature_c numeric(4,1),
  spo2_percent integer check (spo2_percent is null or spo2_percent between 0 and 100),
  glucose_mg_dl numeric(6,2),
  weight_kg numeric(5,2) check (weight_kg is null or weight_kg > 0),
  recorded_by_professional_id uuid references professional_accounts(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (patient_id, checked_at)
);

create table medical_records (
  id uuid primary key,
  patient_id uuid not null references patients(id) on delete cascade,
  file_name text not null,
  category record_category not null default 'other',
  file_type record_file_type not null,
  mime_type text not null,
  storage_bucket text not null,
  storage_object_key text not null,
  checksum_sha256 text not null,
  byte_size bigint not null check (byte_size > 0),
  source_name text,
  ai_summary text,
  uploaded_by_professional_id uuid references professional_accounts(id) on delete set null,
  consultation_id uuid references patient_consultations(id) on delete set null,
  processing_status medical_record_processing_status not null default 'secured',
  scanned_at timestamptz,
  classified_at timestamptz,
  secured_at timestamptz,
  uploaded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (patient_id, storage_object_key)
);

create table medical_record_upload_events (
  id uuid primary key,
  medical_record_id uuid not null references medical_records(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  event_type medical_record_processing_status not null,
  event_message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table access_grants (
  id uuid primary key,
  patient_id uuid not null references patients(id) on delete cascade,
  doctor_id uuid references doctors(id) on delete set null,
  recipient_email text not null,
  token_hash text not null unique,
  token_preview text,
  expires_in_label text,
  status access_grant_status not null default 'active',
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  last_verified_at timestamptz,
  constraint access_grants_expiry_in_future check (expires_at > created_at)
);

create table access_grant_records (
  access_grant_id uuid not null references access_grants(id) on delete cascade,
  medical_record_id uuid not null references medical_records(id) on delete cascade,
  primary key (access_grant_id, medical_record_id)
);

create table doctor_verifications (
  id uuid primary key,
  access_grant_id uuid not null references access_grants(id) on delete cascade,
  otp_hash text not null,
  expires_at timestamptz not null,
  verified_at timestamptz,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  created_at timestamptz not null default now()
);

create table access_audit_events (
  id uuid primary key,
  access_grant_id uuid not null references access_grants(id) on delete cascade,
  medical_record_id uuid references medical_records(id) on delete set null,
  event_type text not null,
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index medical_records_patient_id_idx on medical_records(patient_id);
create index medical_records_processing_status_idx on medical_records(processing_status);
create index medical_records_uploaded_by_professional_idx on medical_records(uploaded_by_professional_id);
create index patient_consultations_patient_status_idx on patient_consultations(patient_id, status);
create index medical_record_upload_events_record_created_idx on medical_record_upload_events(medical_record_id, created_at desc);
create index patient_identity_documents_profile_id_idx on patient_identity_documents(profile_id);
create index medical_records_uploaded_at_idx on medical_records(uploaded_at desc);
create index access_grants_patient_id_idx on access_grants(patient_id);
create index access_grants_recipient_email_idx on access_grants(recipient_email);
create index access_grants_expires_at_idx on access_grants(expires_at);
create index access_audit_events_grant_created_idx on access_audit_events(access_grant_id, created_at desc);
create index patient_vital_snapshots_patient_checked_idx on patient_vital_snapshots(patient_id, checked_at desc);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger patients_set_updated_at
before update on patients
for each row execute function set_updated_at();

create trigger doctors_set_updated_at
before update on doctors
for each row execute function set_updated_at();

create trigger professional_accounts_set_updated_at
before update on professional_accounts
for each row execute function set_updated_at();

create trigger app_user_accounts_set_updated_at
before update on app_user_accounts
for each row execute function set_updated_at();

-- Optional seed data for local UI wiring.
insert into patients (id, profile_id, full_name, date_of_birth, age_years, weight_kg, country_of_origin, email)
values (
  '00000000-0000-0000-0000-000000000001',
  'BL-PROFILE-UAE-000001',
  'Amina M.',
  '1984-02-14',
  42,
  68.40,
  'UAE',
  'amina@example.com'
)
on conflict (id) do nothing;

insert into patient_identity_documents (
  id,
  patient_id,
  profile_id,
  document_type,
  document_number,
  issuing_country,
  verified_at
)
values
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'BL-PROFILE-UAE-000001', 'emirates_id', '784-1984-1234567-1', 'UAE', '2026-05-18 09:42:00+04'),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'BL-PROFILE-UAE-000001', 'passport', 'P7842190', 'UAE', '2026-05-18 09:42:00+04')
on conflict (patient_id, document_type) do nothing;

insert into hospitals (id, name, country)
values
  ('00000000-0000-0000-0000-000000000201', 'Burjeel Hospital', 'UAE')
on conflict (id) do nothing;

insert into professional_accounts (id, full_name, role, email, pin_hash, license_id, organization_name, hospital_id, can_upload_medical_records)
values
  ('00000000-0000-0000-0000-000000000101', 'Dr. Layla Hassan', 'doctor', 'layla.hassan@burjeel.example', 'demo-hash-731942-replace-in-production', 'DHA-CL-20491', 'Burjeel Hospital', '00000000-0000-0000-0000-000000000201', true),
  ('00000000-0000-0000-0000-000000000102', 'Omar Al Nuaimi', 'health_professional', 'omar.nuaimi@betterlife.health', 'demo-hash-208614-replace-in-production', 'HP-REG-88420', 'Better Life Care Operations', null, false)
on conflict (id) do nothing;

insert into patient_consultations (id, patient_id, hospital_id, primary_doctor_id, reason, starts_at, status)
values (
  '00000000-0000-0000-0000-000000000301',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000101',
  'Cardiology consultation and diagnostic follow-up',
  '2026-05-21 10:00:00+04',
  'active'
)
on conflict (id) do nothing;

insert into patient_vital_snapshots (
  id,
  patient_id,
  checked_at,
  blood_pressure,
  heart_rate_bpm,
  temperature_c,
  spo2_percent,
  glucose_mg_dl,
  weight_kg,
  recorded_by_professional_id
)
values (
  '00000000-0000-0000-0000-000000000401',
  '00000000-0000-0000-0000-000000000001',
  '2026-05-18 09:42:00+04',
  '118/76 mmHg',
  72,
  36.8,
  98,
  92.00,
  68.40,
  '00000000-0000-0000-0000-000000000101'
)
on conflict (patient_id, checked_at) do nothing;

insert into medical_records (
  id,
  patient_id,
  file_name,
  category,
  file_type,
  mime_type,
  storage_bucket,
  storage_object_key,
  checksum_sha256,
  byte_size,
  source_name,
  ai_summary,
  uploaded_by_professional_id,
  consultation_id,
  processing_status,
  scanned_at,
  classified_at,
  secured_at,
  uploaded_at
)
values
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000001', 'Complete Blood Count - Burjeel Hospital.pdf', 'blood_metrics', 'lab', 'application/pdf', 'medical-records', 'patients/amina/cbc.pdf', 'sha256-cbc-demo-replace-with-real-checksum', 842144, 'Burjeel Hospital', 'CBC markers normalized, mild lipid follow-up retained.', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000301', 'secured', '2026-05-18 09:43:00+04', '2026-05-18 09:44:00+04', '2026-05-18 09:45:00+04', '2026-05-18 09:42:00+04'),
  ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000001', 'Chest CT Scan - Burjeel Diagnostic Series.dcm', 'radiology_scans', 'dicom', 'application/dicom', 'medical-records', 'patients/amina/chest-ct.dcm', 'sha256-ct-demo-replace-with-real-checksum', 12842144, 'Burjeel Hospital', 'Chest CT series indexed with diagnostic image preview.', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000301', 'secured', '2026-05-12 11:11:00+04', '2026-05-12 11:12:00+04', '2026-05-12 11:13:00+04', '2026-05-12 11:10:00+04'),
  ('00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000001', 'Cardiac Stress Test Summary.pdf', 'cardiology', 'pdf', 'application/pdf', 'medical-records', 'patients/amina/stress-test.pdf', 'sha256-stress-demo-replace-with-real-checksum', 624512, 'Burjeel Hospital', 'Stress-test summary tagged for cardiovascular review.', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000301', 'secured', '2026-04-29 14:21:00+04', '2026-04-29 14:22:00+04', '2026-04-29 14:23:00+04', '2026-04-29 14:20:00+04'),
  ('00000000-0000-0000-0000-000000000504', '00000000-0000-0000-0000-000000000001', 'Primary Care Consultation Notes.pdf', 'clinical_notes', 'note', 'application/pdf', 'medical-records', 'patients/amina/consultation-notes.pdf', 'sha256-notes-demo-replace-with-real-checksum', 318976, 'Burjeel Hospital', 'Consultation notes parsed into timeline-ready narrative.', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000301', 'secured', '2026-04-21 16:06:00+04', '2026-04-21 16:07:00+04', '2026-04-21 16:08:00+04', '2026-04-21 16:05:00+04')
on conflict (patient_id, storage_object_key) do nothing;
