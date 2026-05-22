# Better Life Frontend

Premium Next.js 14 frontend for a secure healthcare record repository and temporary doctor access gateway.

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run clean
npm run dev
```

Open:

- Patient dashboard: `http://localhost:3000/patient/dashboard`
- Doctor gateway: `http://localhost:3000/secure-view/demo-token`
- Professional login: `http://localhost:3000/professional`
- Patient/doctor signup and sign-in: `http://localhost:3000/auth`

The patient dashboard is view-only for medical records. The professional dashboard includes the secure document upload flow, and only a doctor attached to the patient’s active consultation hospital can add records.

Demo professional PINs:

- Doctor: `731942`
- Health Professional: `208614`

Demo OTP code for `/auth`:

- `246810`

## Production Hosting

The easiest deployment path is Vercel:

```bash
npm run build
```

Then import the repository into Vercel and deploy with the default Next.js settings.

Add the variables from `.env.example` to your hosting provider before going live. At minimum, set:

- `NEXT_PUBLIC_APP_URL`
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `AUTH_SECRET`
- your storage provider variables for medical documents
- your SMTP variables for OTP/email delivery

## Database

The PostgreSQL schema is in:

```bash
database/schema.sql
```

Run it against a PostgreSQL 15+ database first. Then run:

```bash
database/backend-data.sql
```

The second file seeds the richer backend-backed demo network: more hospitals, more doctors, more patients, patient feedback reports, appointment doctors, hospital facilities, connected apps, and Supabase views used by the frontend.

The frontend now reads these Supabase views when configured:

- `better_life_appointment_doctors`
- `better_life_hospital_facilities`
- `better_life_connected_apps`
- `better_life_patient_feedback_reports`
- `better_life_professional_accounts`
- `better_life_professional_patient_queue`

The schema intentionally avoids `CREATE EXTENSION`, `citext`, and `pgcrypto` so it can run in restricted hosted SQL editors. Generate UUIDs and password/PIN hashes in your backend when inserting live records.
