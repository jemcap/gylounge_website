## Project Overview
GYLounge is a Ghanaian community platform helping elderly people connect through local visits and activities. Built with Next.js 16, React 19, and Tailwind CSS v4, deployed on Vercel.

For the full system design and architecture, see `docs/SYSTEM_ARCHITECTURE.md`.

## Product Principles (Elderly-Friendly)
- Keep steps minimal: email + basic details → book.
- Avoid accounts, passwords, and multi-step flows.
- Use clear language, large touch targets, and simple navigation.

## Core Features
- **Combined Public Experience**: `/` now stacks the landing page above the shared `Register`, `Booking`, `FAQs`, and `Contact Us` home sections, while `/home` remains a compatibility alias
- **Dedicated Register Route**: `/register` hosts the full membership sign-up form with server-action feedback
- **Server-Wired Public Forms**: `/register` and the shared public `Booking` section submit to server actions and return status feedback
- **Booking System**: Location-based booking with date-specific hourly time slots
- **Membership**: One-time membership fee via bank transfer (no accounts required)
- **Member Verification**: Email-based lookup - no passwords or logins
- **Email Notifications**: Confirmation emails via Resend to booker and organizer
- **Admin Console**: Protected admin pages for managing locations/availability, viewing bookings, and activating members

## Tech Stack
- **Next.js 16.1.4** - App Router (no Pages Router)
- **React 19** - Server Components by default
- **Tailwind CSS v4** - `@import "tailwindcss"` syntax (not v3's `@tailwind`)
- **TypeScript 5** - strict mode
- **Supabase** - PostgreSQL database; Auth used for admin portal only
- **Bank transfer** - Manual membership payments (GHS)
- **Resend** - Transactional emails
- **Vercel** - deployment platform

## Project Structure
```
app/
  page.tsx                # Canonical combined public page (landing + stacked home sections)
  register/
    page.tsx              # Dedicated membership sign-up route
  home/
    page.tsx              # Compatibility alias that auto-scrolls into the shared public experience
    actions.ts            # Server actions for register + booking submissions
    home-page-helpers.ts  # Shared public booking query parsing, feedback mapping, booking option lookup
    components/           # Shared public-site modules (landing sections, stacked home shell, header, section content)
  types/
    database.ts           # Supabase generated types
  admin/
    login/page.tsx        # Admin email/password login (Supabase Auth)
    page.tsx              # Admin dashboard
    members/page.tsx      # Manage members (activate from pending -> active)
    bookings/page.tsx     # View/manage bookings
    events/page.tsx       # Manage locations (legacy route name)
    slots/page.tsx        # Manage location/date/time availability
  events/
    page.tsx              # Redirects to the live booking section on /
  booking/
    confirm/page.tsx      # Booking confirmation (dedicated route scaffold)
  membership/
    page.tsx              # Membership signup + bank transfer instructions (dedicated route scaffold)
    pending/page.tsx      # “Awaiting verification” state (dedicated route scaffold)
  my-bookings/
    page.tsx              # Email lookup for booking history
components/
  ui/                     # Base UI primitives (Button, Input, Card)
  forms/                  # BookingForm, MembershipForm
  events/                 # Legacy placeholder cards/pickers for redirect route
utils/
  date.ts                 # Date formatting helpers
  validation.ts           # Form validation (email, phone)
lib/
  supabase.ts             # Supabase client
  resend.ts               # Email client
```

## Architecture Patterns

### No-Auth Design (Email-Based Membership)
Users are identified by email only (no accounts, passwords, or sessions). This is chosen to reduce friction for elderly users and keep the flow simple. Tradeoffs: lower security and potential privacy risk if someone knows another person’s email; mitigate by showing minimal booking details and focusing on current/future bookings only.
```tsx
// Check membership by email lookup
const { data: member } = await supabase
  .from('members')
  .select('id, email, status')
  .eq('email', email)
  .single();

if (member?.status === 'active') {
  // Create booking
} else {
  // Redirect to /#register, where Register links to /register
}
```

### Membership Required (Server-Enforced)
Membership is mandatory. The booking server action must check membership status and only proceed for `active` members. Non-members are redirected to the Register section on `/`, which routes users to the dedicated `/register` sign-up form. Activation happens after payment is verified (manually). This is enforced server-side to prevent bypassing in the UI.

### Admin Portal (Supabase Auth Only)
Public users never log in. Admins authenticate via Supabase Auth using email/password to access `/admin/*`.

Admin capabilities (planned):
- Activate members after verifying bank transfers (`pending` → `active`).
- Manage locations and availability slots.
- View and manage bookings.

Security requirements:
- Gate all `/admin/*` routes by server-side session checks.
- Restrict admin access by email allowlist (MVP) or an `admin_users` table (more robust).
- Perform writes server-side using `supabaseAdminClient()` after verifying the requester is an admin.
- Admin auth is only for dashboard and management routes; public membership/booking flows remain no-auth.

### App Router Conventions
- `page.tsx` = route (Server Component by default)
- `layout.tsx` = shared wrapper
- `loading.tsx` = loading UI
- `error.tsx` = error boundary
- Add `'use client'` only for forms and interactivity

### Path Aliases
```tsx
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/utils/date";
import { supabase } from "@/lib/supabase";
```

### Server Actions for Forms
```tsx
// app/actions/booking.ts
'use server'
export async function createBooking(formData: FormData) {
  const email = formData.get('email') as string;
  // 1. Verify membership by email
  // 2. Check slot availability (transactional)
  // 3. Create booking in Supabase
  // 4. Send confirmation emails via Resend
}
```

### Concurrency Controls (Strict, Simple)
Even at low volume, prevent double-booking by performing “check availability → decrement → insert booking” in a single database transaction. Implement a Supabase SQL function (RPC) that locks the slot row (`SELECT ... FOR UPDATE`) and only decrements if `available_spots > 0`.

### Bank Transfer Verification (Manual)
```tsx
// No payment webhook. Membership is activated after manual verification.
// Recommended minimal flow:
// 1. User submits membership intent (name, email, phone)
// 2. App creates or updates a `members` row with `status = 'pending'`
// 3. App stores a unique reference in a dedicated reference table linked to the member
// 4. App shows bank transfer instructions + reference and emails them to the user
// 5. Admin verifies transfer in bank statement and sets `status = 'active'`
```

## Data Flow: Booking System
1. User selects location → fetch available booking dates for that location
2. User selects a date → fetch available hourly time slots
3. User submits booking form (name, email, phone, slot)
4. Server Action: query `members` table by email
5. If active member → create booking → send confirmations
6. If not member → redirect to `/#register` → open dedicated `/register` form for bank transfer instructions
7. Admin verifies transfer in the admin console → mark member `active` → user can book

## Feasibility Notes (Roadmap Alignment)
- The approach is feasible with the existing stack and favors simplicity.
- Email-only membership is the simplest UX, but adds privacy/security tradeoffs; keep booking views minimal.
- Strict concurrency controls belong in the database to keep app code simple and reliable.

## Currency & Ghana Considerations (Bank Transfer)
- Price membership in `GHS` and provide bank details for local transfers.
- Use a unique membership reference so transfers can be reconciled reliably.
- Expect delayed activation if verification is manual (hours to days).

## Database Schema (Supabase PostgreSQL)
```sql
-- Members (created as pending, activated after manual verification)
members: id, first_name, last_name, email, birthday, gender, phone, home_address_line1, home_address_line2, home_address_digital, emergency_contact_first_name, emergency_contact_last_name, emergency_contact_relationship, emergency_contact_phone, status, created_at

-- Locations
locations: id, name, address, region, description, image_url, created_at

-- Time Slots (linked directly to location)
slots: id, location_id, date, start_time, end_time, available_spots, created_at

-- Bookings (linked to member, location, and slot)
bookings: id, member_id, location_id, slot_id, status, created_at
```

Slot policy:
- hourly slots from `08:00` to `22:00`
- default capacity of `10` per slot unless explicitly changed in admin tooling later

## Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Membership (bank transfer)
MEMBERSHIP_FEE_GHS=
BANK_TRANSFER_ACCOUNT_NAME=
BANK_TRANSFER_ACCOUNT_NUMBER=
BANK_TRANSFER_BANK_NAME=
BANK_TRANSFER_INSTRUCTIONS=

# Admin
ADMIN_EMAIL_ALLOWLIST=
NEXT_PUBLIC_SITE_URL= # optional fallback for admin reset-password redirects

# Resend
RESEND_API_KEY=
```
