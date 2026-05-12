# ARK Wellness — Booking System Spec

## Overview
Custom booking platform for ARK Wellness (ark-final.vercel.app booking section replacement).
Single admin manages multiple locations. Clients book 60-minute sessions online.

---

## Tech Stack
- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Database/Auth:** Supabase (PostgreSQL + Row Level Security)
- **Email:** Nitebus/Zoho SMTP
- **Hosting:** Vercel (`ark-wellness-booking` repo)
- **Design:** Match ark-final.vercel.app — Cormorant Garamond + Jost, cream/gold/deep-brown palette

---

## Design Tokens
```
--cream:        #f5f0e8
--cream-dark:   #ede7dc
--deep-brown:   #2b1f14
--warm-brown:   #7b5b3a
--text-dark:    #1a1209
--text-mid:     #6b5d4f
--gold:         #c49a5a
--gold-light:   #e0be8a
--parchment:    #f0ebe0
--white:        #faf8f4
```

---

## Pages

### `/` (Home)
- Existing ARK site header/nav with "Book Now" CTA
- Hero section promoting the booking system
- Location cards linking to `/book?location=...`
- Link to `/login`

### `/book` — Public Booking Flow
**Step 1 — Location**
- Cards for: Ashton-under-Lyne, Manchester City Centre, Alderley Edge, County Kerry
- Each shows name + address

**Step 2 — Date**
- Custom calendar component
- No past dates selectable
- Days with no availability shown greyed out
- Highlights selected date

**Step 3 — Time Slot**
- 60-minute slots from location's availability window
- Slots already booked shown as disabled
- Shows: "Only X slots left" if near capacity
- AM / PM分组

**Step 4 — Confirm**
- Summary: location, date, time, session type
- Name, email, phone fields (pre-filled if logged in)
- "Confirm Booking" button
- On success: confirmation screen + email sent to client

### `/login`
- Email + password login
- "Don't have an account? Sign up" link
- Magic link option (Supabase built-in)

### `/dashboard` — Client Area
- List of upcoming and past bookings
- Cancel button (cancellable up to 24h before)
- "Book a Session" CTA

### `/admin` — Admin Calendar
- Default route: `/admin/bookings`
- Week view calendar grouped by location (4 columns)
- Each day column shows booked slots as cards
- Click slot → booking detail popover (name, email, phone, date/time)
- Cancel booking action

### `/admin/bookings` — Admin List View
- Filterable table: by location, by date range, by status
- Columns: date, time, client name, location, status
- Row actions: View, Cancel
- Search by client name/email

### `/admin/availability` — Availability Manager
- Per-location weekly schedule
- Toggle days on/off
- Set start/end hour for each location
- Save button → updates `availability` table

### `/admin/layout`
- Admin sidebar nav: Calendar | Bookings | Availability
- Admin-only route protection

---

## Database Schema

### `profiles`
| column | type | notes |
|--------|------|-------|
| id | uuid | Supabase auth id |
| email | text | from auth |
| name | text | |
| phone | text | |
| role | text | 'client' or 'admin' |
| created_at | timestamptz | |

### `locations`
| column | type | notes |
|--------|------|-------|
| id | uuid | pk |
| name | text | |
| address | text | |

### `availability`
| column | type | notes |
|--------|------|-------|
| id | uuid | pk |
| location_id | uuid | fk |
| day_of_week | int | 0=Sun, 6=Sat |
| start_hour | int | e.g. 9 |
| end_hour | int | e.g. 17 |

### `bookings`
| column | type | notes |
|--------|------|-------|
| id | uuid | pk |
| user_id | uuid | fk → profiles |
| location_id | uuid | fk → locations |
| date | date | |
| start_time | time | |
| end_time | time | start + 60min |
| status | text | 'confirmed', 'cancelled' |
| created_at | timestamptz | |

---

## API Endpoints (Next.js Route Handlers)

### `POST /api/auth/signup`
- Email + password → Supabase auth
- Creates profile row

### `POST /api/auth/login`
- Delegates to Supabase

### `GET /api/locations`
- Returns all locations

### `GET /api/availability?location_id=`
- Returns availability for location

### `GET /api/slots?location_id=&date=`
- Generates available 60min slots for that location/date
- Excludes already-booked slots
- Excludes past times if today

### `POST /api/bookings`
- Books a slot (validates not already booked)
- Sends confirmation email

### `GET /api/bookings` (client)
- Returns user's bookings

### `GET /api/admin/bookings` (admin)
- Returns all bookings (filterable)

### `PATCH /api/admin/bookings/:id`
- Cancel a booking

### `PUT /api/admin/availability`
- Replace availability for a location

---

## Email Confirmation
- On booking: sends to client email
- Subject: "Your Ark Session is Confirmed"
- Body: location, date, time, address
- From: info@brightstacklabs.co.uk (ARK Zoho SMTP)

---

## Auth & Security
- Supabase auth with email/password
- RLS on all tables — clients see only their own bookings
- Admin role checks on `/admin/*` routes
- Middleware protects all `/admin/*` and `/dashboard`

---

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SMTP_HOST=smtp.zoho.eu
SMTP_PORT=587
SMTP_USER=info@brightstacklabs.co.uk
SMTP_PASS=
ADMIN_EMAIL=hello@ark-wellness.life
```
