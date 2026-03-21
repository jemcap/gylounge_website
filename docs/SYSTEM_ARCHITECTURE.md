# System Architecture

## Purpose
This document is the high-level system to follow while building GYLounge. It is derived from `docs/PROJECT_OVERVIEW.md` and translates that vision into a practical architecture and delivery model.

## Product Intent
GYLounge is an elderly-friendly location-booking and membership platform for Ghana with:
- Public no-auth flows (email-based identity)
- Membership-required booking
- Manual bank-transfer activation
- Protected in-app admin console (Supabase Auth + allowlisted admin access)

## Architecture Principles
- Simplicity first: prefer fewer moving parts over automation.
- Server-enforced rules: membership checks and privileged writes must be server-side.
- Email as member identity: no passwords for public users.
- Operational clarity: bank transfer references must be unique and traceable.
- Composable modules: routes delegate domain logic to `lib/*` helpers.

## System Boundaries
- Frontend and server runtime: Next.js App Router on Vercel.
- Data and admin identity provider: Supabase (Postgres + Auth).
- Transactional email provider: Resend.
- Payments: manual Ghana bank transfer only.

## Route Architecture (Target)
The target route map mirrors `docs/PROJECT_OVERVIEW.md`:
- `/` default landing and navigation entrypoint
- `/home` consolidated public home with Register, Booking, FAQs, and Contact Us sections
- `/register` dedicated membership sign-up form route
- `/events` legacy redirect into the `/home#booking` flow
- `/booking/confirm` booking completion state (dedicated route scaffold)
- `/membership` membership sign-up and bank instructions (dedicated route scaffold)
- `/membership/pending` waiting state until activation (dedicated route scaffold)
- `/my-bookings` email-based booking lookup (dedicated route scaffold)
- `/admin/login` admin authentication (email + password)
- `/admin/reset-password` admin password recovery completion
- `/admin` dashboard
- `/admin/members` membership activation and member ops
- `/admin/bookings` bookings operations
- `/admin/bookings/[date]` bookings detail for a selected calendar date
- `/admin/events` location operations (legacy route name)
- `/admin/slots` slot availability operations

## Layered Design

### 1. Presentation Layer (`app/`, `components/`)
Responsibilities:
- Collect user input and render state.
- Keep UI logic thin.
- Call Server Actions or Route Handlers for mutations.

Guideline:
- Client components only for interactivity.
- Server components by default.
- Typography tokens come from `next/font/google` variables (`Geist`, `Geist Mono`, `Instrument Serif`) exposed through `app/globals.css`.
- The membership registration UI uses React Hook Form with a shared Zod schema, then derives the server-required `name` and `phone` fields before calling the registration action.

### 2. Domain/Application Layer (Server Actions + API)
Responsibilities:
- Enforce booking and membership rules.
- Orchestrate Supabase reads/writes.
- Trigger email side effects through `lib/resend.ts`.

Primary server use cases:
- `createMembershipIntent`
- `createBooking`
- `lookupBookingsByEmail`
- `adminSignIn`
- `adminRequestPasswordReset`
- `adminCompletePasswordReset`
- `adminDashboardSummary`
- `updateMember` (admin only)
- `deleteMember` (admin only, guarded when bookings exist)
- `listBookingCountsByDate` (admin only)
- `updateBooking` (admin only, transactional slot-capacity handling)
- `manageLocationAvailability` (admin only, later slice)

### 3. Integration Layer (`lib/*`)
Responsibilities:
- Encapsulate service provider usage.
- Centralize env var contracts.

Current modules:
- `lib/supabase.ts`: public and service-role clients
- `lib/supabase-browser.ts`: browser Supabase auth client for recovery flow
- `lib/supabase-server.ts`: server, server-action, and proxy Supabase auth clients
- `lib/admin-auth.ts`: admin allowlist, auth validation schemas, and auth feedback helpers
- `lib/admin-session.ts`: `requireAdminUser()` server guard for protected admin pages
- `lib/membership.ts`: email normalization, bank details, reference generation
- `lib/membership-form.ts`: shared membership form schema, defaults, and normalized `FormData` builder
- `lib/resend.ts`: booking/membership/admin email helpers

Still planned for later admin slices:
- Admin-specific validation schemas for member and booking updates

### 4. Data Layer (Supabase Postgres)
Core tables:
- `members`
- `locations`
- `slots`
- `bookings`

Planned booking schema addition:
- `bookings.guest_count` to persist the guest count already used when decrementing slot capacity

