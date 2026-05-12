# ARK Wellness — Booking System

Custom booking platform for The Ark Wellness. Located at `ark-final.vercel.app/booking`.

## Tech Stack
- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Database/Auth:** Supabase (PostgreSQL + RLS)
- **Email:** nodemailer via Zoho SMTP
- **Hosting:** Vercel

## Setup

### 1. Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run `supabase/schema.sql`
3. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Email
- ARK Zoho SMTP: same credentials as BSL Zoho
- `SMTP_HOST=smtp.zoho.eu`, `SMTP_PORT=587`
- `SMTP_USER=info@brightstacklabs.co.uk`

### 3. Deploy to Vercel
```bash
cd ark-wellness-booking
vercel --yes --token <token>
```

Or connect the GitHub repo (`claytonbwebb-lab/ark-wellness-booking`) to Vercel and set env vars there.

### 4. Create Admin Account
1. Go to your deployed app → `/login`
2. Sign up with `hello@ark-wellness.life`
3. In Supabase **SQL Editor**, run:
```sql
update profiles set role = 'admin' where email = 'hello@ark-wellness.life';
```

## Routes
| Route | Description |
|-------|-------------|
| `/` | Marketing homepage |
| `/book` | 3-step booking flow |
| `/login` | Sign in / sign up |
| `/dashboard` | Client booking management |
| `/admin` | Weekly calendar view |
| `/admin/bookings` | All bookings list |
| `/admin/availability` | Per-location schedule manager |

## Database
See `supabase/schema.sql` for full schema.

Tables: `profiles`, `locations`, `availability`, `bookings`
# trigger
