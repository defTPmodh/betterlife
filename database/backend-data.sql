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
  ('00000000-0000-0000-0000-000000000107', 'Dr. Elena Petrova', 'doctor', 'elena.petrova@sgh.example', 'demo-hash-872330-replace-in-production', 'DHA-NE-55901', 'Saudi German Hospital Dubai', '00000000-0000-0000-0000-000000000206', true),
  ('00000000-0000-0000-0000-000000000108', 'Dr. Rania Saleh', 'doctor', 'rania.saleh@nmc.example', 'demo-hash-540912-replace-in-production', 'DOH-OR-66201', 'NMC Royal Hospital', '00000000-0000-0000-0000-000000000205', true)
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

insert into patient_consultations (id, patient_id, hospital_id, primary_doctor_id, reason, starts_at, status)
values
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000103', 'Orthopedic imaging review', '2026-05-16 09:30:00+04', 'active'),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000106', 'Endocrinology lab follow-up', '2026-05-14 11:15:00+04', 'active'),
  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000104', 'Internal medicine medication reconciliation', '2026-05-12 13:00:00+04', 'active'),
  ('00000000-0000-0000-0000-000000000305', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000105', 'Radiology second opinion for abdominal CT', '2026-05-10 15:45:00+04', 'active'),
  ('00000000-0000-0000-0000-000000000306', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000107', 'Neurology review and migraine treatment plan', '2026-05-08 12:20:00+04', 'active'),
  ('00000000-0000-0000-0000-000000000307', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000108', 'Post-surgical orthopedic follow-up', '2026-05-06 08:45:00+04', 'active')
on conflict (id) do nothing;

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
  ('00000000-0000-0000-0000-000000000521', '00000000-0000-0000-0000-000000000002', 'Right Knee MRI - Burjeel Orthopedic Review.dcm', 'radiology_scans', 'dicom', 'application/dicom', 'medical-records', 'patients/khalid/right-knee-mri.dcm', 'sha256-khalid-mri-demo', 18400000, 'Burjeel Hospital', 'MRI series uploaded for orthopedic review.', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000302', 'secured', '2026-05-16 09:42:00+04', '2026-05-16 09:43:00+04', '2026-05-16 09:44:00+04', '2026-05-16 09:40:00+04'),
  ('00000000-0000-0000-0000-000000000522', '00000000-0000-0000-0000-000000000002', 'Orthopedic Consultation Notes.pdf', 'clinical_notes', 'note', 'application/pdf', 'medical-records', 'patients/khalid/ortho-notes.pdf', 'sha256-khalid-notes-demo', 456320, 'Burjeel Hospital', 'Doctor notes attached to active orthopedic consultation.', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000302', 'secured', '2026-05-16 10:02:00+04', '2026-05-16 10:03:00+04', '2026-05-16 10:04:00+04', '2026-05-16 10:00:00+04'),
  ('00000000-0000-0000-0000-000000000531', '00000000-0000-0000-0000-000000000003', 'Endocrine Lab Panel - SSMC.pdf', 'blood_metrics', 'lab', 'application/pdf', 'medical-records', 'patients/sara/endocrine-panel.pdf', 'sha256-sara-labs-demo', 704128, 'Sheikh Shakhbout Medical City', 'Thyroid and glucose markers classified for endocrinology follow-up.', '00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000303', 'secured', '2026-05-14 11:32:00+04', '2026-05-14 11:33:00+04', '2026-05-14 11:34:00+04', '2026-05-14 11:30:00+04'),
  ('00000000-0000-0000-0000-000000000541', '00000000-0000-0000-0000-000000000004', 'Medication Reconciliation Notes - Cleveland.pdf', 'clinical_notes', 'note', 'application/pdf', 'medical-records', 'patients/mariam/medication-reconciliation.pdf', 'sha256-mariam-meds-demo', 412000, 'Cleveland Clinic Abu Dhabi', 'Medication reconciliation sealed to patient profile.', '00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000304', 'secured', '2026-05-12 13:22:00+04', '2026-05-12 13:23:00+04', '2026-05-12 13:24:00+04', '2026-05-12 13:20:00+04'),
  ('00000000-0000-0000-0000-000000000551', '00000000-0000-0000-0000-000000000005', 'Abdominal CT Second Opinion - Mediclinic.dcm', 'radiology_scans', 'dicom', 'application/dicom', 'medical-records', 'patients/yousef/abdominal-ct.dcm', 'sha256-yousef-ct-demo', 21600000, 'Mediclinic City Hospital', 'Radiology second opinion imaging added by Mediclinic specialist.', '00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000305', 'secured', '2026-05-10 16:02:00+04', '2026-05-10 16:03:00+04', '2026-05-10 16:04:00+04', '2026-05-10 16:00:00+04'),
  ('00000000-0000-0000-0000-000000000561', '00000000-0000-0000-0000-000000000006', 'Migraine Treatment Plan - Saudi German.pdf', 'clinical_notes', 'note', 'application/pdf', 'medical-records', 'patients/leila/migraine-plan.pdf', 'sha256-leila-plan-demo', 389440, 'Saudi German Hospital Dubai', 'Neurology plan uploaded for migraine care pathway.', '00000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000306', 'secured', '2026-05-08 12:45:00+04', '2026-05-08 12:46:00+04', '2026-05-08 12:47:00+04', '2026-05-08 12:40:00+04'),
  ('00000000-0000-0000-0000-000000000571', '00000000-0000-0000-0000-000000000007', 'Post Surgical X-Ray - NMC Royal.dcm', 'radiology_scans', 'dicom', 'application/dicom', 'medical-records', 'patients/hamdan/post-surgical-xray.dcm', 'sha256-hamdan-xray-demo', 9800000, 'NMC Royal Hospital', 'Post-surgical imaging added by NMC Royal orthopedic consultant.', '00000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000307', 'secured', '2026-05-06 09:12:00+04', '2026-05-06 09:13:00+04', '2026-05-06 09:14:00+04', '2026-05-06 09:10:00+04')
on conflict (patient_id, storage_object_key) do nothing;

insert into appointment_doctors (id, professional_id, full_name, specialty, hospital_id, next_slot_label, rating, consultation_fee_aed)
values
  ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000101', 'Dr. Layla Hassan', 'Consultant Cardiologist', '00000000-0000-0000-0000-000000000201', 'Today, 6:30 PM', 4.9, 450),
  ('00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000104', 'Dr. Mariam Al Ketbi', 'Internal Medicine', '00000000-0000-0000-0000-000000000202', 'Tomorrow, 10:15 AM', 4.8, 390),
  ('00000000-0000-0000-0000-000000000703', '00000000-0000-0000-0000-000000000105', 'Dr. Omar Siddiqui', 'Radiology Review', '00000000-0000-0000-0000-000000000203', 'Fri, 2:00 PM', 4.7, 320),
  ('00000000-0000-0000-0000-000000000704', '00000000-0000-0000-0000-000000000106', 'Dr. Noura Al Hameli', 'Endocrinology', '00000000-0000-0000-0000-000000000204', 'Sat, 11:45 AM', 4.9, 410),
  ('00000000-0000-0000-0000-000000000705', '00000000-0000-0000-0000-000000000103', 'Dr. Faisal Rahman', 'Orthopedic Surgery', '00000000-0000-0000-0000-000000000201', 'Mon, 9:00 AM', 4.6, 360),
  ('00000000-0000-0000-0000-000000000706', '00000000-0000-0000-0000-000000000107', 'Dr. Elena Petrova', 'Neurology', '00000000-0000-0000-0000-000000000206', 'Tue, 4:20 PM', 4.8, 520),
  ('00000000-0000-0000-0000-000000000707', '00000000-0000-0000-0000-000000000108', 'Dr. Rania Saleh', 'Orthopedic Recovery', '00000000-0000-0000-0000-000000000205', 'Wed, 1:10 PM', 4.7, 380)
on conflict (id) do update set
  professional_id = excluded.professional_id,
  full_name = excluded.full_name,
  specialty = excluded.specialty,
  hospital_id = excluded.hospital_id,
  next_slot_label = excluded.next_slot_label,
  rating = excluded.rating,
  consultation_fee_aed = excluded.consultation_fee_aed,
  accepting_appointments = excluded.accepting_appointments;

insert into hospital_facilities (id, hospital_id, label, detail, icon_key, sort_order)
values
  ('00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000201', 'Cardiology wing', 'ECG, stress test, echo lab', 'heart', 1),
  ('00000000-0000-0000-0000-000000000802', '00000000-0000-0000-0000-000000000201', 'Radiology center', 'CT, MRI, ultrasound, DICOM exports', 'scan', 2),
  ('00000000-0000-0000-0000-000000000803', '00000000-0000-0000-0000-000000000201', 'Lab diagnostics', 'CBC, lipid panel, HbA1c, CRP', 'lab', 3),
  ('00000000-0000-0000-0000-000000000804', '00000000-0000-0000-0000-000000000201', 'Rehab support', 'Physio and wellness follow-up', 'rehab', 4),
  ('00000000-0000-0000-0000-000000000805', '00000000-0000-0000-0000-000000000201', 'Emergency care', '24/7 triage, trauma, urgent imaging', 'shield', 5),
  ('00000000-0000-0000-0000-000000000806', '00000000-0000-0000-0000-000000000201', 'Telehealth suites', 'Remote specialist consultations', 'phone', 6),
  ('00000000-0000-0000-0000-000000000807', '00000000-0000-0000-0000-000000000202', 'Executive internal medicine', 'Medication review and preventive screening', 'shield', 7),
  ('00000000-0000-0000-0000-000000000808', '00000000-0000-0000-0000-000000000203', 'Advanced imaging', 'CT, MRI, abdominal and vascular diagnostics', 'scan', 8),
  ('00000000-0000-0000-0000-000000000809', '00000000-0000-0000-0000-000000000204', 'Endocrine diagnostics', 'Hormone panels, HbA1c, metabolic care', 'lab', 9),
  ('00000000-0000-0000-0000-000000000810', '00000000-0000-0000-0000-000000000205', 'Orthopedic recovery', 'X-ray, surgical review, rehab plans', 'rehab', 10),
  ('00000000-0000-0000-0000-000000000811', '00000000-0000-0000-0000-000000000206', 'Neurology unit', 'Migraine, EEG, and specialist treatment plans', 'heart', 11)
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
values
  (
    '00000000-0000-0000-0000-000000000951',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000201',
    'Cardiology consultation feedback',
    94,
    'Patient record quality is strong. LDL requires follow-up, vitals are stable, and diagnostic documents are complete enough for a second opinion.',
    '["Repeat lipid profile in 30 days", "Book cardiology follow-up", "Share CT scan only if requested by specialist"]'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000952',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000201',
    'Orthopedic imaging feedback',
    88,
    'MRI is ready for surgical review. Recommend physiotherapy evaluation before invasive treatment decisions.',
    '["Review MRI with orthopedic surgeon", "Start supervised physiotherapy", "Avoid high-impact training for 14 days"]'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000953',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000106',
    '00000000-0000-0000-0000-000000000204',
    'Endocrinology feedback',
    92,
    'Lab quality is complete. Thyroid markers should be trended with a repeat panel after medication adjustment.',
    '["Repeat thyroid panel in 45 days", "Track fasting glucose twice weekly", "Schedule endocrinology follow-up"]'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000954',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000202',
    'Internal medicine feedback',
    90,
    'Medication reconciliation is complete and no critical interaction flags were found in the uploaded notes.',
    '["Confirm medication timing", "Upload latest pharmacy list", "Book preventive screening slot"]'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000955',
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000105',
    '00000000-0000-0000-0000-000000000203',
    'Radiology second opinion feedback',
    91,
    'Abdominal CT is complete. Follow-up contrast comparison is recommended if symptoms persist.',
    '["Compare with prior imaging", "Discuss findings with gastroenterology", "Keep CT share link time-limited"]'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000956',
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000107',
    '00000000-0000-0000-0000-000000000206',
    'Neurology feedback',
    89,
    'Migraine treatment plan is documented and ready for patient monitoring through connected wearable trends.',
    '["Track headache frequency", "Upload medication response notes", "Follow up with neurology in 30 days"]'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000957',
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000108',
    '00000000-0000-0000-0000-000000000205',
    'Post-surgical recovery feedback',
    87,
    'Post-surgical imaging is attached. Recovery appears on track, with range-of-motion review still required.',
    '["Book orthopedic recovery review", "Upload physiotherapy report", "Repeat X-ray only if pain increases"]'::jsonb
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

create or replace view better_life_professional_medical_records as
select
  mr.id,
  mr.patient_id,
  mr.file_name,
  mr.category::text as category,
  pa.full_name as added_by,
  coalesce(h.name, mr.source_name) as hospital_name,
  to_char(mr.uploaded_at, 'Mon DD, YYYY') as uploaded_at_label,
  case
    when mr.byte_size >= 1048576 then round((mr.byte_size::numeric / 1048576), 1)::text || ' MB'
    else round((mr.byte_size::numeric / 1024), 0)::text || ' KB'
  end as size_label,
  mr.uploaded_at
from medical_records mr
left join professional_accounts pa
  on pa.id = mr.uploaded_by_professional_id
left join patient_consultations pc
  on pc.id = mr.consultation_id
left join hospitals h
  on h.id = pc.hospital_id
order by mr.uploaded_at desc;

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
