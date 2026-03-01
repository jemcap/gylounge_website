# System Architecture

## Purpose
This document is the high-level system to follow while building GYLounge. It is derived from `docs/PROJECT_OVERVIEW.md` and translates that vision into a practical architecture and delivery model.

## Product Intent
GYLounge is an elderly-friendly event and membership platform for Ghana with:
- Public no-auth flows (email-based identity)
- Membership-required booking
- Manual bank-transfer activation
- Protected in-app admin console (Supabase Auth)

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
- `/home` consolidated public home with accordion sections for Register, Booking, FAQs, and Contact Us
- `/events` event listing and location filtering
- `/events/[eventId]` event detail and slot selection
- `/booking/confirm` booking completion state (dedicated route scaffold)
- `/membership` membership sign-up and bank instructions (dedicated route scaffold)
- `/membership/pending` waiting state until activation (dedicated route scaffold)
- `/my-bookings` email-based booking lookup (dedicated route scaffold)
- `/admin/login` admin authentication
- `/admin` dashboard
- `/admin/members` membership activation and member ops
- `/admin/bookings` bookings operations
- `/admin/events` events operations
- `/admin/slots` slot operations

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

### 2. Domain/Application Layer (Server Actions + API)
Responsibilities:
- Enforce booking and membership rules.
- Orchestrate Supabase reads/writes.
- Trigger email side effects through `lib/resend.ts`.

Primary server use cases:
- `createMembershipIntent`
- `createBooking`
- `lookupBookingsByEmail`
- `activateMember` (admin only)
- `manageEventsSlots` (admin only)

### 3. Integration Layer (`lib/*`)
Responsibilities:
- Encapsulate service provider usage.
- Centralize env var contracts.

Current modules:
- `lib/supabase.ts`: public and service-role clients
- `lib/membership.ts`: email normalization, bank details, reference generation
- `lib/resend.ts`: booking/membership/admin email helpers

### 4. Data Layer (Supabase Postgres)
Core tables:
- `members`
- `locations`
- `events`
- `slots`
- `bookings`

Type source of truth:
- `app/types/database.ts`

## Core Business Rules
- Only `members.status = 'active'` can complete bookings.
- Every membership intent gets a unique `bank_transfer_reference`.
- Slot capacity cannot go below zero.
- Admin-only operations must require authenticated admin identity.
- Public lookups (`/home` booking/register sections and `/my-bookings` scaffold) should expose minimal fields.

## Security Model

### Public Area
- No login.
- Email is the user key for membership and booking retrieval.

### Admin Area
- Supabase Auth session is required.
- Authorization gate by `ADMIN_EMAIL_ALLOWLIST` (MVP).
- Service role writes only on the server.

### Data Safeguards
- Validate all server action inputs.
- Avoid returning unnecessary PII.
- Add RLS and policy checks when admin/data endpoints expand.

## End-to-End Flows

### Membership Activation Flow
1. User opens `/home` and expands the `Register` accordion.
2. User submits membership form.
3. Server creates `members` record with `status = 'pending'` and unique reference.
4. App shows bank instructions and sends email.
5. Admin validates transfer and sets member status to `active`.
6. Optional welcome email sent after activation.

### Booking Flow
1. User opens `/home` and expands the `Booking` accordion.
2. User submits booking form.
3. Server checks member by normalized email.
4. If active, reserve slot and insert booking.
5. Send confirmation (member) and notification (organizer).
6. If not active, route user to `/home#register`.

### Event Browsing (Dedicated Flow)
1. User opens `/events`.
2. Server reads events and locations from Supabase.
3. UI renders filterable event list.

### My Bookings Flow (Dedicated Flow)
1. User submits email on `/my-bookings`.
2. Server resolves member and bookings.
3. UI returns constrained booking list.

## Concurrency and Integrity
- Protect slot booking with database-level transaction or RPC (`SELECT ... FOR UPDATE`).
- Insert booking only after capacity decrement succeeds.
- Keep booking creation idempotency strategy in scope for retries.

## Deployment and Configuration
Required environment groups:
- Supabase: URL, anon/publishable key, service role key
- Resend: API key, sender, organizer recipients
- Membership bank details: fee and bank instructions
- Admin: email allowlist

## Build Sequence (Execution Order)
1. Foundation: env contracts, Supabase wiring, typed schema, base route skeleton.
2. Public home shell: `/home` navbar + accordions (`Register`, `Booking`, `FAQs`, `Contact Us`).
3. Membership and booking logic: wire server-backed membership + booking flows to `/home` accordion forms.
4. Dedicated flow enhancements: `/events`, `/events/[eventId]`, `/booking/confirm`, `/membership`, `/membership/pending`, `/my-bookings`.
5. Admin console: auth, route protection, member activation, event/slot/booking management.
6. Hardening: tests, validations, observability, deployment readiness.

## Status Snapshot (Current Repository)
Implemented now:
- `app/page.tsx`
- `app/home/page.tsx`
- `app/home/actions.ts`
- `app/home/home-page-helpers.ts`
- `app/home/components/*` (route-scoped accordion/header/section modules)
- `app/events/page.tsx`
- Route skeletons for:
  - `/events/[eventId]`
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
- `/home` Register accordion posts to a server action that creates/updates pending members, generates transfer references, and sends membership instruction emails
- `/home` Booking accordion posts to a server action that enforces active membership, creates bookings with slot decrement, and sends booking emails
- `lib/supabase.ts`
- `lib/membership.ts`
- `lib/resend.ts`
- integration tests under `__tests__/lib/*`

Planned next:
- Replace scaffold placeholders with:
  - Dedicated event-detail booking flow wiring on `/events/[eventId]` and `/booking/confirm`
  - Expanded slot-selection UX on `/home` beyond the next available slot shortcut
  - Supabase-authenticated admin operations and route protection

## Documentation Contract
- `docs/PROJECT_OVERVIEW.md` remains the product-definition source.
- This file is the architecture execution guide.
- `docs/IMPLEMENTATION_ROADMAP.md` is the milestone plan tied to this architecture.