Planned reference persistence addition:
- `payment_references` table to store issued references (`membership` and `booking`) separately from `members` and `bookings`

Type source of truth:
- `app/types/database.ts`

## Core Business Rules
- Only `members.status = 'active'` can complete bookings.
- Member birthdays cannot be in the future.
- Booking selection is always `location -> date -> hourly slot`.
- Standard slot hours are `08:00` through `22:00`.
- Default slot capacity is `10`.
- Slot capacity cannot go below zero.
- Admin-only operations must require authenticated admin identity.
- Admin-only operations must also require an allowlisted admin email.
- Admin login uses email/password with password reset support.
- Member status vocabulary remains `pending` and `active`.
- Public lookups (`/home` booking section, `/register` sign-up, and `/my-bookings` scaffold) should expose minimal fields.

## Security Model

### Public Area
- No login.
- Email is the user key for membership and booking retrieval.

### Admin Area
- Supabase Auth session is required.
- Admin login uses email/password.
- Password reset is handled through Supabase Auth recovery flow.
- Authorization gate by `ADMIN_EMAIL_ALLOWLIST` (MVP).
- Admin authentication applies only to `/admin/*` dashboard and management routes.
- Root `proxy.ts` uses `@supabase/ssr` to refresh session cookies before protected admin routes render.
- Protected admin pages re-check the verified user server-side with `requireAdminUser()`.
- Service role writes only on the server.

### Data Safeguards
- Validate all server action inputs.
- Avoid returning unnecessary PII.
- Add RLS and policy checks when admin/data endpoints expand.
- Keep member deletion conservative: reject deletes while related bookings exist unless a later migration introduces explicit archival/cascade rules.

## End-to-End Flows

### Membership Activation Flow
1. User opens `/home` and selects `Register`, then navigates to `/register`.
2. User submits membership form on `/register`.
3. Server creates or updates a `members` record with the submitted profile fields and `status = 'pending'`.
4. Server creates a membership reference record in `payment_references` and links it to the member.
5. App shows bank instructions and sends email.
6. Admin validates transfer and sets member status to `active`.
7. Optional welcome email sent after activation.

### Admin Authentication Flow
1. Admin opens `/admin/login`.
2. Admin submits an email/password form handled by a server action.
3. Supabase Auth creates the session and writes cookies through `@supabase/ssr`.
4. `proxy.ts` refreshes the session on `/admin/*`, and protected pages call `requireAdminUser()`.
5. Server verifies the authenticated email is present in `ADMIN_EMAIL_ALLOWLIST`.
6. Allowed admins may access `/admin/*`.
7. Non-allowlisted authenticated users are rejected and signed out.
8. If needed, the admin starts a password reset flow and completes it on `/admin/reset-password`.

### Admin Member Management Flow
1. Admin opens `/admin/members`.
2. Server loads members and groups them by `pending` and `active`.
3. Admin filters the list by name or email.
4. Admin edits member details or switches status between `pending` and `active`.
5. Server validates the payload and updates the `members` row.
6. Admin may delete a member only when no related bookings exist.

### Admin Booking Management Flow
1. Admin opens `/admin/bookings`.
2. Server loads all locations and booking counts grouped by date.
3. Admin optionally filters the calendar by location.
4. Admin selects a date and navigates to `/admin/bookings/[date]`.
5. Server loads bookings for the selected date and groups them by time slot.
6. Admin amends booking details, including moving the booking to another slot if required.
7. Server updates the booking and slot capacity transactionally.

### Booking Flow
1. User opens `/home` and expands the `Booking` accordion.
2. User chooses a location, then an available date, then an hourly slot.
3. User submits booking form.
4. Server checks member by normalized email.
5. If active, reserve slot and insert booking.
6. Send confirmation (member) and notification (organizer).
7. If not active, route user to `/home#register` (which links to `/register`).

### Legacy `/events` Route
1. User opens `/events`.
2. App redirects to `/home#booking`.

### My Bookings Flow (Dedicated Flow)
1. User submits email on `/my-bookings`.
2. Server resolves member and bookings.
3. UI returns constrained booking list.

## Concurrency and Integrity
- Protect slot booking with database-level transaction or RPC (`SELECT ... FOR UPDATE`).
- Insert booking only after capacity decrement succeeds.
- Persist booking guest count so future booking edits or cancellations can restore slot capacity correctly.
- Handle admin booking reassignments with a transactional RPC or equivalent database-level lock strategy.
- Keep booking creation idempotency strategy in scope for retries.

## Deployment and Configuration
Required environment groups:
- Supabase: URL, anon/publishable key, service role key
- Resend: API key, sender, organizer recipients
- Membership bank details: fee and bank instructions
- Admin: email allowlist

Optional fallback:
- `NEXT_PUBLIC_SITE_URL` can be used to build the admin password-reset redirect when forwarded host headers are unavailable.

## Build Sequence (Execution Order)
1. Foundation: env contracts, Supabase wiring, typed schema, base route skeleton.
2. Public home shell: `/home` navbar + sections (`Register`, `Booking`, `FAQs`, `Contact Us`) with Register linking to `/register`.
3. Membership and booking logic: wire server-backed membership flow to `/register` and booking flow to `/home`.
4. Dedicated flow enhancements: `/booking/confirm`, `/membership`, `/membership/pending`, `/my-bookings`.
5. Admin console: email/password auth, allowlist route protection, password reset, member activation, bookings management, then later location/availability management.
6. Hardening: tests, validations, observability, deployment readiness.

## Status Snapshot (Current Repository)
Implemented now:
- `app/page.tsx`
- `app/home/page.tsx`
- `app/home/actions.ts`
- `app/home/home-page-helpers.ts`
- `app/home/components/*` (route-scoped accordion/header/section modules)
- `/home` booking now loads bookable locations plus date-based hourly slots directly from Supabase, with active-membership enforcement on submit
- `/home` now uses a hamburger menu in the fixed mobile header for section navigation, while desktop keeps the left-side sticky section nav
- `/home` content wrappers use `min-w-0` + `overflow-x-hidden` guards, a widened content cap (`max-w-[96rem]`), and a content-first desktop split (`md: 2/3`, `lg: 3/4`) so sections remain contained while giving content more space than navigation
- `/home` default register promo now renders as a two-column layout on `md+` with membership card on the left and hero image on the right
- `app/events/page.tsx`
- `components/forms/MembershipForm.tsx` now uses React Hook Form + Zod and submits a normalized payload that preserves the existing `registerMemberAction` contract
- Route skeletons for:
  - `/booking/confirm`
  - `/membership`
  - `/membership/pending`
  - `/my-bookings`
  - `/admin/login`
  - `/admin`
  - `/admin/members`
  - `/admin/bookings`
  - `/admin/events`
  - `/admin/slots`
- Component boilerplates for:
  - `components/ui/*`
  - `components/forms/*`
  - `components/events/*`
- Hero utility component:
  - `components/hero/TimePill.tsx` for live Ghana time display on the landing and `/home` pages
- `/register` posts to a server action that creates/updates pending members, generates transfer references, and sends membership instruction emails
- `/home` Booking accordion posts to a server action that enforces active membership, creates location-based bookings with slot decrement, and sends booking emails
- `lib/supabase.ts`
- `lib/membership.ts`
- `lib/membership-form.ts`
- `lib/resend.ts`
- `lib/admin-auth.ts`
- `lib/admin-session.ts`
- `lib/supabase-browser.ts`
- `lib/supabase-server.ts`
- `proxy.ts` protecting `/admin/*` except the public admin auth routes
- integration tests under `__tests__/lib/*`
- `docs/ADMIN_PORTAL_IMPLEMENTATION_PLAN.md` documenting the target admin auth, dashboard, members, and bookings implementation slice
- `/admin/login` uses server-action-based email/password auth and reset-email requests
- `/admin/reset-password` completes Supabase recovery with a client-side password update form
- `/admin`, `/admin/members`, `/admin/bookings`, `/admin/bookings/[date]`, `/admin/events`, and `/admin/slots` are now authenticated admin routes with logout access

Planned next:
- Replace scaffold placeholders with:
  - Dedicated booking confirmation and my-bookings lookup wiring
  - Dashboard summary cards for members and bookings
  - Member management with search, edit, status changes, and guarded delete
  - Booking calendar and date-detail management flows
  - `bookings.guest_count` persistence to support correct capacity restoration during admin booking edits
  - Admin operations for locations and pre-seeded hourly slot availability in a later slice

## Documentation Contract
- `docs/PROJECT_OVERVIEW.md` remains the product-definition source.
- This file is the architecture execution guide.
- `docs/IMPLEMENTATION_ROADMAP.md` is the milestone plan tied to this architecture.
- `docs/LOCAL_SUPABASE_DEVELOPMENT.md` is the operational guide for running the app against a local Docker-backed Supabase stack instead of hosted environments.
